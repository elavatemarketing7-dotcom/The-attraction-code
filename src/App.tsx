import React, { useEffect, useMemo, useRef, useState } from 'react';

declare module 'react' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'vturb-smartplayer': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      >;
    }
  }
}

interface VTurbPlayerElement extends HTMLElement {
  currentTime?: number;
  onTime?: (
    seconds: number,
    callback: () => void,
    options?: { once?: boolean },
  ) => void;
}

interface MetaFbqFunction {
  (...args: unknown[]): void;
  callMethod?: (...args: unknown[]) => void;
  queue?: unknown[][];
  push?: (...args: unknown[]) => void;
  loaded?: boolean;
  version?: string;
}

declare global {
  interface Window {
    fbq?: MetaFbqFunction;
    _fbq?: MetaFbqFunction;
  }
}

const CHECKOUT_URL = 'https://pay.hotmart.com/Y108565530Y?checkoutMode=10';
const VTURB_PLAYER_SCRIPT_SRC =
  'https://scripts.converteai.net/02589b94-d095-4ed9-a948-f6b752d97cd8/players/6b048f66c7ae969980aa8c6d/v4/player.js';
const OFFER_REVEAL_SECONDS = 103;

// META PIXEL: If your WordPress/GTM already installs the base pixel,
// leave this blank to avoid loading it twice.
// For a standalone HTML page without an existing pixel, enter your Pixel ID (digits only).
const META_PIXEL_ID = '2237573333519311';

type PolicyKey = 'faqs' | 'refund' | 'privacy' | 'support';

function initializeMetaPixelIfNeeded() {
  if (!/^\d{8,25}$/.test(META_PIXEL_ID)) return;
  if (typeof window.fbq === 'function') return;

  const fbq: MetaFbqFunction = function (...args: unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
    } else {
      fbq.queue?.push(args);
    }
  };
  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = '2.0';
  fbq.push = fbq;

  window.fbq = fbq;
  if (!window._fbq) {
    window._fbq = fbq;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const firstScript = document.getElementsByTagName('script')[0];
  if (firstScript?.parentNode) {
    firstScript.parentNode.insertBefore(script, firstScript);
  } else {
    document.head.appendChild(script);
  }

  window.fbq('init', META_PIXEL_ID);
  window.fbq('track', 'PageView');
}

function trackMetaCheckoutClick(): boolean {
  if (typeof window.fbq !== 'function') {
    console.warn(
      '[Meta Pixel] Base pixel unavailable: install it through WordPress/GTM or fill META_PIXEL_ID in this HTML.',
    );
    return false;
  }
  try {
    window.fbq('track', 'InitiateCheckout', {
      content_name: 'The Attraction Code',
      content_ids: ['Y108565530Y'],
      content_type: 'product',
      value: 7.97,
      currency: 'USD',
      num_items: 1,
    });
    return true;
  } catch (error) {
    console.warn('[Meta Pixel] Failed to queue checkout event:', error);
    return false;
  }
}

const POLICY_TITLES: Record<PolicyKey, string> = {
  faqs: 'Frequently Asked Questions',
  refund: '365-Day Money-Back Guarantee Policy',
  privacy: 'Privacy Policy',
  support: 'Member Support',
};

function PolicyContent({ policyKey }: { policyKey: PolicyKey }) {
  if (policyKey === 'faqs') {
    return (
      <div className="space-y-4 text-sm text-zinc-700 leading-relaxed">
        <div>
          <h4 className="font-bold text-black">
            How do I receive The Attraction Code?
          </h4>
          <p>
            Immediately after confirming your order, you receive instant digital
            access to the complete three-phase training along with all three
            free bonuses ($63.00 value) on any phone, tablet, or computer.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-black">
            Is $7.97 a one-time payment?
          </h4>
          <p>
            Yes. There are no recurring subscriptions or hidden fees. You pay
            $7.97 once and keep lifetime access to the program and bonuses.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-black">
            Does this work if I am naturally introverted or shy?
          </h4>
          <p>
            Yes. The Attraction Code was built specifically so you never have to
            fake an outgoing persona or memorize pickup lines. It focuses on
            calm timing, warmth, and clear intent.
          </p>
        </div>
      </div>
    );
  }

  if (policyKey === 'refund') {
    return (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <p>
          Every copy of The Attraction Code is backed by a full 365-day
          satisfaction guarantee.
        </p>
        <p>
          Take your time going through all three phases and the three included
          bonuses. If at any point within 365 days of purchase you feel the
          training has not improved your confidence or conversations, contact
          support with your order email for a prompt 100% refund of your $7.97.
        </p>
      </div>
    );
  }

  if (policyKey === 'privacy') {
    return (
      <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
        <p>
          Your privacy and discretion are respected at every step. Your contact
          details are used solely to deliver your digital access and provide
          customer support.
        </p>
        <p>
          We never sell, rent, or trade your email address or personal
          information with third parties. Billing statements remain discreet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 text-sm text-zinc-700 leading-relaxed">
      <p>
        Have a question about accessing your program, downloading your three
        free bonuses, or requesting a refund under the 365-day guarantee?
      </p>
      <p className="font-bold text-black bg-[#F4F4F5] inline-block px-2.5 py-1 rounded border border-zinc-300">
        Support Desk: support@attractioncodemethod.com
      </p>
      <p>Support hours: Monday–Friday. Replies within 24 business hours.</p>
    </div>
  );
}

function PaymentTrustRow({ extraClass = '' }: { extraClass?: string }) {
  return (
    <div
      className={`payment-trust-row ${extraClass}`.trim()}
      aria-label="Payment and guarantee information"
    >
      <img
        className="trust-money-back"
        src="/images/asset-2.webp"
        width={287}
        height={105}
        alt="365-Day Money Back Guarantee"
        loading="lazy"
        decoding="async"
      />
      <img
        className="trust-ssl"
        src="/images/asset-3.webp"
        width={172}
        height={46}
        alt="SSL and Google Safe Browsing security logos"
        loading="lazy"
        decoding="async"
      />
      <img
        className="trust-secure"
        src="/images/asset-4.webp"
        width={250}
        height={250}
        alt="100% Secure Payment badge"
        loading="lazy"
        decoding="async"
      />
    </div>
  );
}

export default function App() {
  const [offerIsVisible, setOfferIsVisible] = useState(false);
  const [viewers, setViewers] = useState(335);
  const [activePolicy, setActivePolicy] = useState<PolicyKey | null>(null);
  const offerPlayerRef = useRef<VTurbPlayerElement | null>(null);
  const checkoutNavigationStartedRef = useRef(false);

  const { todayDate, footerYear } = useMemo(() => {
    const now = new Date();
    return {
      todayDate: now.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      footerYear: String(now.getFullYear()),
    };
  }, []);

  useEffect(() => {
    initializeMetaPixelIfNeeded();
  }, []);

  useEffect(() => {
    const offerPlayer = offerPlayerRef.current;
    if (!offerPlayer) return;

    let revealed = false;
    const revealDelayedOffer = () => {
      if (revealed) return;
      revealed = true;
      setOfferIsVisible(true);
    };

    const handlePlayerReady = () => {
      offerPlayer.onTime?.(OFFER_REVEAL_SECONDS, revealDelayedOffer, {
        once: true,
      });
      if (Number(offerPlayer.currentTime) >= OFFER_REVEAL_SECONDS) {
        revealDelayedOffer();
      }
    };

    const handleTimeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ time?: number }>;
      if (Number(customEvent.detail?.time) >= OFFER_REVEAL_SECONDS) {
        revealDelayedOffer();
      }
    };

    offerPlayer.addEventListener('player:ready', handlePlayerReady);
    offerPlayer.addEventListener('video:timeupdate', handleTimeUpdate);

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${VTURB_PLAYER_SCRIPT_SRC}"]`,
    );
    if (!existingScript) {
      const script = document.createElement('script');
      script.src = VTURB_PLAYER_SCRIPT_SRC;
      script.async = true;
      document.head.appendChild(script);
    }

    return () => {
      offerPlayer.removeEventListener('player:ready', handlePlayerReady);
      offerPlayer.removeEventListener('video:timeupdate', handleTimeUpdate);
    };
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setViewers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(368, Math.max(318, prev + delta));
      });
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!activePolicy) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActivePolicy(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activePolicy]);

  const handleCheckoutClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
  ) => {
    const queued = trackMetaCheckoutClick();
    if (!queued || event.defaultPrevented) return;
    if (
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.currentTarget.target === '_blank'
    ) {
      return;
    }
    event.preventDefault();
    if (checkoutNavigationStartedRef.current) return;
    checkoutNavigationStartedRef.current = true;
    const targetHref = event.currentTarget.href;
    window.setTimeout(() => window.location.assign(targetHref), 250);
  };

  const delayedOfferAttr = offerIsVisible ? undefined : '';

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Top Notice Bar */}
      <div className="bg-[#09090B] text-white py-2.5 px-4 text-center border-b border-zinc-800">
        <a
          href="#offer-box"
          className="inline-flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1 text-xs sm:text-sm font-medium tracking-wide hover:text-zinc-300 transition-colors"
        >
          <span className="font-bold text-white tracking-wider uppercase">
            ⚠️ NOTICE:
          </span>
          <span className="text-zinc-200">
            The content on this page is extremely sensitive and may be removed
            at midnight on{' '}
            <span
              id="today-date"
              className="font-semibold text-white tabular-nums underline decoration-white/75 underline-offset-4"
            >
              {todayDate}
            </span>
            .
          </span>
        </a>
      </div>

      {/* Hero VSL Showcase */}
      <section id="vsl-hero-section" className="py-8 sm:py-12 px-4">
        <div
          id="vsl-hero-card"
          className="mx-auto max-w-[980px] rounded-2xl bg-white px-5 py-7 sm:px-10 sm:py-10 border-2 border-black shadow-[0_24px_70px_-20px_rgba(0,0,0,0.16)] relative overflow-hidden"
        >
          <div className="absolute top-0 inset-x-0 h-1.5 bg-black" />
          <div className="text-center mb-3">
            <span className="inline-block bg-black text-white px-3 py-1 rounded-sm text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em]">
              Stop Ending Up In The Friend Zone
            </span>
          </div>
          <h1 className="font-display text-center text-3xl sm:text-5xl font-bold leading-[1.08] tracking-tight text-black max-w-4xl mx-auto">
            Win Women Over{' '}
            <span className="italic font-semibold bg-black text-white px-2.5 py-0.5 rounded-sm">
              Naturally
            </span>
            —Without Looks, Money, or Memorized Lines
          </h1>
          <p className="mt-3.5 text-center text-base sm:text-lg text-zinc-600 max-w-2xl mx-auto leading-relaxed">
            Discover{' '}
            <span className="font-semibold text-black">The Attraction Code</span>
            : a three-phase flirting method to talk confidently, create real
            chemistry, and recognize mutual interest.
          </p>

          {/* VTurb SmartPlayer */}
          <div id="vsl-player-area" className="mt-6">
            <div
              id="vsl-player-frame"
              className="w-full rounded-xl overflow-hidden border-2 border-black bg-black shadow-[0_24px_60px_-15px_rgba(0,0,0,0.35)]"
            >
              <vturb-smartplayer
                ref={offerPlayerRef}
                id="vid-6b048f66c7ae969980aa8c6d"
              >
                <div className="vturb-player-placeholder" />
              </vturb-smartplayer>
            </div>
          </div>

          {/* Early checkout CTA: visible immediately, before the 01:43 offer reveal. */}
          <div className="early-cta-container mt-5 mx-auto" id="early-checkout-cta">
            <a
              data-checkout-link=""
              href={CHECKOUT_URL}
              onClick={handleCheckoutClick}
              className="early-cta-button"
              aria-label="Get the Method for Just $7.97"
            >
              <span>Get the Method for Just $7.97</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>

          {/* Live Viewer Counter */}
          <div className="mt-4 flex justify-center">
            <div className="inline-flex items-center gap-2.5 rounded-md border border-black bg-[#FAFAFA] px-4 py-1.5 text-xs sm:text-sm font-medium text-zinc-700 shadow-xs">
              <span
                className="h-2.5 w-2.5 rounded-full bg-green-500 shrink-0"
                aria-hidden="true"
              />
              <span>
                <span
                  id="viewer-count"
                  className="font-bold text-black tabular-nums"
                >
                  {viewers}
                </span>{' '}
                people are watching now
              </span>
            </div>
          </div>

          {/* Bundle Image + CTA */}
          <div
            data-delayed-offer={delayedOfferAttr}
            className="mt-7 grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
          >
            <div className="md:col-span-5">
              <div className="rounded-xl border-2 border-black bg-[#09090B] overflow-hidden shadow-[0_14px_32px_-12px_rgba(0,0,0,0.3)]">
                <img
                  id="product-image-master"
                  width={1500}
                  height={844}
                  loading="lazy"
                  decoding="async"
                  src="/images/asset-1.webp"
                  alt="The Attraction Code complete package with tablet guide, audio breakdown, and 3 bonus books"
                  className="w-full h-auto block"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="md:col-span-7 flex flex-col justify-center">
              <a
                data-checkout-link=""
                href={CHECKOUT_URL}
                onClick={handleCheckoutClick}
                className="w-full py-4 px-7 rounded-md bg-black hover:bg-zinc-800 text-white font-bold text-base sm:text-lg tracking-wide transition-colors cursor-pointer shadow-[0_14px_30px_-8px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2.5 whitespace-nowrap"
              >
                <span>Unlock Instant Access — Only $7.97</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
              <PaymentTrustRow />
              <div className="mt-3 flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-xs font-medium text-zinc-600">
                <span className="text-black font-semibold">
                  365-Day Guarantee
                </span>
                <span aria-hidden="true" className="text-zinc-300">
                  ·
                </span>
                <span>3 Free Bonuses ($63 Value)</span>
                <span aria-hidden="true" className="text-zinc-300">
                  ·
                </span>
                <span>Instant Digital Access</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comments & 3 Free Bonuses */}
      <section className="bg-[#FAFAFA] text-black py-12 sm:py-16 px-4 border-t border-zinc-200">
        <div className="mx-auto max-w-[920px]">
          <div className="text-center max-w-2xl mx-auto mb-7">
            <span className="inline-block bg-black text-white px-3 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              Verified Member Discussion
            </span>
            <h2 className="font-display text-2xl sm:text-4xl font-bold text-black leading-tight mb-2.5">
              See Why Men Are Saying This Method Changed Everything
            </h2>
            <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
              From breaking out of the friend zone to flirting naturally without
              looking desperate, look at what happens when you stop guessing and
              apply a clear three-phase approach:
            </p>
          </div>
          <div className="mx-auto max-w-[560px] rounded-xl border-2 border-black bg-white p-2.5 sm:p-3.5 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.14)]">
            <img
              width={1209}
              height={1301}
              loading="lazy"
              decoding="async"
              src="/images/asset-5.webp"
              alt="Member comments from Oliver M., Marcus T., and Ryan C."
              className="w-full h-auto rounded-lg block"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="mt-12 mx-auto max-w-[920px] space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="relative rounded-xl border-2 border-black bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-black" />
                <div className="bonus-image-frame mb-4 rounded-lg bg-[#09090B] border border-zinc-200 p-3 h-64 flex items-center justify-center overflow-hidden">
                  <img
                    width={206}
                    height={521}
                    loading="lazy"
                    decoding="async"
                    src="/images/asset-6.webp"
                    alt="Bonus 1: The Code to Escape the Friend Zone"
                    className="bonus-image-art block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="inline-flex items-center bg-black text-white px-2.5 py-0.5 rounded-sm mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                  Bonus #1
                </div>
                <h3 className="font-display text-xl font-bold text-black leading-snug mb-2.5">
                  THE CODE TO ESCAPE THE FRIEND ZONE
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Stop being seen as just a friend! Discover how to show
                  romantic interest confidently, recognize attraction, and
                  create opportunities for something more.
                </p>
              </div>

              <div className="relative rounded-xl border-2 border-black bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-black" />
                <div className="bonus-image-frame mb-4 rounded-lg bg-[#09090B] border border-zinc-200 p-3 h-64 flex items-center justify-center overflow-hidden">
                  <img
                    width={194}
                    height={485}
                    loading="lazy"
                    decoding="async"
                    src="/images/asset-7.webp"
                    alt="Bonus 2: The Magnetic Attraction Blueprint"
                    className="bonus-image-art block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="inline-flex items-center bg-black text-white px-2.5 py-0.5 rounded-sm mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                  Bonus #2
                </div>
                <h3 className="font-display text-xl font-bold text-black leading-snug mb-2.5">
                  THE MAGNETIC ATTRACTION BLUEPRINT
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Discover how to build natural confidence, spark attraction,
                  and become more charismatic without changing who you are.
                </p>
              </div>

              <div className="relative rounded-xl border-2 border-black bg-white p-6 shadow-sm overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-1.5 bg-black" />
                <div className="bonus-image-frame mb-4 rounded-lg bg-[#09090B] border border-zinc-200 p-3 h-64 flex items-center justify-center overflow-hidden">
                  <img
                    width={183}
                    height={449}
                    loading="lazy"
                    decoding="async"
                    src="/images/asset-8.webp"
                    alt="Bonus 3: The Irresistible Texting Formula"
                    className="bonus-image-art block"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="inline-flex items-center bg-black text-white px-2.5 py-0.5 rounded-sm mb-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.14em]">
                  Bonus #3
                </div>
                <h3 className="font-display text-xl font-bold text-black leading-snug mb-2.5">
                  THE IRRESISTIBLE TEXTING FORMULA
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Never run out of things to say! Learn how to send engaging
                  messages, keep conversations exciting, and turn mutual
                  interest into real dates.
                </p>
              </div>
            </div>

            <div
              data-delayed-offer={delayedOfferAttr}
              className="rounded-xl bg-[#09090B] border-2 border-black text-white px-6 py-5 text-center shadow-[0_14px_35px_-10px_rgba(0,0,0,0.3)]"
            >
              <p className="font-mono text-xs sm:text-sm uppercase tracking-[0.18em] text-zinc-300 tabular-nums">
                TOTAL BONUS VALUE:{' '}
                <span className="line-through text-zinc-500">$63.00</span>
              </p>
              <p className="font-display text-xl sm:text-2xl font-bold text-white mt-1">
                TODAY: 100% FREE WITH THE ATTRACTION CODE!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Phase Method & Core Lessons */}
      <section className="bg-white text-black py-12 sm:py-16 px-4 border-t border-zinc-200">
        <div className="mx-auto max-w-[960px]">
          <div className="max-w-2xl mx-auto text-center mb-10">
            <span className="inline-block bg-black text-white px-3 py-0.5 rounded-sm text-[11px] font-bold uppercase tracking-[0.2em] mb-3">
              The 3-Phase Method
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-black leading-tight mb-3">
              Balance Lightness, Interest &amp; Respect at the Exact Right
              Moment
            </h2>
            <p className="text-zinc-600 text-base leading-relaxed">
              Show interest too early and she pulls back. Hide your intentions
              completely and you stay in the friend zone. The Attraction Code
              replaces guesswork and rehearsed lines with three simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            <div className="relative rounded-xl border-2 border-black bg-white p-6 flex flex-col justify-between shadow-xs">
              <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-lg bg-black" />
              <div>
                <span className="inline-block bg-black text-white font-mono text-[11px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm mb-3">
                  Phase 01
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-black mb-2">
                  Natural Opening &amp; Lightness
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Start conversations smoothly—even if you are naturally shy or
                  quiet—without rehearsed lines or awkward tension.
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-zinc-200 text-xs text-zinc-500 font-medium">
                Helps you stop overthinking and feel calm and present.
              </p>
            </div>

            <div className="relative rounded-xl border-2 border-black bg-white p-6 flex flex-col justify-between shadow-xs">
              <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-lg bg-black" />
              <div>
                <span className="inline-block bg-black text-white font-mono text-[11px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm mb-3">
                  Phase 02
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-black mb-2">
                  The Roller Coaster Dynamic
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Use light humor, unexpected questions, and sincere compliments
                  to create surprise, warmth, and emotional momentum.
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-zinc-200 text-xs text-zinc-500 font-medium">
                Separates memorable flirting from polite, forgettable small
                talk.
              </p>
            </div>

            <div className="relative rounded-xl border-2 border-black bg-white p-6 flex flex-col justify-between shadow-xs">
              <div className="absolute top-0 inset-x-0 h-1.5 rounded-t-lg bg-black" />
              <div>
                <span className="inline-block bg-black text-white font-mono text-[11px] font-bold uppercase tracking-[0.18em] px-2 py-0.5 rounded-sm mb-3">
                  Phase 03
                </span>
                <h3 className="font-display text-xl sm:text-2xl font-bold text-black mb-2">
                  Calibration &amp; Clear Intent
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Recognize signs of mutual interest, respect boundaries,
                  communicate your intentions clearly, and ask her out with
                  confidence.
                </p>
              </div>
              <p className="mt-4 pt-3 border-t border-zinc-200 text-xs text-zinc-500 font-medium">
                Eliminates the friend zone without pressure or neediness.
              </p>
            </div>
          </div>

          <div className="rounded-xl border-2 border-black bg-[#09090B] text-white p-6 sm:p-8 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 pb-4 border-b border-zinc-800">
              <h3 className="font-display text-2xl font-bold text-white">
                What You Discover Inside
              </h3>
              <p className="text-xs sm:text-sm italic font-medium text-zinc-300">
                No fake persona required — just confident communication.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="flex items-start gap-3.5">
                <span className="font-display text-xl font-bold text-white shrink-0 tabular-nums">
                  01.
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    Start Conversations Naturally—Even If You’re Shy
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                    Open warm, effortless conversations anywhere without relying
                    on memorized scripts or forcing an extroverted personality.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-display text-xl font-bold text-white shrink-0 tabular-nums">
                  02.
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    Use Humor &amp; Spontaneity Without Seeming Forced
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                    Bring lightness, playful teasing, and genuine curiosity into
                    any dialogue so she looks forward to every reply.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-display text-xl font-bold text-white shrink-0 tabular-nums">
                  03.
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    Recognize Signs of Interest &amp; Respect Boundaries
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                    Recognize when interest is mutual—and when to adjust—so
                    interactions feel comfortable and respectful.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-display text-xl font-bold text-white shrink-0 tabular-nums">
                  04.
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    Eliminate Insecurity &amp; Approval-Seeking Habits
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                    Stop agreeing to everything, over-explaining, or hiding your
                    true personality out of fear of saying the wrong thing.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <span className="font-display text-xl font-bold text-white shrink-0 tabular-nums">
                  05.
                </span>
                <div>
                  <h4 className="text-sm sm:text-base font-semibold text-white">
                    Show Clear Interest &amp; Ask Her Out Smoothly
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-0.5 leading-relaxed">
                    Bridge the gap between friendly conversation and a real date
                    confidently, without making things awkward.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objections & Social Proof */}
      <section className="bg-[#FAFAFA] text-black py-12 sm:py-16 px-4 border-t border-zinc-200">
        <div className="mx-auto max-w-[960px] space-y-10">
          <div>
            <h2 className="font-display text-center text-2xl sm:text-4xl font-bold text-black mb-6">
              Even If You’re Thinking...
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="rounded-xl border border-zinc-300 bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-display text-xl font-bold text-black pb-2 mb-2.5 border-b-2 border-black">
                  “But I’m shy.”
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  You do not have to become the loudest or most outgoing guy in
                  the room. The Attraction Code works with your natural calm
                  temperament—teaching you how to communicate with quiet
                  assurance.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-300 bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-display text-xl font-bold text-black pb-2 mb-2.5 border-b-2 border-black">
                  “I don’t know what to say.”
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  That is exactly why learning the structure of engaging
                  conversation changes everything. Once you know the three
                  phases, you never freeze up searching for clever lines.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-300 bg-white p-5 sm:p-6 shadow-xs">
                <h3 className="font-display text-xl font-bold text-black pb-2 mb-2.5 border-b-2 border-black">
                  “What if I am rejected?”
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Rejection happens in life—but this method eliminates
                  unnecessary guesswork and unforced mistakes. You also learn to
                  handle interactions with composure, so one conversation does
                  not undermine your self-confidence.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
            <figure className="rounded-xl border border-zinc-300 bg-white p-6 flex flex-col justify-between shadow-xs">
              <blockquote className="text-zinc-700 text-sm sm:text-[15px] leading-relaxed mb-4">
                “I always thought I needed better jokes or a louder personality.
                Learning the three-phase timing completely changed how I talk.
                Last Friday a conversation at a bookstore turned into a two-hour
                coffee date—and she asked when we were meeting again.”
              </blockquote>
              <figcaption className="pt-3 border-t border-zinc-200 text-xs text-zinc-500">
                <span className="font-bold bg-black text-white px-2 py-0.5 rounded-sm">
                  Daniel M., 34
                </span>
                <span aria-hidden="true" className="mx-2 text-zinc-300">
                  ·
                </span>
                <span>
                  Software Engineer · Used to freeze up on first dates
                </span>
              </figcaption>
            </figure>

            <figure className="rounded-xl border border-zinc-300 bg-white p-6 flex flex-col justify-between shadow-xs">
              <blockquote className="text-zinc-700 text-sm sm:text-[15px] leading-relaxed mb-4">
                “I used to agree with everything just to avoid conflict, and
                women always saw me as the safe friend. The roller-coaster
                framework and Bonus #1 helped me express real interest
                respectfully. The shift in how she responded was immediate.”
              </blockquote>
              <figcaption className="pt-3 border-t border-zinc-200 text-xs text-zinc-500">
                <span className="font-bold bg-black text-white px-2 py-0.5 rounded-sm">
                  Lucas R., 28
                </span>
                <span aria-hidden="true" className="mx-2 text-zinc-300">
                  ·
                </span>
                <span>
                  Architect · Escaped a 6-month friend-zone stalemate
                </span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* Focused Offer Stack */}
      <section
        id="offer-box"
        data-delayed-offer={delayedOfferAttr}
        className="bg-white text-black py-12 sm:py-16 px-4 border-t border-zinc-200"
      >
        <div className="mx-auto max-w-[960px]">
          <div className="rounded-2xl border-2 border-black bg-white p-6 sm:p-10 shadow-[0_28px_70px_-20px_rgba(0,0,0,0.2)] relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-2 bg-black" />
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5">
                <div className="rounded-xl border-2 border-black bg-[#09090B] overflow-hidden shadow-[0_18px_40px_-14px_rgba(0,0,0,0.35)]">
                  <img
                    width={1500}
                    height={844}
                    loading="lazy"
                    decoding="async"
                    src="/images/asset-1.webp"
                    alt="The Attraction Code complete package with tablet guide, audio breakdown, and 3 bonus books"
                    className="w-full h-auto block"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>
              <div className="lg:col-span-7 space-y-5">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-zinc-600 mb-1.5">
                    Not $97 · Not $67 · Not $47
                  </p>
                  <h2 className="font-display text-3xl sm:text-4xl font-bold text-black leading-tight">
                    Get Instant Access + 3 Free Bonuses ($63.00 Value)
                  </h2>
                </div>

                <div className="space-y-2.5 rounded-xl border border-zinc-300 bg-[#FAFAFA] p-4 text-sm">
                  <div className="flex items-center justify-between gap-3 py-1 border-b border-zinc-200">
                    <span className="text-zinc-800">
                      <strong className="text-black">Bonus #1:</strong> The Code
                      to Escape the Friend Zone
                    </span>
                    <span className="font-mono text-xs shrink-0 tabular-nums">
                      <span className="text-zinc-400 line-through mr-1.5">
                        $21.00
                      </span>
                      <strong className="bg-black text-white px-1.5 py-0.5 rounded-sm">
                        FREE
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1 border-b border-zinc-200">
                    <span className="text-zinc-800">
                      <strong className="text-black">Bonus #2:</strong> The
                      Magnetic Attraction Blueprint
                    </span>
                    <span className="font-mono text-xs shrink-0 tabular-nums">
                      <span className="text-zinc-400 line-through mr-1.5">
                        $21.00
                      </span>
                      <strong className="bg-black text-white px-1.5 py-0.5 rounded-sm">
                        FREE
                      </strong>
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 py-1">
                    <span className="text-zinc-800">
                      <strong className="text-black">Bonus #3:</strong> The
                      Irresistible Texting Formula
                    </span>
                    <span className="font-mono text-xs shrink-0 tabular-nums">
                      <span className="text-zinc-400 line-through mr-1.5">
                        $21.00
                      </span>
                      <strong className="bg-black text-white px-1.5 py-0.5 rounded-sm">
                        FREE
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                  <div>
                    <p className="text-xs text-zinc-600 uppercase tracking-wider font-semibold">
                      One-Time Investment
                    </p>
                    <div className="flex items-baseline gap-3">
                      <span className="font-display text-2xl text-zinc-400 line-through tabular-nums">
                        $97.00
                      </span>
                      <span className="font-display text-5xl font-bold text-black tabular-nums">
                        $7.97
                      </span>
                    </div>
                  </div>
                  <a
                    data-checkout-link=""
                    href={CHECKOUT_URL}
                    onClick={handleCheckoutClick}
                    className="sm:flex-1 py-4 px-6 rounded-md bg-black hover:bg-zinc-800 text-white font-bold text-base sm:text-lg tracking-wide transition-colors cursor-pointer shadow-[0_14px_30px_-8px_rgba(0,0,0,0.35)] flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <span>Get Instant Access — $7.97</span>
                    <span aria-hidden="true">&rarr;</span>
                  </a>
                </div>

                <PaymentTrustRow extraClass="offer-trust-row" />

                <div className="pt-4 border-t border-zinc-200 text-xs sm:text-sm text-zinc-700">
                  <p className="leading-relaxed">
                    <strong className="text-black">
                      365-Day Money-Back Guarantee:
                    </strong>{' '}
                    Try The Attraction Code risk-free for a full year. If your
                    conversations do not feel noticeably more natural and
                    confident, request a 100% refund anytime within 365 days.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#09090B] border-t border-zinc-800 text-zinc-300 py-9 px-4">
        <div className="mx-auto max-w-[960px] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm">
          <p className="text-zinc-400">
            &copy; <span id="footer-year">{footerYear}</span> The Attraction
            Code · Educational Communication Training
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 font-medium text-zinc-300">
            <button
              type="button"
              data-policy="faqs"
              onClick={() => setActivePolicy('faqs')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQs
            </button>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <button
              type="button"
              data-policy="refund"
              onClick={() => setActivePolicy('refund')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              365-Day Refund Policy
            </button>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <button
              type="button"
              data-policy="privacy"
              onClick={() => setActivePolicy('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <span aria-hidden="true" className="text-zinc-600">
              ·
            </span>
            <button
              type="button"
              data-policy="support"
              onClick={() => setActivePolicy('support')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Support
            </button>
          </div>
        </div>
      </footer>

      {/* Policy Modal */}
      <div
        id="policy-modal"
        className={`${activePolicy ? 'flex' : 'hidden'} fixed inset-0 z-50 items-center justify-center bg-black/75 backdrop-blur-xs p-4`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-modal-title"
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            setActivePolicy(null);
          }
        }}
      >
        <div className="w-full max-w-lg rounded-xl bg-white text-black shadow-2xl border-2 border-black overflow-hidden">
          <div className="flex items-center justify-between bg-[#09090B] px-6 py-4 text-white border-b border-zinc-800">
            <h3
              id="policy-modal-title"
              className="font-display text-2xl font-bold text-white"
            >
              {activePolicy ? POLICY_TITLES[activePolicy] : ''}
            </h3>
            <button
              id="policy-close-top"
              type="button"
              aria-label="Close modal"
              onClick={() => setActivePolicy(null)}
              className="p-1.5 rounded hover:bg-white/15 transition-colors cursor-pointer text-lg leading-none"
            >
              &times;
            </button>
          </div>
          <div id="policy-modal-body" className="p-6">
            {activePolicy && <PolicyContent policyKey={activePolicy} />}
          </div>
          <div className="border-t border-zinc-200 bg-[#FAFAFA] px-6 py-3 flex justify-end">
            <button
              id="policy-close-btn"
              type="button"
              onClick={() => setActivePolicy(null)}
              className="px-5 py-2 rounded-md bg-black hover:bg-zinc-800 text-white text-sm font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
