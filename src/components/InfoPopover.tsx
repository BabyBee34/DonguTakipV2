import React, { useEffect, useRef } from 'react';
import { Modal, Pressable, View, Text, Animated } from 'react-native';

interface InfoPopoverProps {
  visible: boolean;
  onClose: () => void;
  emoji?: string;
  title: string;
  lines: string[];
  tint?: string;
}

export default function InfoPopover({
  visible,
  onClose,
  emoji = 'ℹ️',
  title,
  lines,
  tint = '#FF66B2',
}: InfoPopoverProps) {
  const a = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(a, {
      toValue: visible ? 1 : 0,
      duration: 160,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Pressable
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Animated.View
          style={{
            width: '86%',
            maxWidth: 400,
            transform: [
              {
                scale: a.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.96, 1],
                }),
              },
            ],
            opacity: a,
            backgroundColor: '#fff',
            borderRadius: 18,
            padding: 16,
            shadowColor: '#000',
            shadowOpacity: 0.15,
            shadowRadius: 18,
            elevation: 6,
          }}
        >
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: tint,
              borderRadius: 12,
              paddingHorizontal: 8,
              paddingVertical: 4,
              marginBottom: 8,
            }}
          >
            <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
              {emoji}  {title}
            </Text>
          </View>
          {lines.map((t, i) => (
            <Text key={i} style={{ color: '#333', marginBottom: 6, fontSize: 14, lineHeight: 20 }}>
              {'• '}{t}
            </Text>
          ))}
          <Text style={{ color: '#777', marginTop: 8, fontSize: 12, lineHeight: 18 }}>
            ⚠️ Bu bilgiler geneldir; tıbbi tavsiye değildir.
          </Text>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}



