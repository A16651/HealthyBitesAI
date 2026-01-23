import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppProviders from '../components/AppProviders';
import AppShell from '../components/AppShell';

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

// Enhanced metadata for SEO and social sharing
export const metadata: Metadata = {
    title: "Food Doctor - Know What You Eat",
    description: "Scan barcodes or ingredients to detect allergens, understand additives, and make healthier choices instantly. Powered by AI for transparent food analysis.",
    keywords: ["food transparency", "ingredient analysis", "allergen detection", "nutrition", "health", "food safety"],
    authors: [{ name: "Food Doctor Team" }],
    openGraph: {
        title: "Food Doctor - Know What You Eat",
        description: "AI-powered food transparency platform for healthier choices",
        type: "website",
    },
};

// Responsive viewport configuration for all devices
export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5, // Allow zoom for accessibility
    userScalable: true,
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
    ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta name="format-detection" content="telephone=no" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            </head>
            <body className={inter.className} suppressHydrationWarning>
                <AppProviders>
                    <AppShell>{children}</AppShell>
                </AppProviders>
            </body>
        </html>
    );
}
