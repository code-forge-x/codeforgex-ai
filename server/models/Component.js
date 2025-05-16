import mongoose from 'mongoose';
const { Schema } = mongoose;

// Parameter sub-schema
const ParameterSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['string', 'number', 'boolean', 'array', 'object'],
    default: 'string'
  },
  description: {
    type: String,
    default: ''
  },
  default: Schema.Types.Mixed,
  options: {
    type: [Schema.Types.Mixed],
    default: []
  },
  required: {
    type: Boolean,
    default: false
  },
  semantic_type: {
    type: String,
    default: ''
  },
  validation: {
    type: Schema.Types.Mixed,
    default: undefined
  }
});

const ComponentSchema = new Schema({
  name: {
    type: String,
    trim: true
  },
  title: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
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
  component_version: {
    type: String
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
  },
  type: {
    type: String,
    default: 'generic_template',
  },
  parameters: {
    type: [ParameterSchema],
    default: []
  },
  dependent_components: {
    type: [String],
    default: []
  },
  required_by: {
    type: [String],
    default: []
  },
  default: {
    type: [String],
    default: []
  },
  tested_versions: {
    type: [String],
    default: []
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