"use client";

import { useEffect, useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function RankingCategoria({ params }) {
  useAuthGuard();

  const { categoria } = params;
  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState("Carregando ranking...");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    const carregarRanking = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ranking/${decodeURIComponent(
            categoria
          )}`
        );

        const data = await res.json();

        if (!res.ok) {
          setMsg("Erro ao carregar ranking");
          return;
        }

        setRanking(data);
        setMsg("");
      } catch {
        setMsg("Erro de conexão");
      }
    };

    carregarRanking();
  }, [categoria]);

  const top5 = ranking.slice(0, 5);
  const restante = ranking.slice(5);

  const isMe = (nome) => nome === userName;

  return (
    <div style={styles.page}>
      <h1 style={styles.title}>
        🏆 Ranking – {decodeURIComponent(categoria)}
      </h1>

      {msg && <p>{msg}</p>}

      {!msg && (
        <>
          {/* 🥇 PÓDIO */}
          <div style={styles.podio}>
            {top5[1] && (
              <PodioCard {...top5[1]} posicao="2º" material="ouro" />
            )}
            {top5[0] && (
              <PodioCard {...top5[0]} posicao="1º" material="diamante" grande />
            )}
            {top5[2] && (
              <PodioCard {...top5[2]} posicao="3º" material="prata" />
            )}
          </div>

          {/* 4º e 5º */}
          <div style={styles.podioMenor}>
            {top5[3] && (
              <MiniCard {...top5[3]} posicao="4º" material="bronze" />
            )}
            {top5[4] && (
              <MiniCard {...top5[4]} posicao="5º" material="madeira" />
            )}
          </div>

          {/* LISTA */}
          {restante.length > 0 && (
            <>
              <h2 style={styles.subTitle}>Demais posições</h2>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th>Posição</th>
                      <th>Nome</th>
                      <th>Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {restante.map((r) => (
                      <tr
                        key={r.posicao}
                        style={
                          isMe(r.nome)
                            ? styles.meRow
                            : undefined
                        }
                      >
                        <td>{r.posicao}</td>
                        <td>
                          {r.nome}
                          {isMe(r.nome) && (
                            <span style={styles.meTag}>Você</span>
                          )}
                        </td>
                        <td>{r.pontos}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ================= COMPONENTES ================= */

function PodioCard({ nome, pontos, posicao, material, grande }) {
  return (
    <div
      style={{
        ...styles.card,
        ...styles[material],
        height: grande ? 220 : 170,
      }}
      className="podio-anim"
    >
      <strong style={{ fontSize: 24 }}>{posicao}</strong>
      <div style={{ marginTop: 6 }}>{material.toUpperCase()}</div>
      <div style={styles.nome}>{nome}</div>
      <div>{pontos} pontos</div>
    </div>
  );
}

function MiniCard({ nome, pontos, posicao, material }) {
  return (
    <div style={{ ...styles.miniCard, ...styles[material] }}>
      <strong>{posicao}</strong>
      <div>{nome}</div>
      <div>{pontos} pts</div>
    </div>
  );
}

/* ================= ESTILOS ================= */

const styles = {
  page: {
    padding: 20,
    maxWidth: 1100,
    margin: "0 auto",
  },
  title: {
    textAlign: "center",
    fontSize: 26,
  },
  subTitle: {
    marginTop: 40,
  },
  podio: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: 16,
    marginTop: 30,
  },
  podioMenor: {
    display: "flex",
    justifyContent: "center",
    gap: 16,
    marginTop: 20,
    flexWrap: "wrap",
  },
  card: {
    width: 170,
    borderRadius: 14,
    textAlign: "center",
    padding: 14,
    boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
    animation: "slideUp 0.6s ease",
  },
  miniCard: {
    width: 150,
    borderRadius: 12,
    padding: 12,
    textAlign: "center",
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  nome: {
    fontSize: 18,
    marginTop: 8,
    fontWeight: 600,
  },

  /* Materiais */
  diamante: { background: "#4FC3F7" },
  ouro: { background: "#FFD700" },
  prata: { background: "#C0C0C0" },
  bronze: { background: "#CD7F32" },
  madeira: { background: "#8D6E63" },

  tableWrap: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  meRow: {
    background: "#E3F2FD",
    fontWeight: "bold",
  },
  meTag: {
    marginLeft: 8,
    fontSize: 12,
    background: "#1976D2",
    color: "#fff",
    padding: "2px 6px",
    borderRadius: 6,
  },
};
