# Direção de estilo — LP Manutenção Preventiva Canun

## Fonte dos tokens
Derivados da **marca real**, lidos de `canun-site-principal/styles.css` (design system já
implantado no site institucional). Nada foi inventado nem sugerido por biblioteca externa.

| Token | Valor | Uso na LP |
|---|---|---|
| `--blue-950` | `#0D1A3E` | fundo dark, headings |
| `--blue-900/800/700` | `#142A66` / `#18327A` / `#1F3D8F` | superfícies e bordas |
| `--blue-500` | `#3460C8` | linhas/detalhes |
| `--blue-200/100/50` | `#C7D5F4` / `#E8EDF9` / `#F2F5FD` | seções claras alternadas |
| `--orange-500` | `#F08526` | **accent único** — CTA, eyebrow, números |
| `--orange-400/600/700` | `#F5A54A` / `#D86E14` / `#B85C0A` | hover e accent sobre dark |
| Neutros | escala `--gray-*` idêntica ao site principal | texto e bordas |
| Tipografia | `'Helvetica Neue', Helvetica, Arial, sans-serif` | mesma família do institucional (sem webfont — zero requisição externa) |
| Raio | 6px botões / 14–18px cards | idem institucional |
| `--ease` | `cubic-bezier(0.22, 1, 0.36, 1)` | idem |

Logo: `logo_canun.png` (positiva) e `logo_canun_white.png` (negativa) — as duas versões,
copiadas do site principal.

## Eixos de variação aplicados (vs. site institucional Canun)
Regra: a LP tem de **pertencer à marca**, mas não pode ser um clone da home.

| Eixo | Site institucional | Esta LP |
|---|---|---|
| Hero | full-bleed com slider de 5 fotos | **split assimétrico**: texto + card de oferta + foto vertical |
| Navbar | transparente sobre o hero | **sólida escura** desde o topo, com scroll-spy nas âncoras |
| Ritmo de seções | modalidades → tipos → diferenciais → sobre → comparativo → portfólio | risco → posicionamento → **cronograma técnico (nova)** → processo → **planos (nova)** → fora da base → **oferta (nova)** → galeria |
| Card | overlay de foto e cards numerados | **card de risco com barra lateral** + **card de plano com badge** |
| Portfólio | grade 3 col. por obra (35 fotos/obra) | **grade bento 3/2/1**, lightbox único de 11 fotos |
| Bloco de CTA | dark centralizado | **dark com bloco de escassez** (vagas/prazo) + CTA final separado |
| Movimento | reveal + marquee + pin | reveal com stagger + marquee + **contador de stats** + accordion |

## Anti-padrões evitados
- Sem "grid de 3 cards idênticos" repetido: as seções alternam grade 4 (riscos), lista
  numerada 3 (posicionamento), timeline 6 (cronograma), passos 4 (processo), preço 3 (planos).
- Sem sombra/raio uniformes em tudo — superfícies dark usam borda 1px, claras usam sombra.
- Sem stock genérico: **todas as fotos são obras reais da Canun**, extraídas do portfólio.
- Sem formulário como CTA — **CTA = botão WhatsApp** em todos os pontos (requisito BuildV).
- Sem scroll-cue e sem back-to-top.

## Nota
Plugin `ui-ux-pro-max` disponível no ambiente, mas **não consultado para paleta/tipografia**
(elas vêm da marca real, por regra). A direção de estilo acima é derivada do próprio
design system do cliente.
