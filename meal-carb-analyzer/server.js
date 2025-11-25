require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Initialize Anthropic client
const anthropic = new Anthropic();

// Analysis endpoint
app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mediaType = req.file.mimetype;

    const systemPrompt = `あなたは栄養士・糖質管理の専門家です。食事の画像を分析し、糖質（炭水化物）の観点から詳細な分析とアドバイスを提供してください。

以下の形式で回答してください：

## 🍽️ 識別された食品
画像から識別できる食品をリストアップしてください。

## 📊 糖質分析

### 各食品の推定糖質量
| 食品名 | 推定量 | 糖質量（目安） |
|--------|--------|----------------|

### 総糖質量（推定）
この食事全体の推定糖質量を記載してください。

## 🚦 糖質レベル評価
- 低糖質（〜20g）: 🟢
- 中程度（20-40g）: 🟡
- 高糖質（40g以上）: 🔴

## 💡 アドバイス
糖質管理の観点から、以下について具体的なアドバイスを提供してください：
1. この食事の良い点
2. 改善できる点
3. 糖質を抑えるための代替案（該当する場合）

## ⚠️ 注意事項
画像からの推定であるため、実際の糖質量は調理方法や分量により異なる可能性があることを明記してください。`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: 'この食事の画像を分析し、糖質の観点から詳細なインサイトを提供してください。'
            }
          ]
        }
      ],
      system: systemPrompt
    });

    const analysisResult = response.content[0].text;
    res.json({ analysis: analysisResult });

  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({
      error: 'Analysis failed',
      message: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🍽️ Meal Carb Analyzer running at http://localhost:${PORT}`);
});
