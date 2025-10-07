import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

type Props = { children: React.ReactNode };
type State = { hasError: boolean };

export default class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Unhandled error:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      // Simple fallback UI
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: '700', marginBottom: 12 }}>Bir şeyler ters gitti</Text>
          <Text style={{ textAlign: 'center', color: '#666', marginBottom: 16 }}>
            Beklenmeyen bir hata oluştu. Devam etmek için yeniden deneyin.
          </Text>
          <TouchableOpacity onPress={this.handleReset} style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#6C47FF', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Tekrar Dene</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return this.props.children as any;
  }
}


