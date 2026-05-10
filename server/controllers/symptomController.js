import axios from 'axios';
import SymptomHistory from '../models/SymptomHistory.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

const MODEL_NAME = 'llama-3.3-70b-versatile';

// ── Prompt builder ─────────────────────────────────────────────────────────────
const TEXT_PROMPT = (symptoms, patientInfo) => {
  const { age, gender, duration, painLevel, existingConditions } = patientInfo;

  const patientContext = [
    age ? `Age: ${age}` : null,
    gender ? `Gender: ${gender}` : null,
    duration ? `Symptom duration: ${duration}` : null,
    painLevel ? `Pain/discomfort level: ${painLevel}/10` : null,
    existingConditions ? `Existing conditions/medications: ${existingConditions}` : null,
  ].filter(Boolean).join('\n');

  return `
You are a compassionate and intelligent medical AI assistant named प्राण.AI.

Patient profile:
${patientContext || 'No additional patient info provided.'}

Patient describes symptoms:
"${symptoms}"

Analyse the symptoms carefully considering the patient's age, gender, and context.
Respond ONLY with valid JSON (no extra text, no markdown):

{
  "condition": "probable condition name (be specific, consider age and gender)",
  "severity": "Mild or Moderate or Serious",
  "description": "2-3 sentence explanation in simple language, personalised to the patient profile",
  "remedies": "3-4 practical home care steps separated by semicolons",
  "doctorType": "best specialist doctor for this case",
  "urgency": "specific timeframe when to consult doctor",
  "reliabilityScore": <number 0-100 representing how confident you are in this assessment>,
  "reliabilityNote": "1 sentence explaining what factors increase or limit confidence in this assessment"
}

For reliabilityScore:
- 85-100: Clear, specific symptoms with good patient context
- 65-84: Reasonably clear symptoms, some context missing
- 40-64: Vague symptoms or unusual combination, limited context
- Below 40: Too vague to assess confidently, needs professional evaluation
`;
};

// ── Parse AI response ──────────────────────────────────────────────────────────
const parseAIResponse = (text) => {
  try {
    const cleaned = text
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      condition: 'Unable to determine',
      severity: 'Moderate',
      description: 'The AI could not fully analyse the input. Please provide more details.',
      remedies: 'Rest; Stay hydrated; Monitor symptoms; Avoid self-medication',
      doctorType: 'General Physician',
      urgency: 'Within 24 hours',
      reliabilityScore: 30,
      reliabilityNote: 'Assessment confidence is low due to parsing issues. Please try again with more detail.'
    };
  }
};

// ── Analyze symptoms ───────────────────────────────────────────────────────────
export const analyzeSymptoms = async (req, res) => {
  try {
    const {
      inputType, text,
      // Patient info fields
      patientAge, patientGender, symptomDuration, painLevel, existingConditions
    } = req.body;

    if (!inputType) {
      return res.status(400).json({ message: 'inputType is required' });
    }

    if (inputType === 'image') {
      return res.json({
        success: false,
        message: 'Image analysis temporarily disabled.'
      });
    }

    const symptoms = text?.trim();
    if (!symptoms) {
      return res.status(400).json({ message: 'Symptom text is required' });
    }

    const patientInfo = {
      age: patientAge || null,
      gender: patientGender || '',
      duration: symptomDuration || '',
      painLevel: painLevel || null,
      existingConditions: existingConditions || ''
    };

    const aiResponse = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: MODEL_NAME,
        messages: [{ role: 'user', content: TEXT_PROMPT(symptoms, patientInfo) }],
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const responseText = aiResponse.data.choices?.[0]?.message?.content || '';
    const parsed = parseAIResponse(responseText);

    const history = await SymptomHistory.create({
      userId: req.user._id,
      inputType,
      rawInput: text || '',
      imageBase64: '',
      // Patient info
      patientAge: patientAge || null,
      patientGender: patientGender || '',
      symptomDuration: symptomDuration || '',
      painLevel: painLevel || null,
      existingConditions: existingConditions || '',
      // AI result
      condition: parsed.condition,
      severity: parsed.severity,
      remedies: parsed.remedies,
      doctorType: parsed.doctorType,
      description: parsed.description,
      urgency: parsed.urgency || '',
      reliabilityScore: parsed.reliabilityScore ?? null,
      reliabilityNote: parsed.reliabilityNote || '',
      fullAiResponse: responseText
    });

    res.json({
      success: true,
      result: {
        ...parsed,
        historyId: history._id,
        // Pass patient info through to Results page for PDF
        patientAge: patientAge || null,
        patientGender: patientGender || '',
        symptomDuration: symptomDuration || '',
        painLevel: painLevel || null,
        existingConditions: existingConditions || '',
        rawInput: text
      }
    });

  } catch (error) {
    console.error('AI Analysis error:', error.response?.data || error.message);
    res.status(500).json({
      message: 'AI analysis failed. Please try again.',
      error: error.response?.data || error.message
    });
  }
};

// ── Get user history ───────────────────────────────────────────────────────────
export const getHistory = async (req, res) => {
  try {
    const history = await SymptomHistory.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select('-imageBase64 -fullAiResponse')
      .limit(50);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history' });
  }
};

// ── ADMIN: Get all stats ───────────────────────────────────────────────────────
export const adminGetStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [totalUsers, totalReports, reportsToday, severityCounts] = await Promise.all([
      User.countDocuments(),
      SymptomHistory.countDocuments(),
      SymptomHistory.countDocuments({ createdAt: { $gte: today } }),
      SymptomHistory.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } }
      ])
    ]);

    const severityMap = { Mild: 0, Moderate: 0, Serious: 0 };
    severityCounts.forEach(s => { severityMap[s._id] = s.count; });

    res.json({ totalUsers, totalReports, reportsToday, severityMap });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

// ── ADMIN: Get all users ───────────────────────────────────────────────────────
export const adminGetUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    // Add report count per user
    const userIds = users.map(u => u._id);
    const reportCounts = await SymptomHistory.aggregate([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } }
    ]);

    const countMap = {};
    reportCounts.forEach(r => { countMap[r._id.toString()] = r.count; });

    const usersWithCounts = users.map(u => ({
      ...u.toObject(),
      reportCount: countMap[u._id.toString()] || 0
    }));

    res.json({ users: usersWithCounts });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
};

// ── ADMIN: Get all reports ─────────────────────────────────────────────────────
export const adminGetReports = async (req, res) => {
  try {
    const { page = 1, limit = 20, severity, search } = req.query;
    const filter = {};
    if (severity) filter.severity = severity;

    const reports = await SymptomHistory.find(filter)
      .populate('userId', 'name email')
      .select('-imageBase64 -fullAiResponse')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await SymptomHistory.countDocuments(filter);

    res.json({ reports, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

// ── ADMIN: Get single user's history ──────────────────────────────────────────
export const adminGetUserHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const history = await SymptomHistory.find({ userId })
      .select('-imageBase64 -fullAiResponse')
      .sort({ createdAt: -1 });

    res.json({ user, history });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user history' });
  }
};

// ── ADMIN: Delete user ─────────────────────────────────────────────────────────
export const adminDeleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await User.findByIdAndDelete(userId);
    await SymptomHistory.deleteMany({ userId });
    res.json({ message: 'User and all their data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

// ── ADMIN: Delete a single report ─────────────────────────────────────────────
export const adminDeleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    await SymptomHistory.findByIdAndDelete(reportId);
    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete report' });
  }
};