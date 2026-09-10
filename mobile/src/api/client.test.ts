import { getStoredValue } from '../storage';
import { ApiError, apiRequest, subscribeToUnauthorized } from './client';

jest.mock('../storage', () => ({ getStoredValue: jest.fn() }));

const mockedGetStoredValue = jest.mocked(getStoredValue);

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

describe('apiRequest', () => {
  beforeEach(() => {
    mockedGetStoredValue.mockReset();
    globalThis.fetch = jest.fn();
  });

  it('does not send an authenticated request without a token', async () => {
    mockedGetStoredValue.mockResolvedValue(null);
    await expect(apiRequest('/api/user/profile', { authenticated: true })).rejects.toMatchObject({
      status: 401,
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it('attaches the bearer token and parses JSON', async () => {
    mockedGetStoredValue.mockResolvedValue('secret-token');
    jest.mocked(fetch).mockResolvedValue(jsonResponse({ success: true }));
    await expect(apiRequest<{ success: boolean }>('/api/example', { authenticated: true }))
      .resolves.toEqual({ success: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/example'),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer secret-token' }) }),
    );
  });

  it('notifies the session layer on an authenticated 401', async () => {
    mockedGetStoredValue.mockResolvedValue('expired-token');
    jest.mocked(fetch).mockResolvedValue(jsonResponse({ message: 'Expired' }, 401));
    const listener = jest.fn();
    const unsubscribe = subscribeToUnauthorized(listener);

    await expect(apiRequest('/api/user/profile', { authenticated: true })).rejects.toBeInstanceOf(ApiError);
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });
});
