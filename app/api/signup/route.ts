import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { name, email, password } = await req.json()

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "User exists" }, { status: 400 })

  const hashed = await bcrypt.hash(password, 10)

  // Generate a random avatar if none provided
  const avatarUrl = `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}`;

  await prisma.user.create({
    data: { 
      name, 
      email, 
      password: hashed,
      image: avatarUrl
    }
  })

  return NextResponse.json({ success: true })
}
