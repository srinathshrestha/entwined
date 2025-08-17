"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  Zap,
  MessageCircle,
  Settings,
} from "lucide-react";

export default function HomePage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/chat/simplified");
    }
  }, [isLoaded, isSignedIn, router]);

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.push("/chat/simplified");
    } else {
      router.push("/sign-up");
    }
  };

  const features = [
    {
      icon: Brain,
      title: "Memory Tagging",
      description:
        "Tag important memories during conversations for personalized AI responses.",
    },
    {
      icon: Heart,
      title: "Personality Traits",
      description:
        "Customize your companion's affection, empathy, curiosity, and playfulness levels.",
    },
    {
      icon: Sparkles,
      title: "Dynamic Responses",
      description:
        "AI responses adapt based on personality settings and conversation history.",
    },
    {
      icon: Zap,
      title: "Emotional Intelligence",
      description:
        "Your companion understands and responds to emotional context appropriately.",
    },
    {
      icon: MessageCircle,
      title: "Simplified Setup",
      description:
        "Get started in under 2 minutes with our streamlined onboarding process.",
    },
    {
      icon: Settings,
      title: "Easy Customization",
      description:
        "Adjust your companion's personality with simple sliders and dropdown menus.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <Badge
                    variant="outline"
                    className="text-purple-600 border-purple-300"
                  >
                    ✨ Simplified AI Companion
                  </Badge>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight"
                >
                  Simple AI{" "}
                  <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    Companionship
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="text-xl text-gray-600 leading-relaxed max-w-2xl"
                >
                  Experience personalized AI companionship with 6 simple
                  personality traits, manual memory tagging, and streamlined
                  conversations.
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3"
                  onClick={handleGetStarted}
                >
                  {isSignedIn ? "Go to Dashboard" : "Get Started (2 min setup)"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="border-purple-300 text-purple-600 hover:bg-purple-50 px-8 py-3"
                  onClick={() => router.push("/sign-in")}
                >
                  {isSignedIn ? "Continue Chat" : "Sign In"}
                </Button>
              </motion.div>
            </motion.div>

            {/* Right Column - Demo */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative z-10">
                <Card className="bg-white/80 backdrop-blur-sm shadow-2xl border-0">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm text-gray-500 ml-auto">
                        Simplified Chat
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                        <p className="text-sm">
                          Hi! I'm your AI companion with simple personality
                          traits.
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl px-4 py-2 max-w-xs">
                        <p className="text-sm">
                          Can you remember this conversation?
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-2xl px-4 py-2 max-w-xs">
                        <p className="text-sm">
                          Yes! Just tag memories manually using the brain
                          button. 🧠
                        </p>
                      </div>
                    </div>
                    <div className="flex justify-center">
                      <Badge variant="secondary" className="text-xs">
                        <Brain className="h-3 w-3 mr-1" />
                        Memory Tagging Available
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center space-y-4 mb-16"
          >
            <Badge
              variant="outline"
              className="text-purple-600 border-purple-300"
            >
              Simplified Features
            </Badge>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Simple. Powerful. Personal.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for meaningful AI companionship without the
              complexity.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow border-0 bg-gradient-to-br from-gray-50 to-white">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl">
                        <feature.icon className="h-6 w-6 text-purple-600" />
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-white">
              Ready for Simple AI Companionship?
            </h2>
            <p className="text-xl text-purple-100 max-w-2xl mx-auto">
              Get started in under 2 minutes with our streamlined setup process.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3"
                onClick={handleGetStarted}
              >
                Start in 2 Minutes
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}