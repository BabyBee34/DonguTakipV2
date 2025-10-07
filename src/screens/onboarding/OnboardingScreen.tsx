﻿import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { useDispatch } from 'react-redux';
import OnbWelcome from './OnbWelcome';
import OnbReminders from './OnbReminders';
import OnbPrivacy from './OnbPrivacy';
import { useTheme } from '../../theme/ThemeProvider';
import { setOnboardingCompleted } from '../../store/slices/appSlice';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const PAGES = [OnbWelcome, OnbReminders, OnbPrivacy];

export default function OnboardingScreen({ navigation }: any) {
  const { colors } = useTheme();
  const dispatch = useDispatch();
  const listRef = useRef<FlatList>(null);
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();

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

  const skip = () => {
    dispatch(setOnboardingCompleted(true));
    // Setup ekranına yönlendir
    navigation.reset({
      index: 0,
      routes: [{ name: 'Setup' }],
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <TouchableOpacity onPress={skip} style={{ position: 'absolute', right: 16, top: 16, zIndex: 10 }}>
        <Text style={{ color: colors.inkLight }}>{t('common.skip')}</Text>
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

      <View style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 12 }}>
          {PAGES.map((_, i) => (
            <View
              key={i}
              style={{
                width: 10,
                height: 10,
                borderRadius: 5,
                marginHorizontal: 6,
                backgroundColor: i === index ? colors.primary : colors.bgGray,
              }}
            />
          ))}
        </View>
        <TouchableOpacity
          onPress={goNext}
          style={{
            height: 56,
            borderRadius: 28,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.primary,
          }}
        >
          <Text style={{ color: colors.textOnPrimary, fontSize: 16, fontWeight: '600' }}>
            {index < PAGES.length - 1 ? t('common.continue') : t('common.start')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
