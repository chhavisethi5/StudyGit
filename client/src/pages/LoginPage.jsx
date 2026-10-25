import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, AlertCircle, LogIn, Lock, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from = location.state?.from?.pathname || '/my-roadmaps';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email: email.trim(), password });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Authentication failed. Please verify your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-12rem)] flex flex-col justify-center items-center px-4 py-8">
      {/* Brand Icon & Heading */}
      <div className="text-center mb-6">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-git-canvas border border-git-border text-git-text shadow-2xs mb-3">
          <GitBranch className="h-5 w-5 text-git-indigo" />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-git-text">Sign in to StudyGit</h1>
        <p className="text-xs text-git-textMuted mt-1">
          Access your personal roadmap forks and study contributions
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm rounded-lg border border-git-border bg-white p-6 shadow-2xs space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-medium text-git-text mb-1">
              Email address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-8 pr-3 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-medium text-git-text mb-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <input
                id="login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-8 pr-3 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-green py-2 px-3 text-xs font-medium text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <LogIn className="h-3.5 w-3.5" />
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Switch to Register */}
      <div className="mt-4 text-center text-xs text-git-textMuted">
        New to StudyGit?{' '}
        <Link to="/register" className="font-medium text-git-indigo hover:underline">
          Create an account
        </Link>
      </div>
    </div>
  );
}
