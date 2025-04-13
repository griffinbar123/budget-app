'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../utils/supabase/client';
import { useRouter } from 'next/navigation';

function GoogleSignInButton({ setError }) {
    const router = useRouter();

    useEffect(() => {
        const handleCredentialResponse = async (response) => {
            const { error } = await supabase.auth.signInWithIdToken({
                provider: 'google',
                token: response.credential,
            });
            if(error) {
                setError("Could not sign in with Google")
                console.error(error);
                return;
            }

            //Success
            router.push('/home'); // <-- PROBLEM: Redirecting from here.
            router.refresh()

        };

      // ... (rest of your useEffect - script loading, initialization) ...
          if (!document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
                const script = document.createElement('script');
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                  // Initialize Google Identity Services
                  window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, // Use environment variable
                    callback: handleCredentialResponse,  // Call our handler
                    context: "signin", //sign in context
                    ux_mode: "popup", //pop up mode
                  });

                  // Render the button
                  window.google.accounts.id.renderButton(
                    document.getElementById('google-signin-button'),
                    { theme: 'outline', size: 'large',  text: 'signin_with', logo_alignment: 'left', shape: 'rectangular' } // Changed shape
                  );
                    window.google.accounts.id.prompt(); //prompts with google

                };
                script.onerror = () => {
                  setError('Failed to load Google Sign-In button.');
                };
                document.head.appendChild(script);
              }
        return () => { //cleanup
          if (document.getElementById('google-signin-button')) {
            document.getElementById('google-signin-button').innerHTML = "";
          }
          const idDiv = document.getElementById("g_id_onload");
          if (idDiv) {
            idDiv.remove();
          }
        };
    }, [router, setError]); //  Dependencies.  GOOD.


    return (
    <>
      <div id="g_id_onload"
        data-client_id={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID}
        data-context="signin"
        data-ux_mode="popup"
        data-callback="handleCredentialResponse"
        data-nonce=""
        data-auto_select="true"
        data-itp_support="true"
        data-use_fedcm_for_prompt="true"
        style={{display: 'none'}}
      >
      </div>
      <div
        id="google-signin-button"
        className="w-full" // Make sure this div exists and takes up the full width
      >
        {/* Google Sign-In button will be rendered here */}
      </div>
      {/* {loadError && <div className="text-danger-primary">{loadError}</div>} */}
    </>
  );
}

export default GoogleSignInButton;