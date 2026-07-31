import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://chillaah.github.io/workbee-dashboard/"),
  title: "Workbee Command Centre",
  description:
    "A secure operational dashboard for Workbee users, workforce demand, and platform activity.",
  applicationName: "Workbee Command Centre",
  keywords: ["Workbee", "dashboard", "workforce", "Sri Lanka"],
  openGraph: {
    title: "Workbee Command Centre",
    description: "People. Demand. Operations.",
    images: [{ url: "og.png", width: 1792, height: 909 }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Workbee Command Centre",
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
