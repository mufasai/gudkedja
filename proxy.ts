import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

// import { updateSession } from "@/lib/supabase/proxy"

export async function proxy(request: NextRequest) {
  // Placeholder for any future logic if needed
  return NextResponse.next({
    request,
  })
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
