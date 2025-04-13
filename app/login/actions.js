// app/login/actions.js
'use server';

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function login(formData) {
  const supabase = await createClient();

  const email = formData.get('email');
  const password = formData.get('password');

  if (!email || !password) {
    return { error: 'Email and password are required' }; // Return error, don't redirect
  }
    if (typeof email !== "string" || typeof password !== "string") {
        return {error: "invalid credentials"}
    }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error("Login Error:", error); // Log the error for debugging
    return { error: error.message }; // Return the error message to the client
  }

  revalidatePath('/home'); // Invalidate the cache for the home route and its children
  redirect('/home'); // Redirect to the home page
}