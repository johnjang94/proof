import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-navigation";

function AuthHeader() {
  return (
    <div className="sticky top-0 z-40 bg-black backdrop-blur border-b">
      <div className="mx-auto flex items-center justify-center">
        <Link
          href="/"
          aria-label="Go to home"
          className="inline-flex items-center gap-2"
        >
          <Image
            src="/sign-up-logo.png"
            alt="PROOF"
            width={150}
            height={150}
            className="py-5"
          />
        </Link>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const isAuthRoute =
    router.pathname === "/category/login" ||
    router.pathname.startsWith("/category/sign-up");

  const hideDesktopNav = isAuthRoute;
  const hideMobileNav = isAuthRoute;

  return (
    <>
      {!hideDesktopNav && <Navigation />}

      {isAuthRoute && <AuthHeader />}

      {!hideMobileNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white">
          <MobileNav />
        </div>
      )}

      <main className="pb-5 lg:pb-0">
        <Component {...pageProps} />
      </main>
    </>
  );
}
