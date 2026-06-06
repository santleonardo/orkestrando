import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { db } from '@/lib/db'

const DEFAULT_ORG_ID = 'org_1'

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, role, phone } = await request.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 })
    }

    // Create user via standard signUp
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: `${firstName} ${lastName}` },
      },
    })

    if (signUpError || !signUpData.user) {
      const msg = signUpError?.message || 'Erro ao criar conta'
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
      }
      console.error('signUp error:', msg)
      return NextResponse.json({ error: msg }, { status: 500 })
    }

    // Ensure the org exists
    await db.organization.upsert({
      where: { id: DEFAULT_ORG_ID },
      update: {},
      create: {
        id: DEFAULT_ORG_ID,
        name: 'Orkestrando',
        slug: 'orkestrando',
        settings: '{}',
      },
    })

    // Create profile row
    const profile = await db.profile.create({
      data: {
        user_id: signUpData.user.id,
        org_id: DEFAULT_ORG_ID,
        email,
        first_name: firstName,
        last_name: lastName,
        role: role || 'STUDENT',
        phone: phone || null,
      },
    })

    // Try to sign in — works only if email confirmation is disabled
    const { data: sessionData } = await supabase.auth.signInWithPassword({ email, password })

    return NextResponse.json({
      token: sessionData?.session?.access_token ?? null,
      user: profile,
      needsConfirmation: !sessionData?.session,
    }, { status: 201 })

  } catch (error: any) {
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email já cadastrado' }, { status: 409 })
    }
    console.error('Register error:', error)
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
