import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// AI Smart Suggestion Endpoint
app.post('/api/ai/smart-recommendations', async (req, res) => {
  try {
    const {
      templateTitle,
      category,
      canvasWidth,
      canvasHeight,
      employeeName,
      employeeRole,
      department,
      language = 'en',
      safeZone,
      theme = 'light',
    } = req.body;

    const isArabic = language === 'ar' || /[\u0600-\u06FF]/.test(employeeName || '');

    const prompt = `You are the lead brand and typography director for Vision Medical (رؤية الطبية), a premier healthcare network.
Analyze the following template and employee details to provide optimal typography and placement recommendations:
- Template Title: "${templateTitle || 'Company Template'}"
- Category: "${category || 'General'}"
- Canvas Dimensions: ${canvasWidth}px width by ${canvasHeight}px height (aspect ratio: ${(canvasWidth / (canvasHeight || 1)).toFixed(2)})
- Employee Name: "${employeeName || 'Vision Medical Professional'}"
- Role/Title: "${employeeRole || 'Healthcare Professional'}"
- Department: "${department || 'Medical Care'}"
- Primary Script: ${isArabic ? 'Arabic' : 'English'}
- Background Tone: ${theme}
- Safe Zone Constraints: ${JSON.stringify(safeZone || { minX: 10, maxX: 90, minY: 15, maxY: 85 })}

Return a JSON object conforming exactly to this structure:
{
  "recommendedFont": string (One of: "Cairo", "Tajawal", "IBM Plex Sans Arabic", "Alexandria" for Arabic; or "Plus Jakarta Sans", "Outfit", "DM Sans" for English),
  "recommendedRoleFont": string,
  "fontSize": number (optimal pixel size for ${canvasWidth}x${canvasHeight} canvas, balanced and readable, usually 24 to 54),
  "roleFontSize": number (usually 60-70% of name size),
  "fontColor": string (hex code: high contrast e.g. "#0B2545" for dark navy, "#005A9C" for royal blue, "#FFFFFF" for white on dark backgrounds, or "#F58220" for amber accent),
  "roleFontColor": string (hex code complementary to name),
  "textAlignment": "left" | "center" | "right",
  "xPercent": number (percentage 0-100 from left of canvas, ensuring safe distance from borders and Vision Medical logos),
  "yPercent": number (percentage 0-100 from top of canvas),
  "letterSpacing": number (-0.5 to 1.5),
  "aiRationaleEn": string (1 concise sentence explaining placement & typography choice),
  "aiRationaleAr": string (1 concise Arabic sentence explaining placement & typography choice)
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response from AI model');
    }

    const parsed = JSON.parse(text);
    return res.json({ success: true, recommendation: parsed });
  } catch (error: any) {
    console.error('Error generating AI recommendation:', error);
    // Provide a robust smart fallback matching Vision Medical brand rules
    const isArabic = req.body?.language === 'ar' || /[\u0600-\u06FF]/.test(req.body?.employeeName || '');
    const isDark = req.body?.theme === 'dark';
    
    return res.json({
      success: true,
      recommendation: {
        recommendedFont: isArabic ? 'Cairo' : 'Plus Jakarta Sans',
        recommendedRoleFont: isArabic ? 'Tajawal' : 'Outfit',
        fontSize: Math.min(Math.max(Math.round((req.body?.canvasHeight || 600) * 0.06), 26), 46),
        roleFontSize: Math.min(Math.max(Math.round((req.body?.canvasHeight || 600) * 0.038), 16), 28),
        fontColor: isDark ? '#FFFFFF' : '#0B2545',
        roleFontColor: isDark ? '#38BDF8' : '#00A3E0',
        textAlignment: isArabic ? 'right' : 'center',
        xPercent: isArabic ? 75 : 50,
        yPercent: 55,
        letterSpacing: isArabic ? 0 : 0.5,
        aiRationaleEn: 'Centered brand-safe positioning with high-contrast official navy & cyan typography.',
        aiRationaleAr: 'موضع متناسق مع هوية رؤية الطبية وبخط واضح وعالي التباين.',
      },
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Vision Medical Template Studio server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
