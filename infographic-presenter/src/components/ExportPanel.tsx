'use client';

import { useState } from 'react';
import { Download, FileImage, FileText, Loader2 } from 'lucide-react';
import { Presentation } from '@/types';
import { exportToPptx, downloadBlob, exportAllSlidesToSVG } from '@/lib/exporter';

interface ExportPanelProps {
  presentation: Presentation | null;
  isExporting: boolean;
  onExportStart: () => void;
  onExportEnd: () => void;
}

export default function ExportPanel({
  presentation,
  isExporting,
  onExportStart,
  onExportEnd,
}: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<'pptx' | 'svg'>('pptx');

  const handleExport = async () => {
    if (!presentation || isExporting) return;

    onExportStart();

    try {
      if (exportFormat === 'pptx') {
        const blob = await exportToPptx(presentation);
        downloadBlob(blob, `${presentation.title}.pptx`);
      } else {
        await exportAllSlidesToSVG(presentation);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('エクスポートに失敗しました');
    } finally {
      onExportEnd();
    }
  };

  if (!presentation) {
    return null;
  }

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        エクスポート
      </h3>

      {/* フォーマット選択 */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          onClick={() => setExportFormat('pptx')}
          className={`p-3 flex flex-col items-center gap-2 rounded-lg border transition-all ${
            exportFormat === 'pptx'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileText className="w-6 h-6" />
          <span className="text-sm font-medium">PowerPoint</span>
          <span className="text-xs text-gray-500">.pptx</span>
        </button>
        <button
          onClick={() => setExportFormat('svg')}
          className={`p-3 flex flex-col items-center gap-2 rounded-lg border transition-all ${
            exportFormat === 'svg'
              ? 'border-blue-500 bg-blue-50 text-blue-700'
              : 'border-gray-200 hover:border-gray-300'
          }`}
        >
          <FileImage className="w-6 h-6" />
          <span className="text-sm font-medium">SVG画像</span>
          <span className="text-xs text-gray-500">各スライド個別</span>
        </button>
      </div>

      {/* エクスポート情報 */}
      <div className="mb-4 p-3 bg-gray-50 rounded-lg text-sm">
        <p className="text-gray-600">
          <span className="font-medium">タイトル:</span> {presentation.title}
        </p>
        <p className="text-gray-600">
          <span className="font-medium">スライド数:</span> {presentation.slides.length}枚
        </p>
      </div>

      {/* エクスポートボタン */}
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
      >
        {isExporting ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            エクスポート中...
          </>
        ) : (
          <>
            <Download className="w-5 h-5" />
            {exportFormat === 'pptx' ? 'PowerPointをダウンロード' : 'SVGをダウンロード'}
          </>
        )}
      </button>
    </div>
  );
}
