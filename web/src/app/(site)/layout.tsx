import { Suspense } from "react";
import { AuthSheet } from "@/components/auth/AuthSheet";
import { SessionProvider } from "@/components/auth/SessionProvider";
import { SignInFromUrl } from "@/components/auth/SignInFromUrl";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RevealObserver } from "@/components/motion/RevealObserver";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { Toast } from "@/components/ui/Toast";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <SessionProvider>
      <SiteHeader />
      <main id="main">{children}</main>
      <SiteFooter />
      <AuthSheet />
      <Toast />
      <RevealObserver />
      <SmoothScroll />
      <Suspense>
        <SignInFromUrl />
      </Suspense>
    </SessionProvider>
  );
}
