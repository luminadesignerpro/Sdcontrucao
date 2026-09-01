import { useEffect, useRef, useState } from 'react';
import './Etapasobra.css';

const ETAPAS = [
  {
    num: '01',
    titulo: 'Fundação',
    texto:
      'Sondagem do terreno, escavação e lançamento das bases. O diário de obra registra cada camada de concreto, com fotos e assinatura do mestre de obra.',
  },
  {
    num: '02',
    titulo: 'Estrutura',
    texto:
      'Pilares, vigas e laje ganham forma. A calculadora de traço de concreto e armação fica à mão da equipe, direto no canteiro.',
  },
  {
    num: '03',
    titulo: 'Alvenaria',
    texto:
      'Levantamento das paredes com controle de consumo de tijolos e blocos por ambiente, comparado ao orçamento previsto.',
  },
  {
    num: '04',
    titulo: 'Instalações',
    texto:
      'Elétrica, hidráulica e o editor de ambientes para posicionar cada ponto — com preview 3D e orçamento atualizado na hora.',
  },
  {
    num: '05',
    titulo: 'Acabamento & Entrega',
    texto:
      'Pintura, revisão final e assinatura digital do contrato de entrega. O cliente acompanha tudo pelo próprio login.',
  },
];

export default function Etapasobra({ etapas = ETAPAS }) {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [skipAnimation, setSkipAnimation] = useState(false);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.matchMedia('(max-width: 760px)').matches;
    if (reduce || isMobile) {
      setSkipAnimation(true);
      return;
    }

    const handleScroll = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      if (!wrap || !track) return;

      const rect = wrap.getBoundingClientRect();
      const wrapTop = rect.top + window.scrollY;
      const wrapHeight = wrap.offsetHeight;
      const viewportH = window.innerHeight;
      const scrollable = wrapHeight - viewportH;

      let progress = (window.scrollY - wrapTop) / scrollable;
      progress = Math.max(0, Math.min(1, progress));

      const maxTranslate = (etapas.length - 1) * window.innerWidth;
      track.style.transform = `translateX(-${progress * maxTranslate}px)`;

      const index = Math.min(etapas.length - 1, Math.floor(progress * etapas.length));
      setActiveIndex(index);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [etapas.length]);

  return (
    <div className={`etapas-pinwrap ${skipAnimation ? 'etapas-static' : ''}`} ref={wrapRef}>
      <div className="etapas-pininner">
        <div className="etapas-track" ref={trackRef}>
          {etapas.map((etapa) => (
            <div className="etapas-panel" key={etapa.num}>
              <div className="etapas-num">{etapa.num}</div>
              <div className="etapas-copy">
                <div className="etapas-eyebrow">ETAPA {etapa.num}</div>
                <h2>{etapa.titulo}</h2>
                <p>{etapa.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!skipAnimation && (
        <div className="etapas-progress">
          {etapas.map((etapa, i) => (
            <div
              key={etapa.num}
              className={`etapas-dot ${i === activeIndex ? 'active' : ''}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
