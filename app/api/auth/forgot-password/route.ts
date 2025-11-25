import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Email required" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return NextResponse.json({ message: "If that email exists, we sent a link" });

    // Generate token
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 1000 * 60 * 10); // 10 mins

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expires,
      },
    });

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password/${token}`;

    // Send email
    await resend.emails.send({
      from: "Your App <no-reply@yourdomain.com>",
      to: email,
      subject: "Reset your password",
      html: `
        <p>Click the link to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link expires in 10 minutes.</p>
      `,
    });

    // In development return the token so the frontend can route immediately to the
    // reset page for faster testing. Never return tokens in production responses.
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json({ message: "Reset link sent", token });
    }

    return NextResponse.json({ message: "Reset link sent" });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
