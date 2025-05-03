import { Colors } from '@/app/constants/colors'
import { useColorScheme } from '@/app/hooks/useColorScheme'
import { useSignIn } from '@clerk/clerk-expo'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React, { useState } from 'react'
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn()
  const router = useRouter()
  const params = useLocalSearchParams<{ redirect_url?: string }>()
  const colorScheme = useColorScheme() ?? 'light'
  
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded || isLoading) return
    
    setIsLoading(true)
    setError('')

    // Start the sign-in process using the username and password provided
    try {
      const signInAttempt = await signIn.create({
        identifier: username,
        password,
      })

      // If sign-in process is complete, set the created session as active
      // and redirect the user to the original page or home if no redirect_url
      if (signInAttempt.status === 'complete') {
        await setActive({ session: signInAttempt.createdSessionId })
        if (params.redirect_url) {
          router.replace(params.redirect_url)
        } else {
          router.back()
        }
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        setError('登入未完成，請再試一次')
        console.error(JSON.stringify(signInAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      setError('帳號或密碼錯誤')
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <Image
              source={{ uri: 'https://tuenmunpathfinder.com/photo/2024/2024-09-promotion/2024-09-promotion-87.jpeg' }}
              style={styles.logo}
              resizeMode="cover"
            />
            <View style={styles.overlay}>
              <Text style={styles.title}>屯門前鋒會 幼鋒會 登入系統</Text>
            </View>
          </View>
          
          <View style={[styles.formContainer, { backgroundColor: 'rgba(200, 220, 255, 0.2)' }]}>           
            {error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: Colors[colorScheme].text }]}>帳號</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: Colors[colorScheme].text,
                    borderColor: Colors[colorScheme].icon,
                    backgroundColor: Colors[colorScheme].background 
                  }
                ]}
                placeholder="請輸入帳號"
                placeholderTextColor={Colors[colorScheme].icon}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: Colors[colorScheme].text }]}>密碼</Text>
              <TextInput
                style={[
                  styles.input, 
                  { 
                    color: Colors[colorScheme].text,
                    borderColor: Colors[colorScheme].icon,
                    backgroundColor: Colors[colorScheme].background 
                  }
                ]}
                placeholder="請輸入密碼"
                placeholderTextColor={Colors[colorScheme].icon}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            
            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors[colorScheme].primary }]}
              onPress={onSignInPress}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text style={styles.buttonText}>登入</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  logoContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
  },
  logo: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  formContainer: {
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  formHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    gap: 5,
  },
  linkText: {
    fontWeight: '600',
  }
})