import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { AuthProvider } from "@/context/AuthContext";
import { SocketProvider } from "@/context/SocketContext";
import { Toaster } from "sonner";
import GlobalNotificationHandler from "@/components/PusherNotificationListener";
import ActiveTracker from "@/components/ActiveTracker";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Play & Date",
  description: "Play Your Fevourite Game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${bricolage.variable} ${bricolage.variable} antialiased`}
      >
        <AuthProvider>
          <SocketProvider>
            {/* 1. The Toaster (The UI part) */}
            <Toaster
              position="top-center"
              richColors
              toastOptions={{
                style: { zIndex: 9999 }, // Ensure it's above home page elements
              }}
            />

            {/* 2. The Logic (The Listener part) */}
            <GlobalNotificationHandler />
            <ActiveTracker />
            {children}
            <BottomNav />
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
