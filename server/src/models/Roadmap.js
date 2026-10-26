const mongoose = require('mongoose');

// Helper function to validate HTTP/HTTPS URLs
const isValidHttpUrl = (val) => {
  if (!val || typeof val !== 'string') return false;
  try {
    const parsed = new URL(val);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
};

// Resource Subdocument Schema
const ResourceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Resource title is required'],
      trim: true,
    },
    url: {
      type: String,
      required: [true, 'Resource URL is required'],
      trim: true,
      validate: {
        validator: isValidHttpUrl,
        message: (props) => `"${props.value}" is not a valid HTTP or HTTPS URL`,
      },
    },
    type: {
      type: String,
      enum: {
        values: ['video', 'article', 'pdf', 'documentation', 'other'],
        message: 'Resource type must be one of: video, article, pdf, documentation, other',
      },
      default: 'other',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    // Reference to original resource if this is a cloned fork
    originalResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: true }
);

// Topic Subdocument Schema
const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Topic title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    estimatedHours: {
      type: Number,
      min: [0, 'Estimated hours must be a non-negative number'],
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    resources: {
      type: [ResourceSchema],
      default: [],
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    scheduledDate: {
      type: Date,
      default: null,
    },
    // Reference to original topic if this is a cloned fork
    originalTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: true }
);

// Module Subdocument Schema
const ModuleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Module title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    topics: {
      type: [TopicSchema],
      default: [],
    },
    // Reference to original module if this is a cloned fork
    originalModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { _id: true }
);

// Main Roadmap Schema
const RoadmapSchema = new mongoose.Schema(
  {
    // Basic Information
    title: {
      type: String,
      required: [true, 'Roadmap title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
      maxlength: [100, 'Subject cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    university: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    tags: {
      type: [String],
      default: [],
    },

    // Ownership & Visibility
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    visibility: {
      type: String,
      enum: {
        values: ['public', 'private'],
        message: 'Visibility must be either public or private',
      },
      default: 'public',
      index: true,
    },

    // Embedded Syllabus Modules
    modules: {
      type: [ModuleSchema],
      default: [],
    },

    // Future Version Control Support
    parentRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      default: null,
    },
    version: {
      type: Number,
      default: 1,
      min: [1, 'Version must be at least 1'],
    },

    // Personal Planning & Fork Metadata
    startDate: {
      type: Date,
      default: null,
    },
    examDate: {
      type: Date,
      default: null,
    },
    dailyStudyHours: {
      type: Number,
      min: [0, 'Daily study hours must be a non-negative number'],
      default: 2,
    },
    schedule: {
      type: [
        {
          topicId: { type: mongoose.Schema.Types.ObjectId },
          topicTitle: { type: String, default: '' },
          moduleTitle: { type: String, default: '' },
          date: { type: Date },
          hours: { type: Number, default: 0 },
          dayNumber: { type: Number, default: 1 },
        },
      ],
      default: [],
    },

    // Upvotes & Popularity Metrics
    upvotes: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
      default: [],
    },
    upvoteCount: {
      type: Number,
      default: 0,
      min: [0, 'Upvote count cannot be negative'],
      index: true,
    },

    // Fork Popularity Metric
    forkCount: {
      type: Number,
      default: 0,
      min: [0, 'Fork count cannot be negative'],
      index: true,
    },
  },
  {
    timestamps: true, // creates createdAt and updatedAt
  }
);

// Text Index for Keyword Search across Title, Subject, and Description
RoadmapSchema.index({
  title: 'text',
  subject: 'text',
  description: 'text',
});

// Compound and Secondary Indexes for efficient query filtering and sorting
RoadmapSchema.index({ visibility: 1, subject: 1 });
RoadmapSchema.index({ visibility: 1, university: 1 });
RoadmapSchema.index({ visibility: 1, semester: 1 });
RoadmapSchema.index({ visibility: 1, tags: 1 });
RoadmapSchema.index({ createdAt: -1 });
RoadmapSchema.index({ visibility: 1, upvoteCount: -1, createdAt: -1 });
RoadmapSchema.index({ visibility: 1, forkCount: -1, createdAt: -1 });

const Roadmap = mongoose.models.Roadmap || mongoose.model('Roadmap', RoadmapSchema);

module.exports = Roadmap;
