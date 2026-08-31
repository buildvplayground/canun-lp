# deploy-wordpress

Alvo de deploy para hospedagem **WordPress**. A LP entra como subpasta estática de
`public_html/` — ver [public_html/manutencao-preventiva/README.md](public_html/manutencao-preventiva/README.md).

A estrutura espelha a do servidor, então é só subir o conteúdo de `public_html/`
para o `public_html/` do host.

> ⚠️ O site atual em canun.com.br **não é WordPress** — é uma aplicação PHP própria
> (`admin.php`, `form-handler.php`, `db-config.php`). Esta pasta existe para o caso
> de o destino ser um WordPress. Se a LP for para o site atual, o procedimento é o
> mesmo (subpasta estática em `public_html/`), mas o `.htaccess` pode ser simplificado:
> o `RewriteEngine Off` só é indispensável quando há as regras do WP na raiz.
