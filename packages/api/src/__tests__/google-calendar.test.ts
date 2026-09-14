/**
 * Google Calendar lib tests — OAuth token exchange/refresh, calendar
 * event CRUD, and the auth URL builder via a mocked fetch.
 * (Coverage ratchet target: src/lib/googleCalendar.ts — was 1.6%)
 */
import { describe, it, expect, afterEach, vi } from 'vitest';
import {
  exchangeGoogleCode,
  refreshGoogleToken,
  createGoogleCalendarEvent,
  deleteGoogleCalendarEvent,
  getGoogleAuthUrl,
} from '../lib/googleCalendar';

const GOOGLE_ENV = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] as const;

function setGoogleConfig(): void {
  process.env['GOOGLE_CLIENT_ID'] = 'client-123';
  process.env['GOOGLE_CLIENT_SECRET'] = 'secret-456';
}

function jsonResponse(body: unknown, ok = true): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? 200 : 400,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('googleCalendar lib', () => {
  afterEach(() => {
    for (const key of GOOGLE_ENV) delete process.env[key];
    vi.unstubAllGlobals();
  });

  describe('getGoogleAuthUrl', () => {
    it('returns null without config', () => {
      expect(getGoogleAuthUrl('http://localhost/cb', 'state-1')).toBeNull();
    });

    it('builds the consent URL with client id, scope, and state', () => {
      setGoogleConfig();
      const url = getGoogleAuthUrl('http://localhost/cb', 'state-1');
      expect(url).toContain('client_id=client-123');
      expect(url).toContain('redirect_uri=http%3A%2F%2Flocalhost%2Fcb');
      expect(url).toContain('access_type=offline');
      expect(url).toContain('prompt=consent');
      expect(url).toContain('state=state-1');
    });
  });

  describe('exchangeGoogleCode', () => {
    it('returns null without config', async () => {
      expect(await exchangeGoogleCode('code', 'http://localhost/cb')).toBeNull();
    });

    it('exchanges a code for tokens', async () => {
      setGoogleConfig();
      const before = Date.now();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(
          jsonResponse({
            access_token: 'at-1',
            refresh_token: 'rt-1',
            expires_in: 3600,
          }),
        ),
      );
      const tokens = await exchangeGoogleCode('code-1', 'http://localhost/cb');
      expect(tokens).toMatchObject({ accessToken: 'at-1', refreshToken: 'rt-1' });
      expect(tokens!.expiryDate).toBeGreaterThanOrEqual(before + 3599 * 1000);
    });

    it('returns null on a non-ok response', async () => {
      setGoogleConfig();
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)));
      expect(await exchangeGoogleCode('code-1', 'http://localhost/cb')).toBeNull();
    });

    it('returns null when fetch throws', async () => {
      setGoogleConfig();
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      expect(await exchangeGoogleCode('code-1', 'http://localhost/cb')).toBeNull();
    });
  });

  describe('refreshGoogleToken', () => {
    it('returns null without config', async () => {
      expect(await refreshGoogleToken('rt-1')).toBeNull();
    });

    it('refreshes and keeps the refresh token', async () => {
      setGoogleConfig();
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue(jsonResponse({ access_token: 'at-2', expires_in: 3600 })),
      );
      const tokens = await refreshGoogleToken('rt-1');
      expect(tokens).toMatchObject({ accessToken: 'at-2', refreshToken: 'rt-1' });
    });

    it('returns null when fetch throws', async () => {
      setGoogleConfig();
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      expect(await refreshGoogleToken('rt-1')).toBeNull();
    });
  });

  describe('createGoogleCalendarEvent', () => {
    it('creates an event and returns its id', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 'evt-9' })));
      const id = await createGoogleCalendarEvent('at-1', {
        summary: 'حجز جمال',
        start: '2026-09-01T10:00:00Z',
        end: '2026-09-01T11:00:00Z',
      });
      expect(id).toBe('evt-9');
      const [url, init] = (global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0] as [
        string,
        RequestInit,
      ];
      expect(url).toContain('/calendars/primary/events');
      expect(String(init.headers?.['Authorization'])).toBe('Bearer at-1');
      const body = JSON.parse(String(init.body));
      expect(body.start.timeZone).toBe('Asia/Riyadh');
    });

    it('uses a custom timezone when provided', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({ id: 'evt-10' })));
      const id = await createGoogleCalendarEvent('at-1', {
        summary: 'S',
        start: '2026-09-01T10:00:00Z',
        end: '2026-09-01T11:00:00Z',
        timezone: 'Europe/Paris',
      });
      expect(id).toBe('evt-10');
      const body = JSON.parse(
        String((global.fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0][1].body),
      );
      expect(body.end.timeZone).toBe('Europe/Paris');
    });

    it('returns null on non-ok and on throw', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(jsonResponse({}, false)));
      expect(
        await createGoogleCalendarEvent('at-1', {
          summary: 'S',
          start: 'a',
          end: 'b',
        }),
      ).toBeNull();
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      expect(
        await createGoogleCalendarEvent('at-1', { summary: 'S', start: 'a', end: 'b' }),
      ).toBeNull();
    });
  });

  describe('deleteGoogleCalendarEvent', () => {
    it('returns true on 204', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 204 })));
      expect(await deleteGoogleCalendarEvent('at-1', 'evt-1')).toBe(true);
    });

    it('returns true on 410 (already deleted)', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 410 })));
      expect(await deleteGoogleCalendarEvent('at-1', 'evt-1')).toBe(true);
    });

    it('returns false on 403 and on throw', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));
      expect(await deleteGoogleCalendarEvent('at-1', 'evt-1')).toBe(false);
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')));
      expect(await deleteGoogleCalendarEvent('at-1', 'evt-1')).toBe(false);
    });
  });
});
