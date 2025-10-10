import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useTheme } from '../../theme/ThemeProvider';
import SectionCard from '../../components/SectionCard';
import { searchFaq } from '../../services/faqService';

export default function ChatScreen() {
  const { colors, spacing, borderRadius } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(() => searchFaq('', 3));
  const [showGuardrail, setShowGuardrail] = useState(false);

  const handleSearch = (text: string) => {
    setQuery(text);
    const normalized = text.trim().toLowerCase();
    const guardrail = ['acil', 'kanama', 'hamile', 'hamilelik', 'kriz', 'baygin'];
    if (guardrail.some((word) => normalized.includes(word))) {
      setShowGuardrail(true);
      setResults([]);
      return;
    }
    setShowGuardrail(false);
    setResults(searchFaq(text, 3));
  };

  const guardrailMessage = useMemo(() => (
    'Sorunuz kritik olabilir. Lutfen bir saglik profesyoneline basvurun veya acil durumda 112 yi arayin.'
  ), []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={{ padding: spacing.lg }}
      keyboardShouldPersistTaps="handled"
    >
      <SectionCard style={{ padding: spacing.lg, marginBottom: spacing.lg }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.ink, marginBottom: spacing.sm }}>
          Sorularina hizli cevaplar
        </Text>
        <Text style={{ fontSize: 14, color: colors.inkSoft }}>
          Anahtar kelimelerle arayabilir, sik sorulan sorulara hizli ulasabilirsin.
        </Text>
      </SectionCard>

      <View
        style={{
          backgroundColor: '#fff',
          borderRadius: borderRadius.lg,
          padding: spacing.md,
          marginBottom: spacing.lg,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          elevation: 4,
        }}
      >
        <TextInput
          value={query}
          onChangeText={handleSearch}
          placeholder="Orn: kramp icin ne yapmaliyim?"
          placeholderTextColor={colors.inkSoft}
          style={{
            fontSize: 16,
            color: colors.ink,
            paddingVertical: spacing.sm,
          }}
        />
      </View>

      {showGuardrail ? (
        <SectionCard style={{ padding: spacing.md }}>
          <Text style={{ color: '#B91C1C', fontSize: 15, fontWeight: '700', marginBottom: spacing.xs }}>
            Dikkat
          </Text>
          <Text style={{ color: colors.ink, fontSize: 14 }}>{guardrailMessage}</Text>
        </SectionCard>
      ) : (
        results.map((result, index) => (
          <SectionCard key={result.item.id} style={{ padding: spacing.md, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.ink, marginBottom: spacing.xs }}>
              {result.item.question}
            </Text>
            <Text style={{ fontSize: 14, color: colors.ink, lineHeight: 20 }}>
              {result.item.answer}
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: spacing.sm }}>
              {result.item.tags.map((tag) => (
                <View
                  key={`${result.item.id}-${tag}`}
                  style={{
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs,
                    borderRadius: borderRadius.chip,
                    backgroundColor: colors.primary100,
                    marginRight: spacing.xs,
                    marginBottom: spacing.xs,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.primary }}>{tag}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        ))
      )}

      <TouchableOpacity
        onPress={() => {
          handleSearch('');
          setQuery('');
        }}
        style={{
          alignSelf: 'center',
          marginTop: spacing.lg,
          paddingHorizontal: spacing.lg,
          paddingVertical: spacing.sm,
          borderRadius: borderRadius.lg,
          backgroundColor: colors.primary200,
        }}
      >
        <Text style={{ color: colors.primary, fontWeight: '600' }}>Soruyu temizle</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
