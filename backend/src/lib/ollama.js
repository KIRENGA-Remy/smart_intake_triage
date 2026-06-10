
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const CHAT_MODEL = process.env.OLLAMA_CHAT_MODEL || "qwen2.5:3b-instruct-q3_K_S";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || "nomic-embed-text";

// Chat with JSON output (structured data extraction)
async function chatJSON({ system, user, schema, temperature = 0 }) {

    if (!system || !user) {
    throw new Error("Both 'system' and 'user' prompts are required");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        format: schema,
        stream: false,
        options: { temperature },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama /api/chat failed: ${res.status} - ${errorText}`);
    }

  const data = await res.json();
  
  // Parse JSON response if schema was provided
    if (schema) {
      try {
        return JSON.parse(data.message.content);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", data.message.content);
        throw new Error(`Invalid JSON response from model: ${parseError.message}`);
      }
    }
    
    return data.message.content;
} catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Ollama request timed out after 30 seconds`);
    }
    console.error("Ollama chat error:", error);
    throw error;
  }
}

/**
 * Chat with text output (freeform responses)
 */
async function chatText({ system, user, temperature = 0.1 }) {
  // Validate inputs
  if (!system || !user) {
    throw new Error("Both 'system' and 'user' prompts are required");
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const res = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHAT_MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        stream: false,
        options: { temperature },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama /api/chat failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return data.message.content.trim();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Ollama request timed out after 30 seconds`);
    }
    console.error("Ollama chat error:", error);
    throw error;
  }
}

/**
 * Generate embeddings for text
 * @param {string|string[]} inputs - Single string or array of strings
 * @returns {Promise<number[][]>} Array of embedding vectors
 */
async function embed(inputs) {
  // Validate input
  if (!inputs) {
    throw new Error("Input text is required for embedding");
  }

  // Normalize to array
  const inputArray = Array.isArray(inputs) ? inputs : [inputs];

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const res = await fetch(`${OLLAMA_URL}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        model: EMBED_MODEL, 
        input: inputArray 
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Ollama /api/embed failed: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    
    // Return single embedding if input was single string
    if (!Array.isArray(inputs)) {
      return data.embeddings[0];
    }
    
    return data.embeddings;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error(`Ollama embedding request timed out after 30 seconds`);
    }
    console.error("Ollama embedding error:", error);
    throw error;
  }
}

module.exports = {
  chatJSON,
  chatText,
  embed,
  config: { OLLAMA_URL, CHAT_MODEL, EMBED_MODEL }
};
