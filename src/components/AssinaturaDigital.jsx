import React, { useRef, useState, useEffect } from "react";
import { X, CheckCircle2 } from "lucide-react";
import { useAppData } from "../context/AppData.jsx";

const CONTRATO_MODELO = `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE CONSTRUÇÃO/REFORMA

Pelo presente instrumento, as partes abaixo identificadas ajustam a execução dos serviços descritos na obra vinculada a este contrato, incluindo prazos, etapas e condições de pagamento previamente combinados entre as partes.

O contratante declara estar de acordo com o escopo, valores e cronograma apresentados, autorizando o início dos serviços conforme planejado.

Este documento, quando assinado digitalmente abaixo, tem validade entre as partes para todos os fins.`;

export default function AssinaturaDigital({ obra, onClose }) {
  const { salvarContrato, assinarContrato } = useAppData();
  const canvasRef = useRef(null);
  const [nome, setNome] = useState("");
  const [temTraco, setTemTraco] = useState(false);
  const desenhando = useRef(false);

  const contrato = obra.contrato;
  const jaAssinado = contrato?.assinado;

  useEffect(() => {
    if (!contrato) {
      salvarContrato(obra.id, CONTRATO_MODELO);
    }
  }, []);

  useEffect(() => {
    if (jaAssinado) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.strokeStyle = "#111";
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    resize();

    function pos(e) {
      const rect = canvas.getBoundingClientRect();
      const t = e.touches ? e.touches[0] : e;
      return { x: t.clientX - rect.left, y: t.clientY - rect.top };
    }
    function start(e) {
      e.preventDefault();
      desenhando.current = true;
      setTemTraco(true);
      const p = pos(e);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
    }
    function move(e) {
      if (!desenhando.current) return;
      e.preventDefault();
      const p = pos(e);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
    function end() {
      desenhando.current = false;
    }

    canvas.addEventListener("touchstart", start, { passive: false });
    canvas.addEventListener("touchmove", move, { passive: false });
    canvas.addEventListener("touchend", end);
    canvas.addEventListener("mousedown", start);
    canvas.addEventListener("mousemove", move);
    canvas.addEventListener("mouseup", end);

    return () => {
      canvas.removeEventListener("touchstart", start);
      canvas.removeEventListener("touchmove", move);
      canvas.removeEventListener("touchend", end);
      canvas.removeEventListener("mousedown", start);
      canvas.removeEventListener("mousemove", move);
      canvas.removeEventListener("mouseup", end);
    };
  }, [jaAssinado, contrato]);

  const limparCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setTemTraco(false);
  };

  const confirmar = () => {
    if (!temTraco || nome.trim().length < 2) return;
    const canvas = canvasRef.current;
    const assinaturaBase64 = canvas.toDataURL("image/jpeg", 0.7);
    assinarContrato(obra.id, { assinanteNome: nome.trim(), assinaturaBase64 });
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={boxStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Assinatura Digital — {obra.nome}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8FA6BC", cursor: "pointer" }}><X size={16} /></button>
        </div>

        {jaAssinado ? (
          <div style={{ textAlign: "center", padding: "24px 0" }}>
            <CheckCircle2 size={40} color="#4ADE80" style={{ marginBottom: "10px" }} />
            <div style={{ fontSize: "15px", fontWeight: 700, color: "#4ADE80" }}>Contrato assinado</div>
            <div style={{ fontSize: "12.5px", color: "#8FA6BC", marginTop: "6px" }}>
              Assinado por {contrato.assinanteNome} em {new Date(contrato.dataAssinatura).toLocaleDateString("pt-BR")}
            </div>
            {contrato.assinaturaBase64 && (
              <img src={contrato.assinaturaBase64} alt="Assinatura" style={{ marginTop: "14px", width: "100%", borderRadius: "8px", border: "1px solid #1E3350" }} />
            )}
          </div>
        ) : (
          <>
            <div style={contratoBox}>{contrato?.texto || CONTRATO_MODELO}</div>

            <label style={labelStyle}>
              Nome completo de quem assina
              <input value={nome} onChange={(e) => setNome(e.target.value)} style={inputStyle} placeholder="Digite o nome" />
            </label>

            <label style={labelStyle}>Assine no campo abaixo (use o dedo ou o mouse)</label>
            <canvas ref={canvasRef} style={canvasStyle} />
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "14px" }}>
              <button onClick={limparCanvas} style={limparBtn}>Limpar</button>
            </div>

            <button onClick={confirmar} disabled={!temTraco || nome.trim().length < 2} style={{ ...confirmarBtn, opacity: temTraco && nome.trim().length >= 2 ? 1 : 0.5 }}>
              Confirmar Assinatura
            </button>
          </>
        )}
      </div>
    </div>
  );
}

const overlayStyle = { position: "fixed", inset: 0, background: "#0000009a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 30, padding: "16px" };
const boxStyle = { width: "100%", maxWidth: "420px", maxHeight: "92vh", overflowY: "auto", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "12px", padding: "18px", fontFamily: "'Inter', sans-serif", color: "#E8EDF2" };
const contratoBox = { background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "10px", padding: "12px", maxHeight: "160px", overflowY: "auto", fontSize: "12px", lineHeight: 1.6, color: "#8FA6BC", whiteSpace: "pre-wrap", marginBottom: "14px" };
const labelStyle = { display: "block", fontSize: "12px", color: "#8FA6BC", marginBottom: "8px" };
const inputStyle = { width: "100%", marginTop: "4px", marginBottom: "14px", padding: "9px 10px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", fontSize: "13px" };
const canvasStyle = { width: "100%", height: "160px", background: "#fff", borderRadius: "10px", touchAction: "none", border: "1px solid #1E3350" };
const limparBtn = { marginTop: "8px", background: "none", border: "1px solid #1E3350", color: "#8FA6BC", padding: "6px 12px", borderRadius: "6px", fontSize: "12px", cursor: "pointer" };
const confirmarBtn = { width: "100%", padding: "13px", borderRadius: "10px", border: "none", background: "linear-gradient(135deg, #F2C56B, #F2A93B)", color: "#1A1204", fontSize: "14px", fontWeight: 800, cursor: "pointer" };
