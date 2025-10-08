import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import OnbWelcome from './OnbWelcome';
import OnbReminders from './OnbReminders';
import OnbPrivacy from './OnbPrivacy';
import { useTheme } from '../../theme/ThemeProvider';
import { setOnboardingCompleted } from '../../store/slices/appSlice';
import { useTranslation } from 'react-i18next';

const PAGES = [OnbWelcome, OnbReminders, OnbPrivacy];

export default function OnboardingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();

  const goNext = () => {
    if (index < PAGES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      // Onboarding tamamlandı, state'i güncelle
      dispatch(setOnboardingCompleted(true));
      // Setup ekranına yönlendir
      navigation.reset({
        index: 0,
        routes: [{ name: 'Setup' }],
      });
    }
  };

  // Her ekran için gradient son rengi
  const getBottomBackgroundColor = () => {
    const bottomColors = ['#FAD8EF', '#FFEFF9', '#F9E1FF'];
    return bottomColors[index];
  };

  const skip = () => {
    dispatch(setOnboardingCompleted(true));
    // Setup ekranına yönlendir
    navigation.reset({
      index: 0,
      routes: [{ name: 'Setup' }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: 'transparent' }}>
      <TouchableOpacity onPress={skip} style={{ position: 'absolute', right: 16, top: Math.max(16, insets.top), zIndex: 10 }}>
        <Text style={{ color: '#666', fontWeight: '600' }}>{t('common.skip')}</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={PAGES}
        keyExtractor={(_, i) => String(i)}
        renderItem={({ item: Component }) => (
          <View style={{ width, flex: 1 }}>
            <Component />
          </View>
        )}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
          setIndex(newIndex);
        }}
      />

      <View style={{ 
        padding: 16, 
        paddingBottom: Math.max(16, insets.bottom), 
        alignItems: 'center',
        backgroundColor: getBottomBackgroundColor(),
      }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              accessible={true}
              accessibilityLabel={`${t('common.step')} ${i + 1} / ${PAGES.length}`}
              accessibilityRole="progressbar"
              style={{
                width: i === index ? 12 : 10,
                height: i === index ? 12 : 10,
                borderRadius: i === index ? 6 : 5,
                marginHorizontal: 6,
                backgroundColor: i === index ? '#FF66B2' : '#F5C6E0',
              }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={goNext}
          activeOpacity={0.8}
          style={{
            width: '90%',
            alignSelf: 'center',
          }}
        >
          <LinearGradient
            colors={['#FF66B2', '#FF8FC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              paddingVertical: 16,
              borderRadius: 24,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ color: '#FFFFFF', fontSize: 16, fontWeight: '700' }}>
              {index < PAGES.length - 1 ? t('common.continue') : t('common.start')}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}
