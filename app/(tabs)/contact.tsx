import { Colors, TARGET_COLORS } from '@/app/constants/colors';
import { useColorScheme } from '@/app/hooks/useColorScheme';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Stack } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Linking, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Simpler approach without complex references
export default function ContactScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Refs for form navigation
  const scrollViewRef = useRef<ScrollView>(null);
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const messageInputRef = useRef<TextInput>(null);
  
  // Fixed scroll positions for each field
  // We'll update these when the component mounts and when orientation changes
  const [formScrollPositions, setFormScrollPositions] = useState({
    form: 300,  // Estimated position of the form section
    name: 350,
    email: 430,
    phone: 510,
    message: 590
  });
  
  // Update positions - could trigger on component mount or orientation change
  useEffect(() => {
    // Update estimated positions based on typical form layout
    // These numbers could be adjusted based on testing
    const baseFormPosition = 300;
    setFormScrollPositions({
      form: baseFormPosition,
      name: baseFormPosition + 100,
      email: baseFormPosition + 180,
      phone: baseFormPosition + 300,
      message: baseFormPosition + 400
    });
  }, []);

  // Simple scroll function 
  const scrollToField = (fieldName: 'name' | 'email' | 'phone' | 'message') => {
    if (!scrollViewRef.current) return;
    
    // Get position from our state
    const position = formScrollPositions[fieldName];
    
    // Scroll with animation, with a small offset for better visibility
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: position - 80, // Subtract offset for better positioning
        animated: true
      });
    }, 100);
  };

  const handleOpenMap = () => {
    const location = '屯門山景邨景榮樓21-30號地下';
    const mapUrl = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(location)}`,
      android: `geo:0,0?q=${encodeURIComponent(location)}`,
      default: `https://maps.google.com/?q=${encodeURIComponent(location)}`
    });
    
    Linking.openURL(mapUrl);
  };

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = () => {
    Linking.openURL('mailto:info@tuenmunpathfinder.com');
  };

  const handleWhatsApp = () => {
    Linking.openURL('https://wa.me/85265721493?text=我想查詢有關幼鋒會及前鋒會的資料。');
  };

  const validateForm = () => {
    if (!name.trim()) {
      Alert.alert('錯誤', '請輸入姓名');
      return false;
    }
    if (!email.trim()) {
      Alert.alert('錯誤', '請輸入電子郵件');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('錯誤', '請輸入電話號碼');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('錯誤', '請輸入訊息內容');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      // Prepare data for API
      const formData = {
        name,
        email,
        phone,
        message
      };
      
      // Send data to API
      const response = await fetch('https://tuenmunpathfinder.com/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (response.ok) {
        // Success
        Alert.alert(
          '成功',
          '感謝您的訊息！我們會盡快回覆您。',
          [
            { 
              text: '確定', 
              onPress: () => {
                // Clear form after successful submission
                setName('');
                setEmail('');
                setPhone('');
                setMessage('');
              } 
            }
          ]
        );
      } else {
        // API error
        const errorData = await response.json();
        Alert.alert('錯誤', errorData.message || '發送訊息時出現問題，請稍後再試。');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('錯誤', '發送訊息時出現問題，請稍後再試。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Stack.Screen options={{ title: '聯絡我們', headerTitleAlign: 'center' }} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 30 : 0}
        enabled
      >
        <ScrollView 
          ref={scrollViewRef}
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true}
        >
          {/* About Us Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                name="info.circle.fill" 
                size={20} 
                color={Colors[colorScheme].primary} 
              />
              <Text style={[styles.sectionHeaderText, { color: Colors[colorScheme].text }]}>關於我們</Text>
            </View>
            
            <View style={[styles.cardContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9' }]}>
              <View style={styles.contactItem}>
                <IconSymbol name="location.fill" size={20} color={TARGET_COLORS.PATHFINDER} />
                <View style={styles.contactTextContainer}>
                  <Text style={[styles.contactLabel, { color: Colors[colorScheme].text }]}>地址</Text>
                  <Text style={[styles.contactText, { color: Colors[colorScheme].text }]}>
                    屯門山景邨景榮樓21-30號地下{'\n'}
                    山景綜合青少年服務中心
                  </Text>
                  <TouchableOpacity 
                    style={[styles.linkButton, { borderColor: TARGET_COLORS.PATHFINDER }]} 
                    onPress={handleOpenMap}
                  >
                    <Text style={{ color: TARGET_COLORS.PATHFINDER, fontWeight: '500' }}>
                      在 Google 地圖中查看
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <IconSymbol name="phone.fill" size={20} color={TARGET_COLORS.ADVENTURER} />
                <View style={styles.contactTextContainer}>
                  <Text style={[styles.contactLabel, { color: Colors[colorScheme].text }]}>電話</Text>
                  <TouchableOpacity onPress={() => handleCall('85224626122')}>
                    <Text style={[styles.contactText, { color: Colors[colorScheme].text }]}>
                      +852 2462-6122
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleCall('85265721493')}>
                    <Text style={[styles.contactText, { color: Colors[colorScheme].text }]}>
                      +852 6572-1493
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.linkButton, { borderColor: TARGET_COLORS.ADVENTURER }]} 
                    onPress={handleWhatsApp}
                  >
                    <Text style={{ color: TARGET_COLORS.ADVENTURER, fontWeight: '500' }}>
                      透過 WhatsApp 聯絡我們
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <IconSymbol name="envelope.fill" size={20} color={TARGET_COLORS.BOTH} />
                <View style={styles.contactTextContainer}>
                  <Text style={[styles.contactLabel, { color: Colors[colorScheme].text }]}>電子郵件</Text>
                  <TouchableOpacity onPress={handleEmail}>
                    <Text style={[styles.contactText, { color: Colors[colorScheme].text }]}>
                      info@tuenmunpathfinder.com
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.contactItem}>
                <IconSymbol name="clock.fill" size={20} color={Colors[colorScheme].primary} />
                <View style={styles.contactTextContainer}>
                  <Text style={[styles.contactLabel, { color: Colors[colorScheme].text }]}>聚會時間</Text>
                  <View style={[styles.meetingItem, { backgroundColor: TARGET_COLORS.PATHFINDER + '20' }]}>
                    <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.PATHFINDER }]} />
                    <Text style={[styles.meetingText, { color: Colors[colorScheme].text }]}>
                      前鋒會：逢星期六 下午2:30 - 4:30
                    </Text>
                  </View>
                  <View style={[styles.meetingItem, { backgroundColor: TARGET_COLORS.ADVENTURER + '20' }]}>
                    <View style={[styles.meetingDot, { backgroundColor: TARGET_COLORS.ADVENTURER }]} />
                    <Text style={[styles.meetingText, { color: Colors[colorScheme].text }]}>
                      幼鋒會：逢星期六 下午2:30 - 4:30
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Contact Form Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <IconSymbol 
                name="envelope.badge.fill" 
                size={20} 
                color={Colors[colorScheme].primary} 
              />
              <Text style={[styles.sectionHeaderText, { color: Colors[colorScheme].text }]}>聯絡表單</Text>
            </View>
            
            <Text style={[styles.formIntro, { color: Colors[colorScheme].text }]}>
              請填寫以下表格，我們會盡快回覆您。
            </Text>
            
            <View style={[styles.cardContainer, { backgroundColor: colorScheme === 'dark' ? '#2a2a2a' : '#f9f9f9' }]}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>姓名 *</Text>
                <TextInput
                  ref={nameInputRef}
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
                      backgroundColor: colorScheme === 'dark' ? '#222' : 'white'
                    }
                  ]}
                  placeholder="請輸入您的姓名"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={name}
                  onChangeText={setName}
                  onFocus={() => scrollToField('name')}
                  returnKeyType="next"
                  onSubmitEditing={() => emailInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>電子郵件 *</Text>
                <TextInput
                  ref={emailInputRef}
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
                      backgroundColor: colorScheme === 'dark' ? '#222' : 'white'
                    }
                  ]}
                  placeholder="請輸入您的電子郵件"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onFocus={() => scrollToField('email')}
                  returnKeyType="next"
                  onSubmitEditing={() => phoneInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>電話號碼 *</Text>
                <TextInput
                  ref={phoneInputRef}
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
                      backgroundColor: colorScheme === 'dark' ? '#222' : 'white'
                    }
                  ]}
                  placeholder="請輸入您的電話號碼"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  onFocus={() => scrollToField('phone')}
                  returnKeyType="next"
                  onSubmitEditing={() => messageInputRef.current?.focus()}
                  blurOnSubmit={false}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: Colors[colorScheme].text }]}>訊息內容 *</Text>
                <TextInput
                  ref={messageInputRef}
                  style={[
                    styles.messageInput,
                    { 
                      color: Colors[colorScheme].text,
                      borderColor: colorScheme === 'dark' ? '#555' : '#ddd',
                      backgroundColor: colorScheme === 'dark' ? '#222' : 'white'
                    }
                  ]}
                  placeholder="請輸入您的訊息內容"
                  placeholderTextColor={Colors[colorScheme].tabIconDefault}
                  value={message}
                  onChangeText={setMessage}
                  multiline
                  numberOfLines={5}
                  textAlignVertical="top"
                  onFocus={() => scrollToField('message')}
                />
              </View>

              <TouchableOpacity 
                style={[
                  styles.submitButton, 
                  { backgroundColor: Colors[colorScheme].primary },
                  submitting && { opacity: 0.7 }
                ]}
                onPress={() => {
                  Keyboard.dismiss();
                  handleSubmit();
                }}
                disabled={submitting}
              >
                <Text style={styles.submitButtonText}>
                  {submitting ? '發送中...' : '發送訊息'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Extra space for keyboard */}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 60,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardContainer: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contactItem: {
    flexDirection: 'row',
    marginVertical: 8,
    alignItems: 'flex-start',
  },
  contactTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  contactLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    fontSize: 15,
  },
  contactText: {
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 2,
  },
  linkButton: {
    marginTop: 8,
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
  meetingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  meetingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  meetingText: {
    fontSize: 14,
    flex: 1,
  },
  formIntro: {
    fontSize: 14,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    height: 42,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  messageInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 14,
    minHeight: 120,
  },
  submitButton: {
    height: 44,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 