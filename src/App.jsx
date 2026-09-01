import { useState } from "react";
import { AppDataProvider, useAppData } from "./context/AppData.jsx";
import EditorAmbientes from "./components/EditorAmbientes.jsx";
import Funcionarios from "./components/Funcionarios.jsx";
import Financeiro from "./components/Financeiro.jsx";
import GestaoObra from "./components/GestaoObra.jsx";
import Calculadoras from "./components/Calculadoras.jsx";
import Login from "./components/Login.jsx";
import { LogOut } from "lucide-react";

const TABS = [
  { id: "obras", label: "Obras" },
  { id: "ambientes", label: "Editor de Ambientes" },
  { id: "funcionarios", label: "Funcionários" },
  { id: "financeiro", label: "Financeiro" },
  { id: "calculadoras", label: "Calculadoras" },
];

function AppContent() {
  const { usuarioLogado, logout } = useAppData();
  const [tab, setTab] = useState("obras");

  if (!usuarioLogado) {
    return <Login />;
  }

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: 600 }}>Construção Civil App</h1>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "12.5px", color: "#8FA6BC" }}>
          <span>{usuarioLogado.nome} · <span style={{ color: "#F2A93B" }}>{usuarioLogado.papel}</span></span>
          <button
            onClick={logout}
            style={{ display: "flex", alignItems: "center", gap: "5px", background: "#132339", border: "1px solid #1E3350", borderRadius: "6px", padding: "6px 10px", color: "#E8EDF2", cursor: "pointer", fontSize: "12px" }}
          >
            <LogOut size={13} /> Sair
          </button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "16px", flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 14px",
              fontSize: "13px",
              borderRadius: "8px",
              border: "1px solid " + (tab === t.id ? "#F2A93B" : "#1E3350"),
              background: tab === t.id ? "#F2A93B22" : "#0B1522",
              color: tab === t.id ? "#F2A93B" : "#8FA6BC",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "obras" && <GestaoObra />}
      {tab === "ambientes" && <EditorAmbientes />}
      {tab === "funcionarios" && <Funcionarios />}
      {tab === "financeiro" && <Financeiro />}
      {tab === "calculadoras" && <Calculadoras />}
    </div>
  );
}

function App() {
  return (
    <AppDataProvider>
      <AppContent />
    </AppDataProvider>
  );
}

export default App;
