import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Button from '../Button';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Button Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with default props', () => {
    const { getByText } = renderWithProvider(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = renderWithProvider(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', () => {
    const { getByText } = renderWithProvider(
      <Button title="Test Button" onPress={mockOnPress} disabled />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('renders with loading state', () => {
    const { getByTestId } = renderWithProvider(
      <Button title="Test Button" onPress={mockOnPress} loading />
    );
    
    // ActivityIndicator should be present when loading
    expect(getByTestId('activity-indicator')).toBeTruthy();
  });

  it('renders different sizes correctly', () => {
    const { getByText: getSmall } = renderWithProvider(
      <Button title="Small" onPress={mockOnPress} size="small" />
    );
    
    const { getByText: getMedium } = renderWithProvider(
      <Button title="Medium" onPress={mockOnPress} size="medium" />
    );
    
    const { getByText: getLarge } = renderWithProvider(
      <Button title="Large" onPress={mockOnPress} size="large" />
    );
    
    expect(getSmall('Small')).toBeTruthy();
    expect(getMedium('Medium')).toBeTruthy();
    expect(getLarge('Large')).toBeTruthy();
  });

  it('renders different variants correctly', () => {
    const { getByText: getPrimary } = renderWithProvider(
      <Button title="Primary" onPress={mockOnPress} variant="primary" />
    );
    
    const { getByText: getSecondary } = renderWithProvider(
      <Button title="Secondary" onPress={mockOnPress} variant="secondary" />
    );
    
    const { getByText: getText } = renderWithProvider(
      <Button title="Text" onPress={mockOnPress} variant="text" />
    );
    
    expect(getPrimary('Primary')).toBeTruthy();
    expect(getSecondary('Secondary')).toBeTruthy();
    expect(getText('Text')).toBeTruthy();
  });

  it('has proper accessibility props', () => {
    const { getByLabelText } = renderWithProvider(
      <Button 
        title="Accessible Button" 
        onPress={mockOnPress}
        accessibilityLabel="Custom Label"
        accessibilityHint="This button does something important"
      />
    );
    
    expect(getByLabelText('Custom Label')).toBeTruthy();
  });
});
