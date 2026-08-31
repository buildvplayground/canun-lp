#!/usr/bin/env python3
"""Sincroniza Site/ (working) para as duas pastas de deploy.

Rode sempre que mexer em Site/ — as pastas de deploy nunca devem ser editadas à mão.
    python sync-deploy.py
"""
import os, shutil, sys

RAIZ   = os.path.dirname(os.path.abspath(__file__))
ORIGEM = os.path.join(RAIZ, "Site")
ROTA   = "manutencao-preventiva"          # subpasta da LP dentro de public_html/
ALVOS  = [
    os.path.join(RAIZ, "deploy-vercel"),
    os.path.join(RAIZ, "deploy-wordpress", "public_html", ROTA),
]
# arquivos que pertencem a cada alvo e não vêm de Site/
PROPRIOS = {"README.md", "vercel.json", "robots.txt", ".htaccess"}

def sincroniza(destino):
    os.makedirs(destino, exist_ok=True)
    # limpa só o que veio de Site/, preservando os arquivos próprios do alvo
    for nome in os.listdir(destino):
        if nome in PROPRIOS:
            continue
        alvo = os.path.join(destino, nome)
        shutil.rmtree(alvo) if os.path.isdir(alvo) else os.remove(alvo)
    for nome in os.listdir(ORIGEM):
        o, d = os.path.join(ORIGEM, nome), os.path.join(destino, nome)
        shutil.copytree(o, d) if os.path.isdir(o) else shutil.copy2(o, d)
    n = sum(len(f) for _, _, f in os.walk(destino))
    peso = sum(os.path.getsize(os.path.join(r, f))
               for r, _, fs in os.walk(destino) for f in fs) // 1024
    print(f"  {os.path.relpath(destino, RAIZ):46s} {n:3d} arquivos  {peso:5d} KB")

if not os.path.isdir(ORIGEM):
    sys.exit("Site/ não encontrada.")
print("Sincronizando a partir de Site/ ...")
for alvo in ALVOS:
    sincroniza(alvo)
print("Pronto.")
