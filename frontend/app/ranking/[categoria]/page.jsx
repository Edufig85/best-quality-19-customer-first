"use client";

import { useEffect, useRef, useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";

export default function RankingCategoria({ params }) {
  useAuthGuard();

  const { categoria } = params;
  const userName = localStorage.getItem("userName");
  const tableRef = useRef(null);

  const [ranking, setRanking] = useState([]);
  const [msg, setMsg] = useState("Carregando ranking...");
  const [ano, setAno] = useState("");
  const [mes, setMes] = useState("");

  useEffect(() => {
    const carregar = async () => {
      const query = new URLSearchParams();
      if (ano) query.append("ano", ano);
      if (mes) query.append("mes", mes);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/ranking/${decodeURIComponent(
          categoria
        )}?${query}`
      );

      const data = await res.json();
      setRanking(data);
      setMsg("");
    };

    carregar();
  }, [categoria, ano, mes]);

  // Centraliza usuário
  useEffect(() => {
    if (!tableRef.current) return;
    const el = tableRef.current.querySelector("[data-me='true']");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [ranking]);

  const top5 = ranking.slice(0, 5);
  const isTop5 = top5.find((r) => r.nome === userName);

  return (
    <div style={{ padding: 20 }}>
      <h1>🏆 Ranking – {decodeURIComponent(categoria)}</h1>

      {/* FILTROS */}
      <div style={{ marginBottom: 20 }}>
        <select onChange={(e) => setAno(e.target.value)}>
          <option value="">Ano</option>
          <option value="2025">2025</option>
          <option value="2026">2026</option>
        </select>

        <select onChange={(e) => setMes(e.target.value)}>
          <option value="">Mês</option>
          <option value="1">Janeiro</option>
          <option value="2">Fevereiro</option>
          <option value="3">Março</option>
        </select>
      </div>

      {/* MENSAGEM TOP 5 */}
      {isTop5 && (
        <div style={styles.celebration}>
          🎉 Parabéns! Você está no <strong>Top 5</strong>!
        </div>
      )}

      {/* PÓDIO */}
      <div style={styles.podio}>
        {top5.map((p) => (
          <MedalCard key={p.posicao} {...p} me={p.nome === userName} />
        ))}
      </div>

      {/* LISTA */}
      <div ref={tableRef} style={{ marginTop: 30 }}>
        {ranking.map((r) => (
          <div
            key={r.posicao}
            data-me={r.nome === userName}
            style={{
              padding: 10,
              background: r.nome === userName ? "#E3F2FD" : "#fff",
              fontWeight: r.nome === userName ? "bold" : "normal",
            }}
          >
            {r.posicao}º – {r.nome} – {r.pontos} pontos
          </div>
        ))}
      </div>
    </div>
  );
}

/* ========= COMPONENTE MEDALHA ========= */

function MedalCard({ posicao, nome, pontos, me }) {
  const material = ["diamante", "ouro", "prata", "bronze", "madeira"][
    posicao - 1
  ];

  return (
    <div
      style={{
        ...styles.card,
        ...styles[material],
        animation: me ? "pulse 1.2s infinite" : "fadeUp 0.6s",
      }}
    >
      <strong>{posicao}º</strong>
      <div style={{ fontSize: 24 }}>{icons[material]}</div>
      <div>{nome}</div>
      <div>{pontos} pts</div>
      {me && <div style={styles.me}>Você</div>}
    </div>
  );
}

/* ========= ÍCONES ========= */

const icons = {
  diamante: "💎",
  ouro: "🥇",
  prata: "🥈",
  bronze: "🥉",
  madeira: "🪵",
};

/* ========= ESTILOS ========= */

const styles = {
  podio: {
    display: "flex",
    gap: 16,
    flexWrap: "wrap",
    justifyContent: "center",
  },
  card: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    textAlign: "center",
    boxShadow: "0 4px 8px rgba(0,0,0,.2)",
  },
  diamante: { background: "#4FC3F7" },
  ouro: { background: "#FFD700" },
  prata: { background: "#C0C0C0" },
  bronze: { background: "#CD7F32" },
  madeira: { background: "#8D6E63" },
  me: {
    marginTop: 4,
    background: "#1976D2",
    color: "#fff",
    borderRadius: 6,
    padding: "2px 6px",
  },
  celebration: {
    background: "#FFF9C4",
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    textAlign: "center",
  },
};
``
