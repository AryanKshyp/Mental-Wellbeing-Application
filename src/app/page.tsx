'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Hero } from '@/components/LandingPage';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on component mount
  useEffect(() => {
    // Replace this with your actual authentication check
    const checkAuth = async () => {
      try {
        // Example: Check if user is logged in
        // const session = await getSession();
        // setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };

    checkAuth();
  }, []);

  // Handler functions
  const handleChatbotClick = () => {
    if (isAuthenticated) {
      router.push('/chat');
    } else {
      router.push('/login?redirect=/chat');
    }
  };

  const handleTalkspaceClick = (tab?: string) => {
    if (isAuthenticated) {
      router.push(`/talkspace${tab ? `?tab=${tab}` : ''}`);
    } else {
      router.push(`/login?redirect=/talkspace${tab ? `?tab=${tab}` : ''}`);
    }
  };

  const handleLogin = () => {
    router.push('/login');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  const handleDashboard = () => {
    if (isAuthenticated) {
      router.push('/dashboard');
    } else {
      router.push('/login?redirect=/dashboard');
    }
  };

  return (
    <div className="min-h-screen">
      <Hero
        onChatbotClick={handleChatbotClick}
        onTalkspaceClick={handleTalkspaceClick}
        onLogin={handleLogin}
        onSignup={handleSignup}
        onDashboard={handleDashboard}
      />
    </div>
  );
}
