import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

/* =========================
   CONFIGURAÇÃO INICIAL
========================= */

const { Pool } = pkg;
const app = express();

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
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log(`📄 Linhas no Excel: ${rows.length}`);

    let created = 0;

    for (const row of rows) {
      const cpfRaw =
        row.cpf ||
        row.CPF ||
        row.documento ||
        row.Documento ||
        "";

      const nomeRaw =
        row.nome ||
        row.Nome ||
        row["Nome Completo"] ||
        row["nome completo"] ||
        "";

      const cpf = String(cpfRaw).replace(/\D/g, "");
      const nome = String(nomeRaw).trim();

      if (!cpf || !nome) {
        console.log("⚠️ Linha ignorada:", row);
        continue;
      }

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

    return res.status(200).json({ users_created: created });

  } catch (err) {
    console.error("❌ Erro import-users:", err);
    return res.status(500).json({
      error: "Erro interno ao importar usuários",
      detalhe: err.message
    });
  }
});

/* =========================
   START DO SERVIDOR (RENDER)
========================= */

const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ PORT não definida");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA NA PORTA", PORT);
});
