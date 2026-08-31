# Pasta de deploy — LP Manutenção Preventiva (Canun)

**Esta pasta é o entregável completo e exclusivo da LP.** Tudo o que está aqui — e só o
que está aqui — vai para o ar. Nenhum material-fonte (`_raw/`, `imagens/`, `Copys/`,
`design-system/`, `canun-site-principal/`, `paginas-portfilotio/`) entra no deploy: esses
ficam locais e no Drive, e estão no `.gitignore`.

```
deploy/
├── index.html          página única da LP
├── styles.css
├── script.js
├── robots.txt
├── vercel.json         cache dos assets + cleanUrls (ignorado fora do Vercel)
└── assets/
    ├── logo_canun.png / logo_canun_white.png
    └── img/            20 imagens .webp (~2,0 MB)
```

## Publicar

**Hostinger (subpasta do site atual) — alvo mais provável**
Suba o **conteúdo** desta pasta (não a pasta em si) para
`public_html/manutencao-preventiva/`. A LP fica em
`https://canun.com.br/manutencao-preventiva/`, que é para onde o
`<link rel="canonical">` já aponta. Todos os caminhos são relativos, então funciona em
qualquer subpasta — se a rota mudar, basta ajustar o canonical no `index.html`.

**Vercel**
Importar o repositório com **Root Directory = `deploy`** e Framework Preset **Other**
(HTML estático — não é projeto Node/Next). Ou `vercel --prod` de dentro desta pasta.

## Antes de publicar

Ver as pendências em `../state.json` → `pendencias`. As que travam a publicação:
confirmar o número de WhatsApp e definir o domínio/rota.
