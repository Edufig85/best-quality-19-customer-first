"use client";

import { useState } from "react";

export default function PainelAdmin() {
  const [usersFile, setData = new FormData();  const [usersFile, setUsersFile] = useState(null);
    formData.append("file", usersFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/import-users`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!res.ok) {
        const text = await res.text();
        setMsg(`❌ Erro no servidor: ${text}`);
        setLoading(false);
        return;
      }

      const data = await res.json();

      if (data.users_created !== undefined) {
        setMsg(`✅ Usuários criados com sucesso: ${data.users_created}`);
      } else {
        setMsg("⚠️ Resposta recebida, mas formato inesperado.");
      }
    } catch (err) {
      console.error("Erro no envio:", err);
      setMsg("❌ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>🛠 Painel Admin</h1>

      <h3>📁 Importação de Usuários</h3>

      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => {
          setUsersFile(e.target.files[0]);
          setMsg("");
        }}
      />

      <br /><br />

      <button onClick={enviarUsuarios} disabled={loading}>
        {loading ? "Enviando..." : "Enviar usuários"}
      </button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarUsuarios = async () => {
    if (!usersFile) {
      setMsg("❌ Selecione um arquivo antes de enviar.");
      return;
    }

    setLoading(true);
    setMsg("⏳ Enviando usuários...");

