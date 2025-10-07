import React, { ReactNode, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Modal as RNModal, 
  ScrollView, 
  StyleSheet,
  Animated,
  PanResponder,
  TouchableWithoutFeedback,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/ThemeProvider';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  closeOnBackdropPress?: boolean;
  swipeToClose?: boolean;
}

export default function Modal({ 
  visible, 
  onClose, 
  title, 
  children,
  closeOnBackdropPress = true,
  swipeToClose = true,
}: ModalProps) {
  const { colors, spacing, borderRadius, shadows } = useTheme();
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(0)).current;
  const panY = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return swipeToClose && gestureState.dy > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          panY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100) {
          // Swipe down threshold exceeded, close modal
          Animated.timing(panY, {
            toValue: 300,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            onClose();
            panY.setValue(0);
          });
        } else {
          // Bounce back
          Animated.spring(panY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      slideAnim.setValue(0);
      panY.setValue(0);
    }
  }, [visible]);

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={closeOnBackdropPress ? onClose : undefined}>
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Modal Content */}
        <Animated.View
          {...(swipeToClose ? panResponder.panHandlers : {})}
          style={[
            styles.container,
            {
              backgroundColor: colors.bg,
              borderTopLeftRadius: borderRadius.modal,
              borderTopRightRadius: borderRadius.modal,
              ...shadows.card,
              transform: [{ translateY: panY }],
            }
          ]}
        >
          {/* Swipe Indicator */}
          {swipeToClose && (
            <View style={styles.swipeIndicatorContainer}>
              <View style={[styles.swipeIndicator, { backgroundColor: colors.bgGray }]} />
            </View>
          )}

          {/* Header */}
          <View style={[
            styles.header, 
            { 
              borderBottomColor: colors.bgGray, 
              paddingHorizontal: spacing.lg, 
              paddingTop: swipeToClose ? spacing.sm : spacing.lg, 
              paddingBottom: spacing.md 
            }
          ]}>
            {title && (
              <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, flex: 1 }}>
                {title}
              </Text>
            )}
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: colors.bgSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityRole="button"
              accessibilityLabel="Kapat"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={{ fontSize: 24, color: colors.inkSoft, lineHeight: 28 }}>×</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: spacing.lg, paddingBottom: Math.max(spacing.lg, insets.bottom) }}
          >
            {children}
          </ScrollView>
        </Animated.View>
      </View>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    maxHeight: '80%',
  },
  swipeIndicatorContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
});
