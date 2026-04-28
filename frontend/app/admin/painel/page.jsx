"use client";

import { useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function PainelAdmin() {
  useAuthGuard();

  const [usersFile, setUsersFile] = useState(null);
  const [rankingFile, setRankingFile] = useState(null);
  const [msgUsers, setMsgUsers] = useState("");
  const [msgRanking, setMsgRanking] = useState("");

  /* =====================
     UPLOAD DE USUÁRIOS
  ====================== */
  const enviarUsuarios = async () => {
    if (!usersFile) {
      setMsgUsers("Selecione um arquivo de usuários");
      return;
    }

    const formData = new FormData();
    formData.append("file", usersFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-users`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsgUsers(data.error || "Erro ao importar usuários");
        return;
      }

      setMsgUsers(
        `Usuários criados: ${data.users_created || 0}`
      );
    } catch {
      setMsgUsers("Erro de conexão");
    }
  };

  /* =====================
     UPLOAD DE RANKING
  ====================== */
  const enviarRanking = async () => {
    if (!rankingFile) {
      setMsgRanking("Selecione um arquivo de ranking");
      return;
    }

    const formData = new FormData();
    formData.append("file", rankingFile);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/import-ranking`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsgRanking(data.error || "Erro ao importar ranking");
        return;
      }

      setMsgRanking("Ranking importado com sucesso ✅");
    } catch {
      setMsgRanking("Erro de conexão");
    }
  };

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <h1>🛠 Painel Administrativo</h1>

      {/* ===================== USUÁRIOS ===================== */}
      <section style={styles.box}>
        <h2>📁 Importação de Usuários</h2>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => setUsersFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={enviarUsuarios}>
          Enviar usuários
        </button>

        <p>{msgUsers}</p>
      </section>

      {/* ===================== RANKING ===================== */}
      <section style={styles.box}>
        <h2>🏆 Importação de Ranking</h2>

        <input
          type="file"
          accept=".xls,.xlsx"
          onChange={(e) => setRankingFile(e.target.files[0])}
        />

        <br /><br />

        <button onClick={enviarRanking}>
          Enviar ranking
        </button>

        <p>{msgRanking}</p>
      </section>
    </div>
  );
}

/* ===================== ESTILO ===================== */

const styles = {
  box: {
    border: "1px solid #ddd",
    padding: 20,
    marginTop: 30,
    borderRadius: 10,
    background: "#fafafa",
  },
};
``
