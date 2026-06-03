'use client'

import React, { useState } from 'react'
import { useStore } from '@/lib/store'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { GraduationCap, BookOpen, Users, CalendarDays, ClipboardCheck, MessageSquare, BarChart3, FolderOpen, Zap, ArrowRight, ChevronRight, Eye } from 'lucide-react'

export function LandingPage() {
  const { setActiveView } = useStore()

  const features = [
    { icon: GraduationCap, title: 'Smart Dashboard', desc: 'Real-time KPIs and analytics' },
    { icon: Users, title: 'User Management', desc: 'Complete CRUD for all roles' },
    { icon: CalendarDays, title: 'Scheduling', desc: 'Automated class scheduling' },
    { icon: ClipboardCheck, title: 'Attendance Tracking', desc: 'Digital attendance with reports' },
    { icon: BookOpen, title: 'Course Management', desc: 'Subjects, rooms, and classes' },
    { icon: MessageSquare, title: 'Messaging', desc: 'Built-in communication' },
    { icon: BarChart3, title: 'Reports & Analytics', desc: 'Custom reports and insights' },
    { icon: FolderOpen, title: 'Materials Hub', desc: 'Centralized document sharing' },
  ]


  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-8 w-8 text-emerald-600" />
            <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">Orkestrando</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => setActiveView('login')}>Sign In</Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setActiveView('login')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 lg:py-40">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="mb-6 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200" variant="outline">
              <Zap className="h-3 w-3 mr-1" /> Academic Management Reimagined
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6">
              Orchestrate Your <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Academic World</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              A comprehensive platform for coordinators, professors, and students to manage every aspect of academic life.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 h-12 text-base" onClick={() => setActiveView('login')}>
                Start Free Trial <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="px-8 h-12 text-base" onClick={() => setActiveView('login')}>
                <Eye className="mr-2 h-4 w-4" /> Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Powerful features for modern academic institutions</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <Card key={i} className="shadow-sm hover:shadow-md transition-shadow border">
                <CardHeader>
                  <div className="rounded-lg bg-emerald-50 w-12 h-12 flex items-center justify-center mb-2">
                    <f.icon className="h-6 w-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg">{f.title}</CardTitle>
                </CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">{f.desc}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Transform Your Institution?</h2>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">Join hundreds of schools using Orkestrando.</p>
          <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 h-12 text-base font-semibold" onClick={() => setActiveView('login')}>
            Get Started Today <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-background border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-emerald-600" />
            <span className="font-semibold">Orkestrando</span>
          </div>
          <p className="text-sm text-muted-foreground">&copy; 2025 Orkestrando. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export function LoginPage() {
  const { login, register, isLoading, setActiveView } = useStore()
  const { toast } = useToast()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [role, setRole] = useState('STUDENT')
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (mode === 'login') {
        await login(email, password)
        toast({ title: 'Welcome back!', description: 'You have been logged in.' })
      } else {
        if (password !== confirmPassword) { setError('Passwords do not match'); return }
        if (password.length < 6) { setError('Password must be at least 6 characters'); return }
        await register({ email, password, firstName, lastName, role })
        toast({ title: 'Account created!', description: 'Welcome to Orkestrando.' })
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative flex flex-col items-center justify-center p-12 text-white">
          <GraduationCap className="h-16 w-16 mb-6 opacity-90" />
          <h1 className="text-4xl font-bold mb-4">Orkestrando</h1>
          <p className="text-lg text-emerald-100 text-center max-w-md">
            Your comprehensive academic management platform. Coordinate, teach, and learn — all in one place.
          </p>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <Card className="w-full max-w-md shadow-lg border-0 sm:border">
          <CardHeader className="text-center pb-2">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-4">
              <GraduationCap className="h-8 w-8 text-emerald-600" />
              <span className="text-xl font-bold">Orkestrando</span>
            </div>
            <CardTitle className="text-2xl">{mode === 'login' ? 'Welcome back' : 'Create account'}</CardTitle>
            <CardDescription>
              {mode === 'login' ? 'Enter your credentials to access your account' : 'Fill in the details to get started'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>First Name</Label><Input placeholder="John" value={firstName} onChange={e => setFirstName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Last Name</Label><Input placeholder="Doe" value={lastName} onChange={e => setLastName(e.target.value)} required /></div>
                  </div>
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STUDENT">Student</SelectItem>
                        <SelectItem value="PROFESSOR">Professor</SelectItem>
                        <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
              <div className="space-y-2"><Label>Email</Label><Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required /></div>
              <div className="space-y-2"><Label>Password</Label><Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required /></div>
              {mode === 'register' && (
                <div className="space-y-2"><Label>Confirm Password</Label><Input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></div>
              )}
              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-md">{error}</p>}
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isLoading}>
                {isLoading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
              </Button>
            </form>
            <div className="mt-6 text-center text-sm">
              {mode === 'login' ? (
                <span className="text-muted-foreground">Don&apos;t have an account?{' '}
                  <button className="text-emerald-600 font-medium hover:underline" onClick={() => { setMode('register'); setError('') }}>Register</button>
                </span>
              ) : (
                <span className="text-muted-foreground">Already have an account?{' '}
                  <button className="text-emerald-600 font-medium hover:underline" onClick={() => { setMode('login'); setError('') }}>Sign In</button>
                </span>
              )}
            </div>
            <div className="mt-4 text-center">
              <button className="text-sm text-muted-foreground hover:text-foreground" onClick={() => setActiveView('landing')}>← Back to landing page</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
