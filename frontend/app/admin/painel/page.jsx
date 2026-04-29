"use client";

import { useState } from "react";

export default function PainelAdmin() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const enviarUsuarios = async () => {
    if (!file) {
      setMsg("❌ Selecione um arquivo antes de enviar.");
      return;
    }

    setLoading(true);
    setMsg("⏳ Enviando usuários...");

    const formData = new FormData();
    formData.append("file", file);

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
        setMsg(`❌ Erro do servidor: ${text}`);
        return;
      }

      const data = await res.json();
      setMsg(`✅ Usuários criados: ${data.users_created}`);
    } catch (e) {
      console.error(e);
      setMsg("❌ Erro de conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 500 }}>
      <h1>🛠 Painel Admin</h1>

      <h3>Importação de Usuários</h3>

      <input
        type="file"
        accept=".xls,.xlsx"
        onChange={(e) => {
          setFile(e.target.files[0]);
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
