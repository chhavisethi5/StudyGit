import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, GitBranch, Plus, Menu, X, LogIn, LogOut, User, GitFork } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onToggleSidebar, isSidebarOpen }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [navSearch, setNavSearch] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  const handleNavSearchSubmit = (e) => {
    e.preventDefault();
    if (navSearch.trim()) {
      navigate(`/explore?q=${encodeURIComponent(navSearch.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/login');
  };

  // Close user dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (name) => {
    if (!name) return 'SG';
    return name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 flex h-14 w-full items-center justify-between border-b border-git-border bg-white px-4 md:px-6">
      {/* Left: Brand & Mobile Sidebar Toggle */}
      <div className="flex items-center space-x-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-git-textMuted hover:border-git-border hover:bg-git-canvas hover:text-git-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo md:hidden transition-colors"
          aria-label={isSidebarOpen ? 'Close sidebar navigation' : 'Open sidebar navigation'}
        >
          {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <Link
          to="/"
          className="flex items-center space-x-2.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo focus-visible:ring-offset-2"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-git-canvas border border-git-border text-git-text shadow-2xs">
            <GitBranch className="h-3.5 w-3.5" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-git-text">
            StudyGit
          </span>
          <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-mono font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
            v0.1
          </span>
        </Link>
      </div>

      {/* Center: Search Field */}
      <form onSubmit={handleNavSearchSubmit} className="hidden sm:flex max-w-md flex-1 mx-6">
        <div className="relative w-full">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-git-textSubtle">
            <Search className="h-3.5 w-3.5" />
          </div>
          <input
            type="text"
            value={navSearch}
            onChange={(e) => setNavSearch(e.target.value)}
            placeholder="Search roadmaps, topics, or subjects... (Press Enter)"
            className="h-8 w-full rounded-md border border-git-border bg-git-canvas py-1 pl-8 pr-10 text-xs text-git-text placeholder-git-textSubtle focus:bg-white focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-2">
            <kbd className="rounded border border-git-border bg-white px-1.5 py-0.5 text-[10px] font-mono text-git-textSubtle shadow-2xs">
              ↵
            </kbd>
          </div>
        </div>
      </form>

      {/* Right: Action Button, Auth & Profile Menu */}
      <div className="flex items-center space-x-2.5">
        {/* Primary Action Button (Green) - Links to /explore/new */}
        <Link
          to="/explore/new"
          className="inline-flex h-8 items-center space-x-1.5 rounded-md bg-git-green px-2.5 text-xs font-medium text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green focus-visible:ring-offset-1 transition-colors"
          aria-label="Create new roadmap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New</span>
        </Link>

        {/* User Account State */}
        {isAuthenticated ? (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="User account menu"
              aria-expanded={isMenuOpen}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-git-border bg-git-canvas text-xs font-semibold text-git-indigoText hover:border-git-textSubtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-colors"
            >
              {getInitials(user?.name)}
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-56 rounded-md border border-git-border bg-white py-1 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-2 border-b border-git-borderMuted">
                  <p className="text-xs font-semibold text-git-text truncate">{user?.name}</p>
                  <p className="text-[11px] text-git-textMuted truncate">{user?.email}</p>
                </div>

                <div className="py-1">
                  <Link
                    to="/my-roadmaps"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs text-git-text hover:bg-git-canvas transition-colors"
                  >
                    <GitFork className="h-3.5 w-3.5 text-git-indigo" />
                    <span>My Roadmaps</span>
                  </Link>
                  <Link
                    to="/explore/new"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 px-3 py-1.5 text-xs text-git-text hover:bg-git-canvas transition-colors"
                  >
                    <Plus className="h-3.5 w-3.5 text-git-green" />
                    <span>Publish Roadmap</span>
                  </Link>
                </div>

                <div className="border-t border-git-borderMuted pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-1.5 text-xs text-git-redText hover:bg-git-redSubtle transition-colors text-left"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Link
              to="/login"
              className="inline-flex items-center space-x-1 rounded-md px-2.5 py-1 text-xs font-medium text-git-text hover:bg-git-canvas focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-git-indigo transition-colors"
            >
              <LogIn className="h-3 w-3" />
              <span>Sign in</span>
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center space-x-1 rounded-md border border-git-border bg-white px-2.5 py-1 text-xs font-medium text-git-text hover:bg-git-canvas focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-git-indigo transition-colors"
            >
              <span>Register</span>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
