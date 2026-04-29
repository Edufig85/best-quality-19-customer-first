import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => res.send("API BQ19 ATIVA"));

app.post("/import-users", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).send("Arquivo não enviado");
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

    let count = 0;

    for (const row of rows) {
      if (!row.cpf || !row.nome) continue;

      await pool.query(
        `
        INSERT INTO users (cpf, nome)
        VALUES ($1, $2)
        ON CONFLICT (cpf) DO NOTHING
        `,
        [String(row.cpf), String(row.nome)]
      );

      count++;
    }

    res.json({ users_created: count });
  } catch (err) {
    console.error("Erro import-users:", err);
    res.status(500).send("Erro ao importar usuários");
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("API BQ19 ATIVA NA PORTA", PORT);
});

