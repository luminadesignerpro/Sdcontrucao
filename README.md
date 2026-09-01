# Construção Civil App

App white label para empresas de construção civil, pedreiros e serventes.
Reaproveita a estrutura dos projetos [sdmoveisprojetados](https://github.com/luminadesignerpro/sdmoveisprojetados) e [Projmarmores](https://github.com/luminadesignerpro/Projmarmores).

## Status atual

Protótipo funcional do **Editor de Ambientes** (estilo Promob simplificado):

- Catálogo de módulos por categoria (Cozinha, Banheiro, Quarto, Área Externa)
- Criação de módulos customizados (nome, medidas, altura, cor, preço)
- Ambiente em formato retângulo ou L
- Preview 3D isométrico simplificado (CSS, sem motor 3D pesado)
- Orçamento estimado em tempo real conforme os módulos são posicionados

## Ainda não implementado (próximos passos)

- [ ] Persistência (Supabase) — hoje tudo fica só na memória do navegador
- [ ] Autenticação e níveis de acesso (Administrador/Construtora, Engenheiro/Mestre de Obra, Pedreiro/Servente, Cliente Final)
- [ ] Diário de Obra Digital (fotos, clima, mão de obra do dia)
- [ ] Cronograma de etapas (Gantt simplificado)
- [ ] Calculadoras de campo (traço de concreto, quantidade de tijolos, rendimento de tinta)
- [ ] Exportação de PDF real da planta e do orçamento
- [ ] Vínculo entre ambiente montado no editor e etapa da obra
- [ ] Multi-tenant / white label (marca, cores e domínio por cliente)
- [ ] Desenho de paredes livre (hoje só retângulo ou L fixo)

## Rodando localmente

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy

Recomendado: importar o repositório direto no [Vercel](https://vercel.com) — ele detecta o Vite automaticamente.
