import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptPerformanceSchema = new Schema({
  // Basic Information
  templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', required: true, index: true },
  templateName: { type: String, required: true, index: true },
  templateVersion: { type: Number, required: true },
  phase: { type: String, enum: ['requirements', 'blueprint', 'code', 'testing', 'deployment'], required: true, index: true },
  
  // Request Details
  parameters: { type: String, required: true }, // JSON string
  requestSize: { type: Number, default: 0 }, // Size of request in bytes
  
  // Performance Metrics
  success: { type: Boolean, default: null, index: true },
  tokenUsage: {
    inputTokens: { type: Number, default: 0 },
    outputTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 }
  },
  latency: { 
    total: { type: Number, default: 0 }, // Total time in ms
    aiProcessing: { type: Number, default: 0 }, // AI processing time
    network: { type: Number, default: 0 } // Network latency
  },
  
  // Quality Metrics
  quality: {
    clarity: { type: Number, min: 1, max: 5, default: null }, // For requirements phase
    accuracy: { type: Number, min: 1, max: 5, default: null }, // For blueprint phase
    codeQuality: { type: Number, min: 1, max: 5, default: null }, // For code phase
    testCoverage: { type: Number, min: 0, max: 100, default: null } // For testing phase
  },
  
  // User Feedback
  userFeedback: {
    rating: { type: Number, min: 1, max: 5, default: null },
    comments: { type: String, default: null },
    helpful: { type: Boolean, default: null }
  },
  
  // Error Tracking
  error: {
    type: { type: String, enum: ['api', 'validation', 'system', 'user', 'other'], default: null },
    message: { type: String, default: null },
    stack: { type: String, default: null },
    retryCount: { type: Number, default: 0 }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  completedAt: { type: Date, default: null },
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes for common queries
PromptPerformanceSchema.index({ templateName: 1, success: 1 });
PromptPerformanceSchema.index({ phase: 1, success: 1 });
PromptPerformanceSchema.index({ createdAt: 1 });
PromptPerformanceSchema.index({ 'quality.clarity': 1 });
PromptPerformanceSchema.index({ 'quality.accuracy': 1 });
PromptPerformanceSchema.index({ 'quality.codeQuality': 1 });

// Virtual for total processing time
PromptPerformanceSchema.virtual('totalProcessingTime').get(function() {
  return this.completedAt ? this.completedAt - this.createdAt : null;
});

// Method to calculate success rate
PromptPerformanceSchema.statics.calculateSuccessRate = async function(phase) {
  const query = phase ? { phase } : {};
  const total = await this.countDocuments(query);
  const successful = await this.countDocuments({ ...query, success: true });
  return total > 0 ? (successful / total) * 100 : 0;
};

// Method to get average latency
PromptPerformanceSchema.statics.getAverageLatency = async function(phase) {
  const query = phase ? { phase } : {};
  const result = await this.aggregate([
    { $match: query },
    { $group: { _id: null, avgLatency: { $avg: '$latency.total' } } }
  ]);
  return result[0]?.avgLatency || 0;
};

// Method to get quality metrics
PromptPerformanceSchema.statics.getQualityMetrics = async function(phase) {
  const query = phase ? { phase } : {};
  const result = await this.aggregate([
    { $match: query },
    { $group: {
      _id: null,
      avgClarity: { $avg: '$quality.clarity' },
      avgAccuracy: { $avg: '$quality.accuracy' },
      avgCodeQuality: { $avg: '$quality.codeQuality' },
      avgTestCoverage: { $avg: '$quality.testCoverage' }
    }}
  ]);
  return result[0] || {
    avgClarity: 0,
    avgAccuracy: 0,
    avgCodeQuality: 0,
    avgTestCoverage: 0
  };
};

const PromptPerformance = mongoose.model('PromptPerformance', PromptPerformanceSchema);

export default PromptPerformance; 