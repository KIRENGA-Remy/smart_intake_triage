const { z } = require("zod");

// ENUMS - Adjusted for Mining Industry Context

const CATEGORIES = [
  "Equipment Failure",        // Broken machinery, crusher issues, conveyor belt problems
  "Safety Incident",          // Worker injuries, hazardous conditions, PPE violations
  "Production Issue",         // Delays, quality problems, yield below target
  "Logistics & Supply",       // Fuel delivery, parts shortage, material transport
  "Environmental Compliance", // Water treatment, dust control, waste management
  "Staff & Training",         // Worker availability, skill gaps, shift scheduling
  "Billing & Licensing",      // Invoicing, permits, royalty payments
  "Payroll & Finance",        // Wage disputes, overtime, cost tracking
  "Feature Request",          // New functionality request
  "Account & Access",         // Login issues, permission problems
  "Other",
];

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const SENTIMENTS = ["Positive", "Neutral", "Negative"];

const MODULES = [
  "Crusher & Milling",
  "Leaching & Processing",
  "Tailings Management",
  "Fleet & Heavy Equipment",
  "Safety & Compliance",
  "Grade Control",
  "Payroll & HR",
  "Contractor Management",
  "Unknown",
];

// ZOD SCHEMAS
// Main triage schema for validation
const TriageSchema = z.object({
  category: z.enum(CATEGORIES),
  priority: z.enum(PRIORITIES),
  summary: z.string().min(1).max(280),
  sentiment: z.enum(SENTIMENTS),
  affectedModule: z.enum(MODULES),
  suggestedReply: z.string().min(1),
  confidence: z.number().min(0).max(1),
});

// Schema for malformed output fallback
const FallbackTriageSchema = z.object({
  category: z.enum(CATEGORIES).default("Other"),
  priority: z.enum(PRIORITIES).default("Medium"),
  summary: z.string().default("Unable to extract summary from message"),
  sentiment: z.enum(SENTIMENTS).default("Neutral"),
  affectedModule: z.enum(MODULES).default("Unknown"),
  suggestedReply: z.string().default("Thank you for your message. Our team will review and respond shortly."),
  confidence: z.number().default(0.3),
});

// JSON Schema for Ollama API (matches Zod schema)
const TriageJsonSchema = {
  type: "object",
  properties: {
    category: { type: "string", enum: CATEGORIES },
    priority: { type: "string", enum: PRIORITIES },
    summary: { type: "string" },
    sentiment: { type: "string", enum: SENTIMENTS },
    affectedModule: { type: "string", enum: MODULES },
    suggestedReply: { type: "string" },
    confidence: { type: "number" },
  },
  required: [
    "category",
    "priority",
    "summary",
    "sentiment",
    "affectedModule",
    "suggestedReply",
    "confidence",
  ],
};

function validateTriageOutput(data) {
  return TriageSchema.safeParse(data);
}

function createFallbackResponse(originalMessage) {
  return {
    category: "Other",
    priority: "Medium",
    summary: originalMessage.slice(0, 280),
    sentiment: "Neutral",
    affectedModule: "Unknown",
    suggestedReply: "Thank you for your message. Our team will review and respond shortly.",
    confidence: 0.3,
  };
}

function parseModelOutput(rawOutput) {
  try {
    // Try to extract JSON from the response (in case model adds extra text)
    let jsonString = rawOutput;
    const jsonMatch = rawOutput.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Failed to parse model output as JSON:", error.message);
    return null;
  }
}

module.exports = {
  CATEGORIES,
  PRIORITIES,
  SENTIMENTS,
  MODULES,
  
  TriageSchema,
  FallbackTriageSchema,
  TriageJsonSchema,
  
  validateTriageOutput,
  createFallbackResponse,
  parseModelOutput,
};
