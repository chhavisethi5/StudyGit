import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GitBranch, AlertCircle, UserPlus, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const from =
    location.state?.from?.pathname ||
    (typeof location.state?.from === 'string' ? location.state.from : null) ||
    '/my-roadmaps';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        password,
      });
      navigate(from, { replace: true });
    } catch (err) {
      setErrorMessage(
        err.message || 'Registration failed. Please check your information and try again.'
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
        <h1 className="text-xl font-bold tracking-tight text-git-text">Create your account</h1>
        <p className="text-xs text-git-textMuted mt-1">
          Join StudyGit to publish roadmaps and personalize study schedules
        </p>
      </div>

      {/* Registration Card */}
      <div className="w-full max-w-sm rounded-lg border border-git-border bg-white p-6 shadow-2xs space-y-4">
        {errorMessage && (
          <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-start space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="flex-1">{errorMessage}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-medium text-git-text mb-1">
              Full name
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <User className="h-3.5 w-3.5" />
              </div>
              <input
                id="reg-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-8 pr-3 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-medium text-git-text mb-1">
              University / School email
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <Mail className="h-3.5 w-3.5" />
              </div>
              <input
                id="reg-email"
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
            <label htmlFor="reg-password" className="block text-xs font-medium text-git-text mb-1">
              Password <span className="text-git-textSubtle font-normal">(min 8 characters)</span>
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <input
                id="reg-password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-8 pr-3 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>
          </div>

          <div>
            <label htmlFor="reg-confirm" className="block text-xs font-medium text-git-text mb-1">
              Confirm password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
                <Lock className="h-3.5 w-3.5" />
              </div>
              <input
                id="reg-confirm"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-md border border-git-border bg-git-canvas py-1.5 pl-8 pr-3 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-green py-2 px-3 text-xs font-medium text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors pt-2"
          >
            {isSubmitting ? (
              <>
                <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <UserPlus className="h-3.5 w-3.5" />
                <span>Create account</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Footer Switch to Login */}
      <div className="mt-4 text-center text-xs text-git-textMuted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-git-indigo hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}
