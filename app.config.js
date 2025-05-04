export default {
  "expo": {
    "extra": {
      "eas": {
        "projectId": "0d489ade-3539-4f30-94a5-cc44d75bac93"
      }
    },
    "ios": {
      "bundleIdentifier": "com.cklckl2008.tuenmunpathfinderapp",
      "infoPlist": {
        "ITSAppUsesNonExemptEncryption": false
      }
    },
    "android": {
      "package": "com.cklckl2008.tuenmunpathfinderapp",
      "googleServicesFile": process.env.GOOGLE_SERVICES_JSON ?? "./google-services.json"
    },
    "newArchEnabled": true,
    "userInterfaceStyle": "light",
    "plugins": [
      [
        "expo-media-library",
        {
          "photosPermission": "Allow $(PRODUCT_NAME) to access your photos.",
          "savePhotosPermission": "Allow $(PRODUCT_NAME) to save photos.",
          "isAccessMediaLocationEnabled": true
        }
      ]
    ]
  }
};
