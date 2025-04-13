// app/signup/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../components/buttons/primary-button';
import Link from 'next/link';
import GoogleSignInButton from '../components/buttons/google-sign-in-button'; // Import
import { signup } from './actions'; // Import the Server Action

function SignupPage() {
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);  // Track success
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignup = async (formData) => { // No event argument
      setLoading(true);
      setError('');
      setSuccess(false);

      const result = await signup(formData);  // Call the Server Action

      setLoading(false);
      if (result && result.error) {
        setError(result.error);
      } else {
        setSuccess(true); // Indicate success
        // No redirect here, we show a success message
      }
    };


  return (
    <div className="flex justify-center items-center min-h-screen bg-background-primary">
      <div className="bg-background-secondary p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Sign Up</h1>
        {error && <p className="text-danger-primary mb-4">{error}</p>}
        {success && <p className="text-success-primary mb-4">Check your email for a confirmation link.</p>}
        {/* Use "action" attribute */}
        <form action={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="email">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full p-2 rounded bg-background-primary text-text-primary border border-gray-300 focus:border-accent-primary focus:ring-accent-primary"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full p-2 rounded bg-background-primary text-text-primary border border-gray-300 focus:border-accent-primary focus:ring-accent-primary"
              required
            />
          </div>
          <PrimaryButton type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing Up...' : 'Sign Up'}
          </PrimaryButton>
           <div className="text-center">
                <p className="text-text-primary">Or</p>
                <GoogleSignInButton setError={setError}/>
          </div>
           <div className="text-center">
                <p className="text-text-primary">
                    Already have an account?{' '}
                    <Link href="/login" className="text-accent-primary hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </form>
      </div>
    </div>
  );
}

export default SignupPage;