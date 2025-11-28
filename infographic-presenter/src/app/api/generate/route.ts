import { NextRequest, NextResponse } from 'next/server';
import { generatePresentationContent, generateImage } from '@/lib/gemini';
import { GenerateRequest, Presentation, DEFAULT_THEME } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json();
    const { data, slideCount = 5, template, customInstructions, theme } = body;

    if (!data || !data.content) {
      return NextResponse.json(
        { error: 'No data provided' },
        { status: 400 }
      );
    }

    // プレゼンテーションコンテンツを生成
    const { title, slides } = await generatePresentationContent(
      data,
      slideCount,
      template,
      customInstructions,
      theme
    );

    // 各スライドの画像を生成
    const slidesWithImages = await Promise.all(
      slides.map(async (slide) => {
        if (slide.imagePrompt) {
          try {
            const imageUrl = await generateImage(slide.imagePrompt);
            return { ...slide, imageUrl };
          } catch (error) {
            console.error('Failed to generate image for slide:', error);
            return slide;
          }
        }
        return slide;
      })
    );

    const presentation: Presentation = {
      id: uuidv4(),
      title,
      slides: slidesWithImages,
      theme: { ...DEFAULT_THEME, ...theme },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return NextResponse.json(presentation);
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate presentation' },
      { status: 500 }
    );
  }
}
