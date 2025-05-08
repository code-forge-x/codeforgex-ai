import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptTemplateSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['blueprint', 'component_generation', 'tech_support', 'code_analysis', 'system'],
    default: 'component_generation',
    index: true
  },
  version: { type: Number, default: 1 },
  content: { type: String, required: true },
  active: { type: Boolean, default: false, index: true },
  tags: { type: [String], default: [], index: true },
  parameters: [{
    name: String,
    description: String,
    required: Boolean,
    defaultValue: Schema.Types.Mixed,
    type: {
      type: String,
      enum: ['string', 'boolean', 'number', 'array', 'object'],
      default: 'string'
    }
  }],
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  previousVersion: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', default: null },
  notes: { type: String, default: '' }
});

PromptTemplateSchema.index({ name: 1, active: 1 });
PromptTemplateSchema.statics.findActive = function(name) {
  return this.findOne({ name, active: true });
};
PromptTemplateSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PromptTemplate = mongoose.model('PromptTemplate', PromptTemplateSchema);
export default PromptTemplate; 