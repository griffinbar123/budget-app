// app/login/page.jsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PrimaryButton from '../components/buttons/primary-button';
import Link from 'next/link';
import GoogleSignInButton from '../components/buttons/google-sign-in-button';
import { login } from './actions'; // Import the Server Action

function LoginPage() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (formData) => { // No event argument
    setLoading(true);
    setError('');
    const result = await login(formData); // Call the Server Action
    setLoading(false);

    if (result && result.error) {
      setError(result.error); // Set error from server
    } else {
      router.refresh() //revalidate cache
    }
  };


  return (
    <div className="flex justify-center items-center min-h-screen bg-background-primary">
      <div className="bg-background-secondary p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-text-primary">Login</h1>
        {error && <p className="text-danger-primary mb-4">{error}</p>}
        {/* Use "action" attribute */}
        <form action={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-text-secondary" htmlFor="email">
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
            <label className="block text-sm font-medium mb-1 text-text-secondary" htmlFor="password">
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
            {loading ? 'Loading...' : 'Login'}
          </PrimaryButton>
           <div className="text-center">
            <p className=' text-text-primary'>Or</p>
            <GoogleSignInButton setError={setError} /> {/* Use the Google Sign-In button */}
          </div>
          <div className="text-center">
            <p className='text-text-primary'>
                Don't have an account?{' '}
                <Link href="/signup" className="text-accent-primary hover:underline">
                    Sign up
                </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;