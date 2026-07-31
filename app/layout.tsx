import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chillaah.github.io/workbee-dashboard/"),
  title: "WorkBee Dashboard",
  description:
    "A secure operational dashboard for WorkBee users, workforce demand, and platform activity.",
  applicationName: "WorkBee Dashboard",
  keywords: ["WorkBee", "dashboard", "workforce", "Sri Lanka"],
  openGraph: {
    title: "WorkBee Dashboard",
    description: "People. Demand. Operations.",
    images: [{ url: "og.png", width: 1731, height: 909 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkBee Dashboard",
    description: "People. Demand. Operations.",
    images: ["og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
