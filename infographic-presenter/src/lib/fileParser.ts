import { ParsedData } from '@/types';
import * as XLSX from 'xlsx';

export async function parseFile(file: File): Promise<ParsedData> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'txt':
    case 'md':
      return parseTextFile(file);
    case 'csv':
      return parseCSVFile(file);
    case 'xlsx':
    case 'xls':
      return parseExcelFile(file);
    case 'pdf':
      return parsePDFFile(file);
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return parseImageFile(file);
    default:
      throw new Error(`Unsupported file type: ${extension}`);
  }
}

async function parseTextFile(file: File): Promise<ParsedData> {
  const content = await file.text();
  return {
    type: 'text',
    content,
    metadata: {
      filename: file.name,
      size: String(file.size),
    },
  };
}

async function parseCSVFile(file: File): Promise<ParsedData> {
  const text = await file.text();
  const lines = text.split('\n').filter((line) => line.trim());

  if (lines.length === 0) {
    return {
      type: 'csv',
      content: '',
      structuredData: [],
    };
  }

  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const data: Record<string, unknown>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const row: Record<string, unknown> = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || '';
    });
    data.push(row);
  }

  return {
    type: 'csv',
    content: formatStructuredDataAsText(headers, data),
    structuredData: data,
    metadata: {
      filename: file.name,
      rowCount: String(data.length),
      columns: headers.join(', '),
    },
  };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());

  return result;
}

async function parseExcelFile(file: File): Promise<ParsedData> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  const allData: Record<string, unknown>[] = [];
  let contentParts: string[] = [];

  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(sheet) as Record<string, unknown>[];

    if (jsonData.length > 0) {
      contentParts.push(`## シート: ${sheetName}`);
      const headers = Object.keys(jsonData[0]);
      contentParts.push(formatStructuredDataAsText(headers, jsonData));
      allData.push(...jsonData.map((row) => ({ ...row, _sheet: sheetName })));
    }
  });

  return {
    type: 'excel',
    content: contentParts.join('\n\n'),
    structuredData: allData,
    metadata: {
      filename: file.name,
      sheetCount: String(workbook.SheetNames.length),
      sheets: workbook.SheetNames.join(', '),
    },
  };
}

async function parsePDFFile(file: File): Promise<ParsedData> {
  // クライアントサイドではPDFのテキスト抽出が制限されるため、
  // サーバーサイドAPIに送信
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/parse', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('Failed to parse PDF file');
  }

  const result = await response.json();
  return result as ParsedData;
}

async function parseImageFile(file: File): Promise<ParsedData> {
  // 画像をBase64に変換
  const base64 = await fileToBase64(file);

  return {
    type: 'image',
    content: `画像ファイル: ${file.name}\n[画像の内容は画像認識APIで分析します]`,
    metadata: {
      filename: file.name,
      size: String(file.size),
      type: file.type,
      base64: base64,
    },
  };
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

function formatStructuredDataAsText(
  headers: string[],
  data: Record<string, unknown>[]
): string {
  let text = `列: ${headers.join(', ')}\n\nデータ:\n`;

  data.slice(0, 50).forEach((row, index) => {
    const values = headers.map((h) => String(row[h] ?? '')).join(' | ');
    text += `${index + 1}. ${values}\n`;
  });

  if (data.length > 50) {
    text += `\n... 他 ${data.length - 50} 行のデータ`;
  }

  return text;
}

export function parseDirectTextInput(text: string): ParsedData {
  return {
    type: 'text',
    content: text,
    metadata: {
      source: 'direct_input',
      length: String(text.length),
    },
  };
}
