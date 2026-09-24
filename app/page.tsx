import AcmeLogo from '@/app/ui/acme-logo';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import Image from 'next/image';
import { Fraunces, Inter, JetBrains_Mono } from 'next/font/google';

// Next.js principle: load and subset fonts at build time with next/font
// instead of a <link> tag — no layout shift, no external request at runtime.
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
});

// TODO: replace with the live portfolio URL.
const PORTFOLIO_URL = 'https://jethan-b4.github.io/Portfolio/';

export default function Page() {
  return (
    // Mobile: natural height, scrolls like any normal page.
    // Desktop (md+): locked to the viewport height with no scrollbar —
    // everything below has to fit inside that fixed h-screen box.
    <main
      className={`${fraunces.variable} ${inter.variable} ${jetbrainsMono.variable} flex min-h-screen flex-col bg-white p-6 font-[family-name:var(--font-body)] text-[#111111] md:h-screen md:overflow-hidden`}
    >
      {/* ---------- Brand ---------- */}
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-24">
        <AcmeLogo />
      </div>

      {/* ---------- Hero: grows to fill whatever height remains ---------- */}
      <div className="mt-4 flex grow flex-col gap-6 md:flex-row md:gap-8 md:overflow-hidden">
        <div className="flex grow flex-col justify-center gap-4 overflow-y-auto rounded-lg bg-gray-50 px-6 py-8 md:w-2/5 md:gap-5 md:px-14 md:py-6">
          <p className="font-[family-name:var(--font-mono)] text-sm font-medium uppercase tracking-[0.08em] text-blue-500">
            Next.js App Router &mdash; Course Project
          </p>

          <h1 className="font-[family-name:var(--font-display)] text-3xl font-medium leading-[1.15] text-gray-800 md:text-4xl">
            Welcome to <em className="italic text-blue-600">Acme</em>.
          </h1>

          <p className="max-w-[50ch] text-base leading-relaxed text-gray-600 md:text-lg">
            This is the example for the{' '}
            <a
              href="https://nextjs.org/learn/"
              className="text-blue-500 underline decoration-blue-200 underline-offset-4 transition-colors hover:text-blue-600 hover:decoration-blue-400"
            >
              Next.js Learn Course
            </a>
            , brought to you by Vercel &mdash; built as part of the App Router
            Fundamentals certification. Successfully completed by JB Barcenas.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="flex items-center gap-5 self-start rounded-lg bg-blue-500 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base"
            >
              <span>Log in</span> <ArrowRightIcon className="w-5 md:w-6" />
            </Link>

            {/* Next.js principle: server-rendered <Link> for same-origin
                navigation; a plain external portfolio link stays a plain <a>. */}
            <a
              href={PORTFOLIO_URL}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2 self-start rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-800 transition-colors hover:border-blue-500 hover:text-blue-500 md:text-base"
            >
              View my portfolio ↗
            </a>
          </div>
        </div>

        {/* Next.js principle: next/image handles responsive sizing,
            lazy loading, and format negotiation automatically.
            max-h + object-contain keeps the image inside the fixed
            desktop viewport instead of pushing the page taller. */}
        <div className="flex grow items-center justify-center overflow-hidden p-2 md:w-3/5 md:p-6">
          <Image
            src="/hero-desktop.png"
            width={1000}
            height={760}
            className="hidden max-h-[65vh] w-auto rounded-lg border border-gray-200 object-contain shadow-sm md:block"
            alt="Screenshots of the dashboard project showing desktop version"
            priority
          />
          <Image
            src="/hero-mobile.png"
            width={560}
            height={620}
            className="block w-full rounded-lg border border-gray-200 shadow-sm md:hidden"
            alt="Screenshots of the dashboard project showing mobile version"
            priority
          />
        </div>
      </div>
    </main>
  );
}