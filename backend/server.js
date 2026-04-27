app.post("/admin/import-users", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Arquivo não recebido" });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Excel vazio ou inválido" });
    }

    const exists = db.prepare("SELECT id FROM users WHERE cpf = ?");
    const insert = db.prepare(
      "INSERT INTO users (cpf, nome, password) VALUES (?, ?, ?)"
    );

    let created = 0;

    for (const r of rows) {
      const cpf = String(r.CPF || "").trim();
      const nome = String(r.Nome || "").trim();

      if (!cpf || !nome) continue;

      if (!exists.get(cpf)) {
        insert.run(
          cpf,
          nome,
          bcrypt.hashSync(DEFAULT_PASSWORD, 10)
        );
        created++;
      }
    }

    return res.json({ users_created: created });
  } catch (err) {
    console.error("Erro no upload:", err);
    return res.status(500).json({
      error: "Erro interno ao processar o Excel"
    });
  }
});
