// app/auth/confirm/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabase/client'; // Import Supabase client

export default function ConfirmPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const confirmUser = async () => {
      try {
        setLoading(true);

        // No need to get the token from the URL manually. Supabase handles it.
        // We just call getSession() to trigger the confirmation process.

        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          // If there's no session, the user hasn't clicked the confirmation link.
          // Redirect to login/signup, or show an error.
          throw new Error('No session found. Please sign up or log in.');
        }

        // If we get here, the session exists, which means the user *has* clicked
        // the confirmation link.  Supabase has already handled the verification.

        // Optionally get updated user data after confirmation:
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;

        // Redirect to home or a success page
        router.push('/home'); // Or a dedicated "confirmed" page
        router.refresh() // Refresh to get new session state. VERY IMPORTANT.
      } catch (err) {
        setError(err.message || 'An error occurred during confirmation.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

      confirmUser(); // Call immediately

  }, [router]);


  if (loading) {
    return <div className="flex justify-center items-center h-screen">Confirming...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-danger-primary">{error}</div>;
  }

  return null; // We redirect automatically on success, so we don't render anything here.
}