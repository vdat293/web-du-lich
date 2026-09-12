export type AuthGate = 'login' | 'unlock' | 'app';

export function getAuthGate({ locked, hasUser }: { locked: boolean; hasUser: boolean }): AuthGate {
  if (locked) return 'unlock';
  return hasUser ? 'app' : 'login';
}
