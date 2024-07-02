'use server'

import { db } from ".."
import { eq } from "drizzle-orm"
import { emailTokens, passwordResetTokens, users } from "../schema"

export const getVerificationTokenByEmail = async (email: string) => {
  try {
    const verificationToken = await db.query.emailTokens.findFirst({
      where: eq(emailTokens.token, email),
    })
    return verificationToken
  }catch(error) {
    return {error: null}
  }
}

export const generateEmailVerificationToken = async (email: string) => {
  const token = crypto.randomUUID()
  const expires = new Date(new Date().getTime() + 3600 * 1000)

  const existingToken = await getVerificationTokenByEmail(email)

  if (existingToken){
    await db.delete(emailTokens).where(eq(emailTokens.id, existingToken.id))
  }
  const verificationToken = await db.insert(emailTokens).values({
    email,
    token,
    expires,
  }).returning()
  return verificationToken
}

export const newVerification = async (token: string) => {
  const existingToken = await getVerificationTokenByEmail(token)
  if (!existingToken) return { error: "Token not found" }
  const hasExpired = new Date(existingToken.expires) < new Date()

  if (hasExpired) return { error: "Token has expired" }

  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, existingToken.email),
  })
  if (!existingUser) return { error: "Email does not exist" }
  await db.update(users).set({
    emailVerified: new Date(),
    email: existingToken.email,
  })

  await db.delete(emailTokens).where(eq(emailTokens.id, existingToken.id))
  return { success: "Email Verified" }
}

export const getPasswordResetTokenByToken = async (token: string) => {
  try{
    const passwordResetToken = await db.query.passwordResetTokens.findFirst({
      where: eq(passwordResetTokens.token, token),
    })
    return passwordResetToken
  }catch {
    return { error: "Token not found" }
  }
}
