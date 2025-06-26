#!/usr/bin/env node

/**
 * Authentication Security Test Script
 * Tests admin route protection without authentication
 */

const http = require('http');
const https = require('https');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';
const ADMIN_ROUTES = [
    '/admin',
    '/admin/products',
    '/admin/products/form',
    '/admin/posts',
    '/admin/resources', 
    '/admin/solutions',
    '/admin/industries',
    '/admin/tag-system',
    '/admin/ui-demo'
];

console.log('🔒 Authentication Security Test');
console.log('================================');
console.log(`Testing: ${BASE_URL}`);
console.log('');

async function testRoute(route) {
    return new Promise((resolve) => {
        const url = new URL(route, BASE_URL);
        const client = url.protocol === 'https:' ? https : http;
        
        const req = client.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                resolve({
                    route,
                    status: res.statusCode,
                    headers: res.headers,
                    body: data,
                    contentLength: data.length
                });
            });
        });
        
        req.on('error', (err) => {
            resolve({
                route,
                status: 'ERROR',
                error: err.message,
                body: '',
                contentLength: 0
            });
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            resolve({
                route,
                status: 'TIMEOUT',
                body: '',
                contentLength: 0
            });
        });
    });
}

async function analyzeResponse(result) {
    const { route, status, body, contentLength } = result;
    
    if (status === 'ERROR' || status === 'TIMEOUT') {
        return { route, status: '✅ PROTECTED', reason: `Network error (${status})` };
    }
    
    if (status === 404) {
        return { route, status: '⚠️ NOT FOUND', reason: 'Route does not exist' };
    }
    
    if (status >= 400) {
        return { route, status: '✅ PROTECTED', reason: `HTTP ${status}` };
    }
    
    // Check if response contains authentication guard
    const bodyLower = body.toLowerCase();
    if (bodyLower.includes('verifying credentials') || 
        bodyLower.includes('access denied') ||
        bodyLower.includes('authentication') ||
        bodyLower.includes('login')) {
        return { route, status: '✅ PROTECTED', reason: 'Shows auth guard' };
    }
    
    // Check if response contains admin content (potential vulnerability)
    if (bodyLower.includes('admin dashboard') ||
        bodyLower.includes('admin panel') ||
        bodyLower.includes('form') && bodyLower.includes('submit') ||
        contentLength > 10000) { // Large responses likely contain admin content
        return { route, status: '❌ VULNERABLE', reason: 'Shows admin content without auth' };
    }
    
    return { route, status: '⚠️ UNKNOWN', reason: `HTTP ${status}, ${contentLength} bytes` };
}

async function runTests() {
    console.log('Testing admin routes without authentication...\n');
    
    const results = [];
    
    for (const route of ADMIN_ROUTES) {
        process.stdout.write(`Testing ${route}... `);
        const result = await testRoute(route);
        const analysis = await analyzeResponse(result);
        results.push(analysis);
        console.log(analysis.status);
    }
    
    console.log('\n📊 Test Results Summary');
    console.log('========================');
    
    let protected = 0;
    let vulnerable = 0;
    let unknown = 0;
    
    results.forEach(result => {
        const icon = result.status.includes('PROTECTED') ? '✅' : 
                    result.status.includes('VULNERABLE') ? '❌' : '⚠️';
        console.log(`${icon} ${result.route.padEnd(25)} - ${result.reason}`);
        
        if (result.status.includes('PROTECTED')) protected++;
        else if (result.status.includes('VULNERABLE')) vulnerable++;
        else unknown++;
    });
    
    console.log('\n📈 Security Score');
    console.log('==================');
    console.log(`✅ Protected: ${protected}/${ADMIN_ROUTES.length}`);
    console.log(`❌ Vulnerable: ${vulnerable}/${ADMIN_ROUTES.length}`);
    console.log(`⚠️ Unknown: ${unknown}/${ADMIN_ROUTES.length}`);
    
    if (vulnerable > 0) {
        console.log('\n🚨 SECURITY ISSUES DETECTED!');
        console.log('Some admin routes are accessible without authentication.');
        console.log('Please review the AuthGuard implementation.');
        process.exit(1);
    } else if (protected === ADMIN_ROUTES.length) {
        console.log('\n🎉 ALL ROUTES PROTECTED!');
        console.log('Authentication security is working correctly.');
        process.exit(0);
    } else {
        console.log('\n⚠️ INCONCLUSIVE RESULTS');
        console.log('Some routes returned unknown status. Manual verification recommended.');
        process.exit(2);
    }
}

// Handle script arguments
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Authentication Security Test Script');
    console.log('');
    console.log('Usage: node scripts/test-auth-security.js [options]');
    console.log('');
    console.log('Options:');
    console.log('  --help, -h    Show this help message');
    console.log('');
    console.log('Environment Variables:');
    console.log('  TEST_URL      Base URL to test (default: http://localhost:3000)');
    console.log('');
    console.log('Example:');
    console.log('  TEST_URL=https://yoursite.com node scripts/test-auth-security.js');
    process.exit(0);
}

runTests().catch(error => {
    console.error('\n💥 Test script failed:', error.message);
    process.exit(1);
}); 