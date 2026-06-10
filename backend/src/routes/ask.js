const express = require("express");
const { retrieve } = require("../lib/rag.js");
const { chatText } = require("../lib/ollama.js");

const router = express.Router();

const NOT_FOUND_MSG =
  "I couldn't find anything about that in the knowledge base, so I can't answer it reliably.";

const SYSTEM = `You answer questions ONLY using the numbered context passages provided.
Rules:
- Use only facts present in the context. Do not use outside knowledge.
- Cite the passage numbers you used, like [1] or [2], inline.
- If the context does not contain the answer, reply exactly:
  "${NOT_FOUND_MSG}"
- Be concise.`;

// POST /api/ask  Request body: { question: string }
router.post("/", async (req, res) => {
  try {
    const { question } = req.body ?? {};
    
    if (!question || typeof question !== "string") {
      return res.status(400).json({ 
        error: "Body must be { question: string }",
        received: { question: typeof question }
      });
    }

    const { chunks, relevant, topSimilarity } = await retrieve(question);

    if (!relevant || chunks.length === 0) {
      return res.json({ 
        answer: NOT_FOUND_MSG, 
        grounded: false, 
        topSimilarity, 
        citations: [] 
      });
    }

    const context = chunks
      .map((c, i) => `[${i + 1}] (source: ${c.source})\n${c.content}`)
      .join("\n\n");

    // Generate answer using the LLM
    const answer = await chatText({
      system: SYSTEM,
      user: `Context:\n${context}\n\nQuestion: ${question}`,
      temperature: 0,
    });

    const grounded = !answer.includes(NOT_FOUND_MSG);

    // Return response with citations
    res.json({
      answer,
      grounded,
      topSimilarity: Number(topSimilarity.toFixed(3)),
      citations: grounded
        ? chunks.map((c, i) => ({
            n: i + 1,
            source: c.source,
            title: c.title,
            similarity: Number(c.similarity.toFixed(3)),
          }))
        : [],
    });
    
  } catch (error) {
    console.error("Ask endpoint error:", error);

    if (error.message.includes("Ollama") || error.message.includes("embedding")) {
      return res.status(502).json({ 
        error: "AI service unavailable", 
        detail: error.message 
      });
    }
    
    if (error.message.includes("database")) {
      return res.status(503).json({ 
        error: "Database connection error", 
        detail: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Ask failed", 
      detail: error.message 
    });
  }
});

// GET /api/ask/health - Check if RAG system is ready
router.get("/health", async (req, res) => {
  try {
    const { listDocuments } = require("../lib/rag.js");
    const docs = await listDocuments();
    res.json({
      status: "ready",
      documentCount: docs.length,
      message: docs.length > 0 
        ? "Knowledge base is ready" 
        : "Knowledge base is empty. Add documents via POST /api/ingest"
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error", 
      message: error.message 
    });
  }
});

module.exports = router;