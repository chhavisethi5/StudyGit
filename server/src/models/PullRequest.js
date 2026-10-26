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

// Resource change payload schema
const ResourceChangeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, 'Resource title is required'],
    },
    url: {
      type: String,
      trim: true,
      required: [true, 'Resource URL is required'],
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
  },
  { _id: false }
);

// Individual proposed change schema
const ProposedChangeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: [true, 'Change type is required'],
      enum: {
        values: ['add_resource', 'replace_resource', 'update_topic_description'],
        message: 'Change type must be add_resource, replace_resource, or update_topic_description',
      },
    },
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target module ID is required'],
    },
    moduleTitle: {
      type: String,
      trim: true,
      default: '',
    },
    topicId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target topic ID is required'],
    },
    topicTitle: {
      type: String,
      trim: true,
      default: '',
    },
    // For replace_resource
    targetResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    targetResourceTitle: {
      type: String,
      trim: true,
      default: '',
    },
    // Traceability references to the source fork's subdocument IDs
    forkModuleId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    forkTopicId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    forkResourceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    // For add_resource and replace_resource
    resource: {
      type: ResourceChangeSchema,
      default: null,
    },
    // For update_topic_description
    newDescription: {
      type: String,
      trim: true,
      default: '',
    },
    oldDescription: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: true }
);

const PullRequestSchema = new mongoose.Schema(
  {
    // The upstream/original roadmap to which changes are proposed
    originalRoadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Original roadmap ID is required'],
      index: true,
    },
    // The fork owned by the user from which changes originate
    sourceForkId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: [true, 'Source fork ID is required'],
    },
    // User proposing the changes
    proposerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Proposing user ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Pull request title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    // Detailed explanation of why changes should be accepted
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    status: {
      type: String,
      enum: {
        values: ['open', 'accepted', 'rejected'],
        message: 'Status must be open, accepted, or rejected',
      },
      default: 'open',
      index: true,
    },
    // Proposed changes stored separately from the original roadmap until accepted
    proposedChanges: {
      type: [ProposedChangeSchema],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'A pull request must contain at least one proposed change.',
      },
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

PullRequestSchema.index({ originalRoadmapId: 1, status: 1 });
PullRequestSchema.index({ proposerId: 1, status: 1 });
PullRequestSchema.index({ sourceForkId: 1 });
PullRequestSchema.index({ createdAt: -1 });

const PullRequest = mongoose.models.PullRequest || mongoose.model('PullRequest', PullRequestSchema);

module.exports = PullRequest;
