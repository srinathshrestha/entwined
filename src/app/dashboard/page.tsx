'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, MessageCircle, Settings, User } from 'lucide-react';

interface OnboardingStatus {
  isComplete: boolean;
  currentStep: number;
  hasProfile: boolean;
}

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const router = useRouter();
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded) return;
    
    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    // Check onboarding status
    checkOnboardingStatus();
  }, [isLoaded, isSignedIn, router]);

  const checkOnboardingStatus = async () => {
    try {
      // TODO: Replace with actual API call to check user's onboarding status
      // For now, we'll simulate checking if user has completed onboarding
      const response = await fetch('/api/user/onboarding-status');
      
      if (response.ok) {
        const status = await response.json();
        setOnboardingStatus(status);
        
        // If user hasn't completed onboarding, redirect to onboarding
        if (!status.isComplete) {
          router.push(`/onboarding?step=${status.currentStep || 1}`);
          return;
        }
      } else {
        // If we can't get status, assume user needs onboarding
        router.push('/onboarding?step=1');
        return;
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      // If there's an error, redirect to onboarding to be safe
      router.push('/onboarding?step=1');
      return;
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Redirecting to sign in...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <Heart className="h-6 w-6 text-rose-600" />
              <h1 className="text-xl font-bold text-gray-900">Entwined</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome back, {user?.firstName || 'there'}!</span>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <User className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Your AI Companion Dashboard
            </h2>
            <p className="text-gray-600">
              Continue building your relationship and explore new conversations.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/chat')}>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MessageCircle className="h-5 w-5 text-rose-600 mr-2" />
                  Continue Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Resume your conversation and create new memories together.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 text-purple-600 mr-2" />
                  Memory Bank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  View and manage all the memories you&apos;ve created together.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 text-indigo-600 mr-2" />
                  Character Profiles
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Update your character profiles and relationship dynamics.
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest conversations and memories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity yet.</p>
                <p className="text-sm">Start a conversation to see your activity here!</p>
                <Button className="mt-4" onClick={() => router.push('/chat')}>
                  Start Chatting
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
} 