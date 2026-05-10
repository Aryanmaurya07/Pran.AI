import mongoose from 'mongoose';

const symptomHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inputType: {
    type: String,
    enum: ['text', 'voice', 'image'],
    required: true
  },
  rawInput: {
    type: String,
    default: ''
  },
  imageBase64: {
    type: String,
    default: ''
  },
  // ── Patient info fields (new) ──────────────────────────────
  patientAge: { type: Number, default: null },
  patientGender: {
    type: String,
    enum: ['Male', 'Female', 'Other', ''],
    default: ''
  },
  symptomDuration: { type: String, default: '' },  // e.g. "2 days"
  painLevel: { type: Number, default: null },       // 1–10
  existingConditions: { type: String, default: '' },
  // ── AI result fields ──────────────────────────────────────
  condition: { type: String, default: '' },
  severity: {
    type: String,
    enum: ['Mild', 'Moderate', 'Serious'],
    default: 'Mild'
  },
  remedies: { type: String, default: '' },
  doctorType: { type: String, default: '' },
  description: { type: String, default: '' },
  urgency: { type: String, default: '' },
  // ── Reliability score (new) ───────────────────────────────
  reliabilityScore: { type: Number, default: null }, // 0–100
  reliabilityNote: { type: String, default: '' },
  // ── Raw ──────────────────────────────────────────────────
  fullAiResponse: { type: String, default: '' }
}, { timestamps: true });

export default mongoose.model('SymptomHistory', symptomHistorySchema);