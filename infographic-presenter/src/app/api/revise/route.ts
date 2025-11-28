import { NextRequest, NextResponse } from 'next/server';
import { reviseSlide, generateImage } from '@/lib/gemini';
import { RevisionRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RevisionRequest = await request.json();
    const { slideId, instruction, currentSlide } = body;

    if (!instruction || !currentSlide) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // スライドを修正
    const revisedSlide = await reviseSlide(currentSlide, instruction);

    // 新しい画像プロンプトがあれば画像を再生成
    if (revisedSlide.imagePrompt && revisedSlide.imagePrompt !== currentSlide.imagePrompt) {
      try {
        const imageUrl = await generateImage(revisedSlide.imagePrompt);
        revisedSlide.imageUrl = imageUrl;
      } catch (error) {
        console.error('Failed to regenerate image:', error);
      }
    }

    return NextResponse.json({
      ...revisedSlide,
      id: slideId,
    });
  } catch (error) {
    console.error('Revision error:', error);
    return NextResponse.json(
      { error: 'Failed to revise slide' },
      { status: 500 }
    );
  }
}
