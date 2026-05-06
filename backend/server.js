import express from "express";
import cors from "cors";
import multer from "multer";
import * as XLSX from "xlsx";
import pkg from "pg";

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA NA PORTA", PORT);
});
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const upload = multer({ storage: multer.memoryStorage() });

app.get("/", (req, res) => {
  res.send("API BQ19 ATIVA");
});

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

      const nome = String(r["Usuário"]).trim();
      const cargo = String(r["Cargo"]).trim();
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
        "INSERT INTO ranking (nome, cargo, pontos, primeira_conclusao) VALUES ($1,$2,$3,$4)",
        [v.nome, v.cargo, v.pontos, v.primeira]
      );
    }

    res.json({ ranking_gerado: map.size });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao gerar ranking" });
  }
});

app.get("/categorias", async (req, res) => {
  const result = await pool.query(
    "SELECT DISTINCT cargo FROM ranking ORDER BY cargo"
  );
  res.json(result.rows.map(r => r.cargo));
});

app.get("/ranking/:cargo", async (req, res) => {
  const cargo = req.params.cargo;

  const result = await pool.query(
    `SELECT nome, pontos
     FROM ranking
     WHERE cargo = $1
     ORDER BY pontos DESC, primeira_conclusao ASC
     LIMIT 5`,
    [cargo]
  );

  res.json(result.rows);
});

const PORT = process.env.PORT;
app.listen(PORT, "0.0.0.0", () => {
  console.log("✅ API BQ19 ATIVA");
});
