import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calculator, Layers, PaintBucket } from "lucide-react";

// Consumo por m³ de traço (valores de referência usuais em obra)
const TRACOS = {
  "1:2:3 — Concreto estrutural": { cimentoSacos: 6, areiaM3: 0.52, britaM3: 0.78, temBrita: true },
  "1:3:5 — Concreto magro/contrapiso": { cimentoSacos: 4, areiaM3: 0.6, britaM3: 1.0, temBrita: true },
  "1:2 — Argamassa de assentamento": { cimentoSacos: 8.5, areiaM3: 1.0, britaM3: 0, temBrita: false },
  "1:4 — Argamassa de reboco": { cimentoSacos: 4.5, areiaM3: 1.1, britaM3: 0, temBrita: false },
};

// Rendimento por m² de parede (un/m²), já considerando assentamento padrão
const TIJOLOS = {
  "Tijolo comum (9x19x19cm)": 25,
  "Bloco cerâmico 6 furos (9x19x19cm)": 16,
  "Bloco cerâmico 8 furos (14x19x29cm)": 15,
  "Bloco de concreto (14x19x39cm)": 12.5,
};

const TABS = [
  { id: "concreto", label: "Traço", icon: Calculator },
  { id: "tijolos", label: "Tijolos/Blocos", icon: Layers },
  { id: "tinta", label: "Tinta", icon: PaintBucket },
];

export default function Calculadoras() {
  const [tab, setTab] = useState("concreto");

  return (
    <div style={wrapperStyle}>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ marginBottom: "18px" }}>
        <div style={eyebrow}>Campo</div>
        <div style={{ fontSize: "18px", fontWeight: 600 }}>Calculadoras de Obra</div>
      </motion.div>

      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const isActive = tab === t.id;
          return (
            <motion.button
              key={t.id}
              onClick={() => setTab(t.id)}
              whileHover={!isActive ? { y: -2 } : {}}
              whileTap={{ scale: 0.96 }}
              style={{ ...tabBtnBase(isActive), position: "relative", overflow: "hidden" }}
            >
              {isActive && (
                <motion.span
                  layoutId="calc-tab-pill"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  style={{ position: "absolute", inset: 0, background: "#F2A93B22", zIndex: 0 }}
                />
              )}
              <span style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                <Icon size={14} /> {t.label}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {tab === "concreto" && <CalcConcreto />}
          {tab === "tijolos" && <CalcTijolos />}
          {tab === "tinta" && <CalcTinta />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function CalcConcreto() {
  const [traco, setTraco] = useState(Object.keys(TRACOS)[0]);
  const [volume, setVolume] = useState(1);

  const resultado = useMemo(() => {
    const t = TRACOS[traco];
    const v = Number(volume) || 0;
    return {
      cimento: Math.ceil(t.cimentoSacos * v),
      areia: (t.areiaM3 * v).toFixed(2),
      brita: t.temBrita ? (t.britaM3 * v).toFixed(2) : null,
    };
  }, [traco, volume]);

  return (
    <div>
      <label style={labelStyle}>
        Tipo de traço
        <select value={traco} onChange={(e) => setTraco(e.target.value)} style={inputStyle}>
          {Object.keys(TRACOS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </label>
      <label style={labelStyle}>
        Volume desejado (m³)
        <input type="number" step="0.1" value={volume} onChange={(e) => setVolume(e.target.value)} style={inputStyle} />
      </label>

      <div style={resultBox}>
        <div style={{ ...eyebrow, marginBottom: "10px" }}>Você vai precisar de</div>
        <ResultRow rkey={`cimento-${resultado.cimento}`} label="Cimento" value={`${resultado.cimento} saco(s) de 50kg`} />
        <ResultRow rkey={`areia-${resultado.areia}`} label="Areia" value={`${resultado.areia} m³`} />
        {resultado.brita !== null && <ResultRow rkey={`brita-${resultado.brita}`} label="Brita" value={`${resultado.brita} m³`} />}
        <div style={{ fontSize: "10.5px", color: "#5B7A99", marginTop: "8px" }}>
          Valores de referência para traço padrão. Pode variar conforme umidade do material e tipo de cimento.
        </div>
      </div>
    </div>
  );
}

function CalcTijolos() {
  const [tipo, setTipo] = useState(Object.keys(TIJOLOS)[0]);
  const [largura, setLargura] = useState(3);
  const [altura, setAltura] = useState(2.8);
  const [perda, setPerda] = useState(10);

  const resultado = useMemo(() => {
    const area = (Number(largura) || 0) * (Number(altura) || 0);
    const un = TIJOLOS[tipo];
    const base = area * un;
    const comPerda = base * (1 + (Number(perda) || 0) / 100);
    return { area: area.toFixed(2), quantidade: Math.ceil(comPerda) };
  }, [tipo, largura, altura, perda]);

  return (
    <div>
      <label style={labelStyle}>
        Tipo de tijolo/bloco
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} style={inputStyle}>
          {Object.keys(TIJOLOS).map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <label style={{ ...labelStyle, flex: 1 }}>
          Largura da parede (m)
          <input type="number" step="0.1" value={largura} onChange={(e) => setLargura(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ ...labelStyle, flex: 1 }}>
          Altura da parede (m)
          <input type="number" step="0.1" value={altura} onChange={(e) => setAltura(e.target.value)} style={inputStyle} />
        </label>
      </div>
      <label style={labelStyle}>
        Margem de perda/quebra (%)
        <input type="number" value={perda} onChange={(e) => setPerda(e.target.value)} style={inputStyle} />
      </label>

      <div style={resultBox}>
        <div style={{ ...eyebrow, marginBottom: "10px" }}>Você vai precisar de</div>
        <ResultRow rkey={`area-${resultado.area}`} label="Área da parede" value={`${resultado.area} m²`} />
        <ResultRow rkey={`qtd-${resultado.quantidade}`} label="Quantidade" value={`${resultado.quantidade} unidades`} destaque />
        <div style={{ fontSize: "10.5px", color: "#5B7A99", marginTop: "8px" }}>
          Já considera a margem de perda informada. Desconte vãos de porta/janela da área se houver.
        </div>
      </div>
    </div>
  );
}

function CalcTinta() {
  const [area, setArea] = useState(30);
  const [demaos, setDemaos] = useState(2);
  const [rendimento, setRendimento] = useState(12);

  const resultado = useMemo(() => {
    const a = Number(area) || 0;
    const d = Number(demaos) || 1;
    const r = Number(rendimento) || 1;
    const litros = (a * d) / r;
    const latas18 = litros / 18;
    return { litros: litros.toFixed(1), latas18: latas18.toFixed(2) };
  }, [area, demaos, rendimento]);

  return (
    <div>
      <label style={labelStyle}>
        Área total a pintar (m²)
        <input type="number" value={area} onChange={(e) => setArea(e.target.value)} style={inputStyle} />
      </label>
      <div style={{ display: "flex", gap: "8px" }}>
        <label style={{ ...labelStyle, flex: 1 }}>
          Número de demãos
          <input type="number" value={demaos} onChange={(e) => setDemaos(e.target.value)} style={inputStyle} />
        </label>
        <label style={{ ...labelStyle, flex: 1 }}>
          Rendimento (m²/L por demão)
          <input type="number" value={rendimento} onChange={(e) => setRendimento(e.target.value)} style={inputStyle} />
        </label>
      </div>

      <div style={resultBox}>
        <div style={{ ...eyebrow, marginBottom: "10px" }}>Você vai precisar de</div>
        <ResultRow rkey={`litros-${resultado.litros}`} label="Total de tinta" value={`${resultado.litros} litros`} destaque />
        <ResultRow rkey={`latas-${resultado.latas18}`} label="Equivalente em latas de 18L" value={`${resultado.latas18} lata(s)`} />
        <div style={{ fontSize: "10.5px", color: "#5B7A99", marginTop: "8px" }}>
          O rendimento padrão varia por marca/tipo de tinta — confira na lata do produto e ajuste aqui.
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value, destaque, rkey }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E3350" }}>
      <span style={{ fontSize: "12.5px", color: "#8FA6BC" }}>{label}</span>
      <AnimatePresence mode="wait">
        <motion.span
          key={rkey}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          style={{ fontSize: destaque ? "16px" : "13px", fontWeight: 700, color: destaque ? "#F2A93B" : "#E8EDF2", fontFamily: "'JetBrains Mono', monospace" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

const wrapperStyle = { fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1B2B", color: "#E8EDF2", borderRadius: "12px", border: "1px solid #1E3350", padding: "20px", width: "100%", maxWidth: "420px" };
const eyebrow = { fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" };
const inputStyle = { width: "100%", marginTop: "4px", padding: "9px 10px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" };
const labelStyle = { display: "block", fontSize: "12px", color: "#8FA6BC", marginBottom: "12px" };
const resultBox = { background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "14px", marginTop: "8px" };

function tabBtnBase(active) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "7px 12px",
    fontSize: "12.5px",
    borderRadius: "8px",
    border: "1px solid " + (active ? "#F2A93B" : "#1E3350"),
    background: active ? "transparent" : "#132339",
    color: active ? "#F2A93B" : "#8FA6BC",
    cursor: "pointer",
  };
}
