import prefsReducer, { setPrefs, resetPrefs } from '../prefsSlice';
import { UserPrefs } from '../../../types';

describe('prefsSlice', () => {
  const initialState = {
    lastPeriodStart: null,
    avgPeriodDays: 5,
    avgCycleDays: 28,
  };

  it('should return the initial state', () => {
    expect(prefsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle setPrefs', () => {
    const newPrefs: Partial<UserPrefs> = {
      lastPeriodStart: '2024-01-01',
      avgPeriodDays: 6,
      avgCycleDays: 30,
    };

    const actual = prefsReducer(initialState, setPrefs(newPrefs));
    expect(actual).toEqual({
      ...initialState,
      ...newPrefs,
    });
  });

  it('should handle partial setPrefs update', () => {
    const initialStateWithData = {
      lastPeriodStart: '2024-01-01',
      avgPeriodDays: 5,
      avgCycleDays: 28,
    };

    const partialUpdate = {
      avgCycleDays: 30,
    };

    const actual = prefsReducer(initialStateWithData, setPrefs(partialUpdate));
    expect(actual).toEqual({
      ...initialStateWithData,
      ...partialUpdate,
    });
  });

  it('should handle resetPrefs', () => {
    const stateWithData = {
      lastPeriodStart: '2024-01-01',
      avgPeriodDays: 6,
      avgCycleDays: 30,
    };

    const actual = prefsReducer(stateWithData, resetPrefs());
    expect(actual).toEqual(initialState);
  });

  it('should maintain immutability', () => {
    const newPrefs = {
      lastPeriodStart: '2024-01-01',
      avgPeriodDays: 6,
    };

    const actual = prefsReducer(initialState, setPrefs(newPrefs));
    
    // Original state should not be modified
    expect(initialState).toEqual({
      lastPeriodStart: null,
      avgPeriodDays: 5,
      avgCycleDays: 28,
    });
    
    // New state should have the updates
    expect(actual).toEqual({
      lastPeriodStart: '2024-01-01',
      avgPeriodDays: 6,
      avgCycleDays: 28,
    });
  });

  it('should handle edge cases', () => {
    // Test with empty object
    const actual1 = prefsReducer(initialState, setPrefs({}));
    expect(actual1).toEqual(initialState);

    // Test with null values
    const nullPrefs = {
      lastPeriodStart: null,
      avgPeriodDays: null,
      avgCycleDays: null,
    };

    const actual2 = prefsReducer(initialState, setPrefs(nullPrefs));
    expect(actual2).toEqual({
      ...initialState,
      ...nullPrefs,
    });
  });
});
