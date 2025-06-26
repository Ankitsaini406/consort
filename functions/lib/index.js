"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFile = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("firebase-admin/app");
const storage_1 = require("firebase-admin/storage");
const auth_1 = require("firebase-admin/auth");
const cors_1 = __importDefault(require("cors"));
// Initialize Firebase Admin
(0, app_1.initializeApp)();
const corsHandler = (0, cors_1.default)({
    origin: [
        "https://consort--consortdigital-327d9.europe-west4.hosted.app",
        "https://consortdigital-327d9.web.app",
        "http://localhost:3000",
        "https://localhost:3000"
    ],
    credentials: true,
});
exports.uploadFile = (0, https_1.onRequest)({
    cors: true,
    timeoutSeconds: 60,
    memory: "256MiB"
}, async (request, response) => {
    return new Promise((resolve) => {
        corsHandler(request, response, async () => {
            var _a;
            try {
                // Check authorization
                const authHeader = request.headers.authorization;
                if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                    response.status(401).json({ error: 'Unauthorized' });
                    return resolve(undefined);
                }
                const token = authHeader.split('Bearer ')[1];
                const decodedToken = await (0, auth_1.getAuth)().verifyIdToken(token);
                if (!decodedToken.uid) {
                    response.status(401).json({ error: 'Invalid token' });
                    return resolve(undefined);
                }
                // Enhanced admin role verification
                // Check both custom claims and Firestore for admin role
                const userRecord = await (0, auth_1.getAuth)().getUser(decodedToken.uid);
                // First check custom claims (faster)
                let isAdmin = ((_a = userRecord.customClaims) === null || _a === void 0 ? void 0 : _a.admin) === true;
                // If no custom claims, check Firestore (fallback)
                if (!isAdmin) {
                    try {
                        const { getFirestore } = await Promise.resolve().then(() => __importStar(require('firebase-admin/firestore')));
                        const db = getFirestore();
                        const userDoc = await db.collection('users').doc(decodedToken.uid).get();
                        if (userDoc.exists) {
                            const userData = userDoc.data();
                            isAdmin = (userData === null || userData === void 0 ? void 0 : userData.role) === 'Admin';
                        }
                    }
                    catch (firestoreError) {
                        console.error('Firestore admin check failed:', firestoreError);
                    }
                }
                if (!isAdmin) {
                    console.log(`[SECURITY] Upload denied for user ${decodedToken.uid} - not admin`);
                    response.status(403).json({ error: 'Admin privileges required' });
                    return resolve(undefined);
                }
                // Handle file upload
                if (request.method !== 'POST') {
                    response.status(405).json({ error: 'Method not allowed' });
                    return resolve(undefined);
                }
                // Extract file data and path from request
                const { fileData, path, fileName } = request.body;
                if (!fileData || !path || !fileName) {
                    response.status(400).json({ error: 'File data, path, and fileName are required' });
                    return resolve(undefined);
                }
                // Security: Validate and sanitize inputs
                const allowedPaths = [
                    'tags/global',
                    'tags/clients',
                    'tags/brands',
                    'tags/icons',
                    'solutions',
                    'products',
                    'industry',
                    'posts',
                    'resources'
                ];
                // Check if path starts with an allowed path
                const isValidPath = allowedPaths.some(allowedPath => path.startsWith(allowedPath) && !path.includes('../') && !path.includes('..'));
                if (!isValidPath) {
                    response.status(403).json({ error: 'Invalid upload path' });
                    return resolve(undefined);
                }
                // Validate file name (no path traversal, only alphanumeric, dashes, underscores, dots)
                const fileNameRegex = /^[a-zA-Z0-9._-]+$/;
                if (!fileNameRegex.test(fileName)) {
                    response.status(400).json({ error: 'Invalid file name format' });
                    return resolve(undefined);
                }
                // Check file size (10MB limit)
                const fileSizeInBytes = Buffer.byteLength(fileData, 'base64');
                const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
                if (fileSizeInBytes > maxSizeInBytes) {
                    response.status(413).json({ error: 'File size exceeds 10MB limit' });
                    return resolve(undefined);
                }
                // Validate file type by extension
                const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.svg'];
                const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
                if (!allowedExtensions.includes(fileExtension)) {
                    response.status(400).json({ error: 'File type not allowed' });
                    return resolve(undefined);
                }
                // Upload to Firebase Storage
                const bucket = (0, storage_1.getStorage)().bucket();
                const timestamp = Date.now();
                const extension = fileName.split('.').pop() || 'jpg';
                const uniqueFileName = `${timestamp}.${extension}`;
                const fullPath = `${path}/${uniqueFileName}`;
                const file = bucket.file(fullPath);
                const buffer = Buffer.from(fileData, 'base64');
                await file.save(buffer, {
                    metadata: {
                        contentType: 'application/octet-stream',
                    },
                });
                // Make file publicly readable
                await file.makePublic();
                const downloadURL = `https://storage.googleapis.com/${bucket.name}/${fullPath}`;
                response.status(200).json({ downloadURL });
                resolve(undefined);
            }
            catch (error) {
                console.error('Upload error:', error);
                response.status(500).json({ error: 'Upload failed' });
                resolve(undefined);
            }
        });
    });
});
//# sourceMappingURL=index.js.map