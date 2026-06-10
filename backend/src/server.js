const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const cors = require('cors');
const triageRouter = require('./routes/triage.js');
const ingestRouter = require('./routes/ingest.js');
const askRouter = require('./routes/ask.js');

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:5173" }));
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => res.json({ ok: true }));
app.use("/api/triage", triageRouter);
app.use("/api/ingest", ingestRouter);
app.use("/api/ask", askRouter);

const PORT = process.env.PORT || 4321;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
