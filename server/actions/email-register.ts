'use server'

import { RegisterSchema } from '@/types/register-schema'
import { createSafeActionClient } from 'next-safe-action'
import bcrypt from 'bcrypt'
import { eq } from 'drizzle-orm'
import { db } from '..'
import { users } from '../schema'
import { generateEmailVerificationToken } from './tokens'
import { sendVerificationEmail } from './email'

const action = createSafeActionClient()

export const emailRegister = action(
  RegisterSchema, 
  async ({ email, password, name }) => {
    //  hashing password
  const hashedPassword = await bcrypt.hash(password, 10)
  console.log(hashedPassword)
  // check user
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, email), 
  })
  // check is user email is already in database then say its in use. if not then regiter it and send verificatiob
  if(existingUser){
    if(!existingUser.emailVerified){
      const verificationToken = await generateEmailVerificationToken(email);
      await sendVerificationEmail(
        verificationToken[0].email, 
        verificationToken[0].token
      )
      return { success: 'Email confirmation resent' }
    }
    return { error: "Email in use"}
  }

  await db.insert(users).values({
    email,
    name,
    password: hashedPassword,
  })
  const verificationToken = await generateEmailVerificationToken(email)

  await sendVerificationEmail(
    verificationToken[0].email, 
    verificationToken[0].token
  )
  return { success: 'Confirmation email sent'}
})
