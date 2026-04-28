"use client";
import { useEffect, useState } from "react";
import useAuthGuard from "../../hooks/useAuthGuard";
import { useRouter } from "next/navigation";
{me && <div>🏅 {badge}</div>}
export default function Categorias() {
  useAuthGuard();
  const router = useRouter();
  const [cats, setCats] = useState([]);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/ranking/categorias`)
      .then(r => r.json())
      .then(setCats);
  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Categorias</h1>
      {cats.map(c => (
        <div
          key={c}
          style={{ padding: 15, cursor: "pointer" }}
          onClick={() => router.push(`/ranking/${encodeURIComponent(c)}`)}
        >
          🏆 {c}
        </div>
      ))}
    </div>
  );
}
