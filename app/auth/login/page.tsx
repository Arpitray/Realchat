'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Read URL search params directly from the browser to avoid SSR/prerender
    // issues with `useSearchParams()` during build-time prerendering.
    try {
      const params = new URLSearchParams(window.location.search);
      const errorParam = params.get('error');
      if (errorParam) {
        setError(getErrorMessage(errorParam));
      }
    } catch (e) {
      // If window is not available or parsing fails, ignore silently
    }
  }, []);

  const getErrorMessage = (error: string) => {
    switch (error) {
      case 'OAuthAccountNotLinked':
        return 'This email is already associated with a different sign-in method.';
      case 'OAuthCallback':
        return 'There was an issue with the Google sign-in. Please try again.';
      case 'Callback':
        return 'Authentication failed. Please try logging in again.';
      case 'AccessDenied':
        return 'Access was denied. Please try again.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn('credentials', {
        redirect: false,
        email,
        password
      });

      if (res?.error) {
        setError('Invalid email or password.');
        return;
      }

      const session = await getSession();
      if (session) {
        router.push('/');
      } else {
        setError('Failed to create session.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      await signIn('google', {
        callbackUrl: '/',
        redirect: true
      });
    } catch (err) {
      console.error('Google sign-in error:', err);
      setError('Failed to initiate Google sign-in.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass-card p-8 rounded-3xl border border-white/10">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-muted-foreground">Sign in to continue to Bando</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-sm"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all text-foreground placeholder:text-muted-foreground/50"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-6 bg-primary text-primary-foreground rounded-xl font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-[1px] flex-1 bg-white/10" />
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Or continue with</span>
            <div className="h-[1px] flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-3 px-6 bg-white/5 border border-white/10 rounded-xl font-medium hover:bg-white/10 transition-all flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google
          </button>

          <div className="mt-8 text-center space-y-4">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-muted-foreground hover:text-primary transition-colors block"
            >
              Forgot your password?
            </Link>
            <p className="text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-primary font-semibold hover:underline"
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
