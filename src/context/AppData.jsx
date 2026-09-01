import React, { createContext, useContext, useState } from "react";

const AppDataContext = createContext(null);

const FUNCOES_PADRAO = [
  "Mestre de Obras",
  "Pedreiro",
  "Servente",
  "Eletricista",
  "Encanador",
  "Pintor",
  "Carpinteiro",
  "Ajudante Geral",
];

// Usuários de demonstração — troque/expanda quando plugar autenticação real (Supabase)
const USUARIOS_PADRAO = [
  { id: 1, usuario: "admin", senha: "admin123", nome: "Administrador", papel: "Administrador" },
  { id: 2, usuario: "mestre", senha: "mestre123", nome: "Mestre de Obras (demo)", papel: "Mestre de Obra" },
  { id: 3, usuario: "cliente", senha: "cliente123", nome: "Cliente (demo)", papel: "Cliente Final" },
];

let nextFuncionarioId = 1;
let nextObraId = 1;
let nextContratoId = 1;

export function AppDataProvider({ children }) {
  const [funcoes, setFuncoes] = useState(FUNCOES_PADRAO);
  const [funcionarios, setFuncionarios] = useState([]);
  const [obras, setObras] = useState([]);
  const [usuarios] = useState(USUARIOS_PADRAO);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  const login = (usuario, senha) => {
    const u = usuarios.find((x) => x.usuario === usuario.trim().toLowerCase() && x.senha === senha);
    if (u) {
      setUsuarioLogado(u);
      return { ok: true };
    }
    return { ok: false, erro: "Usuário ou senha incorretos." };
  };

  const logout = () => setUsuarioLogado(null);

  const addFuncao = (nome) => {
    const f = nome.trim();
    if (!f || funcoes.includes(f)) return;
    setFuncoes((prev) => [...prev, f]);
  };

  const removeFuncao = (nome) => setFuncoes((prev) => prev.filter((x) => x !== nome));

  const upsertFuncionario = (func) => {
    if (func.id) {
      setFuncionarios((prev) => prev.map((f) => (f.id === func.id ? func : f)));
    } else {
      setFuncionarios((prev) => [...prev, { ...func, id: nextFuncionarioId++ }]);
    }
  };

  const removeFuncionario = (id) => setFuncionarios((prev) => prev.filter((f) => f.id !== id));

  const upsertObra = (obra) => {
    if (obra.id) {
      setObras((prev) => prev.map((o) => (o.id === obra.id ? obra : o)));
    } else {
      setObras((prev) => [...prev, { ...obra, id: nextObraId++ }]);
    }
  };

  const removeObra = (id) => setObras((prev) => prev.filter((o) => o.id !== id));

  // Contrato + assinatura digital ficam guardados dentro da própria obra
  const salvarContrato = (obraId, texto) => {
    setObras((prev) => prev.map((o) => (o.id === obraId ? { ...o, contrato: { id: nextContratoId++, texto, assinado: false } } : o)));
  };

  const assinarContrato = (obraId, { assinanteNome, assinaturaBase64 }) => {
    setObras((prev) =>
      prev.map((o) =>
        o.id === obraId
          ? { ...o, contrato: { ...o.contrato, assinado: true, assinanteNome, assinaturaBase64, dataAssinatura: new Date().toISOString() } }
          : o
      )
    );
  };

  return (
    <AppDataContext.Provider
      value={{
        funcoes,
        addFuncao,
        removeFuncao,
        funcionarios,
        upsertFuncionario,
        removeFuncionario,
        obras,
        upsertObra,
        removeObra,
        usuarioLogado,
        login,
        logout,
        salvarContrato,
        assinarContrato,
      }}
    >
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData precisa estar dentro de um AppDataProvider");
  return ctx;
}
