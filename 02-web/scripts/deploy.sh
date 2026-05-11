#!/usr/bin/env bash
# Deploy worklog to Oracle server (aaPanel)
# Usage: bash scripts/deploy.sh
set -e

KEY="$HOME/Documents/important file/ssh-key-2026-04-08.key"
REMOTE="ubuntu@137.131.7.230"
REMOTE_DIR="/www/wwwroot/worklog.looptw.com/standalone"
PM2="/www/server/nvm/versions/node/v24.14.1/bin/pm2"

echo "[1/4] Building..."
bun run build

echo "[2/4] Copying static files and start script..."
cp -r .next/static .next/standalone/.next/static
cat > .next/standalone/start.sh << 'EOF'
#!/bin/bash
export PORT=3010
exec /home/ubuntu/.bun/bin/bun /www/wwwroot/worklog.looptw.com/standalone/server.js
EOF
chmod +x .next/standalone/start.sh

echo "[3/4] Uploading to server..."
rsync -av --delete \
  --no-perms --no-owner --no-group \
  --exclude='.env' \
  --exclude='data/' \
  -e "ssh -i \"$KEY\"" \
  .next/standalone/ \
  "$REMOTE:$REMOTE_DIR/"

echo "[4/4] Restarting PM2..."
ssh -i "$KEY" "$REMOTE" \
  "sudo PATH=/www/server/nvm/versions/node/v24.14.1/bin:\$PATH $PM2 restart worklog && \
   sudo PATH=/www/server/nvm/versions/node/v24.14.1/bin:\$PATH $PM2 logs worklog --lines 5 --nostream"

echo ""
echo "✓ Deploy complete → https://worklog.looptw.com"
