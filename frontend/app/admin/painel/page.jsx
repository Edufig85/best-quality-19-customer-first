"use client";

import { useState } from "react";

export default function AdminPainel() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  async function uploadUsuarios() {
    if (!file) {
      setMsg("Selecione um arquivo Excel");
      return;
    }

    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setMsg("Erro do backend: " + text);
        return;
      }

      const json = await res.json();
      setMsg(`Upload concluído. Usuários criados: ${json.users_created}`);
    } catch (err) {
      console.error(err);
      setMsg("Erro ao enviar o arquivo");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>Painel Admin – Best Quality 19</h1>

      <input
        type="file"
        accept=".xlsx"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <br />
      <br />

      <button onClick={uploadUsuarios}>
        Enviar Excel
      </button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}
