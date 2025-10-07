import React from 'react';
import { render, fireEvent, Text } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Chip from '../Chip';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Chip Component', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders children correctly', () => {
    const { getByText } = renderWithProvider(
      <Chip onPress={mockOnPress}>
        <Text>Test Chip</Text>
      </Chip>
    );
    
    expect(getByText('Test Chip')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = renderWithProvider(
      <Chip onPress={mockOnPress}>
        <Text>Test Chip</Text>
      </Chip>
    );
    
    fireEvent.press(getByText('Test Chip'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows selected state correctly', () => {
    const { getByTestId } = renderWithProvider(
      <Chip selected onPress={mockOnPress} testID="chip">
        <Text>Selected Chip</Text>
      </Chip>
    );
    
    const chip = getByTestId('chip');
    expect(chip.props.style).toMatchObject(expect.objectContaining({
      borderColor: expect.any(String),
    }));
  });

  it('shows unselected state correctly', () => {
    const { getByTestId } = renderWithProvider(
      <Chip selected={false} onPress={mockOnPress} testID="chip">
        <Text>Unselected Chip</Text>
      </Chip>
    );
    
    const chip = getByTestId('chip');
    expect(chip.props.style).toMatchObject(expect.objectContaining({
      borderColor: expect.any(String),
    }));
  });

  it('has proper accessibility props', () => {
    const { getByLabelText } = renderWithProvider(
      <Chip 
        onPress={mockOnPress}
        accessibilityLabel="Custom Chip Label"
        accessibilityHint="This chip can be selected"
      >
        <Text>Chip</Text>
      </Chip>
    );
    
    expect(getByLabelText('Custom Chip Label')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 10 };
    const { getByTestId } = renderWithProvider(
      <Chip onPress={mockOnPress} style={customStyle} testID="chip">
        <Text>Styled Chip</Text>
      </Chip>
    );
    
    const chip = getByTestId('chip');
    expect(chip.props.style).toMatchObject(expect.objectContaining(customStyle));
  });
});
