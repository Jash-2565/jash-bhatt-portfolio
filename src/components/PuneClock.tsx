import { useEffect, useState } from 'react';

const format = new Intl.DateTimeFormat('en-IN', {
  timeZone: 'Asia/Kolkata',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

const now = () => format.format(new Date()).replace(/\s?(am|pm)$/i, (m) => ` ${m.trim().toLowerCase()}`);

/**
 * The time in Pune, for the portrait caption. Ticks on the minute rather than
 * on an interval, so it never shows a minute late, and stops while the tab is
 * hidden (timers are throttled there anyway).
 */
export default function PuneClock({ className = '' }: { className?: string }) {
  const [time, setTime] = useState(now);

  useEffect(() => {
    let timer = 0;
    const schedule = () => {
      setTime(now());
      timer = window.setTimeout(schedule, 60_000 - (Date.now() % 60_000) + 50);
    };
    const onVisible = () => {
      window.clearTimeout(timer);
      if (document.visibilityState === 'visible') schedule();
    };
    schedule();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  return (
    <span className={className}>
      <span className="sr-only">Local time in Pune: </span>
      Pune {time}
    </span>
  );
}
