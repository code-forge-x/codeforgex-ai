import mongoose from 'mongoose';

const projectSessionSchema = new mongoose.Schema({
  project_id: {
    type: String,
    required: true,
    unique: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assigned_to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  current_phase: {
    type: String,
    enum: ['requirements', 'blueprint', 'approval', 'code', 'admin_review', 'completed', 'rejected'],
    default: 'requirements'
  },
  status: {
    type: String,
    enum: ['in_progress', 'completed', 'rejected', 'on_hold'],
    default: 'in_progress'
  },
  context_data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: new Map()
  },
  activity_log: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'developer', 'support'],
      required: true
    },
    action: {
      type: String,
      enum: ['created', 'updated', 'advanced', 'approved', 'rejected', 'edited', 'restarted', 'feedback'],
      required: true
    },
    message: {
      type: String,
      required: true
    }
  }],
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
projectSessionSchema.index({ project_id: 1 });
projectSessionSchema.index({ user_id: 1 });
projectSessionSchema.index({ assigned_to: 1 });
projectSessionSchema.index({ current_phase: 1 });
projectSessionSchema.index({ status: 1 });
projectSessionSchema.index({ created_at: -1 });
projectSessionSchema.index({ updated_at: -1 });

// Pre-save middleware to update timestamps
projectSessionSchema.pre('save', function(next) {
  this.updated_at = new Date();
  next();
});

// Method to check if a user has access to this session
projectSessionSchema.methods.hasAccess = function(userId, role) {
  return (
    this.user_id.toString() === userId.toString() ||
    this.assigned_to?.toString() === userId.toString() ||
    role === 'admin'
  );
};

// Method to add an activity log entry
projectSessionSchema.methods.logActivity = function(userId, role, action, message) {
  this.activity_log.push({
    timestamp: new Date(),
    user_id: userId,
    role,
    action,
    message
  });
};

// Method to update context data
projectSessionSchema.methods.updateContext = function(newData) {
  this.context_data = {
    ...this.context_data,
    ...newData
  };
};

// Method to advance to next phase
projectSessionSchema.methods.advancePhase = function() {
  const phases = ['requirements', 'blueprint', 'approval', 'code', 'admin_review', 'completed'];
  const currentIndex = phases.indexOf(this.current_phase);
  if (currentIndex < phases.length - 1) {
    this.current_phase = phases[currentIndex + 1];
    if (this.current_phase === 'completed') {
      this.status = 'completed';
    }
    return true;
  }
  return false;
};

const ProjectSession = mongoose.model('ProjectSession', projectSessionSchema);

export default ProjectSession; 