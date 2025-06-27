#!/usr/bin/env node

/**
 * 💰 Firebase App Hosting Cost Monitor
 * 
 * Simple script to help monitor your Firebase App Hosting usage
 * and ensure you stay within the free tier limits.
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Free tier limits (monthly)
const FREE_TIER_LIMITS = {
  cloudRun: {
    requests: 2_000_000,
    vCpuSeconds: 360_000,
    memoryGbSeconds: 200_000
  },
  cloudBuild: {
    buildMinutesPerDay: 120,
    buildMinutesPerMonth: 120 * 30 // 3600 minutes/month
  }
};

// Your current configuration
const YOUR_CONFIG = {
  cpu: 0.5, // vCPU
  memoryGb: 0.5, // 512MB = 0.5GB
  estimatedAdminHoursPerMonth: 4, // 2 admins × 30min/week × 4 weeks
  buildsPerMonth: 30, // Daily builds
  estimatedBuildMinutesPerBuild: 4
};

function calculateUsageEstimate() {
  console.log('🔍 Firebase App Hosting Usage Estimate\n');
  
  // Cloud Run estimates
  const adminUsage = {
    vCpuSeconds: YOUR_CONFIG.cpu * YOUR_CONFIG.estimatedAdminHoursPerMonth * 3600,
    memoryGbSeconds: YOUR_CONFIG.memoryGb * YOUR_CONFIG.estimatedAdminHoursPerMonth * 3600,
    requests: YOUR_CONFIG.estimatedAdminHoursPerMonth * 100 // Estimate 100 requests/hour
  };
  
  // Cloud Build estimates
  const buildUsage = {
    buildMinutes: YOUR_CONFIG.buildsPerMonth * YOUR_CONFIG.estimatedBuildMinutesPerBuild
  };
  
  console.log('📊 CLOUD RUN USAGE ESTIMATE:');
  console.log(`   vCPU Seconds: ${adminUsage.vCpuSeconds.toLocaleString()} / ${FREE_TIER_LIMITS.cloudRun.vCpuSeconds.toLocaleString()} (${((adminUsage.vCpuSeconds / FREE_TIER_LIMITS.cloudRun.vCpuSeconds) * 100).toFixed(1)}%)`);
  console.log(`   Memory GB-Seconds: ${adminUsage.memoryGbSeconds.toLocaleString()} / ${FREE_TIER_LIMITS.cloudRun.memoryGbSeconds.toLocaleString()} (${((adminUsage.memoryGbSeconds / FREE_TIER_LIMITS.cloudRun.memoryGbSeconds) * 100).toFixed(1)}%)`);
  console.log(`   Requests: ${adminUsage.requests.toLocaleString()} / ${FREE_TIER_LIMITS.cloudRun.requests.toLocaleString()} (${((adminUsage.requests / FREE_TIER_LIMITS.cloudRun.requests) * 100).toFixed(2)}%)`);
  
  console.log('\n🔨 CLOUD BUILD USAGE ESTIMATE:');
  console.log(`   Build Minutes: ${buildUsage.buildMinutes} / ${FREE_TIER_LIMITS.cloudBuild.buildMinutesPerMonth} (${((buildUsage.buildMinutes / FREE_TIER_LIMITS.cloudBuild.buildMinutesPerMonth) * 100).toFixed(1)}%)`);
  
  // Safety check
  const isWithinLimits = 
    adminUsage.vCpuSeconds < FREE_TIER_LIMITS.cloudRun.vCpuSeconds * 0.8 &&
    adminUsage.memoryGbSeconds < FREE_TIER_LIMITS.cloudRun.memoryGbSeconds * 0.8 &&
    buildUsage.buildMinutes < FREE_TIER_LIMITS.cloudBuild.buildMinutesPerMonth * 0.8;
  
  console.log('\n🎯 FREE TIER STATUS:');
  if (isWithinLimits) {
    console.log('   ✅ SAFE - Well within free tier limits');
    console.log('   💰 Expected monthly cost: $0');
  } else {
    console.log('   ⚠️  WARNING - May exceed free tier limits');
    console.log('   💰 Expected monthly cost: $0-5');
  }
  
  return { adminUsage, buildUsage, isWithinLimits };
}

function generateOptimizationTips() {
  console.log('\n💡 OPTIMIZATION TIPS:\n');
  
  const tips = [
    '🔹 Keep admin sessions short (auto-logout after 30 min)',
    '🔹 Use SSG for all public content (0 Cloud Run cost)',
    '🔹 Trigger builds only when content changes, not daily',
    '🔹 Monitor usage weekly in Firebase Console',
    '🔹 Set up billing alerts at $2, $5 thresholds',
    '🔹 Use lightweight admin operations (quick saves, no bulk operations)',
    '🔹 Pre-compress images before uploading to reduce build time'
  ];
  
  tips.forEach(tip => console.log(tip));
}

function checkCurrentConfig() {
  console.log('\n⚙️  CURRENT CONFIGURATION:\n');
  
  // Read apphosting.yaml if it exists
  const apphostingPath = path.join(process.cwd(), 'apphosting.yaml');
  if (fs.existsSync(apphostingPath)) {
    console.log('📄 apphosting.yaml found:');
    console.log(`   CPU: ${YOUR_CONFIG.cpu} vCPU`);
    console.log(`   Memory: ${YOUR_CONFIG.memoryGb * 1024}MB`);
    console.log(`   Min Instances: 0 (scale-to-zero ✅)`);
    console.log(`   Max Instances: 2`);
    console.log(`   Build CPU: 1 vCPU`);
    console.log(`   Build Memory: 2GB`);
  } else {
    console.log('❌ apphosting.yaml not found in current directory');
  }
}

function displayMonitoringInstructions() {
  console.log('\n📊 MONITORING INSTRUCTIONS:\n');
  
  console.log('1. Firebase Console:');
  console.log('   • Go to: https://console.firebase.google.com');
  console.log('   • Select your project → App Hosting → [Your Backend]');
  console.log('   • Click "Metrics" tab');
  console.log('   • Monitor: Request count, Instance hours, CPU/Memory usage');
  
  console.log('\n2. Google Cloud Console (detailed metrics):');
  console.log('   • Go to: https://console.cloud.google.com');
  console.log('   • Navigate to: Cloud Run → [Your Service] → Metrics');
  console.log('   • Monitor: Request latency, CPU utilization, Memory usage');
  
  console.log('\n3. Billing Alerts:');
  console.log('   • Go to: Google Cloud Console → Billing → Budgets & alerts');
  console.log('   • Create budget: $5/month with alerts at 50%, 80%, 100%');
  
  console.log('\n4. Weekly Review:');
  console.log('   • Run this script: npm run monitor-costs');
  console.log('   • Check actual vs. estimated usage');
  console.log('   • Adjust configuration if needed');
}

function main() {
  console.clear();
  console.log('🚀 Firebase App Hosting Cost Monitor\n');
  console.log('=' .repeat(50));
  
  checkCurrentConfig();
  const usage = calculateUsageEstimate();
  generateOptimizationTips();
  displayMonitoringInstructions();
  
  console.log('\n' + '='.repeat(50));
  console.log('📞 Need help? Check FREE_TIER_OPTIMIZATION_STRATEGY.md');
  console.log('🔄 Run this script weekly to monitor usage');
}

// Run the script
if (require.main === module) {
  main();
}

module.exports = {
  calculateUsageEstimate,
  FREE_TIER_LIMITS,
  YOUR_CONFIG
}; 