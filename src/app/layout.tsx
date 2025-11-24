import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Kočky Manager',
    description: 'Sprava koček',
    viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
}

import Providers from './providers'

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="cs">
            <body>
                <Providers>
                    {children}
                </Providers>
            </body>
        </html>
    )
}
