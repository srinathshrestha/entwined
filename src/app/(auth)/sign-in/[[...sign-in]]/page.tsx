import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-purple-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to Entwined
          </h1>
          <p className="text-gray-600">
            Sign in to continue your AI companion journey
          </p>
        </div>
        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-rose-600 hover:bg-rose-700 text-sm normal-case",
              card: "shadow-lg border border-gray-200",
              headerTitle: "text-lg font-semibold",
              headerSubtitle: "text-gray-600",
              footer: "hidden", // Hide development mode footer
              footerAction: "hidden", // Hide development mode links
            },
            layout: {
              logoImageUrl: "", // Remove Clerk logo
              showOptionalFields: false,
              logoPlacement: "none",
            },
          }}
          redirectUrl="/chat"
          afterSignInUrl="/chat"
        />
      </div>
    </div>
  );
}
