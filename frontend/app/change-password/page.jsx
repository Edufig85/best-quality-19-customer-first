
"use client";

import { useState, useEffect } from "react";
import { useRouter } from  const [cpf, setCpf] = useState("");import { useRouter } from "next/navigation";
  const [senha1, setSenha1] = useState("");
  const [senha2, setSenha2] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const savedCpf = localStorage.getItem("cpf");
    if (!savedCpf) {
      router.push("/login");
    } else {
      setCpf(savedCpf);
    }
  }, [router]);

  const trocarSenha = async () => {
    if (senha1.length < 6) {
      setMsg("A senha deve ter pelo menos 6 caracteres");
      return;
    }

    if (senha1 !== senha2) {
      setMsg("As senhas não conferem");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cpf,
            newPassword: senha1,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Erro ao trocar senha");
        return;
      }

      localStorage.removeItem("cpf");
      setMsg("Senha alterada com sucesso!");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
    } catch (err) {
      setMsg("Erro de conexão com o servidor");
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>Troca obrigatória de senha</h1>

      <input
        type="password"
        placeholder="Nova senha"
        value={senha1}
        onChange={(e) => setSenha1(e.target.value)}
      />

      <br /><br />

      <input
        type="password"
        placeholder="Confirmar nova senha"
        value={senha2}
        onChange={(e) => setSenha2(e.target.value)}
      />

      <br /><br />

      <button onClick={trocarSenha}>
        Alterar senha
      </button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </div>
  );
}

export default function ChangePassword() {
  const router = useRouter();

