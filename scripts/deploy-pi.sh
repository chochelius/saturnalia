#!/bin/bash
set -e

HOST="192.168.1.118"
USER="chochelius"
REMOTE_DIR="/home/chochelius/saturnalia"

echo "🚀 === INICIANDO DESPLIEGUE SATURNALIA999 ==="

# 1. Git status
if [ -n "$(git status --porcelain)" ]; then
  echo "⚠️ Creando commit automático..."
  git add .
  git commit -m "chore: auto-sync update $(date '+%Y-%m-%d %H:%M')"
fi

# 2. Push GitHub
if git remote | grep -q 'origin'; then
  echo "📡 Subiendo a GitHub..."
  git push origin main
fi

# 3. Transmitir a la Raspberry Pi
echo "📤 Empaquetando y transfiriendo archivos..."
tar --exclude='node_modules' --exclude='.astro' --exclude='dist' --exclude='bandcamp' --exclude='.git' -czf /tmp/saturnalia_update.tar.gz .
scp /tmp/saturnalia_update.tar.gz "$USER@$HOST:/tmp/saturnalia_update.tar.gz"
rm -f /tmp/saturnalia_update.tar.gz

# 4. Desempaquetar y compilar en la Raspberry Pi
ssh -n "$USER@$HOST" << EOF
export PATH="/home/chochelius/.nvm/versions/node/v26.12.1/bin:/usr/local/bin:/usr/bin:/bin:$PATH"
cd $REMOTE_DIR
tar -xzf /tmp/saturnalia_update.tar.gz
rm -f /tmp/saturnalia_update.tar.gz
npm install --no-audit --no-fund
npm run build
if systemctl --user is-active --quiet saturnalia.service 2>/dev/null; then
    systemctl --user restart saturnalia.service
    echo "✅ Servicio saturnalia.service reiniciado."
else
    echo "ℹ️ Servicio systemd no activo aún."
fi
EOF

echo "✨ Despliegue finalizado exitosamente."
