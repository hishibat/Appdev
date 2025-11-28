'use client';

import { useState } from 'react';
import { Settings, ChevronDown, ChevronUp, Palette } from 'lucide-react';
import { Theme, DEFAULT_THEME } from '@/types';

interface GenerationSettingsProps {
  slideCount: number;
  onSlideCountChange: (count: number) => void;
  template: string;
  onTemplateChange: (template: string) => void;
  customInstructions: string;
  onCustomInstructionsChange: (instructions: string) => void;
  theme: Partial<Theme>;
  onThemeChange: (theme: Partial<Theme>) => void;
}

const TEMPLATES = [
  { id: '', name: '自動選択', description: 'AIが最適なテンプレートを選択' },
  { id: 'business', name: 'ビジネス', description: 'フォーマルなビジネスプレゼン向け' },
  { id: 'creative', name: 'クリエイティブ', description: '視覚的にインパクトのあるデザイン' },
  { id: 'minimal', name: 'ミニマル', description: 'シンプルでクリーンなデザイン' },
  { id: 'data', name: 'データ重視', description: 'グラフや数値を強調' },
  { id: 'pitch', name: 'ピッチデッキ', description: 'スタートアップのピッチ向け' },
];

const COLOR_PRESETS = [
  { name: 'ブルー', primary: '#3B82F6', secondary: '#60A5FA' },
  { name: 'グリーン', primary: '#10B981', secondary: '#34D399' },
  { name: 'パープル', primary: '#8B5CF6', secondary: '#A78BFA' },
  { name: 'オレンジ', primary: '#F59E0B', secondary: '#FBBF24' },
  { name: 'レッド', primary: '#EF4444', secondary: '#F87171' },
  { name: 'ティール', primary: '#14B8A6', secondary: '#2DD4BF' },
];

export default function GenerationSettings({
  slideCount,
  onSlideCountChange,
  template,
  onTemplateChange,
  customInstructions,
  onCustomInstructionsChange,
  theme,
  onThemeChange,
}: GenerationSettingsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* ヘッダー（常に表示） */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-900">生成設定</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        )}
      </button>

      {/* 展開されたコンテンツ */}
      {isExpanded && (
        <div className="p-4 space-y-6">
          {/* スライド数 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              スライド数
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="20"
                value={slideCount}
                onChange={(e) => onSlideCountChange(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-center font-medium">{slideCount}</span>
            </div>
          </div>

          {/* テンプレート選択 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テンプレート
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => onTemplateChange(t.id)}
                  className={`p-3 text-left rounded-lg border transition-all ${
                    template === t.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{t.description}</p>
                </button>
              ))}
            </div>
          </div>

          {/* カラーテーマ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              カラーテーマ
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() =>
                    onThemeChange({
                      ...theme,
                      primaryColor: preset.primary,
                      secondaryColor: preset.secondary,
                    })
                  }
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                    theme.primaryColor === preset.primary
                      ? 'border-gray-900 bg-gray-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <span className="text-sm">{preset.name}</span>
                </button>
              ))}
            </div>

            {/* カスタムカラー */}
            <div className="mt-3 flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">メイン:</span>
                <input
                  type="color"
                  value={theme.primaryColor || DEFAULT_THEME.primaryColor}
                  onChange={(e) =>
                    onThemeChange({ ...theme, primaryColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">背景:</span>
                <input
                  type="color"
                  value={theme.backgroundColor || DEFAULT_THEME.backgroundColor}
                  onChange={(e) =>
                    onThemeChange({ ...theme, backgroundColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </label>
              <label className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">テキスト:</span>
                <input
                  type="color"
                  value={theme.textColor || DEFAULT_THEME.textColor}
                  onChange={(e) =>
                    onThemeChange({ ...theme, textColor: e.target.value })
                  }
                  className="w-8 h-8 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* カスタム指示 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              追加指示（オプション）
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => onCustomInstructionsChange(e.target.value)}
              placeholder="例：
- 日本語で生成してください
- 各スライドに統計データを含めてください
- 環境に優しいテーマでデザインしてください"
              className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            />
          </div>
        </div>
      )}
    </div>
  );
}
