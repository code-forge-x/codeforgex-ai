import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptPerformanceSchema = new Schema({
  templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', required: true, index: true },
  templateName: { type: String, required: true, index: true },
  templateVersion: { type: Number, required: true },
  parameters: { type: String, required: true }, // JSON string
  success: { type: Boolean, default: null, index: true },
  tokenUsage: {
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 }
  },
  latency: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date, default: null },
  error: { type: String, default: null }
});

PromptPerformanceSchema.index({ templateName: 1, success: 1 });
PromptPerformanceSchema.index({ createdAt: -1 });
PromptPerformanceSchema.index({ templateName: 1, createdAt: -1 });

const PromptPerformance = mongoose.model('PromptPerformance', PromptPerformanceSchema);
export default PromptPerformance; 