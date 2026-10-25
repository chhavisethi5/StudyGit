import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GitFork,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
  X,
  Loader2,
  CheckCircle2,
  CalendarDays,
  Layers,
} from 'lucide-react';
import { forkRoadmap } from '../api/roadmapApi';
import { useAuth } from '../context/AuthContext';

export default function ForkRoadmapModal({ isOpen, onClose, roadmap }) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Default dates: Today and 30 days from today
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const defaultExamStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  }, []);

  // Form State
  const [title, setTitle] = useState(
    roadmap ? `${roadmap.title} (Personal Plan)` : 'Personal Study Plan'
  );
  const [startDate, setStartDate] = useState(todayStr);
  const [examDate, setExamDate] = useState(defaultExamStr);
  const [dailyStudyHours, setDailyStudyHours] = useState(2);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  // Compute roadmap stats
  const { totalEstimatedHours, totalTopics } = useMemo(() => {
    if (!roadmap || !roadmap.modules) return { totalEstimatedHours: 0, totalTopics: 0 };
    let hours = 0;
    let topics = 0;
    roadmap.modules.forEach((mod) => {
      if (mod.topics) {
        topics += mod.topics.length;
        mod.topics.forEach((t) => {
          hours += Number(t.estimatedHours) || 0;
        });
      }
    });
    return { totalEstimatedHours: hours, totalTopics: topics };
  }, [roadmap]);

  // Compute available days and capacity
  const { availableDays, totalCapacity, isWorkloadExceeded, isInvalidDates } = useMemo(() => {
    if (!startDate || !examDate) {
      return { availableDays: 0, totalCapacity: 0, isWorkloadExceeded: false, isInvalidDates: false };
    }

    const start = new Date(startDate);
    const end = new Date(examDate);
    const diffMs = end.getTime() - start.getTime();
    const days = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1; // Inclusive

    if (days <= 0) {
      return { availableDays: 0, totalCapacity: 0, isWorkloadExceeded: false, isInvalidDates: true };
    }

    const hoursPerDay = Math.max(0.1, Number(dailyStudyHours) || 0);
    const capacity = Math.round(days * hoursPerDay * 10) / 10;
    const exceeded = totalEstimatedHours > capacity;

    return {
      availableDays: days,
      totalCapacity: capacity,
      isWorkloadExceeded: exceeded,
      isInvalidDates: false,
    };
  }, [startDate, examDate, dailyStudyHours, totalEstimatedHours]);

  if (!isOpen || !roadmap) return null;

  // Generate schedule array on client
  const generateSchedule = () => {
    const schedule = [];
    if (!startDate) return schedule;

    let currentDate = new Date(startDate);
    const dailyLimit = Math.max(0.5, Number(dailyStudyHours) || 2);
    let dayRemainingHours = dailyLimit;
    let dayNumber = 1;

    (roadmap.modules || []).forEach((mod) => {
      (mod.topics || []).forEach((topic) => {
        let topicRemaining = Number(topic.estimatedHours) || 1;

        while (topicRemaining > 0) {
          const allocated = Math.min(dayRemainingHours, topicRemaining);
          schedule.push({
            topicTitle: topic.title,
            moduleTitle: mod.title,
            date: new Date(currentDate),
            hours: allocated,
            dayNumber,
          });

          topicRemaining -= allocated;
          dayRemainingHours -= allocated;

          if (dayRemainingHours <= 0) {
            currentDate.setDate(currentDate.getDate() + 1);
            dayRemainingHours = dailyLimit;
            dayNumber++;
          }
        }
      });
    });

    return schedule;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!isAuthenticated) {
      setFormError('Authentication required. Please sign in to fork this roadmap.');
      return;
    }

    if (!title.trim()) {
      setFormError('Please enter a title for your personalized roadmap.');
      return;
    }

    if (isInvalidDates) {
      setFormError('Exam date must be on or after your start date.');
      return;
    }

    if (Number(dailyStudyHours) <= 0) {
      setFormError('Daily study hours must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    try {
      const schedule = generateSchedule();

      const payload = {
        title: title.trim(),
        startDate,
        examDate,
        dailyStudyHours: Number(dailyStudyHours),
        schedule,
      };

      const result = await forkRoadmap(roadmap._id, payload);

      if (result && result.data && result.data._id) {
        onClose();
        navigate(`/explore/${result.data._id}`, {
          state: { newlyForked: true, title: result.data.title },
        });
      } else {
        onClose();
        navigate('/my-roadmaps');
      }
    } catch (err) {
      console.error('Error forking roadmap:', err);
      setFormError(err.message || 'Failed to create personal fork. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-lg border border-git-border bg-white shadow-xl overflow-hidden animate-in fade-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-git-border bg-git-canvas px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-git-indigoSubtle text-git-indigo border border-git-indigo/20">
              <GitFork className="h-3.5 w-3.5" />
            </div>
            <h2 className="text-sm font-semibold text-git-text">Fork & Personalize Roadmap</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-git-textSubtle hover:text-git-text hover:bg-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3 text-xs text-git-redText flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          {/* Source Roadmap Summary */}
          <div className="rounded-md border border-git-borderMuted bg-git-canvas/50 p-3 text-xs space-y-1">
            <div className="text-[11px] font-medium text-git-textSubtle">Original Roadmap:</div>
            <div className="font-semibold text-git-text truncate">{roadmap.title}</div>
            <div className="flex items-center space-x-3 text-git-textMuted pt-1">
              <span className="flex items-center space-x-1">
                <Layers className="h-3 w-3 text-git-indigo" />
                <span>{totalTopics} topics</span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Clock className="h-3 w-3 text-git-amber" />
                <span>{totalEstimatedHours} estimated hours</span>
              </span>
            </div>
          </div>

          {/* Personal Title */}
          <div className="space-y-1">
            <label htmlFor="fork-title" className="block text-xs font-medium text-git-text">
              Personal Roadmap Title <span className="text-git-redText">*</span>
            </label>
            <input
              id="fork-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="e.g., My Systems Exam Prep"
              className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
            />
          </div>

          {/* Date Range Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="fork-start-date" className="block text-xs font-medium text-git-text">
                Start Date
              </label>
              <input
                id="fork-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="fork-exam-date" className="block text-xs font-medium text-git-text">
                Exam / Target Date
              </label>
              <input
                id="fork-exam-date"
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-md border border-git-border bg-white px-2.5 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
              />
            </div>
          </div>

          {/* Daily Study Hours Limit */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="fork-daily-hours" className="block text-xs font-medium text-git-text">
                Daily Study Capacity (Hours/Day)
              </label>
              <span className="text-xs font-mono font-medium text-git-text">
                {dailyStudyHours} hrs/day
              </span>
            </div>
            <input
              id="fork-daily-hours"
              type="number"
              min="0.5"
              max="16"
              step="0.5"
              value={dailyStudyHours}
              onChange={(e) => setDailyStudyHours(e.target.value)}
              className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
            />
          </div>

          {/* Schedule Calculation Summary */}
          <div className="rounded-md border border-git-border bg-git-canvas/30 p-3 space-y-2 text-xs">
            <div className="flex items-center justify-between text-git-textMuted">
              <span>Study window:</span>
              <span className="font-medium text-git-text">
                {isInvalidDates ? 'Invalid date range' : `${availableDays} days`}
              </span>
            </div>
            <div className="flex items-center justify-between text-git-textMuted">
              <span>Total study capacity:</span>
              <span className="font-medium text-git-text">{totalCapacity} hrs</span>
            </div>
            <div className="flex items-center justify-between text-git-textMuted">
              <span>Required syllabus hours:</span>
              <span className="font-medium text-git-text">{totalEstimatedHours} hrs</span>
            </div>

            {/* Overload Warning Notice */}
            {isWorkloadExceeded && !isInvalidDates && (
              <div className="mt-2 rounded border border-git-amber/30 bg-git-amberSubtle p-2 text-xs text-git-amberText flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-git-amber" />
                <div className="leading-relaxed">
                  <strong className="font-semibold">Workload Warning: </strong>
                  The total syllabus workload ({totalEstimatedHours} hrs) exceeds your planned capacity ({totalCapacity} hrs) before your exam. Consider increasing daily study hours or extending your target date.
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2 border-t border-git-borderMuted">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isInvalidDates}
              className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-3.5 py-1.5 text-xs font-medium text-white border border-git-greenHover hover:bg-git-greenHover shadow-2xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating Fork...</span>
                </>
              ) : (
                <>
                  <GitFork className="h-3.5 w-3.5" />
                  <span>Create Personal Fork</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
