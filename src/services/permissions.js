import { Alert, Platform, PermissionsAndroid } from 'react-native';

class PermissionService {
  constructor() {
    this.microphonePermission = null;
    this.hasRequestedPermission = false;
  }

  // Request microphone permission
  async requestMicrophonePermission() {
    try {
      console.log('🎤 Requesting microphone permission...');
      
      if (Platform.OS === 'android') {
        // For Android, use PermissionsAndroid
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: 'Microphone Permission',
            message: 'This app needs access to your microphone for voice commands.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        
        this.microphonePermission = granted === PermissionsAndroid.RESULTS.GRANTED;
        
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('✅ Microphone permission granted');
          return true;
        } else {
          console.log('❌ Microphone permission denied');
          this.showPermissionDeniedAlert();
          return false;
        }
      } else {
        // For iOS, permissions are handled by the Voice library automatically
        // We'll assume permission is granted and let Voice handle the request
        console.log('✅ iOS microphone permission will be handled by Voice library');
        this.microphonePermission = true;
        return true;
      }
    } catch (error) {
      console.error('Error requesting microphone permission:', error);
      this.showPermissionErrorAlert();
      return false;
    }
  }

  // Check current microphone permission status
  async checkMicrophonePermission() {
    try {
      if (Platform.OS === 'android') {
        const hasPermission = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
        );
        this.microphonePermission = hasPermission;
        return hasPermission;
      } else {
        // For iOS, assume permission is available (Voice library will handle it)
        this.microphonePermission = true;
        return true;
      }
    } catch (error) {
      console.error('Error checking microphone permission:', error);
      return false;
    }
  }

  // Show alert when permission is denied
  showPermissionDeniedAlert() {
    Alert.alert(
      'Microphone Permission Required',
      'Voice commands require microphone access. Please enable microphone permission in your device settings to use voice features.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open Settings', 
          onPress: () => {
            // Note: Opening settings programmatically requires additional setup
            console.log('User should manually open settings');
          }
        }
      ]
    );
  }

  // Show alert when permission request fails
  showPermissionErrorAlert() {
    Alert.alert(
      'Permission Error',
      'There was an error requesting microphone permission. Voice features may not work properly.',
      [{ text: 'OK' }]
    );
  }

  // Request permission with user-friendly explanation
  async requestPermissionWithExplanation() {
    if (this.hasRequestedPermission) {
      // If we've already requested, just check status
      return await this.checkMicrophonePermission();
    }

    return new Promise((resolve) => {
      Alert.alert(
        'Voice Assistant Setup',
        'This app uses voice commands to help you navigate. We need access to your microphone to listen for voice commands. Would you like to enable voice features?',
        [
          { 
            text: 'Not Now', 
            style: 'cancel',
            onPress: () => {
              this.hasRequestedPermission = true;
              resolve(false);
            }
          },
          { 
            text: 'Enable Voice', 
            onPress: async () => {
              this.hasRequestedPermission = true;
              const granted = await this.requestMicrophonePermission();
              resolve(granted);
            }
          }
        ]
      );
    });
  }

  // Get permission status
  getPermissionStatus() {
    return this.microphonePermission;
  }

  // Reset permission request flag (for testing)
  resetPermissionRequest() {
    this.hasRequestedPermission = false;
  }
}

export default new PermissionService();
