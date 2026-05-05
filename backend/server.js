import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

/* =========================
   APP BASICO
========================= */
const { Pool } = pkg;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

/* =========================
   BANCO
========================= */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

/* =========================
   UPLOAD
========================= */
const upload = multer({
  storage: multer.memoryStorage(),
});

/* =========================
   HEALTHCHECK
========================= */
app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

/* =========================
   IMPORT USERS (FINAL)
========================= */
app.post("/import-users", upload.single("file"), async (req, res) => {
  console.log("➡️ POST /import-users");

  if (!req.file) {
    return res.status(400).json({ error: "Arquivo não enviado" });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    console.log("📄 Total de linhas no Excel:", rawRows.length);
    if (rawRows.length > 0) {
      console.log("🧪 Primeira linha bruta:", rawRows[0]);
    }

    let created = 0;

    for (const rawRow of rawRows) {
      /* =========================
         NORMALIZA CABEÇALHOS
      ========================= */
      const row = {};
      for (const key in rawRow) {
        const normalizedKey = key
          .toString()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "") // remove acentos
          .replace(/\s+/g, "")            // remove espaços
          .trim();

        row[normalizedKey] = rawRow[key];
      }

      /* =========================
         LE CPF / NOME
      ========================= */
      const cpfRaw =
        row.cpf ||
        row.documento ||
        row.nocpf ||
        "";

      const nomeRaw =
        row.nome ||
        row.nomecompleto ||
        row.colaborador ||
        "";

      const cpf = String(cpfRaw).replace(/\D/g, "");
      const nome = String(nomeRaw).trim();

      if (!cpf || !nome) {
        console.log("⚠️ Linha ignorada:", rawRow);
        continue;
      }

      /* =========================
         INSERT
      ========================= */
      const result = await pool.query(
        `
        INSERT INTO users (cpf, nome)
        VALUES ($1, $2)
        ON CONFLICT (cpf) DO NOTHING
        `,
        [cpf, nome]
      );

      if (result.rowCount === 1) {
        created++;
      }
    }

    console.log("✅ Usuários CRIADOS:", created);

    return res.json({ users_created: created });

  } catch (err) {
    console.error("❌ Erro /import-users:", err);
    return res.status(500).json({
      error: "Erro interno ao importar usuários",
      detalhe: err.message,
    });
  }
});

/* =========================
   START (RENDER)
========================= */
const PORT = process.env.PORT;

if (!PORT) {
  console.error("❌ PORT não definida");
  process.exit(1);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA NA PORTA", PORT);
});
