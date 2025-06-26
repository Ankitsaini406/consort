#!/usr/bin/env node

/**
 * 🧹 Authentication System Cleanup Script
 * Removes unused complex authentication files for production simplicity
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 Starting Authentication System Cleanup...\n');

// Files and directories to remove (unused complex auth system)
const filesToRemove = [
    'src/utils/sessionSecurity.ts',
    'src/utils/serverSessionManager.ts', 
    'src/utils/clientSessionManager.ts',
    'src/utils/singleSessionManager.ts',
    'src/utils/firebaseAuthClient.ts',
    'src/utils/militaryGradeInputSecurity.ts',
    'src/utils/accountSecurity.ts',
    'src/utils/auditLogger.ts',
    'src/utils/advancedRateLimit.ts',
    'src/utils/csrfProtection.ts',
    'src/utils/Jwt.tsx',
    'src/utils/envValidation.ts',
    'src/utils/passwordSecurity.ts',
    'src/utils/timingSecurityFix.ts',
    'src/app/api/auth/login/',
    'src/app/api/auth/session-check/',
    'src/app/api/auth/session-terminate/',
    'src/app/api/auth/clear-lockouts/',
    'src/app/api/auth/csrf-token/',
    'src/app/api/auth/verify-otp/',
    'scripts/check-env.js',
    'auth-diagnostic.js',
    'create-test-user.js'
];

// Files to keep (current working system)
const filesToKeep = [
    'src/hooks/useAuth.ts',
    'src/context/AuthContext.tsx', 
    'src/components/auth/AuthGuard.tsx',
    'src/firebase/firebaseconfig.tsx',
    'src/firebase/firebaseAuth.tsx',
    'src/app/api/auth/logout/route.ts',
    'src/app/auth/page.tsx'
];

let removedCount = 0;
let errorCount = 0;

filesToRemove.forEach(filePath => {
    try {
        const fullPath = path.join(process.cwd(), filePath);
        
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                fs.rmSync(fullPath, { recursive: true, force: true });
                console.log(`🗂️  Removed directory: ${filePath}`);
            } else {
                fs.unlinkSync(fullPath);
                console.log(`📄 Removed file: ${filePath}`);
            }
            removedCount++;
        } else {
            console.log(`⚠️  File not found (already removed): ${filePath}`);
        }
    } catch (error) {
        console.error(`❌ Error removing ${filePath}:`, error.message);
        errorCount++;
    }
});

console.log(`\n📊 Cleanup Summary:`);
console.log(`   ✅ Files removed: ${removedCount}`);
console.log(`   ❌ Errors: ${errorCount}`);

console.log(`\n🎯 Simplified Authentication System:`);
filesToKeep.forEach(file => {
    const exists = fs.existsSync(path.join(process.cwd(), file));
    console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

console.log(`\n🚀 Next Steps:`);
console.log(`   1. Set up Firebase environment variables`);
console.log(`   2. Test authentication flow`);
console.log(`   3. Deploy to production`);
console.log(`\n✨ Authentication system simplified for production!`); 