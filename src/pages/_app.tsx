import "@/styles/globals.css";
import type { AppProps } from "next/app";

import Navigation from "@/components/navigation";
import MobileNav from "@/components/mobile-navigation";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <div className="app-container">
        <Navigation />

        <main className="pb-24 lg:pb-0">
          <Component {...pageProps} />
        </main>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white">
        <MobileNav />
      </div>
    </>
  );
}
