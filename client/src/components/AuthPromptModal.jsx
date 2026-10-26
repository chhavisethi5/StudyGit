import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, X, LogIn, Plus, BookOpen, Layers } from 'lucide-react';

export default function AuthPromptModal({ isOpen, onClose, roadmap, targetPath }) {
  if (!isOpen) return null;

  const destination = targetPath || (roadmap ? `/explore/${roadmap._id}` : '/explore');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-git-text/30 backdrop-blur-2xs animate-in fade-in duration-150"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-md rounded-xl border border-git-border bg-white shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-git-border bg-git-canvas px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-git-indigoSubtle text-git-indigo border border-git-indigo/20">
              <Lock className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-git-text">Sign in to view roadmap</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-git-textSubtle hover:text-git-text hover:bg-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Roadmap Info Card if provided */}
          {roadmap && (
            <div className="rounded-lg border border-git-border bg-git-canvas/50 p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-git-indigoText bg-git-indigoSubtle border border-git-indigo/20">
                  {roadmap.subject || 'Roadmap'}
                </span>
                <span className="text-[10px] font-mono text-git-textSubtle">
                  v{roadmap.version || 1}
                </span>
              </div>
              <p className="font-semibold text-git-text line-clamp-1">{roadmap.title}</p>
              {roadmap.modules && (
                <div className="flex items-center space-x-2 text-[11px] text-git-textSubtle pt-1 border-t border-git-borderMuted">
                  <span className="flex items-center space-x-1">
                    <Layers className="h-3 w-3 text-git-indigo" />
                    <span>{roadmap.modules.length} {roadmap.modules.length === 1 ? 'module' : 'modules'}</span>
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-git-textMuted leading-relaxed">
            Full curriculum roadmaps with lecture resources, milestone checklists, and personal fork schedules are available to StudyGit community members. Sign in or register below to access this roadmap.
          </p>

          {/* Action CTAs */}
          <div className="space-y-2 pt-1">
            <Link
              to="/login"
              state={{ from: destination }}
              className="w-full inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-indigo px-3 py-2 text-xs font-semibold text-white hover:bg-git-indigoHover shadow-2xs transition-colors"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Log in to view roadmap</span>
            </Link>

            <Link
              to="/register"
              state={{ from: destination }}
              className="w-full inline-flex items-center justify-center space-x-1.5 rounded-md bg-git-green px-3 py-2 text-xs font-semibold text-white hover:bg-git-greenHover border border-git-greenHover shadow-2xs transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create free account</span>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-git-borderMuted bg-git-canvas px-4 py-2.5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded px-2.5 py-1 text-xs text-git-textMuted hover:text-git-text transition-colors"
          >
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
