import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { PeriodSpan } from '../types';
import { formatPeriodsForSelection } from '../utils/reportsFilters';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface ReportsFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: {
    menstruationOnly: boolean;
    selectedPeriods: PeriodSpan[];
  }) => void;
  periods: PeriodSpan[];
  initialFilters: {
    menstruationOnly: boolean;
    selectedPeriods: PeriodSpan[];
  };
}

export default function ReportsFilterModal({
  visible,
  onClose,
  onApply,
  periods,
  initialFilters,
}: ReportsFilterModalProps) {
  const [menstruationOnly, setMenstruationOnly] = useState(initialFilters.menstruationOnly);
  const [selectedPeriods, setSelectedPeriods] = useState<PeriodSpan[]>(initialFilters.selectedPeriods);

  useEffect(() => {
    setMenstruationOnly(initialFilters.menstruationOnly);
    setSelectedPeriods(initialFilters.selectedPeriods);
  }, [initialFilters]);

  const formattedPeriods = formatPeriodsForSelection(periods);

  const togglePeriodSelection = (period: PeriodSpan) => {
    setSelectedPeriods(prev => {
      const isSelected = prev.some(p => p.id === period.id);
      if (isSelected) {
        return prev.filter(p => p.id !== period.id);
      } else {
        return [...prev, period];
      }
    });
  };

  const clearAllPeriods = () => {
    setSelectedPeriods([]);
  };

  const handleApply = () => {
    onApply({
      menstruationOnly,
      selectedPeriods,
    });
    onClose();
  };

  const renderPeriodItem = ({ item }: { item: any }) => {
    const isSelected = selectedPeriods.some(p => p.id === item.id);
    
    return (
      <TouchableOpacity
        onPress={() => togglePeriodSelection(item)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
          backgroundColor: isSelected ? '#FFE8F5' : '#FFF',
          borderWidth: 1,
          borderColor: isSelected ? '#E94FA1' : '#E5E7EB',
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 10,
            borderWidth: 2,
            borderColor: isSelected ? '#E94FA1' : '#D1D5DB',
            backgroundColor: isSelected ? '#E94FA1' : '#FFF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          {isSelected && (
            <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#1F2937' }}>
            {item.label}
          </Text>
          <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Döngü: {item.cycleLength} gün • Adet: {item.periodLength} gün
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: '#FFF9FB' }}>
        {/* Header */}
        <LinearGradient
          colors={['#FFB6EC', '#D6A3FF']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingTop: 50,
            paddingBottom: 20,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 20,
            borderBottomRightRadius: 20,
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#FFF' }}>
              Filtreler
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255,255,255,0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: '#FFF', fontSize: 18, fontWeight: 'bold' }}>×</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {/* Sadece Adet Günleri Toggle */}
          <View style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 12 }}>
              Sadece Adet Günleri
            </Text>
            <TouchableOpacity
              onPress={() => setMenstruationOnly(!menstruationOnly)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: menstruationOnly ? '#FFE8F5' : '#FFF',
                borderWidth: 1,
                borderColor: menstruationOnly ? '#E94FA1' : '#E5E7EB',
                borderRadius: 12,
              }}
            >
              <View
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: 10,
                  borderWidth: 2,
                  borderColor: menstruationOnly ? '#E94FA1' : '#D1D5DB',
                  backgroundColor: menstruationOnly ? '#E94FA1' : '#FFF',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                }}
              >
                {menstruationOnly && (
                  <Text style={{ color: '#FFF', fontSize: 12, fontWeight: 'bold' }}>✓</Text>
                )}
              </View>
              <Text style={{ fontSize: 14, color: '#1F2937' }}>
                Sadece adet günlerindeki verileri göster
              </Text>
            </TouchableOpacity>
          </View>

          {/* Adet Dönemi Seçimi */}
          <View style={{ marginBottom: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#1F2937' }}>
                Adet Dönemini Seç
              </Text>
              {selectedPeriods.length > 0 && (
                <TouchableOpacity
                  onPress={clearAllPeriods}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    backgroundColor: '#F3F4F6',
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ fontSize: 12, color: '#6B7280', fontWeight: '600' }}>
                    Tümünü Temizle
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            
            <Text style={{ fontSize: 12, color: '#6B7280', marginBottom: 12 }}>
              Birden fazla dönem işaretleyebilirsin
            </Text>

            {formattedPeriods.length > 0 ? (
              <FlatList
                data={formattedPeriods}
                renderItem={renderPeriodItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={{
                padding: 20,
                backgroundColor: '#F9FAFB',
                borderRadius: 12,
                alignItems: 'center',
              }}>
                <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>
                  Henüz adet dönemi kaydı yok
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Buttons */}
        <View style={{
          padding: 20,
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          backgroundColor: '#FFF',
        }}>
          <TouchableOpacity
            onPress={handleApply}
            style={{
              backgroundColor: '#E94FA1',
              paddingVertical: 16,
              borderRadius: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ color: '#FFF', fontSize: 16, fontWeight: 'bold' }}>
              Uygula
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}




