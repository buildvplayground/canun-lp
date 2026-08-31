<?php
// ══════════════════════════════════════════════════════════════
//  CONFIGURAÇÃO — Canun Sistemas Construtivos
//  Preencha com as credenciais do cPanel antes de subir
// ══════════════════════════════════════════════════════════════

define('PROJETO_PREFIX', 'canun');   // prefixo das tabelas no banco

if (!defined('PROJETO_DB_HOST'))     define('PROJETO_DB_HOST',     'localhost');
if (!defined('PROJETO_DB_NAME'))     define('PROJETO_DB_NAME',     'u267855008_canun');
if (!defined('PROJETO_DB_USER'))     define('PROJETO_DB_USER',     'u267855008_devbuildv');
if (!defined('PROJETO_DB_PASSWORD')) define('PROJETO_DB_PASSWORD', ':|HEO1AEz6qS');

// E-mail que recebe notificação a cada novo envio de formulário
if (!defined('PROJETO_NOTIFY'))      define('PROJETO_NOTIFY',      'Canun.sistemasconstrutivos@gmail.com');

// Senha do painel admin — acesse /admin.php
if (!defined('PROJETO_ADMIN_PASS'))  define('PROJETO_ADMIN_PASS',  'buildv@2026!');

// Pasta de uploads (criada automaticamente no primeiro envio)
if (!defined('PROJETO_UPLOAD_DIR'))  define('PROJETO_UPLOAD_DIR',  __DIR__ . '/uploads/arquivos/');
if (!defined('PROJETO_UPLOAD_URL'))  define('PROJETO_UPLOAD_URL',  '/uploads/arquivos/');
