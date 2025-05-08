const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PromptComponentSchema = new Schema({
  name: { type: String, required: true, trim: true, unique: true, index: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['instruction', 'example', 'format', 'system', 'language_specific'],
    default: 'instruction',
    index: true
  },
  content: { type: String, required: true },
  version: { type: Number, default: 1 },
  active: { type: Boolean, default: true, index: true },
  tags: { type: [String], default: [], index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true },
  previousVersion: { type: Schema.Types.ObjectId, ref: 'PromptComponent', default: null }
});

PromptComponentSchema.index({ name: 1, active: 1 });
PromptComponentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('PromptComponent', PromptComponentSchema); 