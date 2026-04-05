#!/bin/bash
set -e

cd /var/www/kintana
echo "Pulling latest changes..."
git pull origin master
echo "Installing dependencies..."
npm install
echo "Building..."
npm run build
echo "Reloading Nginx..."
sudo systemctl reload nginx
echo "Deploy complete!"
