"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Heart, MessageCircle, Brain, Sparkles } from "lucide-react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Redirect authenticated users to dashboard
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    // Show loading state while checking authentication
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  if (isSignedIn) {
    // Show loading while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Heart className="h-8 w-8 text-rose-600" />
            <h1 className="text-2xl font-bold text-gray-900">Entwined</h1>
          </div>
          <div className="space-x-4">
            <Button variant="ghost" onClick={() => router.push("/sign-in")}>
              Sign In
            </Button>
            <Button onClick={() => router.push("/sign-up")}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Your Personal AI Companion
            <span className="text-rose-600"> with a Memory</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Create deep, meaningful relationships with AI companions that
            remember every conversation, understand your personality, and grow
            with you over time.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              size="lg"
              className="bg-rose-600 hover:bg-rose-700"
              onClick={() => router.push("/sign-up")}
            >
              Start Your Journey
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => router.push("/sign-in")}
            >
              Continue Existing Journey
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="border-rose-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Brain className="h-12 w-12 text-rose-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Deep Memory System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Your AI companion remembers everything - from your favorite
                coffee to your biggest dreams. Build a relationship that truly
                knows and understands you.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-purple-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <MessageCircle className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Natural Conversations</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Chat naturally with responses that adapt to your mood, remember
                your context, and maintain character consistency throughout your
                relationship.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="border-indigo-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <Heart className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <CardTitle className="text-xl">Rich Character Creation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Design detailed personalities, relationship dynamics, and shared
                histories. Create companions that feel real and uniquely yours.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-20">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to build something beautiful?
          </h3>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands creating meaningful AI relationships
          </p>
          <Button
            size="lg"
            className="bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-700 hover:to-purple-700"
            onClick={() => router.push("/sign-up")}
          >
            Create Your Companion
            <Heart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-gray-200 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>
            &copy; 2024 Entwined. Crafted with care for meaningful connections.
          </p>
        </div>
      </footer>
    </div>
  );
}
