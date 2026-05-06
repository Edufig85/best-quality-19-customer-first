import express from "express";
import cors from "cors";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();

/* ============================
   CORS — DEFINITIVO
============================ */
const allowedOrigins = [
  "https://best-quality-19-customer-first.vercel.app"
];

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // ✅ PRE-FLIGHT OK
  }

  next();
});

app.use(express.json({ limit: "30mb" }));

/* ============================
   DATABASE (Railway)
============================ */
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

/* ============================
   HEALTHCHECK
============================ */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* ============================
   IMPORTAÇÃO DE RANKING
============================ */
app.post("/import-ranking", async (req, res) => {
  try {
    const { fileBase64 } = req.body;

    if (!fileBase64) {
      return res.status(400).json({ error: "Arquivo não recebido" });
    }

    const buffer = Buffer.from(fileBase64, "base64");
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
      const data = new Date(r["Data da Conclusao"]);
      if (!nome || !cargo || isNaN(data)) continue;

      const key = `${nome}|${cargo}`;

      if (!map.has(key)) {
        map.set(key, { nome, cargo, pontos: 1, primeira: data });
      } else {
        const item = map.get(key);
        item.pontos++;
        if (data < item.primeira) item.primeira = data;
      }
    }

    for (const v of map.values()) {
      await pool.query(
        `INSERT INTO ranking (nome, cargo, pontos, primeira_conclusao)
         VALUES ($1,$2,$3,$4)`,
        [v.nome, v.cargo, v.pontos, v.primeira]
      );
    }

    res.json({ ranking_gerado: map.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao processar ranking" });
  }
});

/* ============================
   START
============================ */
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA");
});
