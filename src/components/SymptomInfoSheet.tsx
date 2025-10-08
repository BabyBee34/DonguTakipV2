import React from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import { X } from 'phosphor-react-native';

interface SymptomInfoSheetProps {
  visible: boolean;
  onClose: () => void;
  symptom: {
    name: string;
    description: string;
    whenToNote: string;
  };
}

export default function SymptomInfoSheet({ visible, onClose, symptom }: SymptomInfoSheetProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.45)',
          justifyContent: 'flex-end',
        }}
        onPress={onClose}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: '#fff',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingTop: 20,
            paddingBottom: 40,
            paddingHorizontal: 20,
            maxHeight: '75%',
          }}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: '700', color: '#1F1F1F' }}>
              {symptom.name}
            </Text>
            <Pressable
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: '#F7F7F8',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={20} color="#6C6C6C" weight="bold" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Bu ne? */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#3E3E41', marginBottom: 6 }}>
                Bu ne?
              </Text>
              <Text style={{ fontSize: 14, color: '#6C6C6C', lineHeight: 20 }}>
                {symptom.description}
              </Text>
            </View>

            {/* Ne zaman not etmeli? */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 14, fontWeight: '700', color: '#3E3E41', marginBottom: 6 }}>
                Ne zaman not etmeli?
              </Text>
              <Text style={{ fontSize: 14, color: '#6C6C6C', lineHeight: 20 }}>
                {symptom.whenToNote}
              </Text>
            </View>

            {/* Acil durum */}
            <View
              style={{
                backgroundColor: '#FFF4F4',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: '#FFD6D6',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#D32F2F', marginBottom: 4 }}>
                ⚠️ Acil Durum
              </Text>
              <Text style={{ fontSize: 12, color: '#6C6C6C', lineHeight: 18 }}>
                Şiddetli ağrı, ani bayılma, yoğun ve alışılmadık kanama gibi durumlarda bir sağlık profesyoneline başvur.
              </Text>
            </View>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
