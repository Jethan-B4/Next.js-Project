'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * DOB input page — mm/dd/yyyy
 *
 * - Type the date directly (auto-inserts slashes, validates as you go)
 * - Or open a calendar modal to pick it visually
 * - Clicking the month or year in the calendar header opens a picker for it
 * - Modal is a centered dialog on wider screens, a bottom sheet on narrow ones
 *
 * Drop this file in as an App Router page (e.g. app/dob/page.tsx) and it
 * renders standalone — no other files or dependencies required.
 */

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

const YEAR_RANGE_PAST = 110; // how far back the year list goes
const YEAR_RANGE_FUTURE = 0; // don't offer years beyond the current one — no future birthdates

function daysInMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function isValidDate(month: number, day: number, year: number) {
  if (!month || !day || !year) return false;
  if (month < 1 || month > 12) return false;
  if (year < 1000 || year > 9999) return false;
  return day >= 1 && day <= daysInMonth(year, month - 1);
}

function formatTyped(raw: string) {
  const digits = raw.replace(/\D/g, '').slice(0, 8);
  const parts = [digits.slice(0, 2), digits.slice(2, 4), digits.slice(4, 8)];
  return parts.filter(Boolean).join('/');
}

function pad(n: number) {
  return String(n).padStart(2, '0');
}

type PickerMode = 'days' | 'months' | 'years';

export default function DobPage() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<PickerMode>('days');

  const today = useMemo(() => new Date(), []);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed
  const [selected, setSelected] = useState<{ m: number; d: number; y: number } | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const yearListRef = useRef<HTMLDivElement>(null);

  function handleTyped(raw: string) {
    const formatted = formatTyped(raw);
    setValue(formatted);

    if (formatted.length < 10) {
      setError(null);
      return;
    }

    const [mm, dd, yyyy] = formatted.split('/').map(Number);
    if (isValidDate(mm, dd, yyyy)) {
      setError(null);
      setSelected({ m: mm, d: dd, y: yyyy });
    } else {
      setError('That date doesn\u2019t look right.');
    }
  }

  function openModal() {
    if (selected) {
      setViewYear(selected.y);
      setViewMonth(selected.m - 1);
    } else {
      setViewYear(today.getFullYear());
      setViewMonth(today.getMonth());
    }
    setMode('days');
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setMode('days');
    inputRef.current?.focus();
  }

  function pickDay(day: number) {
    const y = viewYear;
    const m = viewMonth + 1;
    setSelected({ m, d: day, y });
    setValue(`${pad(m)}/${pad(day)}/${y}`);
    setError(null);
    setIsOpen(false);
    inputRef.current?.focus();
  }

  function pickMonth(monthIndex: number) {
    setViewMonth(monthIndex);
    setMode('days');
  }

  function pickYear(year: number) {
    setViewYear(year);
    setMode('days');
  }

  function changeMonth(delta: number) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y -= 1; }
    if (m > 11) { m = 0; y += 1; }
    setViewMonth(m);
    setViewYear(y);
  }

  function changeYearBy(delta: number) {
    setViewYear((y) => y + delta);
  }

  // Close on Escape, and on click outside the dialog.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    function onClick(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        closeModal();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onClick);
    };
  }, [isOpen]);

  // Scroll the year list so the current viewYear is in view when it opens.
  useEffect(() => {
    if (mode === 'years' && yearListRef.current) {
      const activeEl = yearListRef.current.querySelector('[data-active="true"]');
      activeEl?.scrollIntoView({ block: 'center' });
    }
  }, [mode]);

  const leadingBlanks = new Date(viewYear, viewMonth, 1).getDay();
  const totalDays = daysInMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(leadingBlanks).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];

  const currentRealYear = today.getFullYear();
  const yearOptions = Array.from(
    { length: YEAR_RANGE_PAST + YEAR_RANGE_FUTURE + 1 },
    (_, i) => currentRealYear + YEAR_RANGE_FUTURE - i,
  );

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-semibold text-slate-900 mb-1">Date of birth</h1>
        <p className="text-sm text-slate-500 mb-6">Type it in, or pick it from the calendar.</p>

        <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1.5">
          Date of birth
        </label>
        <div className="relative">
          <input
            id="dob"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="bday"
            placeholder="mm/dd/yyyy"
            value={value}
            onChange={(e) => handleTyped(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? 'dob-error' : undefined}
            className={`w-full rounded-lg border bg-white px-3.5 py-2.5 pr-11 text-base text-slate-900 placeholder:text-slate-400 outline-none transition-colors
              ${error
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                : 'border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-100'}`}
          />
          <button
            type="button"
            onClick={openModal}
            aria-label="Choose date from calendar"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {error ? (
          <p id="dob-error" className="mt-1.5 text-sm text-red-600">{error}</p>
        ) : selected ? (
          <p className="mt-1.5 text-sm text-slate-500">
            {MONTH_NAMES[selected.m - 1]} {selected.d}, {selected.y}
          </p>
        ) : null}
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center"
          role="presentation"
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label="Choose date of birth"
            className="w-full max-w-sm rounded-t-2xl bg-white p-4 shadow-xl
              sm:max-w-xs sm:rounded-2xl sm:p-4"
          >
            <div className="mb-2 flex justify-center sm:hidden">
              <div className="h-1 w-10 rounded-full bg-slate-300" />
            </div>

            {mode === 'days' && (
              <>
                <div className="flex items-center justify-between px-1 pb-2">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    aria-label="Previous month"
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setMode('months')}
                      className="rounded-md px-2 py-1 text-sm font-medium text-slate-900 hover:bg-slate-100 active:bg-slate-200"
                    >
                      {MONTH_NAMES[viewMonth]}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('years')}
                      className="rounded-md px-2 py-1 text-sm font-medium text-slate-900 hover:bg-slate-100 active:bg-slate-200"
                    >
                      {viewYear}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    aria-label="Next month"
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-y-1 px-1 text-center text-xs text-slate-400">
                  {WEEKDAY_LABELS.map((d, i) => (
                    <div key={i} className="py-1">{d}</div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-y-1 px-1">
                  {cells.map((day, i) => {
                    const isSelected =
                      !!day &&
                      selected?.d === day &&
                      selected.m === viewMonth + 1 &&
                      selected.y === viewYear;
                    const isToday =
                      !!day &&
                      day === today.getDate() &&
                      viewMonth === today.getMonth() &&
                      viewYear === today.getFullYear();

                    return (
                      <div key={i} className="flex items-center justify-center py-0.5">
                        {day ? (
                          <button
                            type="button"
                            onClick={() => pickDay(day)}
                            className={`h-9 w-9 rounded-full text-sm transition-colors
                              ${isSelected
                                ? 'bg-slate-900 text-white'
                                : isToday
                                  ? 'text-slate-900 ring-1 ring-inset ring-slate-300'
                                  : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'}`}
                          >
                            {day}
                          </button>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {mode === 'months' && (
              <>
                <div className="flex items-center justify-between px-1 pb-3">
                  <button
                    type="button"
                    onClick={() => changeYearBy(-1)}
                    aria-label="Previous year"
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <span className="text-sm font-medium text-slate-900">{viewYear}</span>
                  <button
                    type="button"
                    onClick={() => changeYearBy(1)}
                    aria-label="Next year"
                    className="rounded-md p-2 text-slate-500 hover:bg-slate-100 active:bg-slate-200"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 px-1">
                  {MONTH_NAMES.map((name, i) => {
                    const isActive = i === viewMonth;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => pickMonth(i)}
                        className={`rounded-lg py-2.5 text-sm transition-colors
                          ${isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'}`}
                      >
                        {name.slice(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {mode === 'years' && (
              <>
                <div className="px-1 pb-2 text-center text-sm font-medium text-slate-900">
                  Choose a year
                </div>
                <div
                  ref={yearListRef}
                  className="grid max-h-64 grid-cols-4 gap-2 overflow-y-auto px-1 py-1"
                >
                  {yearOptions.map((year) => {
                    const isActive = year === viewYear;
                    return (
                      <button
                        key={year}
                        type="button"
                        data-active={isActive ? 'true' : undefined}
                        onClick={() => pickYear(year)}
                        className={`rounded-lg py-2 text-sm transition-colors
                          ${isActive
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-700 hover:bg-slate-100 active:bg-slate-200'}`}
                      >
                        {year}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            <button
              type="button"
              onClick={closeModal}
              className="mt-3 w-full rounded-lg border border-slate-200 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 sm:mt-4"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
