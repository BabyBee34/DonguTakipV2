import React from 'react';
import { render, Text } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { store } from '../../store';
import Card from '../Card';

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  );
};

describe('Card Component', () => {
  it('renders children correctly', () => {
    const { getByText } = renderWithProvider(
      <Card>
        <Text>Test Content</Text>
      </Card>
    );
    
    expect(getByText('Test Content')).toBeTruthy();
  });

  it('applies custom style', () => {
    const customStyle = { marginTop: 20 };
    const { getByTestId } = renderWithProvider(
      <Card style={customStyle} testID="card">
        <Text>Test Content</Text>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card.props.style).toMatchObject(expect.objectContaining(customStyle));
  });

  it('applies custom backgroundColor', () => {
    const customBg = '#FF0000';
    const { getByTestId } = renderWithProvider(
      <Card backgroundColor={customBg} testID="card">
        <Text>Test Content</Text>
      </Card>
    );
    
    const card = getByTestId('card');
    expect(card.props.style).toMatchObject(expect.objectContaining({ backgroundColor: customBg }));
  });

  it('has proper accessibility props', () => {
    const { getByTestId } = renderWithProvider(
      <Card testID="accessible-card" accessibilityRole="button">
        <Text>Accessible Card</Text>
      </Card>
    );
    
    const card = getByTestId('accessible-card');
    expect(card.props.accessibilityRole).toBe('button');
  });
});
