# LP Manutenção Preventiva — deploy WordPress

Página **estática** que roda dentro do `public_html/` de um site WordPress, como
subpasta. Não é tema, não é plugin e não depende do WP para nada — o WordPress
apenas não pode interceptá-la.

## Como publicar

Suba a pasta `manutencao-preventiva/` inteira para dentro do `public_html/` do
servidor, mantendo a estrutura deste repositório:

```
public_html/
├── (arquivos do WordPress)
└── manutencao-preventiva/     ← esta pasta
    ├── .htaccess
    ├── index.html
    ├── styles.css
    ├── script.js
    └── assets/
```

A LP fica em `https://canun.com.br/manutencao-preventiva/`, que é para onde o
`<link rel="canonical">` do `index.html` já aponta.

## O `.htaccess` é obrigatório

O WordPress instala na raiz do `public_html/` uma regra que manda **toda** requisição
inexistente para o `index.php`. Sem o `RewriteEngine Off` deste `.htaccess`, a subpasta
é engolida por essa regra e a LP responde 404. Ele também liga compressão, cache dos
assets e alguns cabeçalhos de segurança.

## Cuidados

- **Não há `robots.txt` aqui**: `robots.txt` só vale na raiz do domínio. Se quiser
  regras específicas para a LP, edite o `robots.txt` do WordPress na raiz.
- **Se a rota mudar** (ex.: `/manutencao/`), renomeie a pasta **e** atualize o
  `<link rel="canonical">` e o `og:url` no `index.html`.
- **Plugins de cache do WP** (LiteSpeed, WP Rocket, W3TC) às vezes tentam otimizar
  caminhos fora do WP. Se a LP aparecer quebrada, exclua `/manutencao-preventiva/*`
  nas configurações do plugin.
- **Não edite os arquivos aqui.** A fonte é `Site/`; rode `python sync-deploy.py`
  na raiz do projeto para regerar esta pasta.
