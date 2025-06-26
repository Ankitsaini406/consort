#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Starting Comprehensive Form Testing Suite');
console.log('=============================================\n');

// Test configuration
const testConfig = {
  timeouts: {
    unit: 30000,      // 30 seconds
    integration: 60000, // 60 seconds
    e2e: 120000,      // 2 minutes
  },
  coverage: {
    threshold: 80,    // 80% coverage required
  },
  security: {
    failOnVulnerability: true,
  },
  performance: {
    maxLoadTime: 3000, // 3 seconds max load time
  }
};

// Test categories and their configurations
const testCategories = [
  {
    name: 'Security Tests',
    pattern: '**/*.security.test.{ts,tsx}',
    timeout: testConfig.timeouts.integration,
    priority: 'CRITICAL',
    description: 'XSS prevention, input sanitization, file upload security',
  },
  {
    name: 'Input Sanitization',
    pattern: '**/errorHandler.test.ts',
    timeout: testConfig.timeouts.unit,
    priority: 'CRITICAL',
    description: 'Data sanitization and validation tests',
  },
  {
    name: 'Rate Limiting',
    pattern: '**/rateLimiter.test.ts',
    timeout: testConfig.timeouts.integration,
    priority: 'HIGH',
    description: 'Form submission rate limiting and abuse prevention',
  },
  {
    name: 'Form Components',
    pattern: '**/components/shared/fields/**/*.test.{ts,tsx}',
    timeout: testConfig.timeouts.unit,
    priority: 'HIGH',
    description: 'Individual form field component tests',
  },
  {
    name: 'Form Integration',
    pattern: '**/*.integration.test.{ts,tsx}',
    timeout: testConfig.timeouts.integration,
    priority: 'HIGH',
    description: 'End-to-end form workflow tests',
  },
  {
    name: 'Business Logic',
    pattern: '**/*.business.test.{ts,tsx}',
    timeout: testConfig.timeouts.unit,
    priority: 'MEDIUM',
    description: 'Form data processing and business rules',
  },
  {
    name: 'Performance Tests',
    pattern: '**/*.performance.test.{ts,tsx}',
    timeout: testConfig.timeouts.integration,
    priority: 'MEDIUM',
    description: 'Form performance and load testing',
  },
];

// Results tracking
let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  categories: {},
  startTime: Date.now(),
  endTime: null,
  coverage: null,
  securityIssues: [],
  performanceIssues: [],
};

// Utility functions
function runCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { 
      success: false, 
      output: error.stdout || error.message,
      error: error.stderr || error.message 
    };
  }
}

function logSection(title, level = 'INFO') {
  const icons = {
    INFO: 'ℹ️',
    SUCCESS: '✅',
    WARNING: '⚠️',
    ERROR: '❌',
    CRITICAL: '🚨',
  };
  
  console.log(`\n${icons[level]} ${title}`);
  console.log('='.repeat(title.length + 3));
}

function logResult(message, success = true) {
  const icon = success ? '✅' : '❌';
  console.log(`${icon} ${message}`);
}

function priorityColor(priority) {
  const colors = {
    CRITICAL: '\x1b[31m', // Red
    HIGH: '\x1b[33m',     // Yellow
    MEDIUM: '\x1b[36m',   // Cyan
    LOW: '\x1b[37m',      // White
  };
  return colors[priority] || colors.LOW;
}

function resetColor() {
  return '\x1b[0m';
}

// Pre-test setup
function setupTestEnvironment() {
  logSection('Setting up Test Environment', 'INFO');
  
  // Install dependencies if needed
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.error('❌ package.json not found. Please run from project root.');
    process.exit(1);
  }

  // Check if Jest is configured
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  if (!packageJson.scripts?.test && !fs.existsSync('jest.config.js')) {
    console.error('❌ Jest not configured. Please set up Jest first.');
    process.exit(1);
  }

  // Create test results directory
  const resultsDir = path.join(process.cwd(), 'test-results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }

  logResult('Test environment setup complete');
}

// Run tests for a specific category
async function runTestCategory(category) {
  const colorCode = priorityColor(category.priority);
  const resetCode = resetColor();
  
  logSection(`${colorCode}${category.name} (${category.priority})${resetCode}`, 'INFO');
  console.log(`📝 ${category.description}\n`);

  const jestCommand = [
    'npx jest',
    `--testPathPattern="${category.pattern}"`,
    `--testTimeout=${category.timeout}`,
    '--verbose',
    '--coverage=false', // We'll run coverage separately
    '--detectOpenHandles',
    '--forceExit',
  ].join(' ');

  console.log(`🔧 Running: ${jestCommand}\n`);

  const result = runCommand(jestCommand);
  
  testResults.categories[category.name] = {
    success: result.success,
    output: result.output,
    priority: category.priority,
  };

  if (result.success) {
    logResult(`${category.name} completed successfully`);
  } else {
    logResult(`${category.name} failed`, false);
    console.log('📋 Error details:');
    console.log(result.output);
    
    if (category.priority === 'CRITICAL') {
      testResults.securityIssues.push({
        category: category.name,
        error: result.error,
        priority: 'CRITICAL',
      });
    }
  }

  return result.success;
}

// Run coverage analysis
function runCoverageAnalysis() {
  logSection('Code Coverage Analysis', 'INFO');

  const coverageCommand = [
    'npx jest',
    '--coverage',
    '--coverageReporters=text-summary',
    '--coverageReporters=html',
    '--coverageReporters=json',
    '--coverageDirectory=test-results/coverage',
    '--testPathPattern="src/app/admin/forms/"',
    '--silent',
  ].join(' ');

  const result = runCommand(coverageCommand, { silent: true });
  
  if (result.success) {
    try {
      const coverageJsonPath = path.join(process.cwd(), 'test-results/coverage/coverage-summary.json');
      if (fs.existsSync(coverageJsonPath)) {
        const coverageData = JSON.parse(fs.readFileSync(coverageJsonPath, 'utf8'));
        testResults.coverage = coverageData.total;
        
        const linesCoverage = testResults.coverage.lines.pct;
        const threshold = testConfig.coverage.threshold;
        
        if (linesCoverage >= threshold) {
          logResult(`Coverage: ${linesCoverage}% (threshold: ${threshold}%)`);
        } else {
          logResult(`Coverage: ${linesCoverage}% - Below threshold (${threshold}%)`, false);
        }
      }
    } catch (error) {
      logResult('Coverage analysis failed', false);
      console.log(error.message);
    }
  } else {
    logResult('Coverage analysis failed', false);
  }
}

// Security audit
function runSecurityAudit() {
  logSection('Security Audit', 'CRITICAL');

  // Check for known vulnerabilities
  const auditCommand = 'npm audit --audit-level moderate --json';
  const result = runCommand(auditCommand, { silent: true });

  if (result.success) {
    try {
      const auditData = JSON.parse(result.output);
      
      if (auditData.vulnerabilities && Object.keys(auditData.vulnerabilities).length > 0) {
        Object.entries(auditData.vulnerabilities).forEach(([name, vuln]) => {
          if (vuln.severity === 'high' || vuln.severity === 'critical') {
            testResults.securityIssues.push({
              package: name,
              severity: vuln.severity,
              title: vuln.via?.[0]?.title || 'Security vulnerability',
            });
          }
        });
        
        logResult(`Found ${Object.keys(auditData.vulnerabilities).length} vulnerabilities`, false);
      } else {
        logResult('No security vulnerabilities found');
      }
    } catch (error) {
      logResult('Security audit parsing failed', false);
    }
  } else {
    logResult('Security audit failed', false);
  }
}

// Performance benchmarks
function runPerformanceBenchmarks() {
  logSection('Performance Benchmarks', 'INFO');

  // Run performance-specific tests
  const perfCommand = [
    'npx jest',
    '--testPathPattern="**/*.performance.test.{ts,tsx}"',
    '--verbose',
    '--silent',
  ].join(' ');

  const result = runCommand(perfCommand, { silent: true });
  
  if (result.success) {
    logResult('Performance benchmarks completed');
  } else {
    logResult('Performance benchmarks failed', false);
    testResults.performanceIssues.push({
      issue: 'Performance tests failed',
      details: result.output,
    });
  }
}

// Generate comprehensive report
function generateReport() {
  testResults.endTime = Date.now();
  const duration = ((testResults.endTime - testResults.startTime) / 1000).toFixed(2);

  logSection('📊 Comprehensive Test Report', 'INFO');

  // Overall summary
  console.log(`⏱️  Total Duration: ${duration}s`);
  console.log(`📋 Categories Tested: ${Object.keys(testResults.categories).length}`);
  
  // Category results
  console.log('\n📊 Test Category Results:');
  Object.entries(testResults.categories).forEach(([name, result]) => {
    const icon = result.success ? '✅' : '❌';
    const colorCode = priorityColor(result.priority);
    const resetCode = resetColor();
    console.log(`  ${icon} ${colorCode}${name} (${result.priority})${resetCode}`);
  });

  // Coverage report
  if (testResults.coverage) {
    console.log('\n📈 Coverage Report:');
    console.log(`  Lines: ${testResults.coverage.lines.pct}%`);
    console.log(`  Functions: ${testResults.coverage.functions.pct}%`);
    console.log(`  Branches: ${testResults.coverage.branches.pct}%`);
    console.log(`  Statements: ${testResults.coverage.statements.pct}%`);
  }

  // Security issues
  if (testResults.securityIssues.length > 0) {
    console.log('\n🚨 Security Issues:');
    testResults.securityIssues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.category || issue.package}: ${issue.error || issue.title}`);
    });
  } else {
    console.log('\n🔒 No security issues found');
  }

  // Performance issues
  if (testResults.performanceIssues.length > 0) {
    console.log('\n⚡ Performance Issues:');
    testResults.performanceIssues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue.issue}`);
    });
  } else {
    console.log('\n🚀 No performance issues found');
  }

  // Critical failures
  const criticalFailures = Object.entries(testResults.categories)
    .filter(([_, result]) => !result.success && result.priority === 'CRITICAL');

  if (criticalFailures.length > 0) {
    console.log('\n🚨 CRITICAL FAILURES - DEPLOYMENT BLOCKED:');
    criticalFailures.forEach(([name, _]) => {
      console.log(`  ❌ ${name}`);
    });
  }

  // Recommendations
  console.log('\n💡 Recommendations:');
  
  if (criticalFailures.length > 0) {
    console.log('  🚨 URGENT: Fix critical security/form failures before deployment');
  }
  
  if (testResults.coverage && testResults.coverage.lines.pct < testConfig.coverage.threshold) {
    console.log(`  📈 Increase test coverage to ${testConfig.coverage.threshold}%`);
  }
  
  if (testResults.securityIssues.length > 0) {
    console.log('  🔒 Address security vulnerabilities');
  }
  
  if (testResults.performanceIssues.length > 0) {
    console.log('  ⚡ Optimize form performance');
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'test-results/comprehensive-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(testResults, null, 2));
  console.log(`\n📄 Detailed report saved to: ${reportPath}`);

  // Exit code
  const hasFailures = Object.values(testResults.categories).some(r => !r.success);
  const hasCriticalIssues = criticalFailures.length > 0 || testResults.securityIssues.length > 0;
  
  if (hasCriticalIssues) {
    console.log('\n🚨 CRITICAL ISSUES DETECTED - FAILING BUILD');
    process.exit(1);
  } else if (hasFailures) {
    console.log('\n⚠️  Some tests failed - Review required');
    process.exit(1);
  } else {
    console.log('\n🎉 All tests passed successfully!');
    process.exit(0);
  }
}

// Main execution
async function main() {
  try {
    setupTestEnvironment();

    // Run test categories in priority order
    const sortedCategories = testCategories.sort((a, b) => {
      const priorities = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return priorities[a.priority] - priorities[b.priority];
    });

    for (const category of sortedCategories) {
      await runTestCategory(category);
      
      // Stop on critical failures if configured
      if (testConfig.security.failOnVulnerability && 
          category.priority === 'CRITICAL' && 
          !testResults.categories[category.name].success) {
        console.log('\n🚨 Critical test failure detected. Stopping execution.');
        break;
      }
    }

    // Run additional analyses
    runCoverageAnalysis();
    runSecurityAudit();
    runPerformanceBenchmarks();

    // Generate final report
    generateReport();

  } catch (error) {
    console.error('\n💥 Test execution failed:');
    console.error(error.message);
    process.exit(1);
  }
}

// Handle process signals
process.on('SIGINT', () => {
  console.log('\n⏹️  Test execution interrupted');
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('\n💥 Uncaught exception during test execution:');
  console.error(error);
  process.exit(1);
});

// Start execution
main();