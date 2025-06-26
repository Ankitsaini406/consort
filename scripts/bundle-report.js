#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('📊 Simple Bundle Size Report\n');

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeDirectory(dirPath, extensions = ['.js', '.css']) {
  const results = [];
  
  if (!fs.existsSync(dirPath)) {
    return results;
  }
  
  const files = fs.readdirSync(dirPath, { recursive: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);
    
    if (stats.isFile() && extensions.some(ext => file.endsWith(ext))) {
      results.push({
        name: file,
        size: stats.size,
        path: filePath
      });
    }
  }
  
  return results.sort((a, b) => b.size - a.size);
}

try {
  // Check if build exists
  const buildDir = path.join(process.cwd(), '.next');
  
  if (!fs.existsSync(buildDir)) {
    console.log('🏗️  No build found. Running build first...');
    execSync('npm run build', { stdio: 'inherit' });
  }
  
  console.log('📁 Analyzing .next directory...\n');
  
  // Analyze static files
  const staticFiles = analyzeDirectory(path.join(buildDir, 'static'));
  
  if (staticFiles.length === 0) {
    console.log('❌ No build files found. Try running: npm run build');
    process.exit(1);
  }
  
  let totalSize = 0;
  const jsFiles = staticFiles.filter(f => f.name.endsWith('.js'));
  const cssFiles = staticFiles.filter(f => f.name.endsWith('.css'));
  
  console.log('🟨 JavaScript Files (Top 10):');
  console.log('─'.repeat(60));
  jsFiles.slice(0, 10).forEach(file => {
    totalSize += file.size;
    console.log(`${formatBytes(file.size).padEnd(10)} │ ${file.name}`);
  });
  
  console.log('\n🟦 CSS Files:');
  console.log('─'.repeat(60));
  cssFiles.forEach(file => {
    totalSize += file.size;
    console.log(`${formatBytes(file.size).padEnd(10)} │ ${file.name}`);
  });
  
  // Summary
  console.log('\n📈 Summary:');
  console.log('─'.repeat(60));
  console.log(`Total JS Files: ${jsFiles.length}`);
  console.log(`Total CSS Files: ${cssFiles.length}`);
  console.log(`Total Size: ${formatBytes(totalSize)}`);
  console.log(`Average JS Size: ${formatBytes(totalSize / jsFiles.length)}`);
  
  // Identify largest files
  console.log('\n🎯 Optimization Opportunities:');
  console.log('─'.repeat(60));
  const largeFiles = staticFiles.filter(f => f.size > 100000); // > 100KB
  
  if (largeFiles.length > 0) {
    largeFiles.forEach(file => {
      console.log(`⚠️  ${file.name} (${formatBytes(file.size)}) - Consider optimization`);
    });
  } else {
    console.log('✅ No files larger than 100KB found');
  }
  
  // Quick dependency analysis
  console.log('\n📦 Large Dependencies Check:');
  console.log('─'.repeat(60));
  
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const heavyDeps = [
    '@subframe/core',
    'framer-motion', 
    'firebase',
    'lodash',
    'lucide-react'
  ];
  
  heavyDeps.forEach(dep => {
    if (packageJson.dependencies[dep]) {
      console.log(`📦 ${dep} v${packageJson.dependencies[dep]} - Consider optimization`);
    }
  });
  
  console.log('\n💡 Quick Optimization Tips:');
  console.log('─'.repeat(60));
  console.log('1. Use dynamic imports for large components');
  console.log('2. Optimize @subframe/core imports (avoid wildcard imports)');
  console.log('3. Consider replacing lodash with native alternatives');
  console.log('4. Use selective imports for Firebase modules');
  console.log('\n🎯 For detailed analysis, run: npm run analyze:full');
  
} catch (error) {
  console.error('❌ Bundle report failed:', error.message);
  process.exit(1);
} 