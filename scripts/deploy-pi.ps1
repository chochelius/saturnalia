# Script de despliegue y sincronización con la Raspberry Pi
# Saturnalia999

param (
    [string]$HostName = "192.168.1.118",
    [string]$User = "chochelius",
    [string]$RemoteDir = "/home/chochelius/saturnalia"
)

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=== INICIANDO DESPLIEGUE SATURNALIA999 ===" -ForegroundColor Cyan
Write-Host ""

# 1. Verificar si hay cambios locales en Git
Write-Host "1. Verificando estado local de Git..." -ForegroundColor Yellow
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "Hay cambios locales sin commitear. Creando commit automatico..." -ForegroundColor Yellow
    git add .
    $commitMsg = "chore: auto-sync update " + (Get-Date -Format 'yyyy-MM-dd HH:mm')
    git commit -m $commitMsg
}

# 2. Push a GitHub si existe remote 'origin'
$remotes = git remote
if ($remotes -contains "origin") {
    Write-Host "2. Subiendo cambios a GitHub (origin/main)..." -ForegroundColor Yellow
    git push origin main
} else {
    Write-Host "No hay remoto 'origin' configurado en Git aun. Saltando push central." -ForegroundColor Gray
}

# 3. Sincronizacion con la Raspberry Pi
Write-Host "3. Conectando con la Raspberry Pi ($User@$HostName)..." -ForegroundColor Yellow

$tempFile = [System.IO.Path]::Combine([System.IO.Path]::GetTempPath(), "saturnalia_update.tar.gz")
if (Test-Path $tempFile) {
    Remove-Item $tempFile -Force
}

Write-Host "Empaquetando codigo fuente..." -ForegroundColor Yellow
tar --exclude='node_modules' --exclude='.astro' --exclude='dist' --exclude='bandcamp' --exclude='.git' -czf $tempFile .

Write-Host "Transfiriendo archivo comprimido..." -ForegroundColor Yellow
$targetScp = $User + "@" + $HostName + ":/tmp/saturnalia_update.tar.gz"
scp $tempFile $targetScp
Remove-Item $tempFile -Force

# 4. Desempaquetado, instalacion y compilacion remota
Write-Host "4. Actualizando dependencias y compilando en la Raspberry Pi..." -ForegroundColor Yellow

$remoteScript = "cd /home/chochelius/saturnalia; tar -xzf /tmp/saturnalia_update.tar.gz; rm -f /tmp/saturnalia_update.tar.gz; npm install --no-audit --no-fund; npm run build; if systemctl --user is-active --quiet saturnalia.service 2>/dev/null; then systemctl --user restart saturnalia.service; echo 'Servicio saturnalia.service reiniciado.'; fi"

$targetSsh = $User + "@" + $HostName
ssh -n $targetSsh $remoteScript

Write-Host ""
Write-Host "=== DESPLIEGUE FINALIZADO EXITOSAMENTE ===" -ForegroundColor Green
Write-Host "Sitio disponible en: http://$HostName:9002" -ForegroundColor Cyan
Write-Host "PocketBase disponible en: http://$HostName:8090/_/" -ForegroundColor Cyan
