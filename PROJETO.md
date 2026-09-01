# Canun — LP Manutenção Preventiva Residencial

Landing page de campanha para o **novo serviço** da Canun Sistemas Construtivos, construída
a partir dos slides da apresentação comercial "Manutenção Preventiva Residencial".

- **Cliente:** Canun Sistemas Construtivos — Pelotas/RS
- **Repo:** https://github.com/dev-buildv/canun-lp (privado)
- **Entregáveis:** [deploy-vercel/](deploy-vercel/) e [deploy-wordpress/](deploy-wordpress/) —
  cada uma completa e exclusiva da LP. Regeradas por `python sync-deploy.py`; nunca editar à mão.
- **Preview local:** `python -m http.server 8899` dentro de `Site/` → http://localhost:8899/
- **Estado de máquina:** [state.json](state.json)

## Checklist das etapas

- [x] **1. Material** — portfólio PDF (9 slides), 9 peças de campanha, site institucional
      (`canun-site-principal/`) e 3 pastas de obras no Drive (Xangrilá, Cassino Beira Mar,
      Edícula Steel Frame).
- [x] **2. Estrutura** — `Site/` (working), duas pastas de deploy, `design-system/`,
      `Copys/`, `imagens/tratadas/`, `.gitignore` seguro.
- [x] **2b. Repositório** — já existia (`dev-buildv/canun-lp`).
- [x] **3. Design system** — [design-system/direcao-estilo.md](design-system/direcao-estilo.md)
- [x] **4. Copy** — [Copys/lp-manutencao-preventiva.md](Copys/lp-manutencao-preventiva.md)
- [x] **5. Front-end** — [Site/index.html](Site/index.html)
- [x] **6. Ajustes e auditoria** — ver "Auditoria" abaixo
- [x] **7. Módulos LGPD** — banner de cookies + Política de Privacidade + `dataLayer`
- [ ] **8. Revisão humana** ← *etapa atual*
- [ ] **9. Deploy** — bloqueado até definir hospedagem/domínio

## Estrutura da página (9 seções)

| # | Seção | Origem da copy |
|---|---|---|
| — | Hero **full-bleed** + faixa de credenciais | Peça "Não importa quem construiu" + slides 1–2 |
| 1 | O custo do silêncio (4 riscos com foto + stat 4x) | Slide 3 |
| 2 | Não é conserto de bico — **full-bleed** | Slide 4 |
| 3 | Cronograma técnico por sistema (6 linhas) + CTA | Slide 5 |
| 4 | Como funciona (4 passos) | Slide 8 |
| 5 | Fora da base Canun (3 etapas) + CTA — **full-bleed** | Slide 7 |
| 6 | Obras Canun (galeria 12 fotos, sem legenda, + lightbox) | Acervo Canun |
| 7 | FAQ (5 perguntas) | Derivado dos slides |
| 8 | CTA final + canais — **full-bleed** | Slide 9 |

**Planos, tiers e preços não entram na página** (decisão do cliente). A seção de oferta
"20 vagas / R$ 300 / até 15/09" também foi removida: vinha de um anúncio de campanha, não
dos slides, e a data estava vencida. Ambos ficam registrados em `Copys/` como referência.

## Design

Tokens **herdados do site institucional** (`canun-site-principal/styles.css`) — mesma
paleta (azul `#0D1A3E` + laranja `#F08526`), mesma tipografia (Helvetica Neue), mesmo
logo em duas versões.

**Tratamento full-bleed** (hero, posicionamento, fora da base e CTA final): a foto ocupa toda a largura
e é mesclada no azul institucional por um degradê que fecha sólido no topo e na base, com
a textura diagonal de chuva por cima — reproduzindo a leitura dos slides. O véu tem piso
calculado para garantir AA mesmo sobre o pixel mais claro de cada foto.

**Sistema de cantos contido:** `--r-sm: 2px` (botões e chips), `--r-md: 3px` (cards),
`--r-lg: 4px` (modais). A galeria usa grade fechada de 6px, sem legenda — a foto carrega
sozinha, o hover só aproxima e clareia.

**Tags e CTAs:** GTM `GTM-WD7GJQPC` (com `noscript`) e popup Merlin, os mesmos do site
institucional. **Os 6 CTAs de ação abrem o popup do Merlin** (`cta-merlin1..6`), por decisão
do cliente — é uma exceção registrada ao requisito BuildV de CTA = WhatsApp, e é o padrão
já em uso no institucional. O `href` de WhatsApp fica no HTML como **fallback**: se o script
do Merlin não carregar, o botão ainda funciona em vez de virar link morto. Os CTAs anunciam
`aria-haspopup="dialog"`. O widget do Merlin injeta um botão sem rótulo e uma imagem sem
`alt` — o `script.js` corrige os dois via `MutationObserver`, e o CSS devolve o foco visível
que o widget remove.

Desvios de cor em relação ao institucional, ambos por acessibilidade:
- `--orange-800: #A8520A` para texto laranja sobre fundo claro (o `--orange-600` fica em
  3.41:1, abaixo do AA para texto pequeno);
- texto sobre botão laranja passou a azul-escuro — que é o que as peças da campanha já fazem.

## Auditoria (medida, não estimada)

| Verificação | Resultado |
|---|---|
| Overflow horizontal — varredura de **21 larguras** de 320 a 1600px | **0 px** em todas |
| Colunas mortas / cards órfãos nas grades | **nenhuma** em toda a faixa |
| Checks de interação (menu, lightbox, modal, cookies, âncoras, links) | **23/23 PASS** |
| WCAG 2.0/2.1/2.2 (foco visível, nome acessível, landmarks, zoom 200%, reflow 320px, armadilha de foco, reduced-motion) | **17/17 PASS** |
| Contraste AA | verificado por **medição de pixel**, inclusive o pixel mais claro sob cada texto sobre foto |
| Anti-padrões "cara de IA" | 13 sinais checados — nenhum aplicável (2 sombras e 6 raios distintos, 20 combinações tipográficas, grades 4/3/6/12 variadas, só foto real) |
| Imagens | 20 arquivos `.webp`, **2,0 MB**, todas com `alt` |
| Alvos de toque (WCAG 2.2 — 2.5.8) | todos ≥ 24 px |
| CTAs | 6 abrem o Merlin (testado um a um, inclusive o do menu mobile) + fallback de WhatsApp verificado com o script do Merlin bloqueado |
| Colisão entre flutuantes e barra de cookies | **nenhuma** em 1440 / 1024 / 375px |

Testado com Playwright/Chromium. Scripts em
`%TEMP%/claude/.../scratchpad/{audit,sweep,interact,wcag,contrast,pixel4,design,mobile}.js`.

## Deploy

A fonte é sempre `Site/`. `python sync-deploy.py` regenera as duas pastas — cada uma
preserva os arquivos que são só dela (`README.md`, `vercel.json`, `robots.txt`, `.htaccess`).

| Alvo | Pasta | Como publicar |
|---|---|---|
| **Vercel** | `deploy-vercel/` | Root Directory = `deploy-vercel`, preset **Other**, sem build. Ou `vercel --prod` dentro da pasta. |
| **WordPress** | `deploy-wordpress/public_html/manutencao-preventiva/` | Subir a pasta para dentro do `public_html/` do host. O `.htaccess` traz `RewriteEngine Off` — sem ele o WordPress engole a subpasta e devolve 404. |

O `<link rel="canonical">` aponta para `canun.com.br/manutencao-preventiva/`. Se a LP for
para outro domínio, atualizar canonical e `og:url` no `index.html`.

> O site atual em canun.com.br **não é WordPress** — é PHP próprio (`admin.php`,
> `form-handler.php`, `db-config.php`). A pasta WordPress existe para o caso de o destino
> ser um WP; indo para o site atual, o procedimento é o mesmo e o `RewriteEngine Off`
> pode ser dispensado.

## Correções do cliente (31/08/2026)

| Pedido | Estado |
|---|---|
| Gás: bienal → anual (cronograma **e FAQ**) | ✅ feito — a LP só tem Semestral e Anual agora |
| Remover o número da casa azul (804) | ✅ feito — retoque sobre o original em alta |
| Analisar o portfólio atualizado | ✅ feito — 10 páginas, revisado linha a linha |
| Acrescentar os serviços novos | ✅ feito — Placas Solares e Marcenaria no cronograma + seção "Vantagem para assinantes" |
| Telefone oficial | ✅ resolvido — o portfólio novo usa **(53) 99118-7976** |

O cronograma e o FAQ foram corrigidos em momentos diferentes: o cronograma no commit
`a04785d` e o FAQ na ClickUp `86ak8vr0t`, que pedia explicitamente "verificar na página
**e no FAQ**". A resposta do FAQ ainda dizia "instalações de gás, a cada dois anos" —
escrito em palavras, sem a palavra "bienal", por isso não apareceu na varredura anterior.
Ao revisar frequências, buscar também as formas escritas ("a cada dois anos").

## Pendências

Ver a lista completa e acionável em [state.json](state.json) → `pendencias`.
Resumo: confirmar o telefone (o material do cliente diverge), definir hospedagem/domínio e
substituir as fotos quando chegarem em alta resolução.
