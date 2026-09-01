import React, { useState } from "react";
import { HardHat, Lock, User } from "lucide-react";
import { useAppData } from "../context/AppData.jsx";

export default function Login() {
  const { login } = useAppData();
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const handleLogin = () => {
    setErro("");
    setCarregando(true);
    setTimeout(() => {
      const resultado = login(usuario, senha);
      if (!resultado.ok) {
        setErro(resultado.erro);
        setCarregando(false);
      }
    }, 350);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "radial-gradient(ellipse 70% 50% at 25% 15%, #16283F 0%, #0F1B2B 60%)",
        fontFamily: "'Inter', system-ui, sans-serif",
        color: "#E8EDF2",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "380px",
          background: "#0B1522",
          border: "1px solid #1E3350",
          borderRadius: "18px",
          padding: "36px 30px",
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              margin: "0 auto 14px",
              border: "2px solid #F2A93B",
              boxShadow: "0 0 30px rgba(242,169,59,0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#132339",
            }}
          >
            <HardHat size={34} color="#F2A93B" />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 800, letterSpacing: "0.04em", color: "#F2A93B" }}>
            CONSTRUTOP
          </div>
          <div style={{ fontSize: "10.5px", color: "#5B7A99", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "4px", fontFamily: "'JetBrains Mono', monospace" }}>
            Sistema de Gestão de Obras (demonstração)
          </div>
        </div>

        <label style={labelStyle}>
          <User size={12} style={{ marginRight: "5px", verticalAlign: "-2px" }} />
          Usuário
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            placeholder="seu usuário"
            autoCapitalize="none"
          />
        </label>

        <label style={labelStyle}>
          <Lock size={12} style={{ marginRight: "5px", verticalAlign: "-2px" }} />
          Senha
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            onKeyDown={handleKeyDown}
            style={inputStyle}
            placeholder="••••••••"
          />
        </label>

        <button onClick={handleLogin} disabled={carregando} style={btnStyle}>
          {carregando ? "Verificando..." : "Entrar no sistema"}
        </button>

        {erro && (
          <div style={{ marginTop: "12px", padding: "10px 12px", background: "#B0555A22", border: "1px solid #B0555A", borderRadius: "8px", color: "#F2A0A5", fontSize: "12.5px", textAlign: "center" }}>
            {erro}
          </div>
        )}

        <div style={{ marginTop: "22px", textAlign: "center", fontSize: "10.5px", color: "#5B7A99", lineHeight: 1.6 }}>
          Contas de demonstração:<br />
          admin / admin123 (Administrador)<br />
          mestre / mestre123 (Mestre de Obra)<br />
          cliente / cliente123 (Cliente Final)
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: "block", fontSize: "11px", color: "#8FA6BC", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "'JetBrains Mono', monospace" };
const inputStyle = { width: "100%", marginTop: "6px", padding: "12px 13px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "10px", color: "#E8EDF2", fontSize: "14px", fontFamily: "'Inter', sans-serif" };
const btnStyle = {
  width: "100%",
  padding: "14px",
  background: "linear-gradient(135deg, #F2C56B, #F2A93B)",
  border: "none",
  borderRadius: "10px",
  color: "#1A1204",
  fontSize: "14.5px",
  fontWeight: 800,
  cursor: "pointer",
  marginTop: "4px",
};
