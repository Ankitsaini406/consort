# 🔐 CREATE FIREBASE ADMIN SDK SECRETS
# Simple script to create Firebase Admin SDK secrets in Google Cloud Secret Manager

Write-Host "🔐 Firebase Admin SDK Secrets Creator" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Prompt for Firebase Client Email
Write-Host "📧 Enter your Firebase Client Email:" -ForegroundColor Yellow
Write-Host "   (Example: firebase-adminsdk-xxxxx@consortdigital-327d9.iam.gserviceaccount.com)" -ForegroundColor Gray
$firebaseClientEmail = Read-Host "FIREBASE_CLIENT_EMAIL"

if (-not $firebaseClientEmail) {
    Write-Host "❌ Firebase Client Email is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔑 Enter your Firebase Private Key:" -ForegroundColor Yellow
Write-Host "   (Paste the entire private key including -----BEGIN PRIVATE KEY----- and -----END PRIVATE KEY-----)" -ForegroundColor Gray
Write-Host "   (Press Enter twice when done)" -ForegroundColor Gray

$privateKeyLines = @()
do {
    $line = Read-Host
    if ($line) {
        $privateKeyLines += $line
    }
} while ($line)

$firebasePrivateKey = $privateKeyLines -join "`n"

if (-not $firebasePrivateKey) {
    Write-Host "❌ Firebase Private Key is required!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔧 Creating temporary files with UTF-8 encoding (no BOM)..." -ForegroundColor Yellow

# Create UTF-8 encoding without BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

try {
    # Create temporary files
    [System.IO.File]::WriteAllText("temp_firebase_client_email.txt", $firebaseClientEmail, $utf8NoBom)
    [System.IO.File]::WriteAllText("temp_firebase_private_key.txt", $firebasePrivateKey, $utf8NoBom)
    
    Write-Host "✅ Temporary files created successfully" -ForegroundColor Green
    
    # Check gcloud authentication
    Write-Host ""
    Write-Host "🔍 Checking Google Cloud authentication..." -ForegroundColor Yellow
    
    $gcloudAccount = gcloud config get-value account 2>$null
    if (-not $gcloudAccount) {
        Write-Host "❌ Not authenticated with Google Cloud. Please run:" -ForegroundColor Red
        Write-Host "   gcloud auth login" -ForegroundColor Gray
        exit 1
    }
    
    Write-Host "✅ Authenticated as: $gcloudAccount" -ForegroundColor Green
    
    # Set project
    Write-Host ""
    Write-Host "🔧 Setting project to consortdigital-327d9..." -ForegroundColor Yellow
    gcloud config set project consortdigital-327d9
    
    # Create FIREBASE_CLIENT_EMAIL secret
    Write-Host ""
    Write-Host "📧 Creating FIREBASE_CLIENT_EMAIL secret..." -ForegroundColor Yellow
    
    $result = gcloud secrets create FIREBASE_CLIENT_EMAIL --data-file="temp_firebase_client_email.txt" 2>&1
    if ($LASTEXITCODE -ne 0) {
        if ($result -match "already exists") {
            Write-Host "⚠️  Secret already exists, updating with new version..." -ForegroundColor Yellow
            gcloud secrets versions add FIREBASE_CLIENT_EMAIL --data-file="temp_firebase_client_email.txt"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ FIREBASE_CLIENT_EMAIL updated successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to update FIREBASE_CLIENT_EMAIL" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Failed to create FIREBASE_CLIENT_EMAIL" -ForegroundColor Red
            Write-Host "Error: $result" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ FIREBASE_CLIENT_EMAIL created successfully" -ForegroundColor Green
    }
    
    # Create FIREBASE_PRIVATE_KEY secret
    Write-Host ""
    Write-Host "🔑 Creating FIREBASE_PRIVATE_KEY secret..." -ForegroundColor Yellow
    
    $result = gcloud secrets create FIREBASE_PRIVATE_KEY --data-file="temp_firebase_private_key.txt" 2>&1
    if ($LASTEXITCODE -ne 0) {
        if ($result -match "already exists") {
            Write-Host "⚠️  Secret already exists, updating with new version..." -ForegroundColor Yellow
            gcloud secrets versions add FIREBASE_PRIVATE_KEY --data-file="temp_firebase_private_key.txt"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ FIREBASE_PRIVATE_KEY updated successfully" -ForegroundColor Green
            } else {
                Write-Host "❌ Failed to update FIREBASE_PRIVATE_KEY" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Failed to create FIREBASE_PRIVATE_KEY" -ForegroundColor Red
            Write-Host "Error: $result" -ForegroundColor Red
        }
    } else {
        Write-Host "✅ FIREBASE_PRIVATE_KEY created successfully" -ForegroundColor Green
    }
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! Firebase Admin SDK secrets created/updated!" -ForegroundColor Green
    Write-Host "======================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Secrets created with UTF-8 encoding (no BOM)" -ForegroundColor Green
    Write-Host "✅ FIREBASE_CLIENT_EMAIL: Available in Secret Manager" -ForegroundColor Green
    Write-Host "✅ FIREBASE_PRIVATE_KEY: Available in Secret Manager" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔍 Verify in Google Cloud Console:" -ForegroundColor Cyan
    Write-Host "   https://console.cloud.google.com/security/secret-manager" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🚀 Next steps:" -ForegroundColor Cyan
    Write-Host "1. Run: firebase deploy --only apphosting" -ForegroundColor Gray
    Write-Host "2. Test your deployed application" -ForegroundColor Gray
    Write-Host "3. Verify admin authentication works" -ForegroundColor Gray
    
} catch {
    Write-Host "❌ Error occurred: $($_.Exception.Message)" -ForegroundColor Red
} finally {
    # Clean up temporary files
    Write-Host ""
    Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow
    Remove-Item "temp_firebase_client_email.txt" -ErrorAction SilentlyContinue
    Remove-Item "temp_firebase_private_key.txt" -ErrorAction SilentlyContinue
    Write-Host "✅ Cleanup complete" -ForegroundColor Green
} 