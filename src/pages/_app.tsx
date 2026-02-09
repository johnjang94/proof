import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-navigation";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  const hideDesktopNav = router.pathname === "/category/login/profile-login";

  const hideMobileNav =
    router.pathname === "/category/login/mobile/mobile-login" ||
    router.pathname === "/category/login/profile-login";

  return (
    <>
      {!hideDesktopNav && (
        <div className="hidden lg:block">
          <Navigation />
        </div>
      )}

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
