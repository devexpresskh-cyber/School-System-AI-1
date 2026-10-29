import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', time: new Date().toISOString() });
  });

  // Admin AI Chat Endpoint
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { userRole, message, studentsContext, history } = req.body;

      // Strict role check: super_admin or campus_admin only
      if (userRole !== 'super_admin' && userRole !== 'campus_admin') {
        return res.status(403).json({
          error: 'ការអនុញ្ញាតត្រូវបានបដិសេធ (Forbidden): AI Chat សម្រាប់កែសម្រួលទិន្នន័យសិស្ស ឬការបង់ប្រាក់ ត្រូវបានអនុញ្ញាតសម្រាប់ Admin តែប៉ុណ្ណោះ។'
        });
      }

      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: 'GEMINI_API_KEY is not configured on the server.'
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are the Official AI School Management Assistant for FBIS (Footprints International School) Administrators.
Your job is to understand natural language requests (in Khmer or English) to:
1. Update student information (class, discount percentage, tuition fee, phone, address, status, past debt).
2. Record or log student fee payments (tuition, term payments, amounts, payment methods).
3. Search or answer questions about students and financial records.

CURRENT ACTIVE STUDENTS CONTEXT:
${JSON.stringify((studentsContext || []).slice(0, 40).map((s: any) => ({
  id: s.id,
  code: s.studentCode || s.roll,
  nameKhmer: s.nameKhmer,
  nameEnglish: s.nameEnglish,
  classGrade: s.classGrade,
  curriculum: s.curriculum,
  tuitionFee: s.tuitionFee,
  discountPercentage: s.discountPercentage,
  phone: s.guardianPhone || s.phone,
  pastYearDebt: s.pastYearDebt,
  status: s.status
})))}

PREVIOUS CONVERSATION:
${JSON.stringify(history || [])}

ADMIN MESSAGE:
"${message}"

INSTRUCTIONS:
- Identify if the admin is requesting a student update or payment record.
- Match the student by code (e.g. 3804, 2310, FBIS02-003804), Khmer name, or English name.
- Respond STRICTLY with a valid JSON object in this format (no markdown code blocks, just raw JSON):
{
  "reply": "Friendly explanation in Khmer (with English summary) describing exactly what will be or was done",
  "action": null | {
    "type": "UPDATE_STUDENT",
    "studentId": "exact id from the student list",
    "studentName": "student name in Khmer/English",
    "updates": {
      "discountPercentage": number (optional),
      "tuitionFee": number (optional),
      "classGrade": string (optional),
      "phone": string (optional),
      "guardianPhone": string (optional),
      "address": string (optional),
      "pastYearDebt": number (optional),
      "status": string (optional)
    }
  } | {
    "type": "RECORD_PAYMENT",
    "studentId": "exact id from the student list",
    "studentName": "student name in Khmer/English",
    "payment": {
      "title": string,
      "amountPaidUSD": number,
      "paymentType": string,
      "paymentMethod": string,
      "discountPercent": number
    }
  }
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text?.trim() || '{}';
      try {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      } catch (e) {
        return res.json({
          reply: responseText,
          action: null
        });
      }
    } catch (err: any) {
      console.error('AI chat error:', err);
      return res.status(500).json({ error: err.message || 'Error communicating with AI service' });
    }
  });

  // Vite Integration
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
