import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Join Entwined
          </h1>
          <p className="text-muted-foreground">
            Create your account and build your AI companion
          </p>
        </div>
        <SignUp
          appearance={{
            elements: {
              // Primary button styling to match your app's theme
              formButtonPrimary:
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl",

              // Card styling with theme-aware colors
              card: "bg-card border border-border shadow-2xl rounded-2xl overflow-hidden",
              cardBox: "shadow-2xl rounded-2xl",

              // Header customization
              headerTitle: "text-2xl font-bold text-foreground mb-2",
              headerSubtitle: "text-muted-foreground text-sm",

              // Input field styling
              formFieldInput:
                "bg-background border border-border text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary focus:border-transparent transition-all",
              formFieldLabel: "text-foreground font-medium mb-2",

              // Social buttons
              socialButtonsBlockButton:
                "border border-border bg-background hover:bg-muted text-foreground font-medium py-3 px-4 rounded-lg transition-all",
              socialButtonsBlockButtonText: "text-foreground font-medium",
              
              // Hide Apple sign-in button
              socialButtonsBlockButtonApple: "hidden",

              // Links and text
              formFieldAction: "text-primary hover:text-primary/80",
              identityPreviewText: "text-muted-foreground",
              formResendCodeLink: "text-primary hover:text-primary/80",

              // Hide branding elements
              footer: "hidden",
              footerAction: "hidden",
              footerActionLink: "hidden",
              footerPages: "hidden",

              // Additional branding removal
              organizationSwitcherTrigger: "border-border",
              userButtonTrigger: "border-border",
            },
            layout: {
              logoImageUrl: "", // Remove Clerk logo
              showOptionalFields: false,
              logoPlacement: "none",
              termsPageUrl: "/terms-of-service",
              privacyPageUrl: "/privacy-policy",
            },
            variables: {
              // CSS variables for consistent theming
              colorPrimary: "hsl(var(--primary))",
              colorBackground: "hsl(var(--background))",
              colorInputBackground: "hsl(var(--background))",
              colorInputText: "hsl(var(--foreground))",
              colorText: "hsl(var(--foreground))",
              colorTextSecondary: "hsl(var(--muted-foreground))",
              colorNeutral: "hsl(var(--muted))",
              borderRadius: "0.75rem",
              fontFamily: "inherit",
            },
          }}
          redirectUrl="/onboarding"
          afterSignUpUrl="/onboarding"
        />
        
        {/* Terms and Privacy Links */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            By creating an account, you agree to our{" "}
            <Link 
              href="/terms-of-service" 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link 
              href="/privacy-policy" 
              className="text-primary hover:text-primary/80 underline underline-offset-4"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
