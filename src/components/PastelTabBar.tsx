import React from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useThemeColors } from '../theme';
// Phosphor ikonlar (Bold stilde hoş görünüyor)
import { CalendarBlank, PencilSimple, ChartBar, GearSix } from 'phosphor-react-native';

const ICONS: Record<string, any> = {
  Calendar: CalendarBlank,
  DailyLog: PencilSimple,
  Reports: ChartBar,
  Settings: GearSix,
};

interface PastelTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export default function PastelTabBar({ state, descriptors, navigation }: PastelTabBarProps) {
  const c = useThemeColors();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, 10);

  return (
    <View pointerEvents="box-none" style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}>
      <View style={{ paddingHorizontal: 16, paddingBottom: bottom }}>
        <View
          style={{
            height: 62,
            borderRadius: 20,
            backgroundColor: c.bg,
            borderWidth: 1,
            borderColor: c.border,
            shadowColor: '#000',
            shadowOpacity: 0.12,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 6 },
            elevation: 14,
            overflow: 'hidden',
          }}
        >
          {/* Üst ayırıcı */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 1,
              backgroundColor: c.hair,
            }}
          />

          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            {state.routes.map((route: any, index: number) => {
              const { options } = descriptors[route.key];
              const label = options.tabBarLabel ?? options.title ?? route.name;
              const isFocused = state.index === index;
              const Icon = ICONS[route.name] || CalendarBlank;

              const onPress = () => {
                if (!isFocused) {
                  Haptics.selectionAsync();
                  navigation.navigate(route.name);
                }
              };

              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  accessibilityRole="button"
                  accessibilityLabel={label}
                  accessibilityState={isFocused ? { selected: true } : {}}
                  style={{
                    flex: 1,
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {/* İçerik kapsülü */}
                  <View
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 14,
                      backgroundColor: isFocused ? c.pillBg : 'transparent',
                      borderWidth: isFocused ? 1 : 0,
                      borderColor: isFocused ? c.pillBr : 'transparent',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 76,
                    }}
                  >
                    {/* İkon */}
                    <Icon size={22} weight="bold" color={isFocused ? c.accent : c.textDim} />

                    {/* Etiket */}
                    <Text
                      numberOfLines={1}
                      ellipsizeMode="tail"
                      style={{
                        marginTop: 2,
                        fontSize: 12,
                        fontWeight: isFocused ? '700' : '600',
                        color: isFocused ? c.text : c.textDim,
                        maxWidth: 92,
                      }}
                    >
                      {label}
                    </Text>

                    {/* Üst vurgu çizgisi */}
                    {isFocused && (
                      <View
                        style={{
                          height: 3,
                          width: 16,
                          borderRadius: 2,
                          backgroundColor: c.accent,
                          marginTop: 6,
                        }}
                      />
                    )}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}


