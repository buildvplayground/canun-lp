# LP Manutenção Preventiva — deploy Vercel

Site **estático** (HTML + CSS + JS vanilla). Não é projeto Node/Next — não há
`package.json`, build nem framework.

## Como publicar

**Pelo painel:** importar o repositório `dev-buildv/canun-lp` no Vercel com

- **Root Directory:** `deploy-vercel`
- **Framework Preset:** `Other`
- **Build Command:** vazio
- **Output Directory:** vazio (a própria raiz)

**Pela CLI:** `vercel --prod` de dentro desta pasta.

## Conteúdo

```
deploy-vercel/
├── index.html
├── styles.css
├── script.js
├── robots.txt
├── vercel.json     cache dos assets (1 ano) + cleanUrls
└── assets/
    ├── logo_canun.png / logo_canun_white.png
    └── img/        20 imagens .webp
```

## Cuidados

- **Domínio.** O `<link rel="canonical">` e o `og:url` do `index.html` apontam para
  `https://canun.com.br/manutencao-preventiva/`. Se a LP for servida de um domínio
  Vercel próprio (ou de um subdomínio), atualize os dois — senão o canonical manda o
  buscador para uma URL que não é esta.
- **`robots.txt`.** Aqui ele libera tudo, porque no Vercel esta pasta é a raiz do
  domínio. Se o destino for um subdomínio de teste, troque para `Disallow: /`.
- **Não edite os arquivos aqui.** A fonte é `Site/`; rode `python sync-deploy.py`
  na raiz do projeto para regerar esta pasta.
