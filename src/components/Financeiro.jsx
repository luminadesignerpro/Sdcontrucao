import React, { useState, useMemo } from "react";
import { Plus, Trash2, X, TrendingUp, TrendingDown, Wallet, Building2 } from "lucide-react";
import { useAppData } from "../context/AppData.jsx";

const CATEGORIAS_DESPESA = ["Pagamento de equipe", "Material", "Ferramenta/Equipamento", "Transporte", "Outros"];
const CATEGORIAS_RECEITA = ["Recebimento de cliente", "Adiantamento", "Outros"];

let nextLancamentoId = 1;

export default function Financeiro() {
  const { funcionarios, obras, upsertObra } = useAppData();
  const [lancamentos, setLancamentos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [filtroObra, setFiltroObra] = useState("todas");
  const [novaObraNome, setNovaObraNome] = useState("");

  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return { tipo: "despesa", descricao: "", valor: "", categoria: CATEGORIAS_DESPESA[0], obraId: "", data: new Date().toISOString().slice(0, 10) };
  }

  const openNew = (tipo) => {
    setForm({ ...emptyForm(), tipo, categoria: tipo === "despesa" ? CATEGORIAS_DESPESA[0] : CATEGORIAS_RECEITA[0] });
    setShowForm(true);
  };

  const salvar = () => {
    if (!form.descricao.trim() || !form.valor) return;
    setLancamentos((prev) => [...prev, { ...form, id: nextLancamentoId++ }]);
    setShowForm(false);
  };

  const remover = (id) => setLancamentos((prev) => prev.filter((l) => l.id !== id));

  const pagarDiaria = (func) => {
    if (!func.diaria) return;
    setLancamentos((prev) => [
      ...prev,
      {
        id: nextLancamentoId++,
        tipo: "despesa",
        descricao: `Pagamento (${func.tipoPagamento === "diaria" ? "diária" : "empreitada"}) — ${func.nome}`,
        valor: func.diaria,
        categoria: "Pagamento de equipe",
        obraId: func.obraId || "",
        data: new Date().toISOString().slice(0, 10),
      },
    ]);
  };

  const criarObraRapida = () => {
    const nome = novaObraNome.trim();
    if (!nome) return;
    upsertObra({ nome });
    setNovaObraNome("");
  };

  const lancamentosFiltrados = useMemo(() => {
    if (filtroObra === "todas") return lancamentos;
    return lancamentos.filter((l) => String(l.obraId) === String(filtroObra));
  }, [lancamentos, filtroObra]);

  const totais = useMemo(() => {
    const receitas = lancamentosFiltrados.filter((l) => l.tipo === "receita").reduce((s, l) => s + Number(l.valor), 0);
    const despesas = lancamentosFiltrados.filter((l) => l.tipo === "despesa").reduce((s, l) => s + Number(l.valor), 0);
    return { receitas, despesas, saldo: receitas - despesas };
  }, [lancamentosFiltrados]);

  const obraNome = (id) => obras.find((o) => o.id === Number(id))?.nome || "Sem obra";
  const fmt = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div style={wrapperStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
        <div>
          <div style={eyebrow}>Financeiro</div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Contas e Fluxo de Caixa</div>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button onClick={() => openNew("receita")} style={{ ...primaryBtn, borderColor: "#4ADE80", color: "#4ADE80", background: "#4ADE8022" }}>
            <TrendingUp size={14} /> Receita
          </button>
          <button onClick={() => openNew("despesa")} style={{ ...primaryBtn, borderColor: "#F2A0A5", color: "#F2A0A5", background: "#F2A0A522" }}>
            <TrendingDown size={14} /> Despesa
          </button>
        </div>
      </div>

      {/* Cards de totais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "10px", marginBottom: "18px" }}>
        <div style={cardStyle}>
          <div style={eyebrow}>Receitas</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#4ADE80", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totais.receitas)}</div>
        </div>
        <div style={cardStyle}>
          <div style={eyebrow}>Despesas</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: "#F2A0A5", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totais.despesas)}</div>
        </div>
        <div style={cardStyle}>
          <div style={eyebrow}>Saldo</div>
          <div style={{ fontSize: "18px", fontWeight: 700, color: totais.saldo >= 0 ? "#F2A93B" : "#F2A0A5", fontFamily: "'JetBrains Mono', monospace" }}>{fmt(totais.saldo)}</div>
        </div>
      </div>

      {/* Filtro por obra + criar obra rápida */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", alignItems: "center" }}>
        <Building2 size={14} color="#8FA6BC" />
        <select value={filtroObra} onChange={(e) => setFiltroObra(e.target.value)} style={{ ...inputStyle, marginTop: 0, width: "auto" }}>
          <option value="todas">Todas as obras</option>
          {obras.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
        </select>
        <input
          value={novaObraNome}
          onChange={(e) => setNovaObraNome(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && criarObraRapida()}
          placeholder="Nova obra (ex: Reforma Cliente X)"
          style={{ ...inputStyle, marginTop: 0, flex: 1, minWidth: "160px" }}
        />
        <button onClick={criarObraRapida} style={secondaryBtn}><Plus size={13} /> Criar obra</button>
      </div>

      {/* Pagamento rápido de diária */}
      {funcionarios.length > 0 && (
        <div style={{ background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}>
          <div style={{ ...eyebrow, marginBottom: "10px" }}>Pagar diária/empreitada rapidamente</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {funcionarios.filter((f) => f.diaria).map((f) => (
              <button key={f.id} onClick={() => pagarDiaria(f)} style={secondaryBtn}>
                <Wallet size={13} /> {f.nome} — {fmt(f.diaria)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Lista de lançamentos */}
      {lancamentosFiltrados.length === 0 && (
        <div style={{ fontSize: "13px", color: "#5B7A99", padding: "20px 0", textAlign: "center" }}>
          Nenhum lançamento ainda.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {lancamentosFiltrados
          .slice()
          .sort((a, b) => (a.data < b.data ? 1 : -1))
          .map((l) => (
            <div key={l.id} style={rowStyle}>
              <div>
                <div style={{ fontSize: "13.5px", fontWeight: 600 }}>{l.descricao}</div>
                <div style={{ fontSize: "11.5px", color: "#5B7A99" }}>{l.categoria} · {obraNome(l.obraId)} · {l.data}</div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, color: l.tipo === "receita" ? "#4ADE80" : "#F2A0A5" }}>
                  {l.tipo === "receita" ? "+" : "-"} {fmt(l.valor)}
                </div>
                <button onClick={() => remover(l.id)} style={{ ...iconBtn, borderColor: "#B0555A", color: "#F2A0A5" }}><Trash2 size={13} /></button>
              </div>
            </div>
          ))}
      </div>

      {showForm && (
        <div style={modalOverlay} onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{form.tipo === "receita" ? "Nova receita" : "Nova despesa"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8FA6BC", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <label style={labelStyle}>
              Descrição
              <input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} style={inputStyle} placeholder="Ex: Compra de cimento" />
            </label>

            <div style={{ display: "flex", gap: "8px" }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Valor (R$)
                <input type="number" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} style={inputStyle} placeholder="0" />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                Data
                <input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} style={inputStyle} />
              </label>
            </div>

            <label style={labelStyle}>
              Categoria
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} style={inputStyle}>
                {(form.tipo === "despesa" ? CATEGORIAS_DESPESA : CATEGORIAS_RECEITA).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label style={labelStyle}>
              Obra
              <select value={form.obraId} onChange={(e) => setForm({ ...form, obraId: e.target.value })} style={inputStyle}>
                <option value="">Nenhuma / geral</option>
                {obras.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
              </select>
            </label>

            <button onClick={salvar} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: "8px" }}>
              Salvar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const wrapperStyle = { fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1B2B", color: "#E8EDF2", borderRadius: "12px", border: "1px solid #1E3350", padding: "20px", width: "100%" };
const eyebrow = { fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" };
const cardStyle = { background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "12px 14px" };
const inputStyle = { width: "100%", marginTop: "4px", padding: "8px 10px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" };
const labelStyle = { display: "block", fontSize: "12px", color: "#8FA6BC", marginBottom: "10px" };
const primaryBtn = { display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", background: "#F2A93B22", border: "1px solid #F2A93B", borderRadius: "8px", color: "#F2A93B", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
const secondaryBtn = { display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", cursor: "pointer", fontSize: "12.5px" };
const iconBtn = { display: "flex", alignItems: "center", justifyContent: "center", width: "30px", height: "30px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", cursor: "pointer" };
const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "10px 14px" };
const modalOverlay = { position: "fixed", inset: 0, background: "#0000009a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: "16px" };
const modalBox = { width: "100%", maxWidth: "340px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "18px", maxHeight: "90vh", overflowY: "auto" };
