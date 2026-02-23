#!/usr/bin/env node
/**
 * One-time setup: create upload dirs so the app can read/write.
 * Works on Windows (no bash required). Run once per environment: npm run setup:uploads
 * Optional (Unix): APP_USER=node npm run setup:uploads to set ownership via the bash script.
 */

const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");

const dirs = [
  "public/uploads/site",
  "public/uploads/site/favicon",
  "public/uploads/site/homepage",
  "public/uploads/site/developers-page",
  "public/uploads/developers/logos",
  "public/uploads/developers/banners",
  "public/uploads/products/images",
  "storage/product-files",
];

for (const dir of dirs) {
  const full = path.join(root, dir);
  fs.mkdirSync(full, { recursive: true });
  console.log("Created:", dir);
}

console.log("Done. Upload dirs ready for product images, product files, developer logos/banners, and site assets.");
