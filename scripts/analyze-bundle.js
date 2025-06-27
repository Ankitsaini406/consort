#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔍 Starting Bundle Analysis...\n');

// Create analyze directory
const analyzeDir = path.join(process.cwd(), 'analyze');
if (!fs.existsSync(analyzeDir)) {
  fs.mkdirSync(analyzeDir, { recursive: true });
}

try {
  console.log('📊 Analyzing client-side bundle...');
  execSync('cross-env ANALYZE=true BUNDLE_ANALYZE=browser npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true', BUNDLE_ANALYZE: 'browser' }
  });
  
  console.log('\n📊 Analyzing server-side bundle...');
  execSync('cross-env ANALYZE=true BUNDLE_ANALYZE=server npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, ANALYZE: 'true', BUNDLE_ANALYZE: 'server' }
  });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('📁 Reports saved in ./analyze/ directory');
  
} catch (error) {
  console.error('❌ Bundle analysis failed:', error.message);
  process.exit(1);
} 