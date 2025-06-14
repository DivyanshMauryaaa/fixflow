import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ClientWrapper } from '@/components/client-wrapper';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' })

export const metadata: Metadata = {
    title: 'FixFlow',
    description: 'Your Development Workflow Assistant',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body
                    className={inter.className + " p-5"}
                    suppressHydrationWarning
                    cz-shortcut-listen="false">
                    <ThemeProvider
                        attribute="class"
                        defaultTheme="system"
                        enableSystem
                        disableTransitionOnChange
                    >
                        <ClientWrapper>
                            {children}
                        </ClientWrapper>
                    </ThemeProvider>
                </body>
            </html>
        </ClerkProvider>
    )
}