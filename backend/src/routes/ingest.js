const express = require("express");
const { ingestDocument } = require("../lib/rag.js");

const router = express.Router();

// POST /api/ingest  { title, source?, text }
router.post("/", async (req, res) => {
  try {
    const { title, source, text } = req.body || {};
    
    if (!title || !text) {
      return res.status(400).json({ 
        error: "Body must be { title, source?, text }",
        received: { title: !!title, source: !!source, text: !!text }
      });
    }
    
    // Ingest the document (source defaults to title if not provided)
    const result = await ingestDocument(title, source ?? title, text);
    
    res.json({
      success: true,
      documentId: result.documentId,
      chunks: result.chunks,
      title: result.title,
      message: `Successfully ingested "${title}" (${result.chunks} chunks)`
    });
    
  } catch (error) {
    console.error("Ingest error:", error);
    
    if (error.message.includes("Document title and text are required")) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        detail: error.message 
      });
    }
    
    if (error.message.includes("embedding") || error.message.includes("Ollama")) {
      return res.status(502).json({ 
        error: "Embedding service unavailable", 
        detail: error.message 
      });
    }
    
    res.status(500).json({ 
      error: "Ingest failed", 
      detail: error.message 
    });
  }
});


// GET /api/ingest - List all documents
router.get("/", async (req, res) => {
  try {
    const { listDocuments } = require("../lib/rag.js");
    const documents = await listDocuments();
    res.json({ success: true, documents });
  } catch (error) {
    console.error("List documents error:", error);
    res.status(500).json({ error: "Failed to list documents", detail: error.message });
  }
});


// DELETE /api/ingest/:id - Delete a document
router.delete("/:id", async (req, res) => {
  try {
    const { deleteDocument } = require("../lib/rag.js");
    const { id } = req.params;
    
    const result = await deleteDocument(id);
    
    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }
    
    res.json({ success: true, message: `Deleted document "${result.title}"` });
  } catch (error) {
    console.error("Delete document error:", error);
    res.status(500).json({ error: "Failed to delete document", detail: error.message });
  }
});

module.exports = router;