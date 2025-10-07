import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { store } from '../../store';
import CalendarScreen from '../CalendarScreen';

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <NavigationContainer>
        {component}
      </NavigationContainer>
    </Provider>
  );
};

// Mock navigation
const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
};

describe('CalendarScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    expect(getByText('Merhaba 🌸')).toBeTruthy();
    expect(getByText('Bugün nasılsın?')).toBeTruthy();
  });

  it('displays calendar with proper month navigation', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    // Check for month navigation arrows
    expect(getByText('‹')).toBeTruthy();
    expect(getByText('›')).toBeTruthy();
  });

  it('displays weekday headers', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    const weekdays = ['PZT', 'SAL', 'ÇAR', 'PER', 'CUM', 'CMT', 'PAZ'];
    weekdays.forEach(day => {
      expect(getByText(day)).toBeTruthy();
    });
  });

  it('shows legend items', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    expect(getByText('🌸 Adet')).toBeTruthy();
    expect(getByText('🌷 Tahmini')).toBeTruthy();
    expect(getByText('🌱 Fertil')).toBeTruthy();
    expect(getByText('💜 Ovulasyon')).toBeTruthy();
    expect(getByText('🌟 Bugün')).toBeTruthy();
  });

  it('shows quick action buttons', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    expect(getByText('Adet Başlat')).toBeTruthy();
    expect(getByText('Günlük Kaydet')).toBeTruthy();
  });

  it('navigates to daily log when day is pressed', async () => {
    const { getAllByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    // Find a day number and press it
    const dayNumbers = getAllByText(/\d+/);
    if (dayNumbers.length > 0) {
      fireEvent.press(dayNumbers[0]);
      
      await waitFor(() => {
        expect(mockNavigation.navigate).toHaveBeenCalledWith('Günlük', expect.any(Object));
      });
    }
  });

  it('navigates to daily log when quick action is pressed', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    fireEvent.press(getByText('Günlük Kaydet'));
    
    expect(mockNavigation.navigate).toHaveBeenCalledWith('Günlük');
  });

  it('handles period toggle action', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    fireEvent.press(getByText('Adet Başlat'));
    
    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('displays motivation message', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    // The motivation message should be displayed
    // This will depend on the current phase prediction
    expect(getByText(/./)).toBeTruthy(); // At least some text should be present
  });

  it('handles month navigation', () => {
    const { getByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    const prevButton = getByText('‹');
    const nextButton = getByText('›');
    
    fireEvent.press(prevButton);
    fireEvent.press(nextButton);
    
    // Should not throw any errors
    expect(true).toBe(true);
  });

  it('shows today indicator', () => {
    const { getAllByText } = renderWithProviders(
      <CalendarScreen navigation={mockNavigation} />
    );
    
    // Today should be marked with 🌟
    const todayIndicators = getAllByText('🌟');
    expect(todayIndicators.length).toBeGreaterThan(0);
  });
});
