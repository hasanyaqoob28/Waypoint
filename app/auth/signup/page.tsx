import { auth } from "@/lib/auth"
import { AuthForm } from "@/components/auth-form"
import { headers } from "next/headers"
import { redirect } from "next/navigation"

export default async function SignupPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user) redirect("/")

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Create Account
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join Travelway to save your trips
          </p>
        </div>
        <AuthForm mode="sign-up" />
      </div>
    </div>
  )
}
