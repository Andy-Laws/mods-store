#!/usr/bin/env bash
# One-time setup: create upload dirs and set permissions so the app can read/write.
# Run once per server (or add to your deploy). Use the same user that runs the app.
# Optional: APP_USER=node ./scripts/setup-uploads.sh to set ownership to that user.

set -e
cd "$(dirname "$0")/.."

mkdir -p \
  public/uploads/site \
  public/uploads/site/favicon \
  public/uploads/site/homepage \
  public/uploads/site/developers-page \
  public/uploads/developers/logos \
  public/uploads/developers/banners \
  public/uploads/products/images \
  storage/product-files

chmod -R 755 public/uploads storage

if [ -n "${APP_USER}" ]; then
  chown -R "${APP_USER}:${APP_USER}" public/uploads storage
  echo "Ownership set to ${APP_USER}. Done."
else
  echo "Upload dirs created and permissions set. If the app runs as another user, run: APP_USER=thatuser bash scripts/setup-uploads.sh"
fi
