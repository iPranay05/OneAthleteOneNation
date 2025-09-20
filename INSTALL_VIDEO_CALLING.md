# 🎥 **Video Calling Setup Guide**

## 📦 **Required Dependencies**

Run these commands in your project directory:

```bash
# Core video calling dependencies
npm install react-native-webrtc
npm install @react-native-async-storage/async-storage
npm install react-native-permissions

# For iOS (if targeting iOS)
cd ios && pod install && cd ..
```

## 🔧 **Android Configuration**

### **1. Update android/app/src/main/AndroidManifest.xml:**
```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
  
  <!-- Add these permissions -->
  <uses-permission android:name="android.permission.CAMERA" />
  <uses-permission android:name="android.permission.RECORD_AUDIO" />
  <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
  <uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
  <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
  <uses-permission android:name="android.permission.INTERNET" />
  
  <application>
    <!-- Your existing app configuration -->
  </application>
</manifest>
```

### **2. Update android/app/build.gradle:**
```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        minSdkVersion 24  // Minimum for WebRTC
        targetSdkVersion 34
    }
}
```

## 🍎 **iOS Configuration (if needed)**

### **1. Update ios/YourApp/Info.plist:**
```xml
<dict>
    <!-- Add these permissions -->
    <key>NSCameraUsageDescription</key>
    <string>This app needs camera access for video calls</string>
    <key>NSMicrophoneUsageDescription</key>
    <string>This app needs microphone access for video calls</string>
</dict>
```

## 🔄 **After Installation**

1. **Restart Metro bundler:**
   ```bash
   npx react-native start --reset-cache
   ```

2. **Rebuild the app:**
   ```bash
   npx react-native run-android
   # or
   npx react-native run-ios
   ```

## ✅ **Verification**

After installation, you should be able to import:
```javascript
import {
  RTCPeerConnection,
  RTCIceCandidate,
  RTCSessionDescription,
  RTCView,
  mediaDevices
} from 'react-native-webrtc';
```

## 🚨 **Important Notes**

- **Android Emulator**: Video calling won't work on Android emulator, use real device
- **iOS Simulator**: Video calling won't work on iOS simulator, use real device  
- **Permissions**: App will request camera/microphone permissions on first call
- **Network**: Ensure devices are on same network or use STUN/TURN servers for production

## 🎯 **Next Steps**

After successful installation:
1. ✅ Dependencies installed
2. ✅ Permissions configured  
3. ✅ App rebuilt
4. 🔄 Ready for video calling implementation

**Once you've completed the installation, I'll implement the video calling features!** 🎥📞
