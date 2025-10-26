'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState('Processing authentication...');

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code');
      const error = searchParams.get('error');

      if (error) {
        setStatus(`Error: ${error}`);
        setTimeout(() => router.push('/?error=auth_failed'), 2000);
        return;
      }

      if (!code) {
        setStatus('No authorization code received');
        setTimeout(() => router.push('/?error=no_code'), 2000);
        return;
      }

      try {
        setStatus('Exchanging code for access token...');
        
        const response = await fetch('/api/auth/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code }),
        });

        if (!response.ok) {
          throw new Error('Failed to exchange code for token');
        }

        const tokenData = await response.json();
        
        if (tokenData.access_token) {
          localStorage.setItem('spotify_access_token', tokenData.access_token);
          setStatus('Authentication successful! Redirecting...');
          setTimeout(() => router.push('/'), 1000);
        } else {
          throw new Error('No access token received');
        }
      } catch (error) {
        console.error('Token exchange error:', error);
        setStatus('Authentication failed');
        setTimeout(() => router.push('/?error=token_exchange'), 2000);
      }
    };

    handleCallback();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
        <p className="text-xl">{status}</p>
      </div>
    </div>
  );
}

export default function Callback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4"></div>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}