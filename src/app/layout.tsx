import type { Metadata } from 'next';
import { Raleway } from 'next/font/google';
import './globals.css';
import { ClerkProvider } from '@clerk/nextjs';
import { ClientWrapper } from '@/components/client-wrapper';
import { ThemeProvider } from '@/components/theme-provider';

const raleway = Raleway({ subsets: ['latin'], weight: ['400', '700'], display: 'swap' })

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
                    className={raleway.className + " p-5"}
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