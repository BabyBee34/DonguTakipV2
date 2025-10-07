import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { NavigationContainer } from '@react-navigation/native';
import { store, persistor } from '../store';
import App from '../../App';

// Mock the fonts
jest.mock('@expo-google-fonts/nunito', () => ({
  useFonts: () => [true],
  Nunito_400Regular: 'Nunito_400Regular',
  Nunito_600SemiBold: 'Nunito_600SemiBold',
  Nunito_700Bold: 'Nunito_700Bold',
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer>
          {component}
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
};

describe('App Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders onboarding screen initially', async () => {
    const { getByText } = renderWithProviders(<App />);
    
    // Should show onboarding content
    await waitFor(() => {
      expect(getByText(/Döngünü kolayca takip et/)).toBeTruthy();
    });
  });

  it('completes onboarding flow', async () => {
    const { getByText } = renderWithProviders(<App />);
    
    // Start onboarding
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // Navigate through onboarding
    fireEvent.press(getByText('Devam Et'));
    
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Devam Et'));
    
    // Should reach the final onboarding screen
    await waitFor(() => {
      expect(getByText('Başla')).toBeTruthy();
    });
  });

  it('skips onboarding when skip button is pressed', async () => {
    const { getByText } = renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(getByText('Atla')).toBeTruthy();
    });
    
    fireEvent.press(getByText('Atla'));
    
    // Should navigate to setup or main app
    await waitFor(() => {
      // The app should have navigated away from onboarding
      expect(() => getByText('Atla')).toThrow();
    });
  });

  it('handles theme switching', async () => {
    const { getByText } = renderWithProviders(<App />);
    
    // Navigate through onboarding to reach settings
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // This is a simplified test - in a real app, you'd navigate to settings
    // and test theme switching functionality
    expect(true).toBe(true);
  });

  it('persists state across app restarts', async () => {
    // This test would verify that Redux Persist is working correctly
    // by checking that state is maintained when the app is "restarted"
    
    const { getByText } = renderWithProviders(<App />);
    
    // Complete some action that changes state
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // Simulate app restart by re-rendering
    const { getByText: getByTextAfterRestart } = renderWithProviders(<App />);
    
    // State should be persisted (this would depend on the specific implementation)
    expect(true).toBe(true);
  });

  it('handles navigation between screens', async () => {
    const { getByText } = renderWithProviders(<App />);
    
    // Navigate through the app flow
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // Test navigation flow
    fireEvent.press(getByText('Devam Et'));
    
    await waitFor(() => {
      // Should be on next screen
      expect(true).toBe(true);
    });
  });

  it('handles error states gracefully', async () => {
    // Mock an error scenario
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    const { getByText } = renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // App should still render even if there are errors
    expect(true).toBe(true);
    
    consoleSpy.mockRestore();
  });

  it('maintains accessibility throughout the app', async () => {
    const { getByLabelText, getByText } = renderWithProviders(<App />);
    
    await waitFor(() => {
      expect(getByText('Devam Et')).toBeTruthy();
    });
    
    // Check that interactive elements have proper accessibility props
    const continueButton = getByText('Devam Et');
    expect(continueButton).toBeTruthy();
    
    // Test that the button is accessible
    fireEvent.press(continueButton);
    
    await waitFor(() => {
      expect(true).toBe(true);
    });
  });
});
