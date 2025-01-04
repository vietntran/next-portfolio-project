// src/components/LoginForm.tsx
"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";

type FormData = {
  email: string;
  password: string;
  name: string;
};

export default function LoginForm() {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!isSignup) {
        const result = await signIn("credentials", {
          email: formData.email,
          password: formData.password,
          redirect: true,
          callbackUrl: "/dashboard",
        });
        return;
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Authentication failed";
      console.error("Form submission error:", errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleModeToggle = (mode: boolean) => {
    setIsSignup(mode);
    setError(null);
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div
            className="p-4 text-sm text-red-700 bg-red-100 rounded-lg"
            role="alert"
          >
            {error}
          </div>
        )}

        {isSignup && (
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-900"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
                focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
              required
              disabled={loading}
              placeholder="Enter your name"
              suppressHydrationWarning
            />
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            required
            disabled={loading}
            placeholder="your@email.com"
            suppressHydrationWarning
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={formData.password}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, password: e.target.value }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm 
              focus:border-indigo-500 focus:ring-indigo-500 text-gray-900"
            required
            disabled={loading}
            placeholder="••••••••"
            minLength={8}
            suppressHydrationWarning
          />
        </div>

        <div className="flex flex-col space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 border border-transparent rounded-md
              shadow-sm text-sm font-medium text-white bg-indigo-600 
              hover:bg-indigo-700 focus:outline-none focus:ring-2 
              focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading
              ? isSignup
                ? "Creating Account..."
                : "Logging in..."
              : isSignup
              ? "Create Account"
              : "Log In"}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2 px-4 border border-gray-300 rounded-md
              shadow-sm text-sm font-medium text-gray-700 bg-white
              hover:bg-gray-50 focus:outline-none focus:ring-2
              focus:ring-offset-2 focus:ring-indigo-500"
          >
            Sign in with Google
          </button>

          {isSignup && (
            <button
              type="button"
              onClick={() => handleModeToggle(false)}
              className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Login
            </button>
          )}

          {!isSignup && (
            <button
              type="button"
              onClick={() => handleModeToggle(true)}
              className="w-full py-2 px-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Don't have an account? Sign Up →
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
