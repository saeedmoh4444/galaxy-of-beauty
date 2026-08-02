'use client';

import { GOOGLE_CALENDAR_URL } from '@galaxy/shared';

interface AddToCalendarProps {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  location?: string;
}

export function AddToCalendar({ title, description, startAt, endAt, location }: AddToCalendarProps): JSX.Element {
  const generateICS = () => {
    const start = new Date(startAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(endAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      `DTSTART:${start}`, `DTEND:${end}`,
      `SUMMARY:${title}`,
      description ? `DESCRIPTION:${description}` : '',
      location ? `LOCATION:${location}` : '',
      'END:VEVENT', 'END:VCALENDAR',
    ].filter(Boolean).join('\r\n');

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `booking-${startAt.slice(0, 10)}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const googleCalUrl = () => {
    const s = new Date(startAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const e = new Date(endAt).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const params = new URLSearchParams({ action: 'TEMPLATE', text: title, dates: `${s}/${e}`, details: description || '', location: location || '' });
    return `${GOOGLE_CALENDAR_URL}?${params.toString()}`;
  };

  return (
    <div className="flex gap-2">
      <button onClick={generateICS} className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">📅 أضف للتقويم</button>
      <a href={googleCalUrl()} target="_blank" rel="noopener" className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400">📆 Google</a>
    </div>
  );
}
