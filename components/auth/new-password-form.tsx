'use client'

import { Form, FormControl, FormDescription, FormField ,FormItem, FormLabel, FormMessage } from "../ui/form"
import { AuthCard } from "./auth-card"
import { useForm } from "react-hook-form"
import { zodResolver } from '@hookform/resolvers/zod'
import { LoginSchema } from "@/types/login-schema"
import * as z from 'zod'
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import Link from "next/link"
import { emailSignIn } from "@/server/actions/email-signin"
import { useAction } from 'next-safe-action/hooks'
import { cn } from "@/lib/utils"
import { useState } from "react"
import { FormSuccess } from "./form-success"
import { FormError } from "./form-error"
import { NewPasswordSchema } from "@/types/new-password-schema"
import { newPassword } from "@/server/actions/new-password"

export const NewPasswordForm = () => {
  const form = useForm<z.infer<typeof NewPasswordSchema>>({
    resolver: zodResolver(NewPasswordSchema),
    defaultValues: {
      password: '',
    },
  })

  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")


  const {execute, status} = useAction(newPassword, {
    onSuccess(data){
      if(data?.error) setError(data.error)
      if(data?.success) setSuccess(data.success)
    }
  })

  const onSubmit = (values: z.infer<typeof NewPasswordSchema>) => {
    execute(values)
  }

  return(
    <AuthCard
      cardTitle="Enter new password"
      backButtonHref="/auth/login"
      backButtonLabel="Back to login"
      showSocials
    >
      <div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <FormField
                control={form.control}
                name="password"
                render={({field}) => (
                <FormItem>
                  <FormLabel>
                    Password
                  </FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      placeholder="******"
                      type='password' 
                      autoComplete="current-password"
                    />
                  </FormControl>
                  <FormDescription />
                  <FormMessage />
                </FormItem>
                )}
              />
              <FormSuccess message={success}/>
              <FormError message={error}/>
              <Button size={'sm'} variant={'link'} asChild>
                <Link href='/auth/reset'>
                  Forgot password?
                </Link>
              </Button>
            </div>
            <Button 
              type="submit" 
              className={cn(
                "w-full my-2",
                status === "executing" ? "animate-pulse" : ""
              )}
            >
              <Link href='#'>
                {'Reset password'}
              </Link>
            </Button>
          </form>
        </Form>
      </div>
    </AuthCard>
  )
}