#!/bin/bash

# 🔐 Firebase App Hosting Secret Setup Script
# This script helps you create all required secrets in Google Cloud Secret Manager

set -e

PROJECT_ID="consortdigital-327d9"
REGION="europe-west4"

echo "🔐 Setting up Firebase App Hosting secrets for project: $PROJECT_ID"
echo "============================================================"

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "❌ Google Cloud CLI is not installed. Please install it first:"
    echo "   https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ You are not authenticated with Google Cloud. Please run:"
    echo "   gcloud auth login"
    exit 1
fi

# Set the project
echo "🔧 Setting Google Cloud project to: $PROJECT_ID"
gcloud config set project $PROJECT_ID

echo ""
echo "📝 You need to provide the following secret values:"
echo "   (You can find these in your Firebase project settings)"
echo ""

# Function to create a secret
create_secret() {
    local secret_name=$1
    local description=$2
    local example=$3
    
    echo "Creating secret: $secret_name"
    echo "Description: $description"
    echo "Example: $example"
    echo -n "Enter value: "
    read -s secret_value
    echo ""
    
    if [ -z "$secret_value" ]; then
        echo "❌ Value cannot be empty. Skipping $secret_name"
        return 1
    fi
    
    # Create the secret
    echo "$secret_value" | gcloud secrets create $secret_name \
        --data-file=- \
        --replication-policy="automatic" \
        --labels="app=consort,environment=production" \
        2>/dev/null || {
        echo "Secret $secret_name already exists. Updating..."
        echo "$secret_value" | gcloud secrets versions add $secret_name --data-file=-
    }
    
    echo "✅ Secret $secret_name created/updated successfully"
    echo ""
}

# Create all required secrets
echo "🔐 Creating authentication secrets..."
create_secret "NEXT_JWT_KEY" "JWT signing key for authentication" "your-ultra-secure-64-character-random-string-here"
create_secret "CSRF_SECRET" "CSRF protection secret" "your-ultra-secure-32-character-random-string-here"

echo "🔥 Creating Firebase configuration secrets..."
echo "   (Get these from Firebase Console > Project Settings > General > Your apps)"

create_secret "NEXT_PUBLIC_FIREBASE_API_KEY" "Firebase API Key" "AIzaSyB..."
create_secret "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" "Firebase Auth Domain" "your-project.firebaseapp.com"
create_secret "NEXT_PUBLIC_FIREBASE_PROJECT_ID" "Firebase Project ID" "your-project-id"
create_secret "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" "Firebase Storage Bucket" "your-project.appspot.com"
create_secret "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" "Firebase Messaging Sender ID" "123456789"
create_secret "NEXT_PUBLIC_FIREBASE_APP_ID" "Firebase App ID" "1:123456789:web:abc123"
create_secret "NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" "Firebase Analytics Measurement ID" "G-ABC123DEF4"

echo "🎉 All secrets created successfully!"
echo ""
echo "📋 Summary of created secrets:"
gcloud secrets list --filter="labels.app=consort" --format="table(name,createTime)"

echo ""
echo "🚀 Next steps:"
echo "1. Deploy your app: firebase deploy --only hosting"
echo "2. Test the deployment"
echo "3. Update your Firebase security rules if needed"
echo ""
echo "🔍 To verify secrets are accessible:"
echo "   gcloud secrets versions access latest --secret=\"NEXT_JWT_KEY\""
echo ""
echo "⚠️  Security reminders:"
echo "   - Never commit these secret values to your repository"
echo "   - Rotate secrets regularly (every 90 days recommended)"
echo "   - Monitor secret access in Cloud Logging"
echo ""
echo "✅ Setup complete! Your app is ready for secure deployment." 