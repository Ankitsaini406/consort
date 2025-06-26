#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Fast Bundle Analysis (Skip Heavy Components)\n');

// Temporarily disable heavy components for faster analysis
const heavyComponents = [
  'src/app/admin',
  'src/components/admin',
  'functions/',
];

const backupDir = path.join(process.cwd(), '.analysis-backup');

try {
  console.log('📦 Temporarily moving heavy components...');
  
  // Create backup directory
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  // Move heavy components temporarily
  heavyComponents.forEach(componentPath => {
    if (fs.existsSync(componentPath)) {
      const backupPath = path.join(backupDir, path.basename(componentPath));
      fs.renameSync(componentPath, backupPath);
      console.log(`📦 Moved ${componentPath} → ${backupPath}`);
    }
  });
  
  console.log('\n📊 Running fast analysis (core app only)...');
  
  // Run analysis with reduced scope
  execSync('cross-env ANALYZE=true next build', { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      ANALYZE: 'true',
      NODE_OPTIONS: '--max-old-space-size=2048'
    },
    timeout: 180000, // 3 minute timeout
  });
  
  console.log('\n🔄 Restoring heavy components...');
  
  // Restore heavy components
  heavyComponents.forEach(componentPath => {
    const backupPath = path.join(backupDir, path.basename(componentPath));
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, componentPath);
      console.log(`🔄 Restored ${backupPath} → ${componentPath}`);
    }
  });
  
  // Cleanup backup directory
  fs.rmSync(backupDir, { recursive: true, force: true });
  
  console.log('\n✅ Fast analysis complete!');
  console.log('📁 Core app bundle analysis saved in ./analyze/');
  console.log('⚠️  Note: Admin components were excluded for speed');
  
} catch (error) {
  console.error('\n❌ Fast analysis failed:', error.message);
  
  // Ensure components are restored even on failure
  console.log('🔄 Restoring components after failure...');
  heavyComponents.forEach(componentPath => {
    const backupPath = path.join(backupDir, path.basename(componentPath));
    if (fs.existsSync(backupPath)) {
      try {
        fs.renameSync(backupPath, componentPath);
        console.log(`🔄 Restored ${backupPath} → ${componentPath}`);
      } catch (restoreError) {
        console.error(`❌ Failed to restore ${componentPath}:`, restoreError.message);
      }
    }
  });
  
  // Cleanup backup directory
  if (fs.existsSync(backupDir)) {
    fs.rmSync(backupDir, { recursive: true, force: true });
  }
  
  process.exit(1);
} 