#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('⚡ Quick Bundle Analysis (Lightweight)\n');

// Create analyze directory
const analyzeDir = path.join(process.cwd(), 'analyze');
if (!fs.existsSync(analyzeDir)) {
  fs.mkdirSync(analyzeDir, { recursive: true });
}

// Set Node.js memory limit for large builds
const nodeOptions = '--max-old-space-size=4096';

try {
  console.log('🧹 Cleaning previous builds...');
  // Clean .next directory first
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
  }
  
  console.log('📊 Running lightweight bundle analysis...');
  console.log('⏱️  This may take 3-5 minutes for large codebases...\n');
  
  // Run with increased memory and timeout
  const buildCommand = 'cross-env ANALYZE=true next build';
  
  execSync(buildCommand, { 
    stdio: 'inherit',
    env: { 
      ...process.env, 
      ANALYZE: 'true',
      NODE_OPTIONS: nodeOptions
    },
    timeout: 300000, // 5 minute timeout
  });
  
  console.log('\n✅ Bundle analysis complete!');
  console.log('📁 Reports saved in ./analyze/ directory');
  console.log('🌐 Open ./analyze/client.html in your browser to view results');
  
} catch (error) {
  if (error.signal === 'SIGTERM' || error.code === 'TIMEOUT') {
    console.error('\n⏰ Build timed out after 5 minutes');
    console.log('💡 Try the fast analysis instead: npm run analyze:fast');
  } else {
    console.error('\n❌ Bundle analysis failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Try: npm run analyze:fast (skips some analysis)');
    console.log('2. Check memory: npm run analyze:memory');
    console.log('3. Build without analysis first: npm run build');
  }
  process.exit(1);
} 