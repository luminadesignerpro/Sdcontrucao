import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Pencil, X, UserRound, Phone, Wallet, Building2 } from "lucide-react";
import { useAppData } from "../context/AppData.jsx";

export default function Funcionarios() {
  const { funcoes, addFuncao, removeFuncao, funcionarios, upsertFuncionario, removeFuncionario, obras } = useAppData();
  const [novaFuncao, setNovaFuncao] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm());

  function emptyForm() {
    return { nome: "", funcao: funcoes[0] || "", telefone: "", diaria: "", obraId: "", tipoPagamento: "diaria" };
  }

  const handleAddFuncao = () => {
    addFuncao(novaFuncao);
    setNovaFuncao("");
  };

  const openNew = () => {
    setForm(emptyForm());
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (func) => {
    setForm({ ...func });
    setEditId(func.id);
    setShowForm(true);
  };

  const saveFuncionario = () => {
    if (!form.nome.trim()) return;
    upsertFuncionario({ ...form, id: editId });
    setShowForm(false);
  };

  const obraNome = (id) => obras.find((o) => o.id === Number(id))?.nome || "";

  return (
    <div style={wrapperStyle}>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "18px" }}
      >
        <div>
          <div style={eyebrow}>Equipe</div>
          <div style={{ fontSize: "18px", fontWeight: 600 }}>Funcionários e Funções</div>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }} onClick={openNew} style={primaryBtn}>
          <Plus size={14} /> Novo funcionário
        </motion.button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        style={{ background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "14px", marginBottom: "18px" }}
      >
        <div style={eyebrow}>Funções cadastradas</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "8px", marginBottom: "10px" }}>
          <AnimatePresence initial={false}>
            {funcoes.map((f) => (
              <motion.span
                key={f}
                layout
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.2 }}
                style={pillStyle}
              >
                {f}
                <X size={12} style={{ cursor: "pointer", color: "#8FA6BC" }} onClick={() => removeFuncao(f)} />
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={novaFuncao}
            onChange={(e) => setNovaFuncao(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddFuncao()}
            placeholder="Nova função (ex: Gesseiro)"
            style={{ ...inputStyle, marginTop: 0, flex: 1 }}
          />
          <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddFuncao} style={secondaryBtn}>
            <Plus size={13} /> Adicionar
          </motion.button>
        </div>
      </motion.div>

      {funcionarios.length === 0 && (
        <div style={{ fontSize: "13px", color: "#5B7A99", padding: "20px 0", textAlign: "center" }}>
          Nenhum funcionário cadastrado ainda.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <AnimatePresence initial={false}>
          {funcionarios.map((f) => (
            <motion.div
              key={f.id}
              layout
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              style={rowStyle}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={avatarStyle}>
                  <UserRound size={18} color="#F2A93B" />
                </div>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600 }}>{f.nome}</div>
                  <div style={{ fontSize: "12px", color: "#8FA6BC" }}>{f.funcao}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px", fontSize: "12px", color: "#8FA6BC", flexWrap: "wrap" }}>
                {f.telefone && <span style={metaItem}><Phone size={12} /> {f.telefone}</span>}
                {f.diaria && <span style={metaItem}><Wallet size={12} /> R$ {Number(f.diaria).toLocaleString("pt-BR")} / {f.tipoPagamento === "diaria" ? "diária" : "empreitada"}</span>}
                {f.obraId && <span style={metaItem}><Building2 size={12} /> {obraNome(f.obraId)}</span>}
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => openEdit(f)} style={iconBtn}><Pencil size={14} /></motion.button>
                <motion.button whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }} onClick={() => removeFuncionario(f.id)} style={{ ...iconBtn, borderColor: "#B0555A", color: "#F2A0A5" }}><Trash2 size={14} /></motion.button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={modalOverlay}
            onClick={() => setShowForm(false)}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 16 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={modalBox}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>{editId ? "Editar funcionário" : "Novo funcionário"}</div>
                <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#8FA6BC", cursor: "pointer" }}><X size={16} /></button>
              </div>

              <label style={labelStyle}>
                Nome completo
                <input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} style={inputStyle} placeholder="Ex: João da Silva" />
              </label>

              <label style={labelStyle}>
                Função
                <select value={form.funcao} onChange={(e) => setForm({ ...form, funcao: e.target.value })} style={inputStyle}>
                  {funcoes.map((f) => <option key={f} value={f}>{f}</option>)}
                </select>
              </label>

              <label style={labelStyle}>
                Telefone
                <input value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} style={inputStyle} placeholder="(00) 00000-0000" />
              </label>

              <div style={{ display: "flex", gap: "8px" }}>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Valor
                  <input type="number" value={form.diaria} onChange={(e) => setForm({ ...form, diaria: e.target.value })} style={inputStyle} placeholder="150" />
                </label>
                <label style={{ ...labelStyle, flex: 1 }}>
                  Pagamento
                  <select value={form.tipoPagamento} onChange={(e) => setForm({ ...form, tipoPagamento: e.target.value })} style={inputStyle}>
                    <option value="diaria">Por diária</option>
                    <option value="empreitada">Empreitada</option>
                  </select>
                </label>
              </div>

              <label style={labelStyle}>
                Obra vinculada
                <select value={form.obraId} onChange={(e) => setForm({ ...form, obraId: e.target.value })} style={inputStyle}>
                  <option value="">Nenhuma / a definir</option>
                  {obras.map((o) => <option key={o.id} value={o.id}>{o.nome}</option>)}
                </select>
              </label>

              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveFuncionario} style={{ ...primaryBtn, width: "100%", justifyContent: "center", marginTop: "8px" }}>
                Salvar
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const wrapperStyle = { fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1B2B", color: "#E8EDF2", borderRadius: "12px", border: "1px solid #1E3350", padding: "20px", width: "100%" };
const eyebrow = { fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" };
const inputStyle = { width: "100%", marginTop: "4px", padding: "8px 10px", background: "#0F1B2B", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", fontSize: "13px", fontFamily: "'JetBrains Mono', monospace" };
const labelStyle = { display: "block", fontSize: "12px", color: "#8FA6BC", marginBottom: "10px" };
const primaryBtn = { display: "flex", alignItems: "center", gap: "8px", padding: "9px 14px", background: "#F2A93B22", border: "1px solid #F2A93B", borderRadius: "8px", color: "#F2A93B", cursor: "pointer", fontSize: "13px", fontWeight: 600 };
const secondaryBtn = { display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", cursor: "pointer", fontSize: "12.5px" };
const iconBtn = { display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", color: "#E8EDF2", cursor: "pointer" };
const pillStyle = { display: "flex", alignItems: "center", gap: "6px", padding: "5px 10px", background: "#132339", border: "1px solid #1E3350", borderRadius: "16px", fontSize: "12px" };
const rowStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "12px 14px" };
const avatarStyle = { width: "38px", height: "38px", borderRadius: "50%", background: "#132339", display: "flex", alignItems: "center", justifyContent: "center" };
const metaItem = { display: "flex", alignItems: "center", gap: "5px" };
const modalOverlay = { position: "fixed", inset: 0, background: "#0000009a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 20, padding: "16px" };
const modalBox = { width: "100%", maxWidth: "340px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "18px" };
