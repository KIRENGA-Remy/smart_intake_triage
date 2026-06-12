const { prisma, toVectorLiteral } = require("./db.js");
const { embed } = require("./ollama.js");

const SIMILARITY_THRESHOLD = Number(process.env.RAG_SIMILARITY_THRESHOLD || "0.5");
const TOP_K = Number(process.env.RAG_TOP_K || "4");
const CHUNK_SIZE = Number(process.env.RAG_CHUNK_SIZE || "180");
const CHUNK_OVERLAP = Number(process.env.RAG_CHUNK_OVERLAP || "40");

// Word-based chunker with sentence boundary awareness
function chunkText(text, chunkWords = CHUNK_SIZE, overlapWords = CHUNK_OVERLAP) {
  if (!text || typeof text !== "string") {
    throw new Error("Invalid text input for chunking");
  }

  const cleaned = text.replace(/\s+/g, " ").trim();
  const words = cleaned.split(" ");
  
  if (words.length <= chunkWords) {
    return [cleaned];
  }
  
  const chunks = [];
  let currentPos = 0;
  
  while (currentPos < words.length) {
    let chunkWordsSlice = words.slice(currentPos, currentPos + chunkWords);
    let chunkTextResult = chunkWordsSlice.join(" ");
    
    // Try to end at a sentence boundary (., !, ?)
    const lastPeriodIndex = chunkTextResult.lastIndexOf(".");
    const lastQuestionIndex = chunkTextResult.lastIndexOf("?");
    const lastExclamationIndex = chunkTextResult.lastIndexOf("!");
    const lastSentenceEnd = Math.max(lastPeriodIndex, lastQuestionIndex, lastExclamationIndex);
    
    if (lastSentenceEnd > chunkTextResult.length * 0.7) {
      // Cut at sentence boundary
      chunkTextResult = chunkTextResult.substring(0, lastSentenceEnd + 1);
      const wordsInChunk = chunkTextResult.split(" ").length;
      currentPos += wordsInChunk;
    } else {
      currentPos += chunkWords;
    }
    
    chunks.push(chunkTextResult.trim());
    
    // Apply overlap for next chunk
    currentPos -= overlapWords;
    if (currentPos < 0) currentPos = 0;
  }
  
  return chunks;
}

async function ingestDocument(title, source, text) {
  if (!title || !text) {
    throw new Error("Document title and text are required");
  }

  try {
    const doc = await prisma.document.create({
      data: { title, source }
    });

    const pieces = chunkText(text);
    console.log(`📄 Ingesting "${title}" - ${pieces.length} chunks`);

    const prefixedPieces = pieces.map(p => `search_document: ${p}`);
    const vectors = await embed(prefixedPieces);

    for (let i = 0; i < pieces.length; i++) {
      const chunk = await prisma.chunk.create({
        data: {
          documentId: doc.id,
          position: i,
          content: pieces[i]
        }
      });
      
      await prisma.$executeRaw`
        UPDATE chunks SET embedding = ${toVectorLiteral(vectors[i])}::vector
        WHERE id = ${chunk.id}
      `;
      
      if ((i + 1) % 10 === 0) {
        console.log(`  Processed ${i + 1}/${pieces.length} chunks`);
      }
    }

    console.log(`✅ Ingested "${title}" (${doc.id}) - ${pieces.length} chunks`);
    return { documentId: doc.id, chunks: pieces.length, title };
    
  } catch (error) {
    console.error(`❌ Failed to ingest document "${title}":`, error.message);
    throw error;
  }
}

async function retrieve(query) {
  if (!query || typeof query !== "string") {
    throw new Error("Valid query string is required");
  }

  try {
    const [queryVec] = await embed([`search_query: ${query}`]);
    const literal = toVectorLiteral(queryVec);

    const rows = await prisma.$queryRaw`
      SELECT 
        c.id,
        c.content,
        d.title,
        d.source,
        1 - (c.embedding <=> ${literal}::vector) AS similarity
      FROM chunks c
      JOIN documents d ON d.id = c."documentId"
      WHERE c.embedding IS NOT NULL
      ORDER BY c.embedding <=> ${literal}::vector
      LIMIT ${TOP_K}
    `;

    const ranked = rows.map(r => ({
      ...r,
      similarity: Number(r.similarity)
    }));

    const topSimilarity = ranked.length ? ranked[0].similarity : 0;
    const relevant = topSimilarity >= SIMILARITY_THRESHOLD;
    const chunks = ranked.filter(r => r.similarity >= SIMILARITY_THRESHOLD);

    return {
      chunks,
      relevant,
      topSimilarity,
      threshold: SIMILARITY_THRESHOLD,
      query
    };
    
  } catch (error) {
    console.error("❌ Retrieval failed:", error.message);
    return {
      chunks: [],
      relevant: false,
      topSimilarity: 0,
      error: error.message
    };
  }
}

async function answerQuestion(query, generateAnswer) {
  const { chunks, relevant, topSimilarity } = await retrieve(query);
  
  if (!relevant || chunks.length === 0) {
    return {
      answer: "I couldn't find relevant information in the knowledge base to answer your question.",
      citations: [],
      hasAnswer: false,
      similarity: topSimilarity
    };
  }
  
  const context = chunks.map(chunk => 
    `Source: ${chunk.title}\nContent: ${chunk.content}`
  ).join("\n\n");
  
  const answer = await generateAnswer(query, context, chunks);

  const citations = chunks.map(chunk => ({
    title: chunk.title,
    source: chunk.source,
    excerpt: chunk.content.substring(0, 200) + "...",
    similarity: chunk.similarity
  }));
  
  return {
    answer,
    citations,
    hasAnswer: true,
    similarity: topSimilarity
  };
}

async function deleteDocument(documentId) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });
    
    if (!document) {
      return { success: false, error: `Document ${documentId} not found` };
    }
    
    await prisma.document.delete({
      where: { id: documentId }
    });
    
    console.log(`🗑️ Deleted document "${document.title}" (${documentId})`);
    return { success: true, title: document.title };
    
  } catch (error) {
    console.error(`❌ Failed to delete document ${documentId}:`, error.message);
    return { success: false, error: error.message };
  }
}

async function listDocuments() {
  const documents = await prisma.document.findMany({
    include: {
      _count: {
        select: { chunks: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  return documents.map(doc => ({
    id: doc.id,
    title: doc.title,
    source: doc.source,
    chunkCount: doc._count.chunks,
    createdAt: doc.createdAt
  }));
}

async function clearKnowledgeBase() {
  try {
    const count = await prisma.document.count();
    await prisma.chunk.deleteMany();
    await prisma.document.deleteMany();
    console.log(`🗑️ Cleared knowledge base (${count} documents)`);
    return { success: true, documentsDeleted: count };
  } catch (error) {
    console.error("❌ Failed to clear knowledge base:", error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  chunkText,
  ingestDocument,
  retrieve,
  answerQuestion,
  deleteDocument,
  listDocuments,
  clearKnowledgeBase,
  toVectorLiteral
};