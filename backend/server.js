import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const { Pool } = pkg;

const app = express();

/* =========================
   MIDDLEWARES
========================= */
app.use(cors({ origin: true }));
app.use(express.json());

/* =========================
   BANCO DE DADOS
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

/* =========================
   UPLOAD (MULTER)
========================= */
const upload = multer({
  storage: multer.memoryStorage()
});

/* =========================
   HEALTHCHECK
========================= */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* =========================
   IMPORTAÇÃO DE USUÁRIOS
========================= */
app.post("/import-users", upload.single("file"), async (req, res) => {
  console.log("➡️ POST /import-users");

  if (!req.file) {
    return res.status(400).json({ error: "Arquivo não enviado" });
  }

  try {
    /* Ler Excel */
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`📄 Linhas no Excel: ${rows.length}`);

    let created = 0;

    for (const row of rows) {
      /* =========================
         NORMALIZAÇÃO DE CAMPOS
      ========================= */

      const cpfRaw =
        row.cpf ||
        row.CPF ||
        row.documento ||
        row.Documento ||
        row.doc ||
        row.Cpf ||
        "";

      const nomeRaw =
        row.nome ||
        row.Nome ||
        row["Nome Completo"] ||
        row["nome completo"] ||
        row.colaborador ||
        row.Colaborador ||
        "";

      const cpf = String(cpfRaw).replace(/\D/g, "");
      const nome = String(nomeRaw).trim();

      if (!cpf || !nome) {
        console.log("⚠️ Linha ignorada (cpf/nome vazio):", row);
        continue;
      }

      /* =========================
         INSERT NO BANCO
      ========================= */
      await pool.query(
        `
        INSERT INTO users (cpf, nome)
        VALUES ($1, $2)
        ON CONFLICT (cpf) DO NOTHING
        `,
        [cpf, nome]
      );

      created++;
    }

    console.log(`✅ Usuários importados: ${created}`);

    return res.status(200).json({
      users_created: created
    });

  } catch (err) {
    console.error("❌ Erro ao importar usuários:", err);

    return res.status(500).json({
      error: "Erro interno ao importar usuários",
      detalhe: err.message
    });
  }
});

/* =========================
   START SERVER
========================= */
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log("✅ API BQ19 ATIVA NA PORTA", PORT);
});
