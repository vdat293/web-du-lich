import i18n from '../i18n';
import { countNights, formatNumber, formatRelativeTime, toDateInput } from './date';

describe('date utilities', () => {
  afterEach(async () => {
    jest.useRealTimers();
    await i18n.changeLanguage('vi');
  });

  it('counts nights without depending on the device time zone', () => {
    expect(countNights('2026-08-23', '2026-08-26')).toBe(3);
    expect(countNights('2026-08-26', '2026-08-23')).toBe(0);
  });

  it('creates a local calendar date input', () => {
    expect(toDateInput(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('formats numbers using the selected language', async () => {
    await i18n.changeLanguage('en');
    expect(formatNumber(1234567)).toBe('1,234,567');
  });

  it('formats notification time using the selected language', async () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-08-23T12:00:00Z'));
    await i18n.changeLanguage('en');
    expect(formatRelativeTime('2026-08-23T11:00:00Z')).toBe('1 hour ago');
  });
});

