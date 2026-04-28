"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();

  const [cpf, setCpf] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  const realizarLogin = async () => {
    if (!cpf || !password) {
      setMsg("Preencha CPF e senha");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cpf, password })
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "CPF ou senha inválidos");
        return;
      }

      // ✅ Troca obrigatória de senha
      if (data.must_change_password) {
        localStorage.setItem("cpf", cpf);
        router.push("/change-password");
        return;
      }

      // ✅ Login normal (caso futuro)
      setMsg("Login realizado com sucesso");
      router.push("/");
    } catch (e) {
      setMsg("Erro ao conectar com o servidor");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Login – Best Quality 19</h1>

      <input
        type="text"
        placeholder="CPF (somente números)"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br /><br />

      <button onClick={realizarLogin}>
        Entrar
      </button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}
``
