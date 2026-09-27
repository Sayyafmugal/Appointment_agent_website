import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AmbientBackground } from "@/components/effects/ambient-background";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Your Clinic Agent — Appointment Agent",
    template: "%s — Appointment Agent",
  },
  description:
    "Appointment management dashboard for Your Clinic Agent, powered by a live n8n automation for SMS, email, and Slack reminders.",
  openGraph: {
    title: "Your Clinic Agent — Appointment Agent",
    description:
      "A real appointment reminder dashboard backed by a live n8n automation — not a mockup.",
    type: "website",
    siteName: "Appointment Agent",
  },
  twitter: {
    card: "summary_large_image",
    title: "Your Clinic Agent — Appointment Agent",
    description:
      "A real appointment reminder dashboard backed by a live n8n automation — not a mockup.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full">
        <ThemeProvider>
          <QueryProvider>
            <TooltipProvider>
              <AmbientBackground />
              <div className="relative z-10">{children}</div>
              <Toaster position="top-right" richColors />
            </TooltipProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
