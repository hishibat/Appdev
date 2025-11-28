import { GoogleGenerativeAI } from '@google/generative-ai';
import { Slide, ParsedData, Theme, DEFAULT_THEME } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generatePresentationContent(
  data: ParsedData,
  slideCount: number = 5,
  template?: string,
  customInstructions?: string,
  theme?: Partial<Theme>
): Promise<{ title: string; slides: Slide[] }> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = buildGenerationPrompt(data, slideCount, template, customInstructions);

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return parseGeneratedContent(text, theme || DEFAULT_THEME);
}

function buildGenerationPrompt(
  data: ParsedData,
  slideCount: number,
  template?: string,
  customInstructions?: string
): string {
  let prompt = `あなたはプロフェッショナルなプレゼンテーションデザイナーです。
以下のデータを基に、インフォグラフィックスタイルの魅力的なプレゼンテーションを作成してください。

## 入力データ
タイプ: ${data.type}
内容:
${data.content}

## 要件
- スライド数: ${slideCount}枚
- 各スライドには、タイトル、コンテンツ、そして画像生成用のプロンプト（imagePrompt）を含めてください
- imagePromptは英語で、インフォグラフィックスタイルの画像を生成するための具体的な指示にしてください
- レイアウトは以下から選択: title, content, image-left, image-right, full-image, chart
- データに数値が含まれる場合は、chartレイアウトを使用し、chartDataを含めてください

`;

  if (template) {
    prompt += `\n## テンプレート指定\n${template}\n`;
  }

  if (customInstructions) {
    prompt += `\n## 追加指示\n${customInstructions}\n`;
  }

  prompt += `
## 出力形式
以下のJSON形式で出力してください。他のテキストは含めないでください。

{
  "title": "プレゼンテーションのタイトル",
  "slides": [
    {
      "title": "スライドタイトル",
      "content": "スライドの内容（箇条書きや説明文）",
      "imagePrompt": "English prompt for generating infographic-style image",
      "layout": "content"
    }
  ]
}

chartレイアウトの場合は以下の形式で:
{
  "title": "スライドタイトル",
  "content": "グラフの説明",
  "layout": "chart",
  "chartData": {
    "type": "bar",
    "labels": ["ラベル1", "ラベル2"],
    "values": [100, 200],
    "colors": ["#3B82F6", "#10B981"]
  }
}
`;

  return prompt;
}

function parseGeneratedContent(
  text: string,
  theme: Partial<Theme>
): { title: string; slides: Slide[] } {
  // JSONを抽出
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse generated content');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  const slides: Slide[] = parsed.slides.map((slide: {
    title: string;
    content: string;
    imagePrompt?: string;
    layout?: string;
    chartData?: {
      type: 'bar' | 'pie' | 'line';
      labels: string[];
      values: number[];
      colors?: string[];
    };
  }) => ({
    id: uuidv4(),
    title: slide.title,
    content: slide.content,
    imagePrompt: slide.imagePrompt,
    layout: slide.layout || 'content',
    chartData: slide.chartData,
    backgroundColor: theme.backgroundColor || DEFAULT_THEME.backgroundColor,
    textColor: theme.textColor || DEFAULT_THEME.textColor,
  }));

  return {
    title: parsed.title,
    slides,
  };
}

export async function generateImage(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const enhancedPrompt = `Create a professional infographic-style illustration: ${prompt}.
Style: Clean, modern, minimalist infographic design with flat colors, icons, and data visualization elements.
No text in the image. High contrast, professional business presentation quality.`;

  try {
    // Gemini 2.0 Flashでテキストベースの画像説明を生成
    // 実際の画像生成はImagenまたは他のサービスを使用する必要があります
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;

    // プレースホルダーSVGを生成
    return generatePlaceholderSVG(prompt);
  } catch (error) {
    console.error('Image generation error:', error);
    return generatePlaceholderSVG(prompt);
  }
}

function generatePlaceholderSVG(prompt: string): string {
  // プロンプトに基づいたプレースホルダーSVGを生成
  const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
      <rect width="800" height="600" fill="${randomColor}20"/>
      <rect x="50" y="50" width="200" height="150" rx="10" fill="${randomColor}"/>
      <rect x="300" y="80" width="450" height="20" rx="5" fill="${randomColor}60"/>
      <rect x="300" y="120" width="350" height="15" rx="5" fill="${randomColor}40"/>
      <rect x="300" y="150" width="400" height="15" rx="5" fill="${randomColor}40"/>
      <circle cx="150" cy="350" r="80" fill="${randomColor}"/>
      <circle cx="150" cy="350" r="60" fill="white"/>
      <rect x="300" y="280" width="50" height="150" rx="5" fill="${randomColor}"/>
      <rect x="380" y="320" width="50" height="110" rx="5" fill="${randomColor}80"/>
      <rect x="460" y="300" width="50" height="130" rx="5" fill="${randomColor}60"/>
      <rect x="540" y="350" width="50" height="80" rx="5" fill="${randomColor}40"/>
      <rect x="50" y="480" width="700" height="80" rx="10" fill="${randomColor}20"/>
    </svg>
  `)}`;
}

export async function reviseSlide(
  slide: Slide,
  instruction: string
): Promise<Slide> {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const prompt = `現在のスライド:
タイトル: ${slide.title}
内容: ${slide.content}
レイアウト: ${slide.layout}
画像プロンプト: ${slide.imagePrompt || 'なし'}

修正指示: ${instruction}

上記の修正指示に従って、スライドを修正してください。
以下のJSON形式で出力してください：

{
  "title": "修正後のタイトル",
  "content": "修正後の内容",
  "imagePrompt": "Modified English prompt for image generation",
  "layout": "レイアウト"
}`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse revised content');
  }

  const parsed = JSON.parse(jsonMatch[0]);

  return {
    ...slide,
    title: parsed.title,
    content: parsed.content,
    imagePrompt: parsed.imagePrompt,
    layout: parsed.layout || slide.layout,
  };
}
