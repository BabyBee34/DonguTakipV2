import React, { useState, memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Symptom } from '../types';
import { useTheme } from '../theme/ThemeProvider';
import Modal from './Modal';
import { useTranslation } from 'react-i18next';

interface SymptomGridProps {
  selectedSymptoms: Symptom[];
  onToggle: (symptom: Symptom) => void;
}

const SYMPTOMS: { symptom: Symptom; label: string; description: string; category: string }[] = [
  // Ağrılar
  { symptom: 'cramp', label: 'Kramp', description: 'Uterus kasılmaları, karın alt bölgesinde ağrı', category: 'Ağrılar' },
  { symptom: 'headache', label: 'Baş Ağrısı', description: 'Hormon dalgalanmasına bağlı baş ağrısı veya migren', category: 'Ağrılar' },
  { symptom: 'backPain', label: 'Sırt Ağrısı', description: 'Sırt ve bel bölgesinde ağrı', category: 'Ağrılar' },
  { symptom: 'jointPain', label: 'Eklem Ağrısı', description: 'Eklemlerde ağrı ve hassasiyet', category: 'Ağrılar' },
  
  // Sindirim
  { symptom: 'bloating', label: 'Şişkinlik', description: 'Su tutma nedeniyle karın şişliği', category: 'Sindirim' },
  { symptom: 'nausea', label: 'Bulantı', description: 'Mide bulantısı', category: 'Sindirim' },
  { symptom: 'constipation', label: 'Kabızlık', description: 'Bağırsak hareketlerinde yavaşlama', category: 'Sindirim' },
  { symptom: 'diarrhea', label: 'İshal', description: 'Prostaglandin etkisiyle sulu dışkılama', category: 'Sindirim' },
  
  // Cilt & Fiziksel
  { symptom: 'acne', label: 'Akne', description: 'Hormonal değişikliklere bağlı sivilce oluşumu', category: 'Cilt' },
  { symptom: 'breastTenderness', label: 'Göğüs Hassasiyeti', description: 'Göğüslerde hassasiyet ve şişlik', category: 'Fiziksel' },
  { symptom: 'discharge', label: 'Akıntı', description: 'Vajinal akıntı (ovulasyon döneminde normal)', category: 'Fiziksel' },
  
  // Enerji & Uyku
  { symptom: 'lowEnergy', label: 'Düşük Enerji', description: 'Yorgunluk ve enerji eksikliği', category: 'Enerji' },
  { symptom: 'sleepy', label: 'Uykulu', description: 'Aşırı uyku hali', category: 'Enerji' },
  { symptom: 'insomnia', label: 'Uykusuzluk', description: 'Uyku sorunu', category: 'Enerji' },
  
  // İştah
  { symptom: 'appetite', label: 'Artan İştah', description: 'İştah artışı', category: 'İştah' },
  { symptom: 'cravings', label: 'Özel Besin İsteği', description: 'Tatlı veya tuzlu yiyecek istekleri', category: 'İştah' },
  
  // Duygusal
  { symptom: 'anxious', label: 'Anksiyete', description: 'Endişe ve gerginlik hissi', category: 'Duygusal' },
  { symptom: 'irritable', label: 'Sinirlilik', description: 'İrritabilite, kolay sinirlenme', category: 'Duygusal' },
  { symptom: 'focusIssues', label: 'Odaklanma Zorluğu', description: 'Konsantrasyon güçlüğü', category: 'Duygusal' },
];

function SymptomGrid({ selectedSymptoms, onToggle }: SymptomGridProps) {
  const { colors, spacing, borderRadius } = useTheme();
  const { t } = useTranslation();
  const [selectedSymptomInfo, setSelectedSymptomInfo] = useState<typeof SYMPTOMS[0] | null>(null);

  const groupedSymptoms = SYMPTOMS.reduce((acc, symptom) => {
    if (!acc[symptom.category]) {
      acc[symptom.category] = [];
    }
    acc[symptom.category].push(symptom);
    return acc;
  }, {} as Record<string, typeof SYMPTOMS>);

  return (
    <View>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.ink, marginBottom: spacing.md }}>
        {t('dailyLog.symptoms.title')}
      </Text>

      {Object.entries(groupedSymptoms).map(([category, symptoms]) => (
        <View key={category} style={{ marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.sm }}>
            {category}
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {symptoms.map(({ symptom, label }) => {
              const isSelected = selectedSymptoms.includes(symptom);
              
              return (
                <TouchableOpacity
                  key={symptom}
                  onPress={() => onToggle(symptom)}
                  onLongPress={() => setSelectedSymptomInfo(symptoms.find(s => s.symptom === symptom) || null)}
                  style={{
                    paddingVertical: spacing.sm,
                    paddingHorizontal: spacing.md,
                    borderRadius: borderRadius.chip,
                    backgroundColor: isSelected ? colors.primary : colors.bgSoft,
                    borderWidth: isSelected ? 0 : 1,
                    borderColor: colors.bgGray,
                  }}
                >
                  <Text 
                    style={{ 
                      color: isSelected ? '#fff' : colors.ink,
                      fontWeight: isSelected ? '600' : '400',
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ))}

      <Text style={{ fontSize: 11, color: colors.inkLight, textAlign: 'center', marginTop: spacing.sm }}>
        {t('dailyLog.symptoms.longPressHint')}
      </Text>

      {/* Semptom Bilgi Modal */}
      {selectedSymptomInfo && (
        <Modal
          visible={!!selectedSymptomInfo}
          onClose={() => setSelectedSymptomInfo(null)}
          title={selectedSymptomInfo.label}
        >
          <View>
            <Text style={{ fontSize: 12, fontWeight: '600', color: colors.inkSoft, marginBottom: spacing.xs }}>
              Kategori: {selectedSymptomInfo.category}
            </Text>
            <Text style={{ fontSize: 16, color: colors.ink, lineHeight: 24 }}>
              {selectedSymptomInfo.description}
            </Text>
          </View>
        </Modal>
      )}
    </View>
  );
}

export default memo(SymptomGrid);

