import express from "express";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();

/* ===== CORS DEFINITIVO ===== */
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Origin",
    "https://best-quality-19-customer-first.vercel.app"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use(express.json({ limit: "20mb" }));

/* ===== DATABASE ===== */
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

/* ===== HEALTH ===== */
app.get("/", (_, res) => {
  res.send("API BQ19 ATIVA");
});

/* ===== IMPORT RANKING ===== */
app.post("/import-ranking", async (req, res) => {
  try {
    const { fileBase64 } = req.body;

    if (!fileBase64 || typeof fileBase64 !== "string") {
      return res.status(400).json({ error: "Arquivo inválido" });
    }

    let buffer;
    try {
      buffer = Buffer.from(fileBase64, "base64");
    } catch {
      return res.status(400).json({ error: "Base64 inválido" });
    }

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: "buffer" });
    } catch (err) {
      console.error("ERRO XLSX:", err);
      return res.status(400).json({ error: "Arquivo Excel inválido" });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    await pool.query("DELETE FROM ranking");

    let total = 0;

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

      await pool.query(
        `INSERT INTO ranking (nome, cargo, pontos, primeira_conclusao)
         VALUES ($1, $2, 1, $3)`,
        [nome, cargo, data]
      );

      total++;
    }

    return res.json({ ranking_gerado: total });

  } catch (err) {
    console.error("ERRO GERAL:", err);
    return res.status(500).json({ error: "Falha interna" });
  }
});

/* ===== START ===== */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("✅ API BQ19 ATIVA NA PORTA", PORT);
});
``
