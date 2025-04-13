// app/auth/confirm/route.js
import { NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server'; // Import your server client helper
import { redirect } from 'next/navigation';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type'); // No type casting needed in JS
  const next = searchParams.get('next') ?? '/home'; // Redirect to /home by default

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Redirect user to the specified 'next' path, or to /home if 'next' is not provided.
      return redirect(next);
    }
  }

  // If there's an error, or if token_hash or type are missing, redirect to an error page.
  // You should create a dedicated error page for this (e.g., app/auth/error/page.jsx).
  redirect('/auth/error'); // Redirect to an error page
}