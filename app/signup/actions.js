// app/signup/actions.js
'use server';

import { createClient } from '@/app/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
// REMOVE: import { initialCategories } from '../../data/seedData'; // No longer needed

export async function signup(formData) {
    const supabase = await createClient();

    const email = formData.get('email');
    const password = formData.get('password');

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }
    if (typeof email !== "string" || typeof password !== "string") {
        return {error: "invalid credentials"}
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/home`, // Still needed for email confirmation
        }
    });

    if (signUpError) {
        console.error("Signup Error:", signUpError);
        return { error: signUpError.message };
    }


    return { success: true };
}