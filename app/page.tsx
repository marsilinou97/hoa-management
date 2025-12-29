import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">HOA Hub</h1>
          </div>
          <div>
            <SignedOut>
              <SignInButton mode="modal">
                <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
                  Sign In
                </button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <div className="flex items-center gap-4">
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Dashboard
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            </SignedIn>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="mb-4 text-5xl font-bold tracking-tight">
          Modern HOA Management
        </h1>
        <p className="mb-8 max-w-2xl text-xl text-gray-600">
          Affordable, simple, and powerful software for small to medium
          homeowners associations. Manage units, dues, violations, and more.
        </p>

        <SignedOut>
          <div className="flex gap-4">
            <SignInButton mode="modal">
              <button className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700">
                Get Started
              </button>
            </SignInButton>
            <Link
              href="#features"
              className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              Learn More
            </Link>
          </div>
        </SignedOut>

        <SignedIn>
          <Link
            href="/dashboard"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
          >
            Go to Dashboard
          </Link>
        </SignedIn>

        {/* Features Preview */}
        <div id="features" className="mt-20 grid max-w-4xl gap-8 md:grid-cols-3">
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Unit Management</h3>
            <p className="text-sm text-gray-600">
              Track units, residents, and payment history all in one place.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Violations & Maintenance</h3>
            <p className="text-sm text-gray-600">
              Manage violations and maintenance requests with photo uploads.
            </p>
          </div>
          <div className="rounded-lg border p-6">
            <h3 className="mb-2 font-semibold">Communications</h3>
            <p className="text-sm text-gray-600">
              Send announcements and notifications to your community.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          &copy; 2025 HOA Hub. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
