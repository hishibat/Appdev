import PptxGenJS from 'pptxgenjs';
import { Presentation, Slide, Theme, ChartData } from '@/types';

export async function exportToPptx(presentation: Presentation): Promise<Blob> {
  const pptx = new PptxGenJS();

  // プレゼンテーション設定
  pptx.title = presentation.title;
  pptx.author = 'Infographic Presenter';
  pptx.layout = 'LAYOUT_16x9';

  // テーマカラーを適用
  const { theme } = presentation;

  for (const slide of presentation.slides) {
    const pptxSlide = pptx.addSlide();

    // 背景色
    pptxSlide.background = { color: theme.backgroundColor.replace('#', '') };

    switch (slide.layout) {
      case 'title':
        addTitleSlide(pptxSlide, slide, theme);
        break;
      case 'content':
        addContentSlide(pptxSlide, slide, theme);
        break;
      case 'image-left':
        addImageLeftSlide(pptxSlide, slide, theme);
        break;
      case 'image-right':
        addImageRightSlide(pptxSlide, slide, theme);
        break;
      case 'full-image':
        addFullImageSlide(pptxSlide, slide, theme);
        break;
      case 'chart':
        addChartSlide(pptxSlide, slide, theme);
        break;
      default:
        addContentSlide(pptxSlide, slide, theme);
    }
  }

  const blob = await pptx.write({ outputType: 'blob' });
  return blob as Blob;
}

function addTitleSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // メインタイトル
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 2.5,
    w: 9,
    h: 1.5,
    fontSize: 44,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
    align: 'center',
    valign: 'middle',
  });

  // サブタイトル
  if (slide.content) {
    pptxSlide.addText(slide.content, {
      x: 0.5,
      y: 4,
      w: 9,
      h: 1,
      fontSize: 24,
      color: theme.textColor.replace('#', ''),
      align: 'center',
      valign: 'top',
    });
  }

  // 画像があれば追加
  if (slide.imageUrl) {
    pptxSlide.addImage({
      data: slide.imageUrl,
      x: 3.5,
      y: 0.5,
      w: 3,
      h: 1.8,
    });
  }
}

function addContentSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // タイトル
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
  });

  // コンテンツ
  const contentLines = slide.content.split('\n').filter((l) => l.trim());
  const bulletPoints = contentLines.map((line) => ({
    text: line.replace(/^[-•*]\s*/, ''),
    options: { bullet: true, color: theme.textColor.replace('#', '') },
  }));

  pptxSlide.addText(bulletPoints, {
    x: 0.5,
    y: 1.3,
    w: 5.5,
    h: 4,
    fontSize: 18,
    color: theme.textColor.replace('#', ''),
    valign: 'top',
  });

  // 画像
  if (slide.imageUrl) {
    pptxSlide.addImage({
      data: slide.imageUrl,
      x: 6.2,
      y: 1.3,
      w: 3.3,
      h: 4,
    });
  }
}

function addImageLeftSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // タイトル
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
  });

  // 左側に画像
  if (slide.imageUrl) {
    pptxSlide.addImage({
      data: slide.imageUrl,
      x: 0.5,
      y: 1.3,
      w: 4,
      h: 4,
    });
  }

  // 右側にコンテンツ
  pptxSlide.addText(slide.content, {
    x: 4.8,
    y: 1.3,
    w: 4.7,
    h: 4,
    fontSize: 16,
    color: theme.textColor.replace('#', ''),
    valign: 'top',
  });
}

function addImageRightSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // タイトル
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
  });

  // 左側にコンテンツ
  pptxSlide.addText(slide.content, {
    x: 0.5,
    y: 1.3,
    w: 4.7,
    h: 4,
    fontSize: 16,
    color: theme.textColor.replace('#', ''),
    valign: 'top',
  });

  // 右側に画像
  if (slide.imageUrl) {
    pptxSlide.addImage({
      data: slide.imageUrl,
      x: 5.5,
      y: 1.3,
      w: 4,
      h: 4,
    });
  }
}

function addFullImageSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // 全画面画像
  if (slide.imageUrl) {
    pptxSlide.addImage({
      data: slide.imageUrl,
      x: 0,
      y: 0,
      w: '100%',
      h: '100%',
    });
  }

  // タイトルをオーバーレイ
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 4.5,
    w: 9,
    h: 0.8,
    fontSize: 28,
    bold: true,
    color: 'FFFFFF',
    align: 'center',
  });
}

function addChartSlide(pptxSlide: PptxGenJS.Slide, slide: Slide, theme: Theme) {
  // タイトル
  pptxSlide.addText(slide.title, {
    x: 0.5,
    y: 0.3,
    w: 9,
    h: 0.8,
    fontSize: 32,
    bold: true,
    color: theme.primaryColor.replace('#', ''),
  });

  if (slide.chartData) {
    const chartType = mapChartType(slide.chartData.type);
    const chartData = [
      {
        name: 'Data',
        labels: slide.chartData.labels,
        values: slide.chartData.values,
      },
    ];

    pptxSlide.addChart(chartType, chartData, {
      x: 0.5,
      y: 1.3,
      w: 6,
      h: 4,
      showTitle: false,
      showLegend: true,
      legendPos: 'b',
    });
  }

  // 説明文
  if (slide.content) {
    pptxSlide.addText(slide.content, {
      x: 6.8,
      y: 1.3,
      w: 2.7,
      h: 4,
      fontSize: 14,
      color: theme.textColor.replace('#', ''),
      valign: 'top',
    });
  }
}

function mapChartType(type: string): PptxGenJS.CHART_NAME {
  switch (type) {
    case 'bar':
      return 'bar';
    case 'pie':
      return 'pie';
    case 'line':
      return 'line';
    default:
      return 'bar';
  }
}

export function exportToSVG(slide: Slide, theme: Theme): string {
  const width = 960;
  const height = 540;

  let svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;

  // 背景
  svgContent += `<rect width="${width}" height="${height}" fill="${theme.backgroundColor}"/>`;

  switch (slide.layout) {
    case 'title':
      svgContent += generateTitleLayoutSVG(slide, theme, width, height);
      break;
    case 'chart':
      svgContent += generateChartLayoutSVG(slide, theme, width, height);
      break;
    default:
      svgContent += generateContentLayoutSVG(slide, theme, width, height);
  }

  svgContent += '</svg>';
  return svgContent;
}

function generateTitleLayoutSVG(
  slide: Slide,
  theme: Theme,
  width: number,
  height: number
): string {
  let svg = '';

  // タイトル
  svg += `<text x="${width / 2}" y="${height / 2 - 20}" font-size="48" font-weight="bold" fill="${theme.primaryColor}" text-anchor="middle" font-family="${theme.fontFamily}">${escapeXml(slide.title)}</text>`;

  // サブタイトル
  if (slide.content) {
    const lines = slide.content.split('\n').slice(0, 3);
    lines.forEach((line, i) => {
      svg += `<text x="${width / 2}" y="${height / 2 + 40 + i * 30}" font-size="24" fill="${theme.textColor}" text-anchor="middle" font-family="${theme.fontFamily}">${escapeXml(line)}</text>`;
    });
  }

  return svg;
}

function generateContentLayoutSVG(
  slide: Slide,
  theme: Theme,
  width: number,
  height: number
): string {
  let svg = '';

  // タイトル背景
  svg += `<rect x="0" y="0" width="${width}" height="80" fill="${theme.primaryColor}"/>`;

  // タイトル
  svg += `<text x="40" y="50" font-size="32" font-weight="bold" fill="white" font-family="${theme.fontFamily}">${escapeXml(slide.title)}</text>`;

  // コンテンツ
  const lines = slide.content.split('\n').filter((l) => l.trim());
  lines.slice(0, 8).forEach((line, i) => {
    const cleanLine = line.replace(/^[-•*]\s*/, '');
    svg += `<circle cx="55" cy="${130 + i * 45}" r="5" fill="${theme.primaryColor}"/>`;
    svg += `<text x="75" y="${135 + i * 45}" font-size="20" fill="${theme.textColor}" font-family="${theme.fontFamily}">${escapeXml(cleanLine.substring(0, 60))}</text>`;
  });

  // 右側の装飾
  svg += `<rect x="${width - 200}" y="100" width="180" height="${height - 120}" rx="10" fill="${theme.primaryColor}20"/>`;

  return svg;
}

function generateChartLayoutSVG(
  slide: Slide,
  theme: Theme,
  width: number,
  height: number
): string {
  let svg = '';

  // タイトル
  svg += `<text x="40" y="50" font-size="32" font-weight="bold" fill="${theme.primaryColor}" font-family="${theme.fontFamily}">${escapeXml(slide.title)}</text>`;

  if (slide.chartData) {
    const chartData = slide.chartData;
    const maxValue = Math.max(...chartData.values);
    const barWidth = 60;
    const chartHeight = 300;
    const chartX = 100;
    const chartY = 120;

    // バーチャート
    chartData.values.forEach((value, i) => {
      const barHeight = (value / maxValue) * chartHeight;
      const x = chartX + i * (barWidth + 30);
      const y = chartY + chartHeight - barHeight;
      const color = chartData.colors?.[i] || theme.primaryColor;

      svg += `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" fill="${color}" rx="5"/>`;
      svg += `<text x="${x + barWidth / 2}" y="${chartY + chartHeight + 25}" font-size="14" fill="${theme.textColor}" text-anchor="middle" font-family="${theme.fontFamily}">${escapeXml(chartData.labels[i])}</text>`;
      svg += `<text x="${x + barWidth / 2}" y="${y - 10}" font-size="14" fill="${theme.textColor}" text-anchor="middle" font-family="${theme.fontFamily}">${value}</text>`;
    });
  }

  return svg;
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function downloadSVG(svgContent: string, filename: string) {
  const blob = new Blob([svgContent], { type: 'image/svg+xml' });
  downloadBlob(blob, filename);
}

export async function exportAllSlidesToSVG(presentation: Presentation): Promise<void> {
  for (let i = 0; i < presentation.slides.length; i++) {
    const slide = presentation.slides[i];
    const svgContent = exportToSVG(slide, presentation.theme);
    downloadSVG(svgContent, `${presentation.title}_slide_${i + 1}.svg`);

    // ダウンロード間に少し待機
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}
