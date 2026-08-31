<?php
// ══════════════════════════════════════════════════════
//  Canun Sistemas Construtivos — PHP entry point
//  Serve o Steel Frame como página principal.
//  Necessário em hostings que priorizam index.php.
// ══════════════════════════════════════════════════════
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
exit;
