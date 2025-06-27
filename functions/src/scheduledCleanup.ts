import { onSchedule } from 'firebase-functions/v2/scheduler';
import { logger } from 'firebase-functions';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin
if (!process.env.FIREBASE_PROJECT_ID) {
    initializeApp();
}

const db = getFirestore();

// Collections for session and token management
const SESSIONS_COLLECTION = 'auth_sessions';
const REVOKED_TOKENS_COLLECTION = 'revoked_tokens';

/**
 * Scheduled Cloud Function to cleanup expired sessions and tokens
 * Runs every 10 minutes to maintain database hygiene
 */
export const cleanupExpiredAuth = onSchedule(
    {
        schedule: 'every 10 minutes',
        timeZone: 'UTC',
        memory: '256MiB',
        maxInstances: 1, // Prevent concurrent cleanup runs
        region: 'us-central1'
    },
    async (event) => {
        const startTime = Date.now();
        logger.info('🧹 Starting scheduled auth cleanup...', { timestamp: startTime });

        try {
            const now = Date.now();
            let totalCleaned = 0;

            // 1. Cleanup expired sessions
            const expiredSessions = await db.collection(SESSIONS_COLLECTION)
                .where('expiry', '<', now)
                .get();

            if (!expiredSessions.empty) {
                const sessionBatch = db.batch();
                expiredSessions.forEach((doc: any) => {
                    sessionBatch.delete(doc.ref);
                });
                
                await sessionBatch.commit();
                totalCleaned += expiredSessions.size;
                
                logger.info(`✅ Cleaned up ${expiredSessions.size} expired sessions`);
            }

            // 2. Cleanup expired token revocations
            const expiredRevocations = await db.collection(REVOKED_TOKENS_COLLECTION)
                .where('expiry', '<', now)
                .get();

            if (!expiredRevocations.empty) {
                const revocationBatch = db.batch();
                expiredRevocations.forEach((doc: any) => {
                    revocationBatch.delete(doc.ref);
                });
                
                await revocationBatch.commit();
                totalCleaned += expiredRevocations.size;
                
                logger.info(`✅ Cleaned up ${expiredRevocations.size} expired token revocations`);
            }

            // 3. Log cleanup statistics
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            logger.info('🎉 Scheduled auth cleanup completed', {
                totalItemsCleaned: totalCleaned,
                durationMs: duration,
                sessionsRemoved: expiredSessions.size,
                revocationsRemoved: expiredRevocations.size,
                timestamp: endTime
            });

            // 4. Optional: Log current active counts for monitoring
            const activeSessions = await db.collection(SESSIONS_COLLECTION)
                .where('expiry', '>', now)
                .get();
            
            const activeRevocations = await db.collection(REVOKED_TOKENS_COLLECTION)
                .where('expiry', '>', now)
                .get();

            logger.info('📊 Current auth statistics', {
                activeSessions: activeSessions.size,
                activeRevocations: activeRevocations.size
            });

        } catch (error) {
            logger.error('❌ Auth cleanup failed:', error);
            throw error; // This will trigger Cloud Functions retry mechanism
        }
    }
);

/**
 * Manual cleanup function that can be triggered via HTTP
 * Useful for admin operations or one-time cleanup
 */
export const manualAuthCleanup = onSchedule(
    {
        schedule: 'every 24 hours', // Daily comprehensive cleanup
        timeZone: 'UTC',
        memory: '512MiB',
        maxInstances: 1,
        region: 'us-central1'
    },
    async (event) => {
        logger.info('🔧 Starting manual comprehensive auth cleanup...');

        try {
            const now = Date.now();
            let totalCleaned = 0;

            // More aggressive cleanup - remove items older than 7 days
            const weekAgo = now - (7 * 24 * 60 * 60 * 1000);

            // Clean old sessions (even if not expired, remove very old ones)
            const oldSessions = await db.collection(SESSIONS_COLLECTION)
                .where('createdAt', '<', weekAgo)
                .get();

            if (!oldSessions.empty) {
                // Process in batches to avoid Firestore limits
                const batchSize = 500;
                const batches: any[][] = [];
                
                for (let i = 0; i < oldSessions.docs.length; i += batchSize) {
                    batches.push(oldSessions.docs.slice(i, i + batchSize));
                }

                for (const batch of batches) {
                    const deleteBatch = db.batch();
                    batch.forEach(doc => {
                        deleteBatch.delete(doc.ref);
                    });
                    await deleteBatch.commit();
                    totalCleaned += batch.length;
                }

                logger.info(`✅ Deep cleaned ${oldSessions.size} old sessions`);
            }

            // Clean old revocations (remove items older than 30 days)
            const monthAgo = now - (30 * 24 * 60 * 60 * 1000);
            const oldRevocations = await db.collection(REVOKED_TOKENS_COLLECTION)
                .where('revokedAt', '<', monthAgo)
                .get();

            if (!oldRevocations.empty) {
                const revocationBatch = db.batch();
                oldRevocations.forEach((doc: any) => {
                    revocationBatch.delete(doc.ref);
                });
                
                await revocationBatch.commit();
                totalCleaned += oldRevocations.size;
                
                logger.info(`✅ Deep cleaned ${oldRevocations.size} old token revocations`);
            }

            logger.info('🎉 Manual comprehensive cleanup completed', {
                totalItemsCleaned: totalCleaned
            });

        } catch (error) {
            logger.error('❌ Manual auth cleanup failed:', error);
            throw error;
        }
    }
); 