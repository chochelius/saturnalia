# Script de despliegue a produccion en GitHub Pages
# Saturnalia999 -> https://saturnalia999.art

param (
    [string]$Branch = "master"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " [*] INICIANDO DESPLIEGUE A PRODUCCION // GITHUB PAGES" -ForegroundColor Cyan
Write-Host " Dominio destino: https://saturnalia999.art" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Sincronizar contenido desde la Raspberry Pi (PocketBase -> Fallback JSONs)
Write-Host "1. Sincronizando contenido validado desde la Raspberry Pi..." -ForegroundColor Yellow
node ./scripts/sync-from-pi.mjs
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Advertencia: No se pudo conectar a la Raspberry Pi. Se utilizaran los datos locales actuales." -ForegroundColor DarkYellow
}

# 2. Validacion de tipos TypeScript
Write-Host "2. Verificando integridad de codigo (TypeScript)..." -ForegroundColor Yellow
npm.cmd run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Error en TypeScript. Corrige los errores antes de desplegar a produccion." -ForegroundColor Red
    exit 1
}

# 3. Comprobar estado de Git
Write-Host "3. Verificando cambios en el repositorio local..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Guardando cambios y sincronizacion de contenido en Git..." -ForegroundColor Yellow
    git add .
    $commitMsg = "chore(release): deploy to github pages " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    git commit -m $commitMsg
}

# 4. Enviar a GitHub
Write-Host "4. Comprobando remoto 'origin' en Git..." -ForegroundColor Yellow
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "Subiendo a GitHub (origin/$Branch)..." -ForegroundColor Yellow
    git push origin $Branch
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "==========================================================" -ForegroundColor Red
        Write-Host " [X] ERROR AL SUBIR A GITHUB" -ForegroundColor Red
        Write-Host " Revisa tu autenticacion de GitHub (ej. ejecuta 'gh auth login' en tu terminal)." -ForegroundColor Yellow
        Write-Host "==========================================================" -ForegroundColor Red
        exit 1
    }
    Write-Host ""
    Write-Host "==========================================================" -ForegroundColor Green
    Write-Host " [OK] CAMBIOS ENVIADOS A GITHUB EXITOSAMENTE" -ForegroundColor Green
    Write-Host " GitHub Actions compilara y publicara automaticamente en:" -ForegroundColor Cyan
    Write-Host " https://saturnalia999.art" -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "[!] No hay un remoto 'origin' configurado en Git." -ForegroundColor DarkYellow
    Write-Host "Para vincular tu repositorio de GitHub, ejecuta:" -ForegroundColor Cyan
    Write-Host "  git remote add origin https://github.com/<tu-usuario>/<tu-repo>.git" -ForegroundColor White
    Write-Host "  git push -u origin $Branch" -ForegroundColor White
}
Write-Host ""
