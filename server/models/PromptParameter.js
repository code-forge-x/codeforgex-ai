import mongoose from 'mongoose';
const { Schema } = mongoose;

const PromptParameterSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  required: { type: Boolean, default: false },
  defaultValue: Schema.Types.Mixed,
  type: {
    type: String,
    enum: ['string', 'boolean', 'number', 'array', 'object'],
    default: 'string'
  },
  templateId: { type: Schema.Types.ObjectId, ref: 'PromptTemplate', required: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

PromptParameterSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const PromptParameter = mongoose.model('PromptParameter', PromptParameterSchema);
export default PromptParameter; 