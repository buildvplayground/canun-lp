# Canun — LP Manutenção Preventiva Residencial

Landing page de campanha para o **novo serviço** da Canun Sistemas Construtivos, derivada
do portfólio comercial "Manutenção Preventiva Residencial" e das peças da campanha da
temporada de chuvas.

- **Cliente:** Canun Sistemas Construtivos — Pelotas/RS
- **Repo:** https://github.com/dev-buildv/canun-lp (privado)
- **Preview local:** `python -m http.server 8899` dentro de `Site/` → http://localhost:8899/
- **Estado de máquina:** [state.json](state.json)

## Checklist das etapas

- [x] **1. Material** — portfólio PDF (9 páginas), 9 peças de campanha, site institucional
      (`canun-site-principal/`) e 3 pastas de obras no Drive (Xangrilá, Cassino Beira Mar,
      Edícula Steel Frame).
- [x] **2. Estrutura** — `Site/` (working), `deploy-vercel/` (entregável), `design-system/`,
      `Copys/`, `imagens/tratadas/`, `.gitignore` seguro.
- [x] **2b. Repositório** — já existia (`dev-buildv/canun-lp`).
- [x] **3. Design system** — [design-system/direcao-estilo.md](design-system/direcao-estilo.md)
- [x] **4. Copy** — [Copys/lp-manutencao-preventiva.md](Copys/lp-manutencao-preventiva.md)
- [x] **5. Front-end** — [Site/index.html](Site/index.html)
- [x] **6. Ajustes e auditoria** — ver "Auditoria" abaixo
- [x] **7. Módulos LGPD** — banner de cookies + Política de Privacidade + `dataLayer`
- [ ] **8. Revisão humana** ← *etapa atual*
- [ ] **9. Deploy** — bloqueado até definir hospedagem/domínio

## Estrutura da página (11 seções)

| # | Seção | Origem da copy |
|---|---|---|
| — | Hero split + métricas | Peça "Não importa quem construiu" + PDF pág. 1 |
| 1 | O custo do silêncio (4 riscos + stat 4x) | PDF pág. 3 |
| 2 | Não é conserto de bico (3 pilares + citação) | PDF pág. 4 |
| 3 | Cronograma técnico por sistema (6 linhas) | PDF pág. 5 |
| 4 | Como funciona (4 passos) | PDF pág. 8 |
| 5 | Planos Essencial / Premium / Master | PDF pág. 6 |
| 6 | Fora da base Canun (3 etapas) | PDF pág. 7 |
| 7 | Oferta: 20 vagas · R$ 300 | Peça "Descubra os pontos fracos" |
| 8 | Obras Canun (galeria 12 fotos + lightbox) | Acervo Canun |
| 9 | FAQ (6 perguntas) | Derivado do PDF |
| 10 | CTA final + canais | PDF pág. 9 |

## Design

Tokens **herdados do site institucional** (`canun-site-principal/styles.css`) — mesma
paleta (azul `#0D1A3E` + laranja `#F08526`), mesma tipografia (Helvetica Neue), mesmo
logo em duas versões. A LP varia em **hero, navbar, ritmo de seções, tipo de card,
padrão de galeria e blocos novos** (cronograma, planos, oferta) para não ser um clone
da home — ver a tabela de eixos em `design-system/direcao-estilo.md`.

Único desvio de cor: adicionado o token `--orange-800: #A8520A` para texto laranja sobre
fundo claro (o `--orange-600` do institucional fica em 3.41:1, abaixo do AA para texto
pequeno), e o texto sobre botões laranja passou a ser azul-escuro — que é exatamente o
que as peças da campanha já fazem.

## Auditoria (medida, não estimada)

| Verificação | Resultado |
|---|---|
| Overflow horizontal em 320/360/375/414/768/1024/1280/1440/1920 | **0 px** em todos |
| Erros de console / JS | **nenhum** |
| Checks de interação e acessibilidade | **23/23 PASS** |
| Contraste WCAG AA | verificado por **medição de pixel** (mín. 3.07:1 em elemento gráfico, 4.95:1 em texto pequeno) |
| Imagens | 16 arquivos `.webp`, **1,35 MB** no total, todas com `alt` |
| Alvos de toque (WCAG 2.2 — 2.5.8) | todos ≥ 24 px |
| Hierarquia de headings | 1 `<h1>`, sem saltos |
| CTAs de WhatsApp | 11, todos com `target="_blank"` + `rel="noopener"` |

Testado com Playwright/Chromium. Scripts em
`%TEMP%/claude/.../scratchpad/{audit,interact,contrast,pixel2}.js`.

## Pendências

Ver a lista completa e acionável em [state.json](state.json) → `pendencias`.
Resumo: confirmar telefone e preço de entrada (o material do cliente diverge), nova data
para a oferta, definir hospedagem/domínio, decidir GTM e Merlin, e substituir as fotos
quando chegarem em alta resolução.
