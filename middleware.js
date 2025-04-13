// middleware.js
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value
        },
       set(name, value, options) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name, options) {
            request.cookies.set({
                name,
                value: '',
                ...options,
            })
             response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
            response.cookies.set({
                name,
                value: '',
                ...options,
            })
        },
      },
    }
  )

    const { data: { user } } = await supabase.auth.getUser();

    if (user) { //if user exists, then we just return
        return response;
    }

  // If user is not logged in and the request is not for allowed pages, redirect to base route (/)
  if (!user &&
        !request.nextUrl.pathname.startsWith('/login') &&
        !request.nextUrl.pathname.startsWith('/signup') &&
        !request.nextUrl.pathname.startsWith('/auth/confirm') &&
        request.nextUrl.pathname !== "/"
    ) {
        const url = request.nextUrl.clone();
        url.pathname = '/'; // Redirect to the base route (/)
        return NextResponse.redirect(url);
    }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|auth/confirm|login|signup).*)',
  ],
};