import express from "express";
import cors from "cors";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();

/* ============================
   CORS
============================ */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors());

/* ============================
   JSON (necessário p/ Base64)
============================ */
app.use(express.json({ limit: "20mb" }));

/* ============================
   DATABASE
============================ */
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ============================
   HEALTHCHECK
============================ */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* ============================
   IMPORTAÇÃO DE RANKING
   ✅ JSON + BASE64
   ✅ SEM multipart
============================ */
app.post("/import-ranking", async (req, res) => {
  try {
    const { fileBase64 } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Arquivo não recebido" });
    }

    // converte base64 em buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // lê o Excel
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    await pool.query("DELETE FROM ranking");

    const map = new Map();

    for (const r of rows) {
      if (
        r["Status da Matrícula"] !== "Concluído" ||
        r["Status de Aprovação"] !== "Aprovado" ||
        r["Situação do Usuário"] !== "Ativo"
      ) continue;

      const nome = String(r["Usuário"] || "").trim();
      const cargo = String(r["Cargo"] || "").trim();
