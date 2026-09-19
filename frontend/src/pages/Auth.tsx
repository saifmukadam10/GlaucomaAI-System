// src/pages/AuthPage.jsx
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import { Button } from "@/components/ui/button"; // adjust to your button path

const AuthPage = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen bg-background text-foreground font-manrope flex flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-card shadow-lg rounded-lg p-8 space-y-6">
          <h1 className="text-2xl font-bold text-center">
            {isSignIn ? "Sign In" : "Create Account"}
          </h1>

          <form className="space-y-4">
            {!isSignIn && (
              <div>
                <label className="block mb-1 text-sm">Full Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Your name"
                />
              </div>
            )}

            <div>
              <label className="block mb-1 text-sm">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block mb-1 text-sm">Password</label>
              <input
                type="password"
                className="w-full px-3 py-2 rounded-md bg-input border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
              />
            </div>

            <Button
              variant="hero"
              type="submit"
              className="w-full mt-4"
            >
              {isSignIn ? "Sign In" : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm mt-4">
            {isSignIn ? (
              <>
                Don’t have an account?{" "}
                <button
                  onClick={() => setIsSignIn(false)}
                  className="text-accent hover:underline"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => setIsSignIn(true)}
                  className="text-accent hover:underline"
                >
                  Sign In
                </button>
              </>
            )}
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AuthPage;
