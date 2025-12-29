'use client'

import { use, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/nextjs'
import { Building2, Check, X } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function InvitationAcceptancePage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = use(params)
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  })
  const [isAccepting, setIsAccepting] = useState(false)

  // TODO: Replace with actual tRPC query
  const invitation = null
  const isLoading = false

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAccepting(true)

    try {
      // TODO: Call tRPC mutation
      console.log('Accepting invitation:', { token, ...formData })

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to accept invitation:', error)
    } finally {
      setIsAccepting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Loading invitation...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Invitation expired
  if (invitation === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <X className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle>Invalid Invitation</CardTitle>
            <CardDescription>
              This invitation link is invalid, has expired, or has already been used.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/')}
            >
              Return Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Placeholder invitation data
  const invitationData = {
    community: {
      name: 'Oakwood Heights HOA',
    },
    email: 'user@example.com',
    isExpired: false,
    isAccepted: false,
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle>You're Invited!</CardTitle>
          <CardDescription>
            You've been invited to join <strong>{invitationData.community.name}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <SignedOut>
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                Sign in or create an account to accept this invitation
              </p>
              <SignUpButton mode="modal">
                <Button className="w-full">Create Account</Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button variant="outline" className="w-full">
                  Sign In
                </Button>
              </SignInButton>
            </div>
          </SignedIn>
            <form onSubmit={handleAccept} className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm">
                  <strong>Community:</strong> {invitationData.community.name}
                </p>
                <p className="text-sm">
                  <strong>Email:</strong> {invitationData.email}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="John"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isAccepting || !formData.firstName || !formData.lastName}
              >
                {isAccepting ? 'Accepting...' : 'Accept Invitation'}
              </Button>
            </form>
          </SignedIn>
        </CardContent>
      </Card>
    </div>
  )
}
