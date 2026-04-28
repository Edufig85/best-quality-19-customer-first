"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ChangePassword() {
  const router = useRouter();
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState("");

  const salvar = async () => {
    const cpf = localStorage.getItem("cpf");
    if (!cpf) {
      router.push("/login");
      return;
    }

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/change-password`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf, newPassword: senha }),
      }
    );

    if (!res.ok) {
      setMsg("Erro ao trocar senha");
      return;
    }

    localStorage.removeItem("cpf");
    router.push("/login");
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Trocar senha</h1>

      <input
        type="password"
        placeholder="Nova senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />

      <br /><br />

      <button onClick={salvar}>Salvar</button>
      <p>{msg}</p>
    </div>
  );
}
