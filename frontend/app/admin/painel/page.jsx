"use client";

import { useState } from "react";

export default function AdminPainel() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");

  const uploadUsuarios = async () => {
    if (!file) {
      setMsg("Selecione um arquivo Excel");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const t = await res.text();
        setMsg("Erro: " + t);
        return;
      }

      const json = await res.json();
      setMsg(`Upload concluído. Usuários criados: ${json.users_created}`);
    } catch {
      setMsg("Erro ao enviar arquivo");
    }
  };

  return (
    <div>
      <h1>Painel Admin – Best Quality 19</h1>
      <input type="file" accept=".xlsx" onChange={e => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={uploadUsuarios}>Enviar Excel</button>
      <p>{msg}</p>
    </div>
  );
}
