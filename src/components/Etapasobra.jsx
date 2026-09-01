import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Layers, Blocks, Home, Zap, Paintbrush, PartyPopper, Clock, User } from "lucide-react";
import "./Etapasobra.css";

const ETAPAS = [
  {
    numero: "01",
    titulo: "Fundação",
    descricao: "Sondagem do terreno, escavação e lançamento das bases. O diário de obra registra cada camada de concreto, com fotos e assinatura do mestre de obra.",
    icon: Layers,
    duracao: "7–15 dias",
    responsavel: "Mestre de obra",
  },
  {
    numero: "02",
    titulo: "Alvenaria",
    descricao: "Levantamento das paredes conforme o projeto. Prumo e nível conferidos etapa por etapa, com registro fotográfico diário no aplicativo.",
    icon: Blocks,
    duracao: "15–25 dias",
    responsavel: "Equipe de pedreiros",
  },
  {
    numero: "03",
    titulo: "Cobertura",
    descricao: "Estrutura do telhado, impermeabilização e calhas. Etapa crítica contra infiltração — vistoriada antes do fechamento total.",
    icon: Home,
    duracao: "5–10 dias",
    responsavel: "Equipe especializada",
  },
  {
    numero: "04",
    titulo: "Instalações",
    descricao: "Redes elétrica, hidráulica e de gás embutidas antes do acabamento. Testes de pressão e continuidade documentados no sistema.",
    icon: Zap,
    duracao: "10–20 dias",
    responsavel: "Eletricista / Encanador",
  },
  {
    numero: "05",
    titulo: "Acabamento",
    descricao: "Reboco, pintura, revestimentos e esquadrias. É a etapa mais visível ao cliente — fotos comparativas de antes e depois no diário.",
    icon: Paintbrush,
    duracao: "20–30 dias",
    responsavel: "Equipe de acabamento",
  },
  {
    numero: "06",
    titulo: "Entrega",
    descricao: "Vistoria final, checklist de pendências e assinatura digital do contrato de entrega junto ao cliente final.",
    icon: PartyPopper,
    duracao: "1–2 dias",
    responsavel: "Administrador",
  },
];

export default function Etapasobra() {
  const trackRef = useRef(null);
  const cardRefs = useRef([]);
  const [active, setActive] = useState(0);
  const dragState = useRef({ isDown: false, startX: 0, startScroll: 0, moved: false });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.55) {
            const idx = Number(entry.target.dataset.index);
            setActive(idx);
          }
        });
      },
      { root: track, threshold: [0.55, 0.75, 0.9] }
    );

    cardRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = useCallback((idx) => {
    const clamped = Math.max(0, Math.min(ETAPAS.length - 1, idx));
    cardRefs.current[clamped]?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, []);

  const onPointerDown = (e) => {
    const track = trackRef.current;
    if (!track) return;
    dragState.current = {
      isDown: true,
      startX: (e.touches ? e.touches[0].clientX : e.clientX),
      startScroll: track.scrollLeft,
      moved: false,
    };
  };

  const onPointerMove = (e) => {
    const track = trackRef.current;
    if (!track || !dragState.current.isDown) return;
    const x = e.touches ? e.touches[0].clientX : e.clientX;
    const delta = x - dragState.current.startX;
    if (Math.abs(delta) > 4) dragState.current.moved = true;
    track.scrollLeft = dragState.current.startScroll - delta;
  };

  const endDrag = () => {
    dragState.current.isDown = false;
  };

  const progressPct = (active / (ETAPAS.length - 1)) * 100;

  return (
    <div className="eo-wrap">
      <div className="eo-blob eo-blob--a" />
      <div className="eo-blob eo-blob--b" />

      <div className="eo-header">
        <div>
          <div className="eo-eyebrow">Linha do tempo</div>
          <div className="eo-title">Etapas da Obra</div>
        </div>
        <div className="eo-arrows">
          <button className="eo-arrow-btn" onClick={() => scrollToIndex(active - 1)} disabled={active === 0} aria-label="Etapa anterior">
            <ChevronLeft size={16} />
          </button>
          <button className="eo-arrow-btn" onClick={() => scrollToIndex(active + 1)} disabled={active === ETAPAS.length - 1} aria-label="Próxima etapa">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="eo-nav">
        <div className="eo-nav-track">
          <div className="eo-nav-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="eo-nav-dots">
          {ETAPAS.map((etapa, idx) => (
            <button
              key={etapa.numero}
              className={"eo-nav-dot" + (idx === active ? " is-active" : "")}
              onClick={() => scrollToIndex(idx)}
            >
              {etapa.numero}
            </button>
          ))}
        </div>
      </div>

      <div
        className="eo-track"
        ref={trackRef}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={endDrag}
        onMouseLeave={endDrag}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={endDrag}
      >
        {ETAPAS.map((etapa, idx) => {
          const Icon = etapa.icon;
          const isActive = idx === active;
          return (
            <div
              key={etapa.numero}
              data-index={idx}
              ref={(el) => (cardRefs.current[idx] = el)}
              className={"eo-card" + (isActive ? " is-active" : "")}
              onClick={() => {
                if (!dragState.current.moved) scrollToIndex(idx);
              }}
            >
              <div className="eo-card-number">{etapa.numero}</div>

              <div className="eo-icon-badge">
                <Icon size={22} />
              </div>

              <div className="eo-card-eyebrow">ETAPA {etapa.numero}</div>
              <div className="eo-card-title">{etapa.titulo}</div>
              <p className="eo-card-desc">{etapa.descricao}</p>

              <div className="eo-tags">
                <span className="eo-tag"><Clock size={11} /> {etapa.duracao}</span>
                <span className="eo-tag"><User size={11} /> {etapa.responsavel}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
