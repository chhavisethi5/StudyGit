import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Plus,
  Trash2,
  BookOpen,
  Layers,
  Clock,
  Link as LinkIcon,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  LogIn,
} from 'lucide-react';
import { createRoadmap } from '../api/roadmapApi';
import { useAuth } from '../context/AuthContext';

export default function CreateRoadmapPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  // Basic Information State
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [university, setUniversity] = useState('');
  const [semester, setSemester] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [visibility, setVisibility] = useState('public');

  // Modules, Topics, and Resources State
  const [modules, setModules] = useState([
    {
      title: 'Module 1: Foundations',
      description: 'Core concepts and foundational principles',
      topics: [
        {
          title: 'Introduction & Core Terminology',
          description: 'Overview of fundamental definitions',
          estimatedHours: 4,
          resources: [
            {
              title: 'Official Documentation',
              url: 'https://developer.mozilla.org',
              type: 'documentation',
              description: 'Primary reference guide',
            },
          ],
        },
      ],
    },
  ]);

  // Form Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState(null);

  // Module Handlers
  const addModule = () => {
    setModules((prev) => [
      ...prev,
      {
        title: `Module ${prev.length + 1}`,
        description: '',
        topics: [],
      },
    ]);
  };

  const removeModule = (mIndex) => {
    setModules((prev) => prev.filter((_, idx) => idx !== mIndex));
  };

  const updateModule = (mIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      copy[mIndex] = { ...copy[mIndex], [field]: value };
      return copy;
    });
  };

  // Topic Handlers
  const addTopic = (mIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      targetModule.topics = [
        ...targetModule.topics,
        {
          title: '',
          description: '',
          estimatedHours: 2,
          resources: [],
        },
      ];
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const removeTopic = (mIndex, tIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      targetModule.topics = targetModule.topics.filter((_, idx) => idx !== tIndex);
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const updateTopic = (mIndex, tIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      topicsCopy[tIndex] = { ...topicsCopy[tIndex], [field]: value };
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  // Resource Handlers
  const addResource = (mIndex, tIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      targetTopic.resources = [
        ...targetTopic.resources,
        {
          title: '',
          url: '',
          type: 'article',
          description: '',
        },
      ];
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const removeResource = (mIndex, tIndex, rIndex) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      targetTopic.resources = targetTopic.resources.filter((_, idx) => idx !== rIndex);
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  const updateResource = (mIndex, tIndex, rIndex, field, value) => {
    setModules((prev) => {
      const copy = [...prev];
      const targetModule = { ...copy[mIndex] };
      const topicsCopy = [...targetModule.topics];
      const targetTopic = { ...topicsCopy[tIndex] };
      const resourcesCopy = [...targetTopic.resources];
      resourcesCopy[rIndex] = { ...resourcesCopy[rIndex], [field]: value };
      targetTopic.resources = resourcesCopy;
      topicsCopy[tIndex] = targetTopic;
      targetModule.topics = topicsCopy;
      copy[mIndex] = targetModule;
      return copy;
    });
  };

  // Validation
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = 'Title is required';
    } else if (title.trim().length > 200) {
      errors.title = 'Title cannot exceed 200 characters';
    }

    if (!subject.trim()) {
      errors.subject = 'Subject is required';
    } else if (subject.trim().length > 100) {
      errors.subject = 'Subject cannot exceed 100 characters';
    }

    // Validate modules, topics, and resources
    modules.forEach((mod, mIdx) => {
      if (!mod.title.trim()) {
        errors[`module_${mIdx}`] = `Module ${mIdx + 1} title is required`;
      }

      mod.topics.forEach((topic, tIdx) => {
        if (!topic.title.trim()) {
          errors[`module_${mIdx}_topic_${tIdx}`] = `Topic title in Module ${mIdx + 1} is required`;
        }

        const hrs = Number(topic.estimatedHours);
        if (isNaN(hrs) || hrs < 0) {
          errors[`module_${mIdx}_topic_${tIdx}_hours`] = `Estimated hours must be a non-negative number`;
        }

        topic.resources.forEach((res, rIdx) => {
          if (!res.title.trim()) {
            errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_title`] = 'Resource title is required';
          }
          if (!res.url.trim()) {
            errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'Resource URL is required';
          } else {
            try {
              const parsed = new URL(res.url.trim());
              if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
                errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'URL must start with http:// or https://';
              }
            } catch {
              errors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] = 'Please enter a valid URL';
            }
          }
        });
      });
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);

    if (!isAuthenticated) {
      setApiError('Authentication is required to publish a roadmap. Please sign in or create an account.');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Clean tags into array
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Structure modules and assign order
      const formattedModules = modules.map((mod, mIdx) => ({
        title: mod.title.trim(),
        description: mod.description.trim(),
        order: mIdx,
        topics: mod.topics.map((topic, tIdx) => ({
          title: topic.title.trim(),
          description: topic.description.trim(),
          estimatedHours: Math.max(0, Number(topic.estimatedHours) || 0),
          order: tIdx,
          resources: topic.resources.map((res) => ({
            title: res.title.trim(),
            url: res.url.trim(),
            type: res.type || 'other',
            description: res.description ? res.description.trim() : '',
          })),
        })),
      }));

      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        university: university.trim(),
        semester: semester.trim(),
        tags,
        visibility,
        modules: formattedModules,
      };

      const result = await createRoadmap(payload);

      if (result && result.data && result.data._id) {
        // Navigate directly to the newly created roadmap's details page
        navigate(`/explore/${result.data._id}`, {
          state: { newlyCreated: true, title: result.data.title },
        });
      } else {
        navigate('/explore');
      }
    } catch (err) {
      console.error('Error creating roadmap:', err);
      setApiError(err.message || 'Failed to create roadmap. Please check your inputs and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-git-textMuted">
        <Link to="/explore" className="hover:text-git-text inline-flex items-center space-x-1 transition-colors">
          <Compass className="h-3.5 w-3.5 text-git-indigo" />
          <span>Explore Roadmaps</span>
        </Link>
        <ChevronRight className="h-3 w-3 text-git-textSubtle" />
        <span className="text-git-text font-medium">New Roadmap</span>
      </nav>

      {/* Page Header */}
      <div className="border-b border-git-border pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-git-text">Publish a New Roadmap</h1>
            <p className="text-xs text-git-textMuted mt-1">
              Structure curriculum milestones, topics, estimated study hours, and curated references for fellow students.
            </p>
          </div>
          <Link
            to="/explore"
            className="hidden sm:inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-white px-3 py-1.5 text-xs font-medium text-git-text hover:bg-git-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Cancel</span>
          </Link>
        </div>
      </div>

      {/* API Error Banner */}
      {apiError && (
        <div className="rounded-md border border-git-red/20 bg-git-redSubtle p-3.5 text-xs text-git-redText flex items-start space-x-2">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Creation Error:</span> {apiError}
          </div>
        </div>
      )}

      {/* Guest Warning Banner */}
      {!isAuthenticated && (
        <div className="rounded-md border border-git-amber/30 bg-git-amberSubtle p-3.5 text-xs text-git-amberText flex items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <LogIn className="h-4 w-4 shrink-0" />
            <span>
              <strong>Guest mode:</strong> You are not signed in. An authenticated account is required to publish this roadmap and establish authorship.
            </span>
          </div>
          <Link
            to="/login"
            state={{ from: location }}
            className="shrink-0 inline-flex items-center space-x-1 rounded bg-white px-2.5 py-1 text-xs font-semibold text-git-text border border-git-border hover:bg-git-canvas shadow-2xs"
          >
            <span>Sign in</span>
          </Link>
        </div>
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <section className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-4">
          <div className="border-b border-git-borderMuted pb-2.5">
            <h2 className="text-sm font-semibold text-git-text flex items-center space-x-2">
              <BookOpen className="h-4 w-4 text-git-indigo" />
              <span>General Information</span>
            </h2>
            <p className="text-xs text-git-textMuted mt-0.5">
              High-level metadata to identify this roadmap in the directory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-xs font-medium text-git-text mb-1">
                Roadmap Title <span className="text-git-redText">*</span>
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Computer Systems & Architecture - Core Curriculum"
                className={`w-full rounded-md border px-3 py-1.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:outline-none focus:ring-1 transition-colors ${
                  formErrors.title
                    ? 'border-git-red focus:border-git-red focus:ring-git-red'
                    : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                }`}
              />
              {formErrors.title && (
                <p className="mt-1 text-[11px] text-git-redText">{formErrors.title}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label htmlFor="subject" className="block text-xs font-medium text-git-text mb-1">
                Subject / Domain <span className="text-git-redText">*</span>
              </label>
              <input
                id="subject"
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Computer Science, Mathematics, Physics"
                className={`w-full rounded-md border px-3 py-1.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:outline-none focus:ring-1 transition-colors ${
                  formErrors.subject
                    ? 'border-git-red focus:border-git-red focus:ring-git-red'
                    : 'border-git-border focus:border-git-indigo focus:ring-git-indigo'
                }`}
              />
              {formErrors.subject && (
                <p className="mt-1 text-[11px] text-git-redText">{formErrors.subject}</p>
              )}
            </div>

            {/* University */}
            <div>
              <label htmlFor="university" className="block text-xs font-medium text-git-text mb-1">
                University / Institution <span className="text-git-textSubtle font-normal">(Optional)</span>
              </label>
              <input
                id="university"
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="e.g., Stanford University, MIT, Autonomous"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>

            {/* Semester */}
            <div>
              <label htmlFor="semester" className="block text-xs font-medium text-git-text mb-1">
                Semester / Term <span className="text-git-textSubtle font-normal">(Optional)</span>
              </label>
              <input
                id="semester"
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="e.g., Semester 3, Fall 2026, Year 2"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-xs font-medium text-git-text mb-1">
                Tags <span className="text-git-textSubtle font-normal">(Comma-separated)</span>
              </label>
              <input
                id="tags"
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="e.g., systems, c-programming, assembly, hardware"
                className="w-full rounded-md border border-git-border px-3 py-1.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-xs font-medium text-git-text mb-1">
                Description / Overview <span className="text-git-textSubtle font-normal">(Optional)</span>
              </label>
              <textarea
                id="description"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide a concise syllabus summary, prerequisites, and learning objectives..."
                className="w-full rounded-md border border-git-border p-2.5 text-xs text-git-text bg-white placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo transition-colors leading-relaxed"
              />
            </div>
          </div>
        </section>

        {/* Card 2: Modules, Topics, and Resources */}
        <section className="rounded-lg border border-git-border bg-white p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-git-borderMuted pb-2.5">
            <div>
              <h2 className="text-sm font-semibold text-git-text flex items-center space-x-2">
                <Layers className="h-4 w-4 text-git-indigo" />
                <span>Curriculum Modules & Topics</span>
              </h2>
              <p className="text-xs text-git-textMuted mt-0.5">
                Organize syllabus content into sequential units, topics, estimated hours, and reference links.
              </p>
            </div>
            <button
              type="button"
              onClick={addModule}
              className="inline-flex items-center space-x-1.5 rounded-md border border-git-border bg-git-canvas px-2.5 py-1 text-xs font-medium text-git-text hover:bg-white hover:border-git-textSubtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-colors"
            >
              <Plus className="h-3.5 w-3.5 text-git-green" />
              <span>Add Module</span>
            </button>
          </div>

          {modules.length === 0 ? (
            <div className="rounded-md border border-dashed border-git-border p-6 text-center">
              <p className="text-xs text-git-textMuted">No modules added yet.</p>
              <button
                type="button"
                onClick={addModule}
                className="mt-2 inline-flex items-center space-x-1 text-xs font-medium text-git-indigo hover:underline"
              >
                <Plus className="h-3 w-3" />
                <span>Add your first module</span>
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {modules.map((mod, mIdx) => (
                <div
                  key={mIdx}
                  className="rounded-md border border-git-border bg-git-canvas/40 p-4 space-y-3"
                >
                  {/* Module Header Row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-git-text uppercase tracking-wider mb-1">
                          Module {mIdx + 1} Title <span className="text-git-redText">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={mod.title}
                          onChange={(e) => updateModule(mIdx, 'title', e.target.value)}
                          placeholder="e.g., Module 1: Memory Management"
                          className="w-full rounded border border-git-border bg-white px-2.5 py-1 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                        />
                        {formErrors[`module_${mIdx}`] && (
                          <p className="text-[10px] text-git-redText mt-0.5">
                            {formErrors[`module_${mIdx}`]}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-git-text uppercase tracking-wider mb-1">
                          Module Description
                        </label>
                        <input
                          type="text"
                          value={mod.description}
                          onChange={(e) => updateModule(mIdx, 'description', e.target.value)}
                          placeholder="Optional unit summary"
                          className="w-full rounded border border-git-border bg-white px-2.5 py-1 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeModule(mIdx)}
                      className="p-1 rounded text-git-textSubtle hover:text-git-redText hover:bg-git-redSubtle transition-colors"
                      title="Remove this module"
                      aria-label={`Remove Module ${mIdx + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Topics List within Module */}
                  <div className="pl-3 border-l-2 border-git-border space-y-3 pt-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-git-textSubtle uppercase tracking-wider">
                        Topics ({mod.topics.length})
                      </span>
                      <button
                        type="button"
                        onClick={() => addTopic(mIdx)}
                        className="inline-flex items-center space-x-1 text-xs text-git-indigo hover:underline font-medium"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Add Topic</span>
                      </button>
                    </div>

                    {mod.topics.map((topic, tIdx) => (
                      <div
                        key={tIdx}
                        className="rounded border border-git-border bg-white p-3 space-y-2.5 shadow-2xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 grid grid-cols-1 sm:grid-cols-4 gap-2">
                            <div className="sm:col-span-3">
                              <label className="block text-[11px] font-medium text-git-text mb-0.5">
                                Topic Title <span className="text-git-redText">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={topic.title}
                                onChange={(e) => updateTopic(mIdx, tIdx, 'title', e.target.value)}
                                placeholder="e.g., Virtual Memory & Paging Algorithms"
                                className="w-full rounded border border-git-border px-2 py-1 text-xs text-git-text placeholder-git-textSubtle focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                              />
                              {formErrors[`module_${mIdx}_topic_${tIdx}`] && (
                                <p className="text-[10px] text-git-redText mt-0.5">
                                  {formErrors[`module_${mIdx}_topic_${tIdx}`]}
                                </p>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-medium text-git-text mb-0.5">
                                Est. Hours
                              </label>
                              <div className="relative">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  value={topic.estimatedHours}
                                  onChange={(e) =>
                                    updateTopic(mIdx, tIdx, 'estimatedHours', e.target.value)
                                  }
                                  className="w-full rounded border border-git-border px-2 py-1 text-xs text-git-text pr-7 focus:border-git-indigo focus:outline-none focus:ring-1 focus:ring-git-indigo"
                                />
                                <span className="absolute right-2 top-1 text-[11px] text-git-textSubtle">
                                  hrs
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeTopic(mIdx, tIdx)}
                            className="p-1 rounded text-git-textSubtle hover:text-git-redText hover:bg-git-redSubtle transition-colors"
                            title="Remove this topic"
                            aria-label={`Remove Topic ${tIdx + 1}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Topic Description */}
                        <div>
                          <input
                            type="text"
                            value={topic.description}
                            onChange={(e) => updateTopic(mIdx, tIdx, 'description', e.target.value)}
                            placeholder="Brief topic summary or notes (optional)"
                            className="w-full rounded border border-git-borderMuted px-2 py-1 text-xs text-git-text placeholder-git-textSubtle bg-git-canvas/30 focus:bg-white focus:border-git-indigo focus:outline-none"
                          />
                        </div>

                        {/* Resources within Topic */}
                        <div className="pt-1.5 border-t border-git-borderMuted space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-git-textSubtle flex items-center space-x-1">
                              <LinkIcon className="h-3 w-3" />
                              <span>Resources ({topic.resources.length})</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => addResource(mIdx, tIdx)}
                              className="text-[11px] text-git-indigo hover:underline inline-flex items-center space-x-0.5"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Add Resource</span>
                            </button>
                          </div>

                          {topic.resources.map((res, rIdx) => (
                            <div
                              key={rIdx}
                              className="rounded border border-git-borderMuted bg-git-canvas/50 p-2 space-y-1.5"
                            >
                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-1.5 items-center">
                                <div className="sm:col-span-4">
                                  <input
                                    type="text"
                                    required
                                    value={res.title}
                                    onChange={(e) =>
                                      updateResource(mIdx, tIdx, rIdx, 'title', e.target.value)
                                    }
                                    placeholder="Resource title"
                                    className="w-full rounded border border-git-border px-2 py-0.5 text-xs text-git-text placeholder-git-textSubtle bg-white"
                                  />
                                </div>
                                <div className="sm:col-span-5">
                                  <input
                                    type="url"
                                    required
                                    value={res.url}
                                    onChange={(e) =>
                                      updateResource(mIdx, tIdx, rIdx, 'url', e.target.value)
                                    }
                                    placeholder="https://..."
                                    className="w-full rounded border border-git-border px-2 py-0.5 text-xs text-git-text placeholder-git-textSubtle bg-white"
                                  />
                                </div>
                                <div className="sm:col-span-2">
                                  <select
                                    value={res.type}
                                    onChange={(e) =>
                                      updateResource(mIdx, tIdx, rIdx, 'type', e.target.value)
                                    }
                                    className="w-full rounded border border-git-border px-1.5 py-0.5 text-xs text-git-text bg-white"
                                  >
                                    <option value="article">Article</option>
                                    <option value="video">Video</option>
                                    <option value="documentation">Docs</option>
                                    <option value="pdf">PDF</option>
                                    <option value="other">Other</option>
                                  </select>
                                </div>
                                <div className="sm:col-span-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => removeResource(mIdx, tIdx, rIdx)}
                                    className="text-git-textSubtle hover:text-git-redText p-0.5"
                                    title="Remove resource"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                              {formErrors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`] && (
                                <p className="text-[10px] text-git-redText">
                                  {formErrors[`module_${mIdx}_topic_${tIdx}_res_${rIdx}_url`]}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Submit Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <Link
            to="/explore"
            className="rounded-md border border-git-border bg-white px-4 py-2 text-xs font-medium text-git-text hover:bg-git-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-indigo transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center space-x-1.5 rounded-md bg-git-green px-4 py-2 text-xs font-medium text-white shadow-2xs border border-git-greenHover hover:bg-git-greenHover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-git-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? (
              <>
                <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Publish Roadmap</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
