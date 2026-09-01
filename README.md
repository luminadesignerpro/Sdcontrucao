# Construção Civil App (CONSTRUTOP — demonstração)

App white label para empresas de construção civil, empreiteiros, pedreiros e serventes.
Reaproveita a estrutura dos projetos [sdmoveisprojetados](https://github.com/luminadesignerpro/sdmoveisprojetados) e [Projmarmores](https://github.com/luminadesignerpro/Projmarmores).

Nome e identidade visual são fictícios, apenas para demonstração.

## Status atual

Módulos prontos:

- **Login** — 3 níveis de acesso de demonstração (Administrador, Mestre de Obra, Cliente Final)
- **Gestão de Obra** — cadastro de obra/cliente, etapas com progresso, diário de obra, assinatura digital de contrato
- **Editor de Ambientes** (estilo Promob simplificado) — catálogo por categoria, módulo customizado, formato L, preview 3D, orçamento em tempo real
- **Funcionários e Funções** — cadastro de equipe, cargos customizáveis, valor por diária/empreitada
- **Financeiro** — receitas/despesas, pagamento de diária com 1 toque, fluxo de caixa por obra
- **Calculadoras de Campo** — traço de concreto/argamassa, tijolos/blocos, rendimento de tinta

## Contas de demonstração (login)

- `admin` / `admin123` — Administrador
- `mestre` / `mestre123` — Mestre de Obra
- `cliente` / `cliente123` — Cliente Final

## Ainda não implementado (próximos passos)

- [ ] Persistência (Supabase) — hoje tudo fica só na memória do navegador, some ao atualizar a página
- [ ] White label de verdade (marca, cores e domínio por cliente)
- [ ] Desenho de paredes livre no editor de ambientes (hoje só retângulo ou L fixo)
- [ ] Exportação de PDF real da planta, orçamento e contrato

## Rodando localmente

\`\`\`bash
npm install
npm run dev
\`\`\`

## Deploy

Recomendado: importar o repositório direto no [Vercel](https://vercel.com) — ele detecta o Vite automaticamente.
