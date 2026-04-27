'use client'
import { useState } from 'react'

export default function AdminPainel() {
  const [file, setFile] = useState(null)
  const [msg, setMsg] = useState('')

  async function uploadUsuarios() {
    if (!file) return setMsg('Selecione um Excel')

    const form = new FormData()
    form.append('file', file)

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`, {
      method: 'POST',
      body: form
    })

    const json = await res.json()
    setMsg(`Upload concluído. Usuários criados: ${json.users_created}`)
  }

  return (
    <div>
      <h1>Painel Admin – Best Quality 19</h1>
      <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={uploadUsuarios}>Enviar Excel</button>
      <p>{msg}</p>
    </div>
  )
}
