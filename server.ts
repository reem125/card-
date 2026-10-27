import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import {
  getAllTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
  uploadImageFile,
  getCloudDiagnostics,
  seedInitialTemplates,
  getAdminSettings,
  saveAdminSettings,
  isSupabaseConfigured,
} from './server/supabase';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase JSON body limit to 50MB to handle high-resolution template image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve uploaded template files statically
const uploadsPath = path.resolve(process.cwd(), 'public', 'uploads');
app.use('/uploads', express.static(uploadsPath));

// Server-side Gemini AI client initialization
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// 1. HEALTH & SYSTEM DIAGNOSTICS
// ==========================================
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConfigured: isSupabaseConfigured(),
  });
});

app.get('/api/admin/sync-status', async (req, res) => {
  try {
    const status = await getCloudDiagnostics();
    res.json({ success: true, status });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 2. TEMPLATES API (Shared across all employees)
// ==========================================
// GET /api/templates
// Returns active templates for employees (or all if ?all=true)
app.get('/api/templates', async (req, res) => {
  try {
    const includeArchived = req.query.all === 'true';
    const templates = await getAllTemplates(includeArchived);

    // Set cache control for performance with fast revalidation
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
    res.json({ success: true, count: templates.length, templates });
  } catch (error: any) {
    console.error('Error fetching templates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 3. ADMIN TEMPLATE MANAGEMENT API
// ==========================================
// POST /api/upload - Uploads template image to Supabase Storage or persistent file server
app.post('/api/upload', async (req, res) => {
  try {
    const { base64Data, fileName, mimeType = 'image/png' } = req.body;
    if (!base64Data) {
      return res.status(400).json({ success: false, error: 'Missing base64Data' });
    }

    const uploadResult = await uploadImageFile(
      base64Data,
      fileName || 'template-image',
      mimeType
    );

    res.json({ success: true, ...uploadResult });
  } catch (error: any) {
    console.error('Error handling upload:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/templates - Create and publish a new template
app.post('/api/admin/templates', async (req, res) => {
  try {
    const templateData = req.body;
    if (!templateData || !templateData.titleEn) {
      return res.status(400).json({ success: false, error: 'Template title is required' });
    }

    const created = await createTemplate(templateData);
    res.json({ success: true, template: created });
  } catch (error: any) {
    console.error('Error creating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/admin/templates/:id - Update template (including Archive/Reactivate)
app.put('/api/admin/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updated = await updateTemplate(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, template: updated });
  } catch (error: any) {
    console.error('Error updating template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/admin/templates/:id - Delete template
app.delete('/api/admin/templates/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await deleteTemplate(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Template not found' });
    }

    res.json({ success: true, message: 'Template removed successfully' });
  } catch (error: any) {
    console.error('Error deleting template:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/admin/reseed - Force sync or reseed official templates
app.post('/api/admin/reseed', async (req, res) => {
  try {
    const count = await seedInitialTemplates();
    res.json({ success: true, message: `Seeded ${count} templates to cloud database.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET & PUT /api/admin/settings - Brand governance settings
app.get('/api/admin/settings', async (req, res) => {
  try {
    const settings = await getAdminSettings();
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/admin/settings', async (req, res) => {
  try {
    const settings = req.body;
    await saveAdminSettings(settings);
    res.json({ success: true, settings });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 4. AI SMART RECOMMENDATIONS API
// ==========================================
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

// ==========================================
// 5. SERVER BOOTSTRAP & STATIC ASSETS
// ==========================================
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
