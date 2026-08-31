<?php
// ══════════════════════════════════════════════════════════════
//  PAINEL ADMIN — Canun Sistemas Construtivos
//  Acesso: seusite.com/admin.php  |  Senha: db-config.php
// ══════════════════════════════════════════════════════════════

// 1. Suprimir erros PHP na saída (nunca expor stack traces)
@ini_set('display_errors', 0);
error_reporting(0);

// 2. Headers de segurança (enviados antes de qualquer HTML)
header('X-Frame-Options: DENY');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header('Referrer-Policy: no-referrer');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header("Content-Security-Policy: default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data:; script-src 'none'; object-src 'none'; base-uri 'self'; form-action 'self'");

// 3. Sessão segura (HttpOnly, SameSite=Strict, Secure em HTTPS)
if (session_status() === PHP_SESSION_NONE) {
    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'secure'   => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
        'httponly' => true,
        'samesite' => 'Strict',
    ]);
    session_start();
}

require_once __DIR__ . '/db-config.php';

// ── Constantes de segurança ────────────────────────────────────
define('MAX_TENTATIVAS',  5);         // bloqueio após N tentativas
define('LOCKOUT_MINUTOS', 15);        // tempo de bloqueio em minutos
define('SESSION_TIMEOUT', 2 * 3600);  // expirar sessão após 2 h inativo

// ── CSRF ───────────────────────────────────────────────────────
function csrf_token(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}
function csrf_ok(): bool {
    $tok = $_POST['csrf_token'] ?? '';
    return !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $tok);
}

// ── Brute-force ────────────────────────────────────────────────
function esta_bloqueado(): bool {
    $tentativas = $_SESSION['bf_count'] ?? 0;
    $desde      = $_SESSION['bf_since'] ?? 0;
    if ($tentativas >= MAX_TENTATIVAS) {
        if (time() - $desde < LOCKOUT_MINUTOS * 60) {
            return true;
        }
        // Período expirou — zera contadores
        $_SESSION['bf_count'] = 0;
        $_SESSION['bf_since'] = 0;
    }
    return false;
}
function registrar_falha(): void {
    if (empty($_SESSION['bf_since'])) {
        $_SESSION['bf_since'] = time();
    }
    $_SESSION['bf_count'] = ($_SESSION['bf_count'] ?? 0) + 1;
}
function resetar_bf(): void {
    $_SESSION['bf_count'] = 0;
    $_SESSION['bf_since'] = 0;
}

// ── Timeout de sessão ──────────────────────────────────────────
if (!empty($_SESSION['proj_admin'])) {
    if (isset($_SESSION['last_act']) && (time() - $_SESSION['last_act']) > SESSION_TIMEOUT) {
        session_destroy();
        header('Location: admin.php?motivo=expirado');
        exit;
    }
    $_SESSION['last_act'] = time();
}

// ── Logout ─────────────────────────────────────────────────────
if (isset($_POST['logout']) && csrf_ok()) {
    session_destroy();
    header('Location: admin.php');
    exit;
}

// ── Login ──────────────────────────────────────────────────────
$erro = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['senha'])) {
    if (!csrf_ok()) {
        $erro = 'Requisição inválida. Recarregue a página e tente novamente.';
    } elseif (esta_bloqueado()) {
        $minutos = ceil((LOCKOUT_MINUTOS * 60 - (time() - ($_SESSION['bf_since'] ?? 0))) / 60);
        $erro = "Muitas tentativas. Tente novamente em {$minutos} minuto(s).";
    } elseif ($_POST['senha'] === PROJETO_ADMIN_PASS) {
        resetar_bf();
        session_regenerate_id(true);   // previne session fixation
        $_SESSION['proj_admin'] = true;
        $_SESSION['last_act']   = time();
        header('Location: admin.php');
        exit;
    } else {
        registrar_falha();
        $restantes = max(0, MAX_TENTATIVAS - ($_SESSION['bf_count'] ?? 0));
        $erro = $restantes > 0
            ? "Senha incorreta. {$restantes} tentativa(s) restante(s)."
            : 'Acesso bloqueado por ' . LOCKOUT_MINUTOS . ' minutos.';
    }
}

$logado       = !empty($_SESSION['proj_admin']);
$candidatos   = [];
$fornecedores = [];

// ── Dados do banco (somente se autenticado) ────────────────────
if ($logado) {
    $conn = new mysqli(PROJETO_DB_HOST, PROJETO_DB_USER, PROJETO_DB_PASSWORD, PROJETO_DB_NAME);
    if ($conn->connect_error) {
        $db_erro = 'Erro de conexão com o banco. Verifique as credenciais.';
    } else {
        $conn->set_charset('utf8mb4');
        $tab_c = PROJETO_PREFIX . '_candidatos';
        $tab_f = PROJETO_PREFIX . '_fornecedores';

        $conn->query("CREATE TABLE IF NOT EXISTS {$tab_c} (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            area VARCHAR(255) NOT NULL, nome VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL, telefone VARCHAR(50) NOT NULL,
            arquivo VARCHAR(255) DEFAULT '', data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $conn->query("CREATE TABLE IF NOT EXISTS {$tab_f} (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            produto VARCHAR(255) NOT NULL, nome VARCHAR(255) NOT NULL,
            empresa VARCHAR(255) NOT NULL, email VARCHAR(255) NOT NULL,
            telefone VARCHAR(50) NOT NULL, arquivo VARCHAR(255) DEFAULT '',
            data_envio DATETIME DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

        $r = $conn->query("SELECT * FROM {$tab_c} ORDER BY data_envio DESC");
        if ($r) while ($row = $r->fetch_assoc()) $candidatos[] = $row;

        $r = $conn->query("SELECT * FROM {$tab_f} ORDER BY data_envio DESC");
        if ($r) while ($row = $r->fetch_assoc()) $fornecedores[] = $row;

        $conn->close();
    }
}

// Validação whitelist da aba
$aba = in_array($_GET['aba'] ?? '', ['candidatos', 'fornecedores'])
    ? $_GET['aba'] : 'candidatos';

?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>Painel Admin — Canun</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root { --ink:#0f0f0e; --paper:#f7f5f0; --card:#fff; --line:#e2e0db; --muted:#888; --red:#8a2020; --red-bg:#fdf2f2; --red-border:#e8b4b4; }
    body { font-family:'Inter Tight',sans-serif; background:var(--paper); color:var(--ink); font-size:14px; min-height:100vh; }

    /* Login */
    .login-wrap { min-height:100vh; display:flex; align-items:center; justify-content:center; padding:24px; }
    .login-box { background:var(--card); border:1px solid var(--line); border-radius:8px; padding:40px; width:100%; max-width:380px; }
    .login-box h1 { font-size:20px; font-weight:600; margin-bottom:6px; }
    .login-box p { color:var(--muted); margin-bottom:28px; font-size:13px; }
    .login-box label { display:block; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); margin-bottom:6px; }
    .login-box input[type="password"] { width:100%; padding:11px 14px; border:1px solid var(--line); border-radius:5px; font-family:inherit; font-size:14px; background:var(--paper); }
    .login-box input:focus { outline:none; border-color:var(--ink); }
    .login-box button[type="submit"] { width:100%; margin-top:16px; padding:12px; background:var(--ink); color:#fff; border:none; border-radius:5px; font-family:inherit; font-size:14px; font-weight:600; cursor:pointer; }
    .login-box button:disabled { opacity:.5; cursor:not-allowed; }
    .alert { margin-top:12px; padding:10px 14px; border-radius:4px; font-size:13px; }
    .alert-err { background:var(--red-bg); border:1px solid var(--red-border); color:var(--red); }
    .alert-info { background:#f0f9ff; border:1px solid #bae6fd; color:#0c4a6e; }

    /* Painel */
    header { background:var(--ink); color:#fff; padding:0 32px; display:flex; align-items:center; justify-content:space-between; height:56px; }
    header .brand { font-weight:600; font-size:15px; }
    header form button { background:rgba(255,255,255,.12); border:1px solid rgba(255,255,255,.2); color:#fff; padding:6px 14px; border-radius:4px; font-family:inherit; font-size:12px; cursor:pointer; }
    .container { max-width:1100px; margin:0 auto; padding:32px 24px; }
    .stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin-bottom:28px; }
    .stat { background:var(--card); border:1px solid var(--line); border-radius:7px; padding:20px 22px; }
    .stat .num { font-size:32px; font-weight:700; line-height:1; }
    .stat .lbl { font-size:12px; color:var(--muted); margin-top:4px; }
    .tabs { display:flex; gap:4px; margin-bottom:24px; }
    .tab { padding:8px 20px; border-radius:5px; font-size:13px; font-weight:500; text-decoration:none; color:var(--muted); border:1px solid transparent; }
    .tab:hover { color:var(--ink); background:var(--card); border-color:var(--line); }
    .tab.active { background:var(--ink); color:#fff; }
    .tab-badge { display:inline-flex; align-items:center; justify-content:center; background:rgba(255,255,255,.25); color:#fff; font-size:10px; font-weight:700; min-width:18px; height:18px; border-radius:9px; padding:0 5px; margin-left:6px; }
    .tab:not(.active) .tab-badge { background:var(--line); color:var(--muted); }
    .table-wrap { background:var(--card); border:1px solid var(--line); border-radius:8px; overflow:hidden; }
    .table-head { padding:16px 20px; border-bottom:1px solid var(--line); font-size:13px; font-weight:600; }
    table { width:100%; border-collapse:collapse; }
    th { text-align:left; font-size:11px; font-weight:600; text-transform:uppercase; letter-spacing:.06em; color:var(--muted); padding:12px 16px; border-bottom:1px solid var(--line); background:var(--paper); }
    td { padding:13px 16px; border-bottom:1px solid var(--line); vertical-align:middle; font-size:13px; }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background:#fafaf8; }
    .badge { display:inline-block; padding:3px 9px; border-radius:20px; font-size:11px; font-weight:600; background:var(--paper); border:1px solid var(--line); }
    .file-link { display:inline-flex; align-items:center; gap:5px; color:var(--ink); font-size:12px; font-weight:500; text-decoration:none; padding:4px 10px; border:1px solid var(--line); border-radius:4px; }
    .empty { padding:48px; text-align:center; color:var(--muted); }
    .security-note { margin-bottom:20px; padding:10px 16px; background:#f0fdf4; border:1px solid #86efac; border-radius:6px; font-size:12px; color:#166534; display:flex; align-items:center; gap:8px; }
  </style>
</head>
<body>

<?php if (!$logado): ?>
<div class="login-wrap">
  <div class="login-box">
    <h1>Painel Admin</h1>
    <p>Canun Sistemas Construtivos — acesso restrito.</p>
    <?php if (isset($_GET['motivo']) && $_GET['motivo'] === 'expirado'): ?>
      <div class="alert alert-info">Sessão expirada por inatividade. Faça login novamente.</div>
    <?php endif; ?>
    <form method="POST" autocomplete="off">
      <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
      <label for="senha">Senha</label>
      <input type="password" id="senha" name="senha" autofocus autocomplete="current-password"
             <?= esta_bloqueado() ? 'disabled' : '' ?>>
      <button type="submit" <?= esta_bloqueado() ? 'disabled' : '' ?>>Entrar</button>
      <?php if ($erro): ?>
        <div class="alert alert-err"><?= htmlspecialchars($erro) ?></div>
      <?php endif; ?>
    </form>
  </div>
</div>

<?php else: ?>
<header>
  <div class="brand">Painel Administrativo — Canun</div>
  <form method="POST">
    <input type="hidden" name="csrf_token" value="<?= csrf_token() ?>">
    <button type="submit" name="logout">Sair</button>
  </form>
</header>

<div class="container">
  <?php if (!empty($db_erro)): ?>
    <div class="alert alert-err" style="margin-bottom:20px"><?= htmlspecialchars($db_erro) ?></div>
  <?php endif; ?>

  <div class="security-note">
    🔒 Sessão autenticada · Expira após 2 horas de inatividade · Página não indexada por buscadores
  </div>

  <div class="stats">
    <div class="stat">
      <div class="num"><?= count($candidatos) ?></div>
      <div class="lbl">Candidaturas recebidas</div>
    </div>
    <div class="stat">
      <div class="num"><?= count($fornecedores) ?></div>
      <div class="lbl">Fornecedores cadastrados</div>
    </div>
  </div>

  <div class="tabs">
    <a href="?aba=candidatos" class="tab <?= $aba === 'candidatos' ? 'active' : '' ?>">
      Candidaturas <span class="tab-badge"><?= count($candidatos) ?></span>
    </a>
    <a href="?aba=fornecedores" class="tab <?= $aba === 'fornecedores' ? 'active' : '' ?>">
      Fornecedores <span class="tab-badge"><?= count($fornecedores) ?></span>
    </a>
  </div>

  <?php if ($aba === 'candidatos'): ?>
  <div class="table-wrap">
    <div class="table-head">Candidaturas — Trabalhe Conosco</div>
    <?php if (empty($candidatos)): ?>
      <div class="empty">Nenhuma candidatura recebida ainda.</div>
    <?php else: ?>
    <table>
      <thead><tr><th>#</th><th>Data</th><th>Nome</th><th>Área</th><th>E-mail</th><th>Telefone</th><th>Arquivo</th></tr></thead>
      <tbody>
        <?php foreach ($candidatos as $r): ?>
        <tr>
          <td style="color:var(--muted)"><?= (int)$r['id'] ?></td>
          <td style="white-space:nowrap"><?= htmlspecialchars(date('d/m/Y H:i', strtotime($r['data_envio']))) ?></td>
          <td><strong><?= htmlspecialchars($r['nome']) ?></strong></td>
          <td><span class="badge"><?= htmlspecialchars($r['area']) ?></span></td>
          <td><a href="mailto:<?= htmlspecialchars($r['email']) ?>" style="color:var(--ink)"><?= htmlspecialchars($r['email']) ?></a></td>
          <td><?= htmlspecialchars($r['telefone']) ?></td>
          <td><?php if ($r['arquivo']): ?><a class="file-link" href="<?= htmlspecialchars(PROJETO_UPLOAD_URL . $r['arquivo']) ?>" target="_blank" rel="noopener noreferrer">↓ Baixar</a><?php else: ?><span style="color:var(--muted)">—</span><?php endif; ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>

  <?php else: ?>
  <div class="table-wrap">
    <div class="table-head">Fornecedores Cadastrados</div>
    <?php if (empty($fornecedores)): ?>
      <div class="empty">Nenhum fornecedor cadastrado ainda.</div>
    <?php else: ?>
    <table>
      <thead><tr><th>#</th><th>Data</th><th>Nome</th><th>Empresa</th><th>Produto / Serviço</th><th>E-mail</th><th>Telefone</th><th>Arquivo</th></tr></thead>
      <tbody>
        <?php foreach ($fornecedores as $r): ?>
        <tr>
          <td style="color:var(--muted)"><?= (int)$r['id'] ?></td>
          <td style="white-space:nowrap"><?= htmlspecialchars(date('d/m/Y H:i', strtotime($r['data_envio']))) ?></td>
          <td><strong><?= htmlspecialchars($r['nome']) ?></strong></td>
          <td><?= htmlspecialchars($r['empresa']) ?></td>
          <td><span class="badge"><?= htmlspecialchars($r['produto']) ?></span></td>
          <td><a href="mailto:<?= htmlspecialchars($r['email']) ?>" style="color:var(--ink)"><?= htmlspecialchars($r['email']) ?></a></td>
          <td><?= htmlspecialchars($r['telefone']) ?></td>
          <td><?php if ($r['arquivo']): ?><a class="file-link" href="<?= htmlspecialchars(PROJETO_UPLOAD_URL . $r['arquivo']) ?>" target="_blank" rel="noopener noreferrer">↓ Baixar</a><?php else: ?><span style="color:var(--muted)">—</span><?php endif; ?></td>
        </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
    <?php endif; ?>
  </div>
  <?php endif; ?>
</div>
<?php endif; ?>
</body>
</html>
