# Create Google Cloud Secrets Manager secrets
# Client-side Firebase configuration (NEXT_PUBLIC_ prefix)

Write-Host "Creating Firebase Client-Side Configuration Secrets..."

# Create temp files with exact values (no newlines)
[System.IO.File]::WriteAllText("temp_firebase_api_key.txt", "AIzaSyB9w0Ryf0kZRGmzSnj8t2Oo-1o3OPgnCaI", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_auth_domain.txt", "consortdigital-327d9.firebaseapp.com", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_project_id.txt", "consortdigital-327d9", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_storage_bucket.txt", "consortdigital-327d9.firebasestorage.app", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_messaging_sender_id.txt", "545144758087", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_app_id.txt", "1:545144758087:web:04e37c0c8eaa05ed1e3662", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_measurement_id.txt", "G-BW2XBY41V9", [System.Text.Encoding]::UTF8)

# Server-side secrets (matching apphosting.yaml exactly)
[System.IO.File]::WriteAllText("temp_next_jwt_key.txt", "super-secure-jwt-secret-change-in-production-32chars-minimum", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_csrf_secret.txt", "csrf-protection-secret-32chars-minimum-for-security", [System.Text.Encoding]::UTF8)

# Firebase Admin SDK secrets (CRITICAL: Replace with your actual service account values)
[System.IO.File]::WriteAllText("temp_firebase_client_email.txt", "firebase-adminsdk-xxxxx@consortdigital-327d9.iam.gserviceaccount.com", [System.Text.Encoding]::UTF8)
[System.IO.File]::WriteAllText("temp_firebase_private_key.txt", "-----BEGIN PRIVATE KEY-----\nYOUR_ACTUAL_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----", [System.Text.Encoding]::UTF8)

Write-Host "Creating client-side Firebase secrets..."

# Client-side Firebase secrets
gcloud secrets create NEXT_PUBLIC_FIREBASE_API_KEY --data-file="temp_firebase_api_key.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --data-file="temp_firebase_auth_domain.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_PROJECT_ID --data-file="temp_firebase_project_id.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --data-file="temp_firebase_storage_bucket.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --data-file="temp_firebase_messaging_sender_id.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_APP_ID --data-file="temp_firebase_app_id.txt"
gcloud secrets create NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --data-file="temp_firebase_measurement_id.txt"

Write-Host "Creating server-side secrets..."

# Server-side secrets (matching apphosting.yaml exactly)
gcloud secrets create NEXT_JWT_KEY --data-file="temp_next_jwt_key.txt"
gcloud secrets create CSRF_SECRET --data-file="temp_csrf_secret.txt"

Write-Host "Creating Firebase Admin SDK secrets..."

# Firebase Admin SDK secrets (CRITICAL for server-side authentication)
gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file="temp_firebase_client_email.txt"
gcloud secrets create FIREBASE_PRIVATE_KEY --data-file="temp_firebase_private_key.txt"

Write-Host "Cleaning up temporary files..."

# Clean up temp files
Remove-Item temp_firebase_*.txt
Remove-Item temp_next_jwt_key.txt
Remove-Item temp_csrf_secret.txt -ErrorAction SilentlyContinue

Write-Host "Secrets created successfully!"
Write-Host ""
Write-Host "CLIENT-SIDE SECRETS (NEXT_PUBLIC_ prefix):"
Write-Host "- NEXT_PUBLIC_FIREBASE_API_KEY"
Write-Host "- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"
Write-Host "- NEXT_PUBLIC_FIREBASE_PROJECT_ID"
Write-Host "- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"
Write-Host "- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID"
Write-Host "- NEXT_PUBLIC_FIREBASE_APP_ID"
Write-Host "- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID"
Write-Host ""
Write-Host "SERVER-SIDE SECRETS (matching apphosting.yaml):"
Write-Host "- NEXT_JWT_KEY"
Write-Host "- CSRF_SECRET"
Write-Host "- FIREBASE_CLIENT_EMAIL"
Write-Host "- FIREBASE_PRIVATE_KEY"
Write-Host ""
Write-Host "🚨 CRITICAL: UPDATE FIREBASE ADMIN SDK SECRETS:"
Write-Host "1. Go to Firebase Console > Project Settings > Service Accounts"
Write-Host "2. Click 'Generate new private key' and download the JSON file"
Write-Host "3. Update FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY secrets with actual values"
Write-Host "4. The private key must be in proper format with \n characters"
Write-Host ""
Write-Host "IMPORTANT: Run this script to update your Firebase secrets:"
Write-Host "1. Open Google Cloud Console"
Write-Host "2. Navigate to Secret Manager"
Write-Host "3. Verify all secrets are created with UTF-8 encoding"
Write-Host "4. Test your Firebase App Hosting deployment" 