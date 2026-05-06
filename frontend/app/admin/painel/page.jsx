"use client";

import { useState } from "react";

export default function PainelAdmin() {
  /* =========================
     USUÁRIOS
  ========================= */
  const [usersFile, setUsersFile] = useState(null);
  const [usersMsg, setUsersMsg] = useState("");

  /* =========================
     RANKING
  ========================= */
  const [rankingFile, setRankingFile] = useState(null);
  const [rankingMsg, setRankingMsg] = useState("");

  async function enviarUsuarios() {
    if (!usersFile) {
      setUsersMsg("❌ Selecione um arquivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", usersFile);

    setUsersMsg("⏳ Enviando usuários...");

    try {
      const res = await fetch(
        "https://SEU-BACKEND.onrender.com/import-users",
        {
          method: "POST",
          body: formData
        }
      );

      setUsersMsg(
        res.ok ? "✅ Usuários importados" : "❌ Erro ao importar usuários"
      );
    } catch {
      setUsersMsg("❌ Erro de conexão");
    }
  }

  async function enviarRanking() {
    if (!rankingFile) {
      setRankingMsg("❌ Selecione a planilha de ranking");
      return;
    }

    const formData = new FormData();
    formData.append("file", rankingFile);

    setRankingMsg("⏳ Calculando ranking...");

    try {
      const res = await fetch(
        "https://SEU-BACKEND.onrender.com/import-ranking",
        {
          method: "POST",
          body: formData
        }
      );

      const data = await res.json();

      if (data.ranking_gerado !== undefined) {
        setRankingMsg(
          `✅ Ranking atualizado (${data.ranking_gerado} registros)`
        );
      } else {
        setRankingMsg("❌ Erro ao gerar ranking");
      }
    } catch {
      setRankingMsg("❌ Erro de conexão");
    }
  }

  return (
    <div style={{ padding: 40 }}>
      <h1>🛠️ Painel Admin</h1>

      {/* ===================== */}
      {/* USUÁRIOS */}
      {/* ===================== */}
      <h2>Importação de Usuários</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={e => setUsersFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={enviarUsuarios}>Enviar usuários</button>

      <p>{usersMsg}</p>

      <hr style={{ margin: "40px 0" }} />

      {/* ===================== */}
      {/* RANKING */}
      {/* ===================== */}
      <h2>🏆 Importação de Ranking</h2>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={e => setRankingFile(e.target.files[0])}
      />
      <br /><br />
      <button onClick={enviarRanking}>
        Enviar pontuação para ranking
      </button>

      <p>{rankingMsg}</p>
    </div>
  );
}
