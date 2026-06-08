import { NextRequest, NextResponse } from "next/server"

export async function POST(_request: NextRequest) {
  const response = NextResponse.json({ success: true }, { status: 200 })

  // Delete the session cookie by setting maxAge to 0
  response.cookies.set("orkestrando_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })

  return response
}
