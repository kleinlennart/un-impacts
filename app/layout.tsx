import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "UN Impacts",
    description: "What has the UN System achieved last year?",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>
                {children}
            </body>
        </html>
    );
}
