import React, { useState } from "react";
import { Plus, Trash2, X, Pencil, Calendar, CheckCircle2, Circle, Cloud, Users2, FileSignature } from "lucide-react";
import { useAppData } from "../context/AppData.jsx";
import AssinaturaDigital from "./AssinaturaDigital.jsx";

const ETAPAS_PADRAO = ["Fundação", "Alvenaria", "Cobertura", "Instalações", "Acabamento", "Entrega"];
const CLIMA_OPCOES = ["Ensolarado", "Nublado", "Chuvoso", "Parcialmente nublado"];

let nextDiarioId = 1;

export default function GestaoObra() {
  const { obras, upsertObra, removeObra, funcionarios } = useAppData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState(emptyForm());
  const [diarioForm, setDiarioForm] = useState(emptyDiario());
  const [showDiarioForm, setShowDiarioForm] = useState(false);
  const [obraAssinatura, setObraAssinatura] = useState(null);

  function emptyForm() {
    return {
      nome: "",
      cliente: "",
      endereco: "",
      dataInicio: new Date().toISOString().slice(0, 10),
      prazoEntrega: "",
      etapas: ETAPAS_PADRAO.map((nome) => ({ nome, concluida: false })),
      diario: [],
    };
  }

  function emptyDiario() {
    return { data: new Date().toISOString().slice(0, 10), clima: CLIMA_OPCOES[0], equipePresente: "", observacoes: "" };
  }

  const openNew = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (obra) => {
    setForm({ ...emptyForm(), ...obra });
    setEditId(obra.id);
    setShowForm(true);
  };

  const salvar = () => {
    if (!form.nome.trim()) return;
    upsertObra({ ...form, id: editId });
    setShowForm(false);
  };

  const toggleEtapa = (obra, idx) => {
    const novasEtapas = obra.etapas.map((e, i) => (i === idx ? { ...e, concluida: !e.concluida } : e));
    upsertObra({ ...obra, etapas: novasEtapas, id: obra.id });
  };

  const progresso = (obra) => {
    const total = obra.etapas?.length || 1;
    const feitas = obra.etapas?.filter((e) => e.concluida).length || 0;
    return Math.round((feitas / total) * 100);
  };

  const abrirDiario = (obra) => {
    setDiarioForm(emptyDiario());
    setExpandedId(obra.id);
    setShowDiarioForm(true);
  };

  const salvarDiario = (obra) => {
    if (!diarioForm.observacoes.trim() && !diarioForm.equipePresente.trim()) return;
    const novoRegistro = { ...diarioForm, id: nextDiarioId++ };
    upsertObra({ ...obra, diario: [...(obra.diario || []), novoRegistro], id: obra.id });
    setShowDiarioForm(false);
  };

  const removerRegistroDiario = (obra, id) => {
    upsertObra({ ...obra, diario: (obra.diario || []).filter((d) => d.id !== id), id: obra.id });
  };

  return (
    <div style={wrapperStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}>
        <div>
          <div style={eyebrow}>Obras</div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Gestão de Obra</div>
        </div>
        <button onClick={openNew} style={primaryBtn}>
          <Plus size={14} /> Nova obra
        </button>
      </div>

      {obras.length === 0 && (
        <div style={{ fontSize: "13px", color: "#5B7A99", padding: "20px 0", textAlign: "center" }}>
          Nenhuma obra cadastrada ainda.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {obras.map((obra) => {
          const isOpen = expandedId === obra.id;
          const pct = progresso(obra);
          const equipeDaObra = funcionarios.filter((f) => String(f.obraId) === String(obra.id));
          return (
            <div key={obra.id} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
                <div style={{ flex: 1, minWidth: "160px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{obra.nome}</div>
                  <div style={{ fontSize: "12px", color: "#8FA6BC" }}>{obra.cliente || "Sem cliente definido"}{obra.endereco ? " · " + obra.endereco : ""}</div>
                  {equipeDaObra.length > 0 && (
                    <div style={{ fontSize: "11.5px", color: "#5B7A99", display: "flex", alignItems: "center", gap: "5px", marginTop: "4px" }}>
                      <Users2 size={12} /> {equipeDaObra.length} da equipe vinculado(s)
                    </div>
                  )}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => openEdit(obra)} style={iconBtn}><Pencil size={14} /></button>
                  <button onClick={() => removeObra(obra.id)} style={{ ...iconBtn, borderColor: "#B0555A", color: "#F2A0A5" }}><Trash2 size={14} /></button>
                </div>
              </div>

              {/* Barra de progresso */}
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#8FA6BC", marginBottom: "4px" }}>
                  <span>Progresso</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{pct}%</span>
                </div>
                <div style={{ height: "6px", background: "#132339", borderRadius: "4px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: "#F2A93B", transition: "width 0.2s" }} />
                </div>
              </div>

              {/* Etapas */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "12px" }}>
                {obra.etapas?.map((etapa, idx) => (
                  <button key={etapa.nome} onClick={() => toggleEtapa(obra, idx)} style={etapaChip(etapa.concluida)}>
                    {etapa.concluida ? <CheckCircle2 size={13} /> : <Circle size={13} />}
                    {etapa.nome}
                  </button>
                ))}
              </div>

              {/* Toggle diário + assinatura */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "12px" }}>
                <button
                  onClick={() => setExpandedId(isOpen ? null : obra.id)}
                  style={secondaryBtn}
                >
                  <Calendar size={13} /> Diário de Obra ({obra.diario?.length || 0})
                </button>
                <button onClick={() => setObraAssinatura(obra)} style={{ ...secondaryBtn, borderColor: obra.contrato?.assinado ? "#4ADE80" : "#1E3350", color: obra.contrato?.assinado ? "#4ADE80" : "#8FA6BC" }}>
                  <FileSignature size={13} /> {obra.contrato?.assinado ? "Contrato assinado" : "Assinatura do contrato"}
                </button>
              </div>

              {isOpen && (
                <div style={{ marginTop: "12px", borderTop: "1px solid #1E3350", paddingTop: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                    <div style={eyebrow}>Registros</div>
                    <button onClick={() => abrirDiario(obra)} style={secondaryBtn}><Plus size={12} /> Novo registro</button>
                  </div>

                  {(!obra.diario || obra.diario.length === 0) && (
                    <div style={{ fontSize: "12px", color: "#5B7A99" }}>Nenhum registro ainda.</div>
                  )}

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {obra.diario?.slice().reverse().map((d) => (
                      <div key={d.id} style={diarioRowStyle}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12.5px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px" }}>
                            {d.data}
                            <span style={{ fontSize: "11px", color: "#8FA6BC", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Cloud size={11} /> {d.clima}
                            </span>
                          </div>
                          {d.equipePresente && <div style={{ fontSize: "11.5px", color: "#8FA6BC" }}>Equipe: {d.equipePresente}</div>}
                          {d.observacoes && <div style={{ fontSize: "12px", marginTop: "4px" }}>{d.observacoes}</div>}
                        </div>
                        <button onClick={() => removerRegistroDiario(obra, d.id)} style={{ ...iconBtn, width: "26px", height: "26px", borderColor: "#B0555A", color: "#F2A0A5" }}>
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {showDiarioForm && (
                    <div style={{ marginTop: "12px", background: "#132339", border: "1px solid #1E3350", borderRadius: "8px", padding: "12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <label style={{ ...labelStyle, flex: 1 }}>
                          Data
                          <input type="date" value={diarioForm.data} onChange={(e) => setDiarioForm({ ...diarioForm, data: e.target.value })} style={inputStyle} />
                        </label>
                        <label style={{ ...labelStyle, flex: 1 }}>
                          Clima
                          <select value={diarioForm.clima} onChange={(e) => setDiarioForm({ ...diarioForm, clima: e.target.value })} style={inputStyle}>
                            {CLIMA_OPCOES.map((c) => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </label>
                      </div>
                      <label style={labelStyle}>
                        Equipe presente
                        <input value={diarioForm.equipePresente} onChange={(e) => setDiarioForm({ ...diarioForm, equipePresente: e.target.value })} style={inputStyle} placeholder="Ex: 3 pedreiros, 2 seventes" />
                      </label>
                      <label style={labelStyle}>
                        Observações do dia
                        <textarea
                          value={diarioForm.observacoes}
                          onChange={(e) => setDiarioForm({ ...diarioForm, observacoes: e.target.value })}
                          style={{ ...inputStyle, minHeight: "60px", resize: "vertical" }}
                          placeholder="Ex: Concluída a alvenaria do 1º pavimento"
                        />
                      </label>
                      <button onClick={() => salvarDiario(obra)} style={{ ...primaryBtn, width: "100%", justifyContent: "center" }}>
                        Salvar registro
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <div style={modalOverlay} onClick={() => setShowForm(false)}>
          <div onClick={(e) => e.stopPropagation()} style={modalBox}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div style={{ fontSize: "14px", fontWeight: 600 }}>{editId ? "Editar obra" : "Nova obra"}</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8FA6BC", cursor: "pointer" }}><X size={16} /></button>
            </div>

            <label style={labelStyle}>
              Nome da obra
              <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder="Ex: Reforma Residencial - Cliente X" />
            </label>
            <label style={labelStyle}>
              Cliente
              <input value={form.cliente} onChange={(e) => setForm({ ...form, cliente: e.target.value })} style={inputStyle} placeholder="Nome do cliente" />
            </label>
            <label style={labelStyle}>
              Endereço
              <input value={form.endereco} onChange={(e) => setForm({ ...form, endereco: e.target.value })} style={inputStyle} placeholder="Endereço da obra" />
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              <label style={{ ...labelStyle, flex: 1 }}>
                Início
                <input type="date" value={form.dataInicio} onChange={(e) => setForm({ ...form, dataInicio: e.target.value })} style={inputStyle} />
              </label>
              <label style={{ ...labelStyle, flex: 1 }}>
                Prazo de entrega
                <input type="date" value={form.prazoEntrega} onChange={(e) => setForm({ ...form, prazoEntrega: e.target.value })} style={inputStyle} />
              </label>
            </div>

            <button onClick={salvar} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: "8px" }}>
              Salvar
            </button>
          </div>
        </div>
      )}

      {obraAssinatura && (
        <AssinaturaDigital obra={obras.find((o) => o.id === obraAssinatura.id) || obraAssinatura} onClose={() => setObraAssinatura(null)} />
      )}
    </div>
  );
}

const wrapperStyle = { fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1B2B", color: "#E8EDF2", borderRadius: "12px", border: "1px solid #1E3350", padding: "20px", width: "100%" };
const eyebrow = { fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" };
const cardStyle = { background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "14px" };
const inputStyle = { width: "100%", marginTop: "4px", padding: "8px 10px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" };
const labelStyle = { display: "block", fontSize: "12px", color: "#8FA6BC", marginBottom: "10px" };
const primaryBtn = { display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", background: "#F2A93B22", border: "1px solid #F2A93B", borderRadius: "8px", color: "#F2A93B", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
const secondaryBtn = { display: "flex", alignItems: "center", gap: "6px", padding: "7px 11px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", cursor: "pointer", fontSize: "12px" };
const iconBtn = { display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", cursor: "pointer" };
const diarioRowStyle = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "8px", padding: "10px" };
const modalOverlay = { position: "fixed", inset: 0, background: "#0000009a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: "16px" };
const modalBox = { width: "100%", maxWidth: "360px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "18px", maxHeight: "90vh", overflowY: "auto" };

function etapaChip(concluida) {
  return {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    padding: "5px 10px",
    borderRadius: "16px",
    fontSize: "11.5px",
    border: "1px solid " + (concluida ? "#4ADE80" : "#1E3350"),
    background: concluida ? "#4ADE8022" : "#132339",
    color: concluida ? "#4ADE80" : "#8FA6BC",
    cursor: "pointer",
  };
}
