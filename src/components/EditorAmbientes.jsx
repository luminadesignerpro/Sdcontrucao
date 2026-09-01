import React, { useState, useRef, useCallback, useMemo } from "react";
import { RotateCw, Trash2, Plus, Ruler, Box, Layers, Printer, X } from "lucide-react";

// ---- Catálogo de módulos por categoria (dimensões em cm, preço estimado em R$) ----
const CATALOG = {
  cozinha: [
    { type: "armario_superior", label: "Armário Superior", w: 60, h: 35, alt: 70, color: "#C9BFA8", price: 850 },
    { type: "armario_inferior", label: "Armário Inferior", w: 60, h: 60, alt: 85, color: "#B8AC8E", price: 950 },
    { type: "bancada", label: "Bancada", w: 60, h: 60, alt: 4, color: "#9B8F73", price: 1200 },
    { type: "ilha", label: "Ilha Central", w: 120, h: 90, alt: 90, color: "#8C8064", price: 2400 },
    { type: "pia", label: "Pia", w: 80, h: 60, alt: 85, color: "#7FA7B0", price: 1100 },
    { type: "fogao", label: "Fogão / Cooktop", w: 60, h: 60, alt: 85, color: "#B0555A", price: 1800 },
    { type: "geladeira", label: "Geladeira", w: 70, h: 70, alt: 180, color: "#6E8A9E", price: 3200 },
  ],
  banheiro: [
    { type: "vaso", label: "Vaso Sanitário", w: 40, h: 60, alt: 40, color: "#C4D0D6", price: 600 },
    { type: "box", label: "Box / Chuveiro", w: 90, h: 90, alt: 200, color: "#7FA7B0", price: 900 },
    { type: "pia_banheiro", label: "Pia / Gabinete", w: 60, h: 45, alt: 85, color: "#B8AC8E", price: 750 },
  ],
  quarto: [
    { type: "cama_casal", label: "Cama Casal", w: 140, h: 190, alt: 40, color: "#A8907C", price: 1500 },
    { type: "guarda_roupa", label: "Guarda-Roupa", w: 180, h: 60, alt: 220, color: "#9B8F73", price: 2200 },
    { type: "criado_mudo", label: "Criado-Mudo", w: 45, h: 40, alt: 55, color: "#C9BFA8", price: 400 },
  ],
  externa: [
    { type: "churrasqueira", label: "Churrasqueira", w: 100, h: 60, alt: 90, color: "#B0555A", price: 1800 },
    { type: "piscina", label: "Piscina", w: 300, h: 150, alt: 5, color: "#3AA7C9", price: 8000 },
    { type: "deck", label: "Deck", w: 200, h: 150, alt: 3, color: "#B8AC8E", price: 2500 },
  ],
};

const CATEGORY_LABELS = {
  cozinha: "Cozinha",
  banheiro: "Banheiro",
  quarto: "Quarto",
  externa: "Área Externa",
  custom: "Meus Módulos",
};

let nextId = 1;

export default function EditorAmbientes() {
  const [room, setRoom] = useState({ w: 400, h: 300, shape: "retangulo", cutW: 120, cutH: 100 });
  const [items, setItems] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [customModules, setCustomModules] = useState([]);
  const [activeCat, setActiveCat] = useState("cozinha");
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [view3d, setView3d] = useState(false);
  const canvasRef = useRef(null);
  const dragState = useRef(null);

  const PADDING = 40;
  const canvasW = 720;
  const canvasH = 480;
  const scale = Math.min(
    (canvasW - PADDING * 2) / room.w,
    (canvasH - PADDING * 2) / room.h
  );

  const roomPxW = room.w * scale;
  const roomPxH = room.h * scale;
  const offsetX = (canvasW - roomPxW) / 2;
  const offsetY = (canvasH - roomPxH) / 2;

  const cutPxW = room.shape === "L" ? Math.min(room.cutW, room.w) * scale : 0;
  const cutPxH = room.shape === "L" ? Math.min(room.cutH, room.h) * scale : 0;

  const roomPath = useMemo(() => {
    if (room.shape !== "L") {
      return `M 0 0 H ${roomPxW} V ${roomPxH} H 0 Z`;
    }
    return `M 0 0 H ${roomPxW - cutPxW} V ${cutPxH} H ${roomPxW} V ${roomPxH} H 0 Z`;
  }, [room.shape, roomPxW, roomPxH, cutPxW, cutPxH]);

  const selected = items.find((i) => i.id === selectedId) || null;

  const allCatalog = { ...CATALOG, custom: customModules };
  const currentList = allCatalog[activeCat] || [];

  const addPreset = (preset) => {
    const id = nextId++;
    const newItem = {
      id,
      type: preset.type,
      label: preset.label,
      color: preset.color,
      w: preset.w,
      h: preset.h,
      alt: preset.alt || 80,
      price: preset.price || 0,
      x: Math.round(room.w / 2 - preset.w / 2),
      y: Math.round(room.h / 2 - preset.h / 2),
      rot: 0,
    };
    setItems((prev) => [...prev, newItem]);
    setSelectedId(id);
  };

  const updateItem = (id, patch) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setItems((prev) => prev.filter((i) => i.id !== selectedId));
    setSelectedId(null);
  };

  const rotateSelected = () => {
    if (!selected) return;
    updateItem(selected.id, { rot: (selected.rot + 90) % 360 });
  };

  const getCanvasPoint = useCallback((clientX, clientY) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: clientX - rect.left, y: clientY - rect.top };
  }, []);

  const onItemMouseDown = (e, item) => {
    e.stopPropagation();
    setSelectedId(item.id);
    const pt = getCanvasPoint(e.clientX, e.clientY);
    dragState.current = { mode: "move", id: item.id, startPx: pt, startItem: { ...item } };
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  };

  const onResizeMouseDown = (e, item) => {
    e.stopPropagation();
    setSelectedId(item.id);
    const pt = getCanvasPoint(e.clientX, e.clientY);
    dragState.current = { mode: "resize", id: item.id, startPx: pt, startItem: { ...item } };
    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
  };

  const onWindowMouseMove = (e) => {
    const ds = dragState.current;
    if (!ds || !canvasRef.current) return;
    const pt = getCanvasPoint(e.clientX, e.clientY);
    const dxCm = (pt.x - ds.startPx.x) / scale;
    const dyCm = (pt.y - ds.startPx.y) / scale;

    if (ds.mode === "move") {
      let nx = Math.round(ds.startItem.x + dxCm);
      let ny = Math.round(ds.startItem.y + dyCm);
      nx = Math.max(0, Math.min(room.w - ds.startItem.w, nx));
      ny = Math.max(0, Math.min(room.h - ds.startItem.h, ny));
      updateItem(ds.id, { x: nx, y: ny });
    } else if (ds.mode === "resize") {
      let nw = Math.max(20, Math.round(ds.startItem.w + dxCm));
      let nh = Math.max(20, Math.round(ds.startItem.h + dyCm));
      nw = Math.min(nw, room.w - ds.startItem.x);
      nh = Math.min(nh, room.h - ds.startItem.y);
      updateItem(ds.id, { w: nw, h: nh });
    }
  };

  const onWindowMouseUp = () => {
    dragState.current = null;
    window.removeEventListener("mousemove", onWindowMouseMove);
    window.removeEventListener("mouseup", onWindowMouseUp);
  };

  const totalBudget = items.reduce((sum, i) => sum + (i.price || 0), 0);
  const totalArea = items.reduce((sum, i) => sum + (i.w / 100) * (i.h / 100), 0);

  const handlePrint = () => window.print();

  return (
    <div
      style={{
        display: "flex",
        fontFamily: "'Inter', system-ui, sans-serif",
        background: "#0F1B2B",
        color: "#E8EDF2",
        minHeight: "680px",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid #1E3350",
      }}
    >
      <div
        style={{
          width: "240px",
          borderRight: "1px solid #1E3350",
          padding: "16px",
          background: "#0B1522",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          overflowY: "auto",
        }}
      >
        <div style={{ marginBottom: "4px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace" }}>
            Editor de Ambientes
          </div>
          <div style={{ fontSize: "16px", fontWeight: 600, marginTop: "2px" }}>Catálogo</div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
          {Object.keys(CATEGORY_LABELS).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              style={{
                padding: "5px 9px",
                fontSize: "11px",
                borderRadius: "6px",
                border: "1px solid " + (activeCat === cat ? "#F2A93B" : "#1E3350"),
                background: activeCat === cat ? "#F2A93B22" : "#132339",
                color: activeCat === cat ? "#F2A93B" : "#8FA6BC",
                cursor: "pointer",
              }}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {currentList.length === 0 && activeCat === "custom" && (
          <div style={{ fontSize: "12px", color: "#5B7A99", padding: "8px 0" }}>
            Nenhum módulo customizado ainda.
          </div>
        )}

        {currentList.map((p) => (
          <button
            key={p.type}
            onClick={() => addPreset(p)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 12px",
              background: "#132339",
              border: "1px solid #1E3350",
              borderRadius: "8px",
              color: "#E8EDF2",
              cursor: "pointer",
              textAlign: "left",
              fontSize: "12.5px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#F2A93B")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#1E3350")}
          >
            <span style={{ width: "15px", height: "15px", borderRadius: "3px", background: p.color, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>
              {p.label}
              <div style={{ fontSize: "10px", color: "#5B7A99" }}>{p.w}×{p.h}cm</div>
            </span>
            <Plus size={13} color="#5B7A99" />
          </button>
        ))}

        <button
          onClick={() => setShowCustomForm(true)}
          style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "9px 10px", background: "#132339", border: "1px dashed #1E3350", borderRadius: "8px", color: "#E8EDF2", cursor: "pointer", fontSize: "13px", marginTop: "6px" }}
        >
          <Plus size={13} /> Criar módulo
        </button>

        <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #1E3350" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
            Ambiente
          </div>
          <div style={{ display: "flex", gap: "6px", marginBottom: "8px" }}>
            <button
              onClick={() => setRoom((r) => ({ ...r, shape: "retangulo" }))}
              style={{ flex: 1, padding: "6px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid " + (room.shape === "retangulo" ? "#F2A93B" : "#1E3350"), background: room.shape === "retangulo" ? "#F2A93B22" : "#132339", color: room.shape === "retangulo" ? "#F2A93B" : "#8FA6BC", cursor: "pointer" }}
            >
              Retângulo
            </button>
            <button
              onClick={() => setRoom((r) => ({ ...r, shape: "L" }))}
              style={{ flex: 1, padding: "6px 8px", fontSize: "11px", borderRadius: "6px", border: "1px solid " + (room.shape === "L" ? "#F2A93B" : "#1E3350"), background: room.shape === "L" ? "#F2A93B22" : "#132339", color: room.shape === "L" ? "#F2A93B" : "#8FA6BC", cursor: "pointer" }}
            >
              Formato L
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <label style={labelStyle}>
              Largura
              <input type="number" value={room.w} onChange={(e) => setRoom((r) => ({ ...r, w: Math.max(100, Number(e.target.value) || 0) }))} style={inputStyle} />
            </label>
            <label style={labelStyle}>
              Profund.
              <input type="number" value={room.h} onChange={(e) => setRoom((r) => ({ ...r, h: Math.max(100, Number(e.target.value) || 0) }))} style={inputStyle} />
            </label>
          </div>
          {room.shape === "L" && (
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <label style={labelStyle}>
                Recorte L (larg.)
                <input type="number" value={room.cutW} onChange={(e) => setRoom((r) => ({ ...r, cutW: Number(e.target.value) || 0 }))} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Recorte L (prof.)
                <input type="number" value={room.cutH} onChange={(e) => setRoom((r) => ({ ...r, cutH: Number(e.target.value) || 0 }))} style={inputStyle} />
              </label>
            </div>
          )}
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", padding: "12px 16px 0" }}>
          <button onClick={() => setView3d((v) => !v)} style={toolbarBtn(view3d)}>
            <Box size={13} /> {view3d ? "Vista 2D" : "Preview 3D"}
          </button>
          <button onClick={handlePrint} style={toolbarBtn(false)}>
            <Printer size={13} /> Exportar
          </button>
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "10px 20px" }}>
          {!view3d ? (
            <svg ref={canvasRef} width={canvasW} height={canvasH} onMouseDown={() => setSelectedId(null)} style={{ background: "#0F1B2B", borderRadius: "8px" }}>
              <defs>
                <pattern id="grid" width={scale * 10} height={scale * 10} patternUnits="userSpaceOnUse">
                  <path d={`M ${scale * 10} 0 L 0 0 0 ${scale * 10}`} fill="none" stroke="#16283F" strokeWidth="1" />
                </pattern>
                <clipPath id="roomClip">
                  <path d={roomPath} />
                </clipPath>
              </defs>
              <rect x={0} y={0} width={canvasW} height={canvasH} fill="#0F1B2B" />
              <g transform={`translate(${offsetX}, ${offsetY})`}>
                <path d={roomPath} fill="url(#grid)" />
                <path d={roomPath} fill="none" stroke="#3AA7C9" strokeWidth="2" />
                <text x={roomPxW / 2} y={-10} fill="#5B7A99" fontSize="12" fontFamily="'JetBrains Mono', monospace" textAnchor="middle">{room.w} cm</text>
                <text x={-10} y={roomPxH / 2} fill="#5B7A99" fontSize="12" fontFamily="'JetBrains Mono', monospace" textAnchor="middle" transform={`rotate(-90, -10, ${roomPxH / 2})`}>{room.h} cm</text>

                <g clipPath="url(#roomClip)">
                  {items.map((item) => {
                    const isSel = item.id === selectedId;
                    const px = item.x * scale;
                    const py = item.y * scale;
                    const pw = item.w * scale;
                    const ph = item.h * scale;
                    const cx = px + pw / 2;
                    const cy = py + ph / 2;
                    return (
                      <g key={item.id} transform={`rotate(${item.rot}, ${cx}, ${cy})`}>
                        <rect x={px} y={py} width={pw} height={ph} fill={item.color} stroke={isSel ? "#F2A93B" : "#0F1B2B"} strokeWidth={isSel ? 2 : 1} rx={3} style={{ cursor: "grab" }} onMouseDown={(e) => onItemMouseDown(e, item)} />
                        <text x={cx} y={cy} fill="#1A1204" fontSize="9.5" fontFamily="Inter, sans-serif" textAnchor="middle" dominantBaseline="middle" style={{ pointerEvents: "none", userSelect: "none" }}>{item.label}</text>
                        {isSel && <rect x={px + pw - 8} y={py + ph - 8} width={10} height={10} fill="#F2A93B" style={{ cursor: "nwse-resize" }} onMouseDown={(e) => onResizeMouseDown(e, item)} />}
                      </g>
                    );
                  })}
                </g>
              </g>
            </svg>
          ) : (
            <div style={{ width: canvasW, height: canvasH, perspective: "1400px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  width: roomPxW,
                  height: roomPxH,
                  transform: "rotateX(55deg) rotateZ(-35deg)",
                  transformStyle: "preserve-3d",
                  background: "#16283F",
                  border: "2px solid #3AA7C9",
                }}
              >
                {items.map((item) => {
                  const px = item.x * scale;
                  const py = item.y * scale;
                  const pw = item.w * scale;
                  const ph = item.h * scale;
                  const altPx = (item.alt || 80) * scale * 0.6;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      style={{
                        position: "absolute",
                        left: px,
                        top: py,
                        width: pw,
                        height: ph,
                        background: item.color,
                        border: item.id === selectedId ? "2px solid #F2A93B" : "1px solid #0F1B2B",
                        transform: `translateZ(${altPx / 2}px)`,
                        boxShadow: `0 0 0 ${altPx}px ${item.color}55`,
                        transformStyle: "preserve-3d",
                        cursor: "pointer",
                        fontSize: "9px",
                        color: "#1A1204",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                      }}
                    >
                      {item.label}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ width: "230px", borderLeft: "1px solid #1E3350", padding: "16px", background: "#0B1522", display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px" }}>
          Propriedades
        </div>

        {!selected && <div style={{ fontSize: "13px", color: "#5B7A99" }}>Selecione um módulo para editar.</div>}

        {selected && (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            <div style={{ fontSize: "14px", fontWeight: 600 }}>{selected.label}</div>
            <div style={{ display: "flex", gap: "8px" }}>
              <label style={labelStyle}>
                Larg. (cm)
                <input type="number" value={selected.w} onChange={(e) => updateItem(selected.id, { w: Math.max(10, Number(e.target.value) || 0) })} style={inputStyle} />
              </label>
              <label style={labelStyle}>
                Prof. (cm)
                <input type="number" value={selected.h} onChange={(e) => updateItem(selected.id, { h: Math.max(10, Number(e.target.value) || 0) })} style={inputStyle} />
              </label>
            </div>
            <div style={{ display: "flex", gap: "6px", fontSize: "12px", color: "#8FA6BC" }}>
              <Ruler size={13} /> {selected.x}, {selected.y} cm
            </div>
            <button onClick={rotateSelected} style={actionBtnStyle}><RotateCw size={13} /> Girar 90°</button>
            <button onClick={deleteSelected} style={{ ...actionBtnStyle, borderColor: "#B0555A", color: "#F2A0A5" }}><Trash2 size={13} /> Remover</button>
          </div>
        )}

        <div style={{ marginTop: "18px", paddingTop: "16px", borderTop: "1px solid #1E3350" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.08em", color: "#5B7A99", textTransform: "uppercase", fontFamily: "'JetBrains Mono', monospace", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
            <Layers size={12} /> Orçamento estimado
          </div>
          <div style={{ fontSize: "12px", color: "#8FA6BC", marginBottom: "4px" }}>{items.length} módulo(s) · {totalArea.toFixed(1)} m² projetados</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#F2A93B", fontFamily: "'JetBrains Mono', monospace" }}>
            {totalBudget.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
          </div>
          <div style={{ fontSize: "10.5px", color: "#5B7A99", marginTop: "4px" }}>Estimativa por módulo, valores de referência.</div>
        </div>
      </div>

      {showCustomForm && (
        <CustomModuleForm
          onClose={() => setShowCustomForm(false)}
          onSave={(mod) => {
            setCustomModules((prev) => [...prev, mod]);
            setActiveCat("custom");
            setShowCustomForm(false);
          }}
        />
      )}
    </div>
  );
}

function CustomModuleForm({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [w, setW] = useState(60);
  const [h, setH] = useState(60);
  const [alt, setAlt] = useState(80);
  const [color, setColor] = useState("#B0AFA0");
  const [price, setPrice] = useState(500);

  const canSave = name.trim().length > 0 && w > 0 && h > 0;

  return (
    <div
      style={{ position: "absolute", inset: 0, background: "#0000009a", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "300px", background: "#0B1522", border: "1px solid #1E3350", borderRadius: "10px", padding: "18px", color: "#E8EDF2" }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div style={{ fontSize: "14px", fontWeight: 600 }}>Novo módulo</div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8FA6BC", cursor: "pointer" }}><X size={16} /></button>
        </div>
        <label style={{ ...labelStyle, width: "100%", marginBottom: "8px" }}>
          Nome
          <input value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} placeholder="Ex: Rack de TV" />
        </label>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <label style={labelStyle}>Larg. (cm)<input type="number" value={w} onChange={(e) => setW(Number(e.target.value) || 0)} style={inputStyle} /></label>
          <label style={labelStyle}>Prof. (cm)<input type="number" value={h} onChange={(e) => setH(Number(e.target.value) || 0)} style={inputStyle} /></label>
        </div>
        <div style={{ display: "flex", gap: "8px", marginBottom: "8px" }}>
          <label style={labelStyle}>Altura (cm)<input type="number" value={alt} onChange={(e) => setAlt(Number(e.target.value) || 0)} style={inputStyle} /></label>
          <label style={labelStyle}>Preço (R$)<input type="number" value={price} onChange={(e) => setPrice(Number(e.target.value) || 0)} style={inputStyle} /></label>
        </div>
        <label style={{ ...labelStyle, width: "100%", marginBottom: "14px" }}>
          Cor
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ ...inputStyle, padding: "2px", height: "30px" }} />
        </label>
        <button
          disabled={!canSave}
          onClick={() => onSave({ type: "custom_" + Date.now(), label: name, w, h, alt, price, color })}
          style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "center", padding: "9px 10px", background: "#132339", border: "1px solid #F2A93B", borderRadius: "8px", color: "#F2A93B", cursor: canSave ? "pointer" : "default", fontSize: "13px", width: "100%", opacity: canSave ? 1 : 0.5 }}
        >
          Salvar módulo
        </button>
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  marginTop: "4px",
  padding: "6px 8px",
  background: "#0F1B2B",
  border: "1px solid #1E3350",
  borderRadius: "6px",
  color: "#E8EDF2",
  fontSize: "13px",
  fontFamily: "'JetBrains Mono', monospace",
};

const labelStyle = { flex: 1, fontSize: "12px", color: "#8FA6BC" };

const actionBtnStyle = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  justifyContent: "center",
  padding: "9px 10px",
  background: "#132339",
  border: "1px solid #1E3350",
  borderRadius: "8px",
  color: "#E8EDF2",
  cursor: "pointer",
  fontSize: "13px",
};

const toolbarBtn = (active) => ({
  display: "flex",
  alignItems: "center",
  gap: "6px",
  padding: "6px 12px",
  fontSize: "12px",
  borderRadius: "7px",
  border: "1px solid " + (active ? "#F2A93B" : "#1E3350"),
  background: active ? "#F2A93B22" : "#132339",
  color: active ? "#F2A93B" : "#8FA6BC",
  cursor: "pointer",
});
