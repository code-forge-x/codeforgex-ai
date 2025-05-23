import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  project_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  current_phase: {
    type: String,
    enum: [
      'requirements',
      'blueprint_generation',
      'approval',
      'code',
      'admin_review',
      'completed'
    ],
    default: 'requirements'
  },
  phase_status: {
    type: String,
    enum: ['in_progress', 'approved', 'rejected', 'needs_editing'],
    default: 'in_progress'
  },
  context_data: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: () => new Map()
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
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
    phase: {
      type: String,
      required: false
    },
    message: {
      type: String,
      required: true
    }
  }]
});

// Update the updated_at timestamp before saving
sessionSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Convert Map to object when converting to JSON
sessionSchema.methods.toJSON = function() {
  const obj = this.toObject();
  if (obj.context_data instanceof Map) {
    obj.context_data = Object.fromEntries(obj.context_data);
  }
  return obj;
};

const Session = mongoose.model('Session', sessionSchema);

export default Session; 