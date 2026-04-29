"use client";import { useState } from "react";

export default function PainelAdmin() {
  const [usersFile, setUsersFile] = useState(null);
  const [msg, setMsg] = useState("");

  const enviarUsuarios = async () => {
    if (!usersFile) {
      setMsg("Selecione um arquivo de usuários");
      return;
    }

    setMsg("Enviando usuários...");

    const formData = new FormData();
    formData.append("file", usersFile);

    try {
      const res = await fetch(
        
`${process.env.NEXT_PUBLIC_API_URL}/import-users`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Erro ao importar usuários");
        return;
      }

      setMsg(`Usuários criados: ${data.users_created}`);
    } catch (err) {
      console.error(err);
      setMsg("Erro de conexão com o servidor");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>Painel Admin</h1>

      <h3>📁 Importação de Usuários</h3>

      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => setUsersFile(e.target.files[0])}
      />

      <br /><br />

      <button onClick={enviarUsuarios}>
        Enviar usuários
      </button>

      <p>{msg}</p>
    </div>
  );
}

