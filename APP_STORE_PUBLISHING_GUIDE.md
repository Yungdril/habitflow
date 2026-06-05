# HabitFlow - App Store Publishing Guide

## Publishing to Apple App Store (iOS)

### Prerequisites

1. **Apple Developer Account** - $99/year
   - Go to [developer.apple.com](https://developer.apple.com)
   - Sign in with Apple ID
   - Enroll in Apple Developer Program
   - Accept agreements and complete setup

2. **Required Information**
   - App name: "HabitFlow"
   - Bundle ID: `com.habitflow.app` (unique identifier)
   - Version: `1.0.0`
   - Build number: `1`

3. **App Icons**
   - 1024x1024 PNG (required)
   - 512x512, 256x256, 128x128, 64x64 (recommended)
   - No transparency, solid background
   - Place in `client/public/app-icons/`

4. **Screenshots**
   - Minimum 2, maximum 5 per device type
   - Sizes:
     - iPhone 6.7": 1284x2778 px
     - iPhone 5.5": 1242x2208 px
     - iPad Pro 12.9": 2048x2732 px
   - PNG or JPG format
   - Show app features and UI

5. **Privacy Policy**
   - Required for App Store approval
   - Create at: `https://habitflow3d-gvifhfbv.manus.space/privacy`
   - Must address:
     - Data collection (user habits, streaks)
     - Data usage (analytics, notifications)
     - Third-party services (Google Analytics, Sentry)
     - User rights and data deletion

### Step-by-Step Publishing Process

#### Phase 1: Prepare Your App

1. **Update App Metadata**
   ```json
   // client/public/manifest.json
   {
     "name": "HabitFlow - Build Better Habits",
     "short_name": "HabitFlow",
     "description": "Track daily habits with style. Watch your streaks grow, celebrate your progress, and transform your life one day at a time.",
     "start_url": "/",
     "display": "standalone"
   }
   ```

2. **Create Privacy Policy Page**
   - Add route: `/privacy`
   - Include comprehensive privacy disclosure
   - Mention data handling practices

3. **Prepare App Store Assets**
   ```
   client/public/
   ├── app-icons/
   │   ├── icon-1024x1024.png
   │   ├── icon-512x512.png
   │   └── icon-256x256.png
   ├── screenshots/
   │   ├── iphone-1.png (1284x2778)
   │   ├── iphone-2.png
   │   ├── ipad-1.png (2048x2732)
   │   └── ipad-2.png
   └── manifest.json
   ```

#### Phase 2: Convert PWA to Native App (Using Capacitor)

Since HabitFlow is a PWA, you have two options:

**Option A: Web Clip (Easiest)**
- Users install directly from Safari
- No App Store approval needed
- Limited to web capabilities

**Option B: Native Wrapper (Recommended)**
- Use Capacitor to wrap PWA as native app
- Full App Store distribution
- Access to native features

**Install Capacitor:**
```bash
cd /home/ubuntu/habitflow
npm install @capacitor/core @capacitor/cli
npx cap init
```

**Configuration:**
```bash
npx cap init HabitFlow com.habitflow.app
npx cap add ios
npx cap add android
```

#### Phase 3: Build for iOS

1. **Build Web Assets**
   ```bash
   pnpm build
   ```

2. **Copy to Capacitor**
   ```bash
   npx cap copy ios
   ```

3. **Open in Xcode**
   ```bash
   npx cap open ios
   ```

4. **In Xcode:**
   - Select "HabitFlow" project
   - Go to Signing & Capabilities
   - Add Apple ID
   - Select team
   - Update Bundle ID to `com.habitflow.app`

5. **Configure App Icons**
   - Drag 1024x1024 icon to Assets
   - Xcode auto-generates other sizes

6. **Build Archive**
   - Product → Archive
   - Wait for build to complete
   - Organizer window opens

#### Phase 4: Submit to App Store

1. **Create App Store Connect Record**
   - Go to [appstoreconnect.apple.com](https://appstoreconnect.apple.com)
   - Click "My Apps"
   - Click "+" → "New App"
   - Select iOS
   - Fill in details:
     - App Name: "HabitFlow"
     - Bundle ID: `com.habitflow.app`
     - SKU: `habitflow-001`
     - User Access: Select access level

2. **Fill App Information**
   - **General Information**
     - Category: Productivity
     - Content Rating: None (no adult content)
     - Age Rating: 4+
   
   - **Pricing and Availability**
     - Price: Free (or set price)
     - Availability: All territories
   
   - **App Privacy**
     - Privacy Policy URL: `https://habitflow3d-gvifhfbv.manus.space/privacy`
     - Data collection: Minimal
     - Tracking: Google Analytics, Sentry (optional)

3. **Add Screenshots**
   - Upload 2-5 screenshots per device type
   - Add captions describing features
   - Recommended order:
     1. Dashboard with habits
     2. Habit completion/streaks
     3. Analytics view
     4. Calendar/heatmap view

4. **Add App Preview Video (Optional)**
   - 15-30 second video
   - Shows app in action
   - Increases conversion rate

5. **Fill Description**
   ```
   Title: HabitFlow - Build Better Habits

   Description:
   Transform your life one habit at a time with HabitFlow, the premium habit tracking app designed for success.

   KEY FEATURES:
   • Track unlimited daily habits
   • Visualize streaks and progress
   • Beautiful 3D glassmorphism design
   • Real-time analytics and insights
   • Offline support - track anywhere
   • Push notifications for reminders
   • Responsive design for all devices

   WHAT USERS LOVE:
   ✓ Instant feedback with optimistic updates
   ✓ Comprehensive analytics with charts
   ✓ Calendar view for historical data
   ✓ Notification system for pending habits
   ✓ Works offline, syncs when online

   Start building better habits today!
   ```

6. **Keywords**
   - habits, productivity, tracking, streaks, goals, wellness, lifestyle, self-improvement, daily habits, habit tracker

7. **Support URL**
   - `https://habitflow3d-gvifhfbv.manus.space/faq`

8. **Marketing URL**
   - `https://habitflow3d-gvifhfbv.manus.space`

#### Phase 5: Review and Submit

1. **Version Information**
   - Version Number: `1.0.0`
   - Build Number: `1`
   - Release Notes: "Initial release of HabitFlow"

2. **Build Selection**
   - Click "Select a build"
   - Choose your archived build
   - Wait for processing (5-10 minutes)

3. **App Review Information**
   - Sign in method: Google OAuth
   - Test account: (optional, for reviewers)
   - Notes: "App uses Manus OAuth for authentication"

4. **Submit for Review**
   - Review all information
   - Click "Submit for Review"
   - Apple reviews within 24-48 hours

### After Approval

1. **Release Strategy**
   - Automatic: Released immediately
   - Manual: Release when ready
   - Phased: Gradual rollout to users

2. **Monitor Performance**
   - App Store Connect dashboard
   - Track downloads, ratings, crashes
   - Respond to user reviews

3. **Update Process**
   - Increment version number
   - Build new archive
   - Submit new build
   - Repeat review process

### Common Rejection Reasons & Fixes

| Issue | Solution |
|-------|----------|
| Missing privacy policy | Add privacy policy URL in App Store Connect |
| Unclear app purpose | Improve app description and screenshots |
| Authentication issues | Test OAuth flow thoroughly |
| Crashes on launch | Fix bugs, test on real device |
| Misleading screenshots | Ensure screenshots show actual app UI |
| Performance issues | Optimize load times, reduce memory usage |

### Troubleshooting

**Build Fails in Xcode**
- Clean build folder: Cmd + Shift + K
- Update Xcode to latest version
- Check iOS deployment target (minimum iOS 13)

**App Crashes on Device**
- Check console logs in Xcode
- Test on physical device, not simulator
- Verify all permissions are granted

**Submission Rejected**
- Read rejection reason carefully
- Fix issues mentioned
- Resubmit with updated build

### Timeline

- **Preparation**: 2-3 hours
- **Building**: 30 minutes
- **Submission**: 5 minutes
- **Review**: 24-48 hours
- **Total**: 2-3 days

### Costs

- Apple Developer Account: $99/year
- App Distribution: Free
- Total: $99/year

---

## Publishing to Google Play Store (Android)

See [PLAY_STORE_PUBLISHING_GUIDE.md](./PLAY_STORE_PUBLISHING_GUIDE.md) for detailed Android publishing instructions.
