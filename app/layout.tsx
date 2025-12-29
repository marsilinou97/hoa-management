import type { Metadata } from 'next'
import { ClerkProvider, SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import './globals.css'
import TRPCProvider from '@/app/_trpc/Provider'

export const metadata: Metadata = {
  title: 'HOA Management System',
  description: 'Comprehensive HOA management platform',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <TRPCProvider>
        <html lang="en">
          <body className="antialiased font-sans">
            <header className="flex justify-end items-center p-4 gap-4 h-16">
              <SignedOut>
                <SignInButton />
                <SignUpButton />
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </header>
            {children}
          </body>
        </html>
      </TRPCProvider>
    </ClerkProvider>
  )
}
