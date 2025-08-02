# Bunchastuff Mobile App Deployment Guide

## Overview
This guide covers deploying the Bunchastuff mobile app to Apple App Store and Google Play Store using Capacitor.

## Prerequisites

### For iOS (Apple App Store)
- macOS computer with Xcode installed
- Apple Developer Account ($99/year)
- iOS device for testing
- Valid Apple Developer certificates and provisioning profiles

### For Android (Google Play Store)
- Android Studio installed
- Google Play Console account ($25 one-time fee)
- Android device for testing
- Valid signing key for app distribution

## Current Status
✅ **Completed:**
- Capacitor initialized with app name "Bunchastuff"
- Package ID: `com.protekweb.bunchastuff`
- iOS platform added with native Xcode project
- Android platform added with native Android project
- Camera plugin installed for native photo capture
- Camera permissions configured for both platforms
- Production build ready in `dist/` folder

⏳ **Pending:**
- Backend deployment to Digital Ocean (waiting for approval)
- Update frontend environment to use production backend URL
- Final mobile app builds with production backend

## Deployment Steps

### Step 1: Backend Deployment (In Progress)
1. Deploy FastAPI backend to Digital Ocean
2. Update frontend `.env` file with production backend URL
3. Rebuild frontend with production configuration
4. Sync changes to mobile platforms

### Step 2: iOS App Store Deployment

#### Prerequisites Setup
1. **Apple Developer Account**: Ensure you have an active Apple Developer account
2. **Xcode**: Install latest version of Xcode on macOS
3. **Certificates**: Create iOS Distribution certificate in Apple Developer portal
4. **App ID**: Register app with bundle ID `com.protekweb.bunchastuff`
5. **Provisioning Profile**: Create App Store distribution provisioning profile

#### Build Process
```bash
# Navigate to frontend directory
cd frontend

# Ensure latest build
npm run build

# Sync with iOS platform
npx cap sync ios

# Open in Xcode
npx cap open ios
```

#### In Xcode
1. Select "App" scheme and "Any iOS Device" target
2. Update signing settings with your Apple Developer team
3. Set deployment target to iOS 13.0 or higher
4. Archive the app (Product → Archive)
5. Upload to App Store Connect via Organizer

#### App Store Connect
1. Create new app in App Store Connect
2. Fill in app metadata:
   - **Name**: Bunchastuff
   - **Bundle ID**: com.protekweb.bunchastuff
   - **Category**: Business/Productivity
   - **Description**: AI-powered bulk item listing platform for multi-platform selling
3. Upload screenshots (required sizes: 6.7", 6.5", 5.5")
4. Submit for review

### Step 3: Google Play Store Deployment

#### Prerequisites Setup
1. **Google Play Console**: Create developer account ($25 fee)
2. **Android Studio**: Install latest version
3. **Signing Key**: Generate upload key for app signing

#### Build Process
```bash
# Navigate to frontend directory
cd frontend

# Ensure latest build
npm run build

# Sync with Android platform
npx cap sync android

# Open in Android Studio
npx cap open android
```

#### In Android Studio
1. Select "Build" → "Generate Signed Bundle/APK"
2. Choose "Android App Bundle" (recommended)
3. Create or select existing keystore
4. Build release bundle

#### Google Play Console
1. Create new app in Play Console
2. Fill in app details:
   - **App name**: Bunchastuff
   - **Package name**: com.protekweb.bunchastuff
   - **Category**: Business
   - **Description**: AI-powered bulk item listing platform
3. Upload AAB file to Internal Testing track first
4. Complete store listing with screenshots and descriptions
5. Submit for review

## App Features for Store Listings

### Core Features
- **AI Photo Analysis**: Take photos and get instant AI-powered item analysis
- **Multi-Platform Listings**: Create listings on Shopify, Facebook Marketplace, and eBay
- **Auto Facebook Responder**: Automated responses to Facebook inquiries
- **Shipping Management**: Complete shipping workflow with label creation
- **Bulk Operations**: Designed for high-volume sellers with varying item conditions

### Screenshots Needed
- Home screen with photo upload
- AI analysis results page
- Multi-platform listing creation
- Facebook auto-responder interface
- Shipping management dashboard
- Items inventory view

## Technical Requirements

### iOS Requirements
- **Minimum iOS Version**: 13.0
- **Device Support**: iPhone, iPad
- **Permissions**: Camera, Photo Library
- **Bundle Size**: ~50MB (estimated)

### Android Requirements
- **Minimum SDK**: API 22 (Android 5.1)
- **Target SDK**: API 34 (Android 14)
- **Permissions**: Camera, Storage, Internet
- **APK Size**: ~30MB (estimated)

## Environment Configuration

### Production Backend URL
Once backend is deployed to Digital Ocean, update:

```bash
# frontend/.env
VITE_API_URL=https://your-production-backend-url.com
```

Then rebuild and sync:
```bash
npm run build
npx cap sync
```

## Testing Checklist

### Before Submission
- [ ] Test photo upload and AI analysis
- [ ] Test multi-platform listing creation
- [ ] Test Facebook auto-responder
- [ ] Test shipping label creation
- [ ] Test app on physical devices
- [ ] Verify all permissions work correctly
- [ ] Test offline behavior
- [ ] Verify app icons and splash screens
- [ ] Test app store compliance

### Performance Testing
- [ ] App launches in under 3 seconds
- [ ] Photo upload completes within 10 seconds
- [ ] UI is responsive on all screen sizes
- [ ] No memory leaks during extended use

## Troubleshooting

### Common iOS Issues
- **Code signing errors**: Verify certificates and provisioning profiles
- **Build failures**: Check Xcode version compatibility
- **Upload errors**: Ensure proper app version incrementing

### Common Android Issues
- **Gradle build failures**: Update Android Studio and Gradle
- **Signing errors**: Verify keystore and key passwords
- **Upload errors**: Check AAB format and Play Console settings

## Support and Maintenance

### App Updates
1. Make changes to React web app
2. Run `npm run build`
3. Run `npx cap sync`
4. Build and upload new versions to stores

### Monitoring
- Monitor app store reviews and ratings
- Track crash reports via platform analytics
- Monitor backend API usage and performance

## Contact Information
- **Developer**: Cam McCurdy (Cameron@protekweb.com)
- **Repository**: https://github.com/ptek618/Bunchastuff
- **Support**: Contact through GitHub issues or email

---

**Note**: This guide assumes backend deployment to Digital Ocean is completed. Update the production backend URL in the environment configuration before final mobile app builds.
