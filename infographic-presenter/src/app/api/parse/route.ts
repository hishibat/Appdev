import { NextRequest, NextResponse } from 'next/server';
import { ParsedData } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'pdf') {
      // PDFの処理
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // pdf-parseを動的にrequire（CommonJSモジュール）
      const pdfParse = require('pdf-parse');
      const pdfData = await pdfParse(buffer);

      const result: ParsedData = {
        type: 'pdf',
        content: pdfData.text,
        metadata: {
          filename: file.name,
          pageCount: String(pdfData.numpages),
          info: JSON.stringify(pdfData.info),
        },
      };

      return NextResponse.json(result);
    }

    return NextResponse.json(
      { error: 'Unsupported file type for server parsing' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Parse error:', error);
    return NextResponse.json(
      { error: 'Failed to parse file' },
      { status: 500 }
    );
  }
}
