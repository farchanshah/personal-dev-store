const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Vercel Build Script for Monorepo');

// 1. Install dependencies di root
console.log('📦 Installing root dependencies...');
execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' });

// 2. Install dependencies di web app
console.log('📦 Installing web app dependencies...');
execSync('cd apps/web && pnpm install', { stdio: 'inherit' });

// 3. Build web app
console.log('🏗️ Building web app...');
execSync('cd apps/web && pnpm run build', { stdio: 'inherit' });

console.log('✅ Build completed!');
