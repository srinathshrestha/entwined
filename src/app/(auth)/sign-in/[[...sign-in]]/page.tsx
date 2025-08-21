import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome to Entwined
          </h1>
          <p className="text-muted-foreground">
            Sign in to continue your AI companion journey
          </p>
        </div>
        <SignIn
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
              termsPageUrl: undefined,
              privacyPageUrl: undefined,
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
          redirectUrl="/chat"
          afterSignInUrl="/chat"
        />
      </div>
    </div>
  );
}
