import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();

/* =========================
   CORS — CORREÇÃO DEFINITIVA
========================= */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

// 👇 ESSENCIAL PARA O RENDER (preflight)
app.options("*", cors());

app.use(express.json());

/* =========================
   DATABASE
========================= */
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   UPLOAD
========================= */
const upload = multer({ storage: multer.memoryStorage() });

/* =========================
   HEALTHCHECK
========================= */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* =========================
   IMPORTAÇÃO DE RANKING
========================= */
app.post("/import-ranking", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não enviado" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
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
        map.set(key, {
          nome,
          cargo,
          pontos: 1,
          primeira: data
        });
      } else {
        const item = map.get(key);
        item.pontos++;
        if (data < item.primeira) item.primeira = data;
      }
    }

    for (const v of map.values()) {
      await pool.query(
        `
        INSERT INTO ranking (nome, cargo, pontos, primeira_conclusao)
        VALUES ($1, $2, $3, $4)
        `,
        [v.nome, v.cargo, v.pontos, v.primeira]
      );
    }

    res.json({ ranking_gerado: map.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar ranking" });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA");
});
