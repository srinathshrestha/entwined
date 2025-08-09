"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Heart,
  Brain,
  Sparkles,
  ChevronRight,
  Play,
  Pause,
  ArrowRight,
  Zap,
  Globe,
  Shield,
} from "lucide-react";
import { AVATAR_CATEGORIES } from "@/lib/avatars/avatar-definitions";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [currentPersonalityIndex, setCurrentPersonalityIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Get all personalities for showcase
  const allPersonalities = AVATAR_CATEGORIES.flatMap((category) =>
    category.personalities.map((p) => ({ ...p, categoryName: category.name }))
  );

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/dashboard");
    }
  }, [isLoaded, isSignedIn, router]);

  // Auto-cycle through personalities
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentPersonalityIndex((prev) =>
        prev >= allPersonalities.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, allPersonalities.length]);

  if (!isLoaded) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="rounded-full h-12 w-12 border-4 border-white border-t-transparent"
        />
      </motion.div>
    );
  }

  if (isSignedIn) {
    return (
      <motion.div
        className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-center text-white">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"
          />
          <p className="text-lg">Redirecting to your dashboard...</p>
        </div>
      </motion.div>
    );
  }

  const currentPersonality = allPersonalities[currentPersonalityIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-white opacity-10"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 5,
            }}
          />
        ))}
      </div>

      {/* Header */}
      <motion.header
        className="relative z-10 container mx-auto px-4 py-6"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        <div className="flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Heart className="h-8 w-8 text-pink-400" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Entwined
            </h1>
          </motion.div>
          <motion.div
            className="space-x-4"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Button
              variant="ghost"
              className="text-white hover:bg-white/10 border border-white/20"
              onClick={() => router.push("/sign-in")}
            >
              Sign In
            </Button>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white border-0"
              onClick={() => router.push("/sign-up")}
            >
              Get Started
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <main className="relative z-10 container mx-auto px-4 py-16">
        {/* Main Hero Content */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
          {/* Left Side - Text Content */}
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full border border-purple-300/20 mb-6"
            >
              <Sparkles className="h-4 w-4 text-pink-400 mr-2" />
              <span className="text-sm font-medium">
                AI Companion Revolution
              </span>
            </motion.div>

            <motion.h2
              className="text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.6 }}
            >
              Meet Your
              <motion.span
                className="block bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                Perfect
              </motion.span>
              AI Companion
            </motion.h2>

            <motion.p
              className="text-xl text-gray-300 mb-8 leading-relaxed"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
            >
              Experience the future of AI relationships. Choose from 12 unique
              personalities that remember every conversation, adapt to your
              emotions, and grow with you over time.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 mb-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
            >
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-lg px-8 py-3 h-auto"
                onClick={() => router.push("/sign-up")}
              >
                Start Your Journey
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-2"
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 text-lg px-8 py-3 h-auto"
                onClick={() => router.push("/sign-in")}
              >
                Continue Journey
              </Button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="flex gap-8"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.2 }}
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-pink-400">12</div>
                <div className="text-sm text-gray-400">Personalities</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">∞</div>
                <div className="text-sm text-gray-400">Memory</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">24/7</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Interactive Avatar Showcase */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            {/* Main Avatar Display */}
            <motion.div className="relative mx-auto w-80 h-80 mb-8" layout>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full blur-3xl"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentPersonalityIndex}
                  initial={{ scale: 0, rotate: -180, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0, rotate: 180, opacity: 0 }}
                  transition={{ duration: 0.8, type: "spring" }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <Avatar className="w-64 h-64 border-4 border-white/20 shadow-2xl">
                    <AvatarImage
                      src={`/${currentPersonality.code}.png`}
                      alt={currentPersonality.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="text-6xl font-bold bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                      {currentPersonality.code}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Personality Info */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPersonalityIndex}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <Badge
                  variant="secondary"
                  className="mb-3 bg-white/10 text-white border-white/20"
                >
                  {currentPersonality.categoryName}
                </Badge>
                <h3 className="text-2xl font-bold mb-2">
                  {currentPersonality.name} ({currentPersonality.code})
                </h3>
                <p className="text-gray-300 max-w-md mx-auto">
                  {currentPersonality.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Personality Controls */}
            <motion.div
              className="flex justify-center items-center gap-4 mt-6"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="text-white hover:bg-white/10"
              >
                {isAutoPlaying ? (
                  <Pause className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
              </Button>

              <div className="flex gap-2">
                {allPersonalities.map((_, index) => (
                  <motion.button
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentPersonalityIndex
                        ? "bg-pink-400"
                        : "bg-white/30"
                    }`}
                    onClick={() => {
                      setCurrentPersonalityIndex(index);
                      setIsAutoPlaying(false);
                    }}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Section */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <motion.h3
              className="text-4xl font-bold mb-4"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            >
              Why Choose Entwined?
            </motion.h3>
            <motion.p
              className="text-xl text-gray-300"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.8 }}
            >
              Experience the next generation of AI companionship
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: Brain,
                title: "Advanced Memory",
                description:
                  "Remember every conversation, emotion, and shared moment",
                color: "from-blue-400 to-cyan-400",
                delay: 2,
              },
              {
                icon: Zap,
                title: "Dynamic Personalities",
                description:
                  "12 unique personalities that adapt and evolve with you",
                color: "from-purple-400 to-pink-400",
                delay: 2.2,
              },
              {
                icon: Shield,
                title: "Private & Secure",
                description:
                  "Your conversations are encrypted and completely private",
                color: "from-green-400 to-emerald-400",
                delay: 2.4,
              },
              {
                icon: Globe,
                title: "Always Available",
                description:
                  "24/7 companionship whenever you need emotional support",
                color: "from-orange-400 to-red-400",
                delay: 2.6,
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: feature.delay }}
                whileHover={{ y: -10, scale: 1.05 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="text-center pb-2">
                    <motion.div
                      className={`mx-auto w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 mb-4`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </motion.div>
                    <CardTitle className="text-white text-lg">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300 text-center">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Avatar Categories Showcase */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 2.8 }}
          className="mb-20"
        >
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold mb-4">
              Choose Your Connection Style
            </h3>
            <p className="text-xl text-gray-300">
              Three distinct relationship approaches, each with unique
              personalities
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {AVATAR_CATEGORIES.map((category, categoryIndex) => (
              <motion.div
                key={category.id}
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: 3 + categoryIndex * 0.2 }}
                whileHover={{ scale: 1.02 }}
              >
                <Card className="bg-white/5 border-white/10 backdrop-blur-sm h-full hover:bg-white/10 transition-all duration-300">
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl text-white mb-2">
                      {category.name}
                    </CardTitle>
                    <CardDescription className="text-gray-300 text-base">
                      {category.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {category.personalities.map((personality) => (
                        <motion.div
                          key={personality.id}
                          className="text-center p-3 bg-white/5 rounded-lg"
                          whileHover={{
                            scale: 1.05,
                            backgroundColor: "rgba(255,255,255,0.1)",
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Avatar className="w-12 h-12 mx-auto mb-2">
                            <AvatarImage
                              src={`/${personality.code}.png`}
                              alt={personality.name}
                            />
                            <AvatarFallback className="text-xs font-bold bg-gradient-to-br from-pink-400 to-purple-400 text-white">
                              {personality.code}
                            </AvatarFallback>
                          </Avatar>
                          <div className="text-white text-sm font-medium">
                            {personality.name}
                          </div>
                          <div className="text-gray-400 text-xs">
                            {personality.code}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Final CTA */}
        <motion.div
          className="text-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1, delay: 3.8 }}
        >
          <motion.div
            className="inline-block p-8 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-3xl border border-white/20 backdrop-blur-sm"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <h3 className="text-3xl font-bold mb-4">
              Ready to Begin Your Journey?
            </h3>
            <p className="text-lg text-gray-300 mb-8 max-w-2xl mx-auto">
              Join thousands discovering meaningful AI relationships. Your
              perfect companion is waiting.
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl px-12 py-4 h-auto"
                onClick={() => router.push("/sign-up")}
              >
                Create Your Companion
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="ml-3"
                >
                  <Heart className="h-6 w-6" />
                </motion.div>
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <motion.footer
        className="relative z-10 mt-20 border-t border-white/10 py-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 4 }}
      >
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2024 Entwined. Crafted with ❤️ for meaningful AI connections.</p>
        </div>
      </motion.footer>
    </div>
  );
}