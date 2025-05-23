import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptTemplateSchema = new Schema({
  template_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['blueprint', 'component_generation', 'tech_support', 'code_analysis', 'system', 'requirements', 'testing', 'validation'],
    default: 'component_generation'
  },
  subcategory: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'inactive'],
    default: 'pending'
  },
  content: { type: String, required: true },
  version: { type: Number, required: true },
  active: { type: Boolean, default: false },
  tags: { type: [String], default: [] },
  parameters: [{ type: Schema.Types.ObjectId, ref: 'PromptParameter' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  previousVersion: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', default: null },
  notes: { type: String, default: '' }
}, {
  timestamps: true
});

// Drop all existing indexes
PromptTemplateSchema.indexes().forEach(index => {
  PromptTemplateSchema.index(index[0], { unique: false });
});

// Create new indexes
PromptTemplateSchema.index({ category: 1 });
PromptTemplateSchema.index({ status: 1 });
PromptTemplateSchema.index({ active: 1 });
PromptTemplateSchema.index({ tags: 1 });
PromptTemplateSchema.index({ createdAt: 1 });
// Compound unique index for template_id and version
PromptTemplateSchema.index({ template_id: 1, version: 1 }, { unique: true });

PromptTemplateSchema.statics.findActive = function(template_id) {
  return this.findOne({ template_id, active: true });
};

PromptTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PromptTemplate = mongoose.model('PromptTemplate', PromptTemplateSchema);

// Drop the existing collection's indexes and recreate them
PromptTemplate.collection.dropIndexes()
  .then(() => {
    console.log('Dropped all indexes from PromptTemplate collection');
    return PromptTemplate.createIndexes();
  })
  .then(() => {
    console.log('Created new indexes for PromptTemplate collection');
  })
  .catch(err => {
    console.error('Error managing indexes:', err);
  });

export default PromptTemplate; 