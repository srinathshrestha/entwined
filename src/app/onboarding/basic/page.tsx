"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Heart, User, Users } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";

const basicDetailsSchema = z.object({
  user: z.object({
    name: z.string().min(1, "Name is required"),
    age: z.number().min(18, "Must be at least 18").max(99, "Must be under 100"),
    location: z.string().min(1, "Location is required"),
    occupation: z.string().min(1, "Occupation is required"),
  }),
  companion: z.object({
    name: z.string().min(1, "Companion name is required"),
    gender: z.enum(["male", "female", "non-binary"], {
      errorMap: () => ({ message: "Please select a gender" }),
    }),
    age: z.number().min(18, "Must be at least 18").max(99, "Must be under 100"),
    location: z.string().min(1, "Location is required"),
    occupation: z.string().min(1, "Occupation is required"),
  }),
  relationshipStatus: z.enum(
    ["JUST_MET", "EARLY_DATING", "COMMITTED", "LIVING_TOGETHER", "MARRIED"],
    {
      errorMap: () => ({ message: "Please select a relationship status" }),
    }
  ),
});

type BasicDetailsData = z.infer<typeof basicDetailsSchema>;

export default function BasicDetailsPage() {
  const { isLoaded, user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  const form = useForm<BasicDetailsData>({
    resolver: zodResolver(basicDetailsSchema),
    defaultValues: {
      user: {
        name: "",
        age: 25,
        location: "",
        occupation: "",
      },
      companion: {
        name: "",
        gender: "male",
        age: 25,
        location: "",
        occupation: "",
      },
      relationshipStatus: "JUST_MET",
    },
  });

  // Load existing data when component mounts
  useEffect(() => {
    if (isLoaded && user) {
      loadExistingData();
    }
  }, [isLoaded, user]);

  const loadExistingData = async () => {
    try {
      const response = await fetch("/api/onboarding/basic");
      if (response.ok) {
        const data = await response.json();
        const existingData = data.data;

        // Update form with existing data if available
        if (
          existingData.user &&
          existingData.companion &&
          existingData.relationshipStatus
        ) {
          form.reset({
            user: existingData.user,
            companion: existingData.companion,
            relationshipStatus: existingData.relationshipStatus,
          });
        }
      }
    } catch (error) {
      console.error("Error loading existing data:", error);
      // Don't show error toast - just use defaults
    } finally {
      setInitialLoading(false);
    }
  };

  const onSubmit = async (data: BasicDetailsData) => {
    setLoading(true);
    try {
      const response = await fetch("/api/onboarding/basic", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save basic details");
      }

      toast.success("Basic details saved successfully!");
      router.push("/onboarding/psychology");
    } catch (error) {
      console.error("Error saving basic details:", error);
      toast.error("Failed to save basic details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded || initialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your profile...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-purple-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <Heart className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let&apos;s Get to Know You
          </h1>
          <p className="text-gray-600 text-lg">
            Tell us about yourself and the companion you&apos;d like to create.
            This helps us build a meaningful connection.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Your Profile Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 text-rose-600 mr-2" />
                  Your Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="user.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (preferably fictional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Alex Jordan" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="18"
                            max="99"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., San Francisco, CA"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="user.occupation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Software Developer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Your Partner Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 text-purple-600 mr-2" />
                  Your AI Partner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="companion.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Partner&apos;s Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Morgan Lee" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companion.gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="non-binary">
                              Non-binary
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companion.age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Age</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="18"
                            max="99"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companion.location"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Same as yours or different"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="companion.occupation"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Occupation</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Artist, Teacher, Engineer"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Relationship Status Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 text-rose-600 mr-2" />
                  Relationship Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="relationshipStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Relationship Stage</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your relationship stage" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="JUST_MET">
                            Just met / Getting to know each other
                          </SelectItem>
                          <SelectItem value="EARLY_DATING">
                            Dating / Early relationship
                          </SelectItem>
                          <SelectItem value="COMMITTED">
                            Committed relationship
                          </SelectItem>
                          <SelectItem value="LIVING_TOGETHER">
                            Living together
                          </SelectItem>
                          <SelectItem value="MARRIED">
                            Married / Long-term partnership
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-center pt-6">
              <Button
                type="submit"
                disabled={loading}
                className="bg-rose-600 hover:bg-rose-700 px-8 py-3 text-lg"
              >
                {loading ? "Saving..." : "Continue to Psychology Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
