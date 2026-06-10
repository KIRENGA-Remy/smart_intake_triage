const dotenv = require("dotenv");
dotenv.config();
const { ingestDocument } = require("../src/lib/rag.js");

// Tiny, PII-free knowledge base about MineTech's product. Replace/extend freely.
const DOCS = [
  {
    title: "Payroll Module Overview",
    source: "payroll-overview.md",
    text: `The MineTech Payroll module provides integrated financial management with automated
payroll and cost tracking. Pay runs can be scheduled weekly, fortnightly, or monthly. Overtime
and shift allowances are calculated automatically from rostered hours. Cost tracking allocates
labour costs to cost centres so site managers can monitor spend by pit, plant, or department.
Payroll exports are produced in CSV and can be pushed to supported general-ledger systems.`,
  },
  {
    title: "Grade Control & Resource Management",
    source: "grade-control.md",
    text: `Grade Control & Resource Management provides precise ore tracking and resource
optimisation from extraction to processing. Blocks are reconciled against the resource model,
and material movement is tracked from the face through stockpiles to the run-of-mine pad.
The module flags dilution and ore loss, and supports blending targets so feed grade to the
plant stays within specification.`,
  },
  {
    title: "Quality Control & Processing",
    source: "quality-control.md",
    text: `Quality Control & Processing offers real-time quality monitoring and processing
optimisation. Sample assays from the lab are linked to processing batches, and the system
raises alerts when recovery drops below configured thresholds. Operators can compare actual
throughput against the daily plan and review trends over a rolling 30-day window.`,
  },
  {
    title: "Contractor Management Systems",
    source: "contractor-management.md",
    text: `Contractor Management Systems give unified contractor oversight with integrated
compliance and performance tracking. Inductions and certifications are stored against each
contractor company, and expiring documents trigger reminders. Performance is tracked against
contract KPIs, and non-conformances are logged with corrective actions and due dates.`,
  },
];

// Seed the knowledge base with default documents
async function main() {
  console.log(" Starting knowledge base seeding...\n");
  
  let totalChunks = 0;
  
  for (const doc of DOCS) {
    console.log(`📄 Processing: "${doc.title}"`);
    const result = await ingestDocument(doc.title, doc.source, doc.text);
    console.log(`   ✅ Ingested -> ${result.chunks} chunk(s)\n`);
    totalChunks += result.chunks;
  }
  
  console.log(`✨ Knowledge base seeded successfully!`);
  console.log(`   📚 Documents: ${DOCS.length}`);
  console.log(`   📝 Total chunks: ${totalChunks}`);
  
  // Verify by listing documents
  const { listDocuments } = require("../src/lib/rag.js");
  const docs = await listDocuments();
  console.log(`\n📋 Documents in knowledge base:`);
  docs.forEach(doc => {
    console.log(`   - ${doc.title} (${doc.chunkCount} chunks) [${doc.id}]`);
  });
  
  process.exit(0);
}

// Clear and reseed the knowledge base
async function reseed() {
  const { clearKnowledgeBase } = require("../src/lib/rag.js");
  console.log("🗑️ Clearing existing knowledge base...");
  await clearKnowledgeBase();
  console.log("✅ Cleared. Now reseeding...\n");
  await main();
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--reseed") || args.includes("-r")) {
    reseed().catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    });
  } else {
    main().catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    });
  }
}

module.exports = { seed: main, reseed, DOCS };