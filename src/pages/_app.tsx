import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-navigation";

function AuthHeader() {
  return (
    <div className="sticky top-0 bg-white border-b z-50">
      <div className="mx-auto flex items-center justify-center">
        <Link
          href="/"
          aria-label="Go to home"
          className="inline-flex items-center gap-2"
        >
          <Image
            src="/logo.png"
            alt="PROOF"
            width={50}
            height={50}
            className="py-5"
          />
        </Link>
      </div>
    </div>
  );
}

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const authRoutes = ["/sign-up", "/welcome"];

  const isSignUpRoute = authRoutes.some((route) =>
    router.pathname.startsWith(route),
  );

  const isLoginRoute = router.pathname === "/login";

  const hideDesktopNav = isLoginRoute || isSignUpRoute;
  const hideMobileNav = isLoginRoute || isSignUpRoute;

  return (
    <>
      {!hideDesktopNav && <Navigation />}

      {isSignUpRoute && <AuthHeader />}

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
