import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();

/* ===============================
   CORS – PERMITIR NAVEGADOR
================================ */
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));
app.options("*", cors());

app.use(express.json());

/* ===============================
   BANCO
================================ */
const { Pool } = pkg;
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* ===============================
   UPLOAD
================================ */
const upload = multer({ storage: multer.memoryStorage() });

/* ===============================
   HEALTH CHECK
================================ */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* ===============================
   IMPORTAÇÃO DE RANKING
   ✅ RESPOSTA IMEDIATA
   ✅ PROCESSAMENTO EM BACKGROUND
================================ */
app.post("/import-ranking", upload.single("file"), async (req, res) => {
  // ✅ RESPONDE IMEDIATO (NUNCA DÁ TIMEOUT)
  res.json({ status: "processando" });

  // ⏳ PROCESSAMENTO PESADO EM BACKGROUND
  try {
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
        map.set(key, { nome, cargo, pontos: 1, primeira: data });
      } else {
        const item = map.get(key);
        item.pontos++;
        if (data < item.primeira) item.primeira = data;
      }
    }

    for (const v of map.values()) {
      await pool.query(
        "INSERT INTO ranking (nome, cargo, pontos, primeira_conclusao) VALUES ($1,$2,$3,$4)",
        [v.nome, v.cargo, v.pontos, v.primeira]
      );
    }

    console.log("✅ Ranking processado em background");
  } catch (err) {
    console.error("❌ Erro no processamento do ranking:", err);
  }
});

/* ===============================
   START
================================ */
const PORT = process.env.PORT || 3001;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA");
});
