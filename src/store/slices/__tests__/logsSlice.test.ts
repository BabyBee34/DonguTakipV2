import logsReducer, { addLog, updateLog, deleteLog, clearLogs } from '../logsSlice';
import { DailyLog } from '../../../types';

describe('logsSlice', () => {
  const initialState = [];

  const mockLog: DailyLog = {
    id: '1',
    date: '2024-01-01',
    mood: 'happy',
    symptoms: ['cramp'],
    note: 'Great day',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  it('should return the initial state', () => {
    expect(logsReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle addLog', () => {
    const actual = logsReducer(initialState, addLog(mockLog));
    expect(actual).toEqual([mockLog]);
  });

  it('should handle adding multiple logs', () => {
    const secondLog: DailyLog = {
      id: '2',
      date: '2024-01-02',
      mood: 'neutral',
      symptoms: ['headache'],
      note: 'Okay day',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    let actual = logsReducer(initialState, addLog(mockLog));
    actual = logsReducer(actual, addLog(secondLog));
    
    expect(actual).toEqual([mockLog, secondLog]);
  });

  it('should handle updateLog', () => {
    const stateWithLog = [mockLog];
    const updatedLog: DailyLog = {
      ...mockLog,
      mood: 'sad',
      note: 'Updated note',
      updatedAt: '2024-01-01T12:00:00Z',
    };

    const actual = logsReducer(stateWithLog, updateLog(updatedLog));
    expect(actual).toEqual([updatedLog]);
  });

  it('should handle updating non-existent log', () => {
    const nonExistentLog: DailyLog = {
      id: '999',
      date: '2024-01-01',
      mood: 'happy',
      symptoms: [],
      note: 'Non-existent',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const actual = logsReducer(initialState, updateLog(nonExistentLog));
    expect(actual).toEqual(initialState);
  });

  it('should handle deleteLog', () => {
    const stateWithLog = [mockLog];
    const actual = logsReducer(stateWithLog, deleteLog('1'));
    expect(actual).toEqual([]);
  });

  it('should handle deleting non-existent log', () => {
    const actual = logsReducer(initialState, deleteLog('999'));
    expect(actual).toEqual(initialState);
  });

  it('should handle clearLogs', () => {
    const stateWithLogs = [mockLog];
    const actual = logsReducer(stateWithLogs, clearLogs());
    expect(actual).toEqual([]);
  });

  it('should maintain immutability', () => {
    const actual = logsReducer(initialState, addLog(mockLog));
    
    // Original state should not be modified
    expect(initialState).toEqual([]);
    
    // New state should have the log
    expect(actual).toEqual([mockLog]);
  });

  it('should handle logs with undefined symptoms', () => {
    const logWithUndefinedSymptoms: DailyLog = {
      id: '2',
      date: '2024-01-02',
      mood: 'happy',
      symptoms: undefined as any,
      note: 'No symptoms',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    const actual = logsReducer(initialState, addLog(logWithUndefinedSymptoms));
    expect(actual).toEqual([logWithUndefinedSymptoms]);
  });

  it('should handle logs with null mood', () => {
    const logWithNullMood: DailyLog = {
      id: '3',
      date: '2024-01-03',
      mood: null as any,
      symptoms: ['cramp'],
      note: 'No mood recorded',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    };

    const actual = logsReducer(initialState, addLog(logWithNullMood));
    expect(actual).toEqual([logWithNullMood]);
  });

  it('should handle complex update scenarios', () => {
    const log1: DailyLog = {
      id: '1',
      date: '2024-01-01',
      mood: 'happy',
      symptoms: ['cramp'],
      note: 'Day 1',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    const log2: DailyLog = {
      id: '2',
      date: '2024-01-02',
      mood: 'neutral',
      symptoms: ['headache'],
      note: 'Day 2',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    const log3: DailyLog = {
      id: '3',
      date: '2024-01-03',
      mood: 'sad',
      symptoms: ['bloating'],
      note: 'Day 3',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-03T00:00:00Z',
    };

    let state = logsReducer(initialState, addLog(log1));
    state = logsReducer(state, addLog(log2));
    state = logsReducer(state, addLog(log3));

    // Update the middle log
    const updatedLog2: DailyLog = {
      ...log2,
      mood: 'happy',
      note: 'Updated Day 2',
      updatedAt: '2024-01-02T12:00:00Z',
    };

    const actual = logsReducer(state, updateLog(updatedLog2));
    
    expect(actual).toEqual([log1, updatedLog2, log3]);
  });
});
