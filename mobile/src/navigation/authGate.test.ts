import { getAuthGate } from './authGate';

describe('getAuthGate', () => {
  it('requires a full login when there is no persisted session', () => {
    expect(getAuthGate({ locked: false, hasUser: false })).toBe('login');
  });

  it('uses the biometric unlock screen before the app when the session is locked', () => {
    expect(getAuthGate({ locked: true, hasUser: false })).toBe('unlock');
    expect(getAuthGate({ locked: true, hasUser: true })).toBe('unlock');
  });

  it('opens the app only for an authenticated session', () => {
    expect(getAuthGate({ locked: false, hasUser: true })).toBe('app');
  });
});
