import mongoose from 'mongoose';
const { Schema } = mongoose;

const ComponentSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['error_handling', 'risk_management', 'introduction', 'conclusion', 'validation', 'other'],
    default: 'other'
  },
  tags: {
    type: [String],
    default: []
  },
  version: {
    type: Number,
    required: true,
    default: 1
  },
  active: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: String,
    required: true
  },
  updatedBy: {
    type: String,
    required: true
  },
  usageCount: {
    type: Number,
    default: 0
  },
  metadata: {
    type: Map,
    of: Schema.Types.Mixed,
    default: new Map()
  }
}, {
  timestamps: true
});

// Create indexes
ComponentSchema.index({ name: 1 });
ComponentSchema.index({ category: 1 });
ComponentSchema.index({ tags: 1 });
ComponentSchema.index({ active: 1 });
ComponentSchema.index({ createdAt: 1 });

// Add methods
ComponentSchema.methods.incrementUsage = async function() {
  this.usageCount += 1;
  return this.save();
};

ComponentSchema.methods.decrementUsage = async function() {
  if (this.usageCount > 0) {
    this.usageCount -= 1;
    return this.save();
  }
  return this;
};

// Add static methods
ComponentSchema.statics.findActive = function(name) {
  return this.findOne({ name, active: true });
};

ComponentSchema.statics.findByCategory = function(category) {
  return this.find({ category, active: true });
};

ComponentSchema.statics.findByTags = function(tags) {
  return this.find({ 
    tags: { $in: tags },
    active: true 
  });
};

const Component = mongoose.model('Component', ComponentSchema);

export default Component; 