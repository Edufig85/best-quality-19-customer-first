app.post('/admin/import-users', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Arquivo não recebido' })
    }

    const workbook = XLSX.readFile(req.file.path)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json(sheet)

    const insert = db.prepare(
      'INSERT INTO users (cpf, nome, password) VALUES (?,?,?)'
    )
    const exists = db.prepare('SELECT id FROM users WHERE cpf = ?')

    let created = 0

    rows.forEach(row => {
      const cpf = String(row.CPF).trim()
      const nome = row.Nome
      if (!cpf || !nome) return

      if (!exists.get(cpf)) {
        const hash = bcrypt.hashSync(DEFAULT_PASSWORD, 10)
        insert.run(cpf, nome, hash)
        created++
      }
    })

    res.json({ users_created: created })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao processar Excel' })
  }
})
