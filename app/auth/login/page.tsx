"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      let loginEmail = emailOrUsername

      // Disable console.log di production
      const isDev = process.env.NODE_ENV === 'development'

      if (isDev) {
        console.log("=== LOGIN DEBUG ===")
        console.log("Input:", emailOrUsername)
      }

      // Check if input is a username (not an email format)
      if (!emailOrUsername.includes("@")) {
        if (isDev) console.log("Detected as username, looking up email from database...")

        // Query database untuk get email berdasarkan username
        // Ini lebih aman karena tidak hardcode email di frontend
        const { data: pembinaData, error: pembinaError } = await supabase
          .from("data_pembina")
          .select("email, username, nama_lengkap")
          .eq("username", emailOrUsername)
          .single()

        if (isDev) {
          console.log("Query result:", pembinaData)
          console.log("Query error:", pembinaError)
        }

        if (pembinaError || !pembinaData?.email) {
          if (isDev) console.error("Username lookup failed:", pembinaError)
          throw new Error("Username tidak ditemukan. Hubungi admin untuk setup username Anda.")
        }

        loginEmail = pembinaData.email
        if (isDev) console.log("Found email from database:", loginEmail)
      } else {
        if (isDev) console.log("Detected as email, using directly")
      }

      if (isDev) console.log("Attempting login with email:", loginEmail)

      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (authError) {
        if (isDev) console.error("Auth error:", authError)
        throw new Error(authError.message)
      }

      if (isDev) console.log("Login successful!")
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Login gagal")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg shadow-lg p-8">
          {/* Logo/Header */}
          <div className="text-center mb-8">
            <div className="inline-block bg-primary rounded-full p-4 mb-4">
              <span className="text-3xl text-primary-foreground">⚜️</span>
            </div>
            <h1 className="text-2xl font-bold text-card-foreground mb-2">Portal GUDKEJA</h1>
            <p className="text-sm text-muted-foreground">Gugus Depan SDN Kedondong Sokaraja</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="emailOrUsername" className="text-sm font-medium">
                Username
              </Label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="Masukkan username"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1"
              />
            </div>

            {error && (
              <div className="p-3 bg-destructive/10 border border-destructive rounded text-sm text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Sedang login..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
