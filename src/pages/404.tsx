import Image from "next/image";
import { useRouter } from "next/router";

export default function Custom404() {
  const router = useRouter();

  const handleGoBack = () => {
    if (document.referrer && document.referrer !== window.location.href) {
      router.back();
    } else {
      void router.push("/");
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden px-6 py-10 text-slate-900">
      {/* soft blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-16 -top-12 h-64 w-64 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute right-0 top-20 h-56 w-56 rounded-full bg-sky-100 blur-3xl" />
        <div className="absolute bottom-0 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-amber-100 blur-3xl" />
      </div>

      <div className="mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2">
          <section className="max-w-xl">
            <div className="mb-8">
              <Image
                src="/logo.png"
                alt="PROOF"
                width={120}
                height={40}
                priority
              />
            </div>

            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Error 404
            </p>

            <h1 className="mb-5 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              It looks like you&#39;ve slid off to a dead end.
            </h1>

            <p className="mb-10 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              Let&#39;s go back to where you came from and get you back on
              track.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                onClick={handleGoBack}
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                Go Back
              </button>
            </div>
          </section>

          <section className="flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xl">
              <div className="relative rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-2xl backdrop-blur-sm">
                <div className="float-slow absolute -left-4 top-8 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm">
                  Wrong turn
                </div>

                <div className="mb-8 flex items-center justify-between">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600">
                    Trail Status
                  </div>
                  <div className="rounded-full bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-600">
                    Dead End
                  </div>
                </div>

                <div className="relative mx-auto mb-8 flex h-72 items-end justify-center overflow-hidden rounded-3xl bg-linear-to-b from-sky-50 to-emerald-50">
                  <div className="absolute left-8 top-10 h-6 w-16 rounded-full bg-white shadow-sm" />
                  <div className="absolute left-14 top-14 h-5 w-10 rounded-full bg-white/80" />
                  <div className="absolute right-10 top-12 h-6 w-16 rounded-full bg-white shadow-sm" />
                  <div className="absolute right-16 top-16 h-5 w-10 rounded-full bg-white/80" />

                  <div className="absolute bottom-0 h-24 w-full bg-slate-200" />
                  <div className="absolute bottom-0 h-24 w-56 rounded-t-full bg-slate-300" />

                  <div className="absolute bottom-24 right-16 flex flex-col items-center">
                    <div className="h-20 w-2 rounded-full bg-amber-700" />
                    <div className="absolute -right-8 top-4 rounded-xl bg-amber-100 px-4 py-2 text-xs font-bold text-amber-800 shadow-sm">
                      DEAD END
                    </div>
                  </div>

                  <div className="sled-sway absolute bottom-16 left-1/2 -translate-x-1/2">
                    <div className="relative">
                      <div className="absolute -top-8 left-6 h-8 w-8 rounded-full bg-orange-200" />
                      <div className="absolute -top-2 left-2 h-10 w-14 rounded-2xl bg-slate-800" />
                      <div className="h-5 w-24 rounded-full bg-emerald-500 shadow-md" />
                      <div className="mt-1 flex justify-between px-1">
                        <div className="h-1.5 w-10 rounded-full bg-slate-500" />
                        <div className="h-1.5 w-10 rounded-full bg-slate-500" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute left-14 top-24 text-xl">✨</div>
                  <div className="absolute right-16 top-24 text-lg">✦</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Suggestion
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Return home and pick a fresh route.
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Shortcut
                    </p>
                    <p className="text-sm font-medium text-slate-700">
                      Browse live projects instead.
                    </p>
                  </div>
                </div>
              </div>

              <div className="float-slow absolute -bottom-4 -right-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  PROOF
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  Back on track
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx>{`
        .float-slow {
          animation: float 4.5s ease-in-out infinite;
        }

        .sled-sway {
          animation: sway 3.2s ease-in-out infinite;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes sway {
          0%,
          100% {
            transform: translateX(-50%) rotate(-2deg);
          }
          50% {
            transform: translateX(calc(-50% + 10px)) rotate(3deg);
          }
        }
      `}</style>
    </main>
  );
}
