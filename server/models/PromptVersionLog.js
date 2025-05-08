import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptVersionLogSchema = new Schema({
  templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', required: true, index: true },
  templateName: { type: String, required: true, index: true },
  version: { type: Number, required: true },
  action: {
    type: String,
    enum: ['created', 'activated', 'deactivated', 'edited', 'deleted'],
    required: true,
    index: true
  },
  timestamp: { type: Date, default: Date.now, index: true },
  author: { type: String, required: true },
  notes: { type: String, default: '' },
  metadata: { type: Schema.Types.Mixed, default: {} }
});

PromptVersionLogSchema.index({ templateName: 1, timestamp: -1 });

const PromptVersionLog = mongoose.model('PromptVersionLog', PromptVersionLogSchema);
export default PromptVersionLog; 