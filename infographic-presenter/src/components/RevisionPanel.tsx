'use client';

import { useState } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { Slide } from '@/types';

interface RevisionPanelProps {
  currentSlide: Slide | null;
  onRevise: (instruction: string) => Promise<void>;
  isRevising: boolean;
}

const QUICK_ACTIONS = [
  { label: 'もっと簡潔に', instruction: 'コンテンツをより簡潔に、要点を絞った内容にしてください' },
  { label: '詳細を追加', instruction: 'より詳細な説明と具体例を追加してください' },
  { label: 'データ強調', instruction: '数値やデータをより強調した表現にしてください' },
  { label: 'ビジュアル強化', instruction: '画像プロンプトをより詳細で視覚的にインパクトのあるものにしてください' },
  { label: 'トーン変更', instruction: 'よりビジネスフォーマルなトーンに変更してください' },
  { label: 'アクション追加', instruction: '具体的なアクションアイテムや次のステップを追加してください' },
];

export default function RevisionPanel({
  currentSlide,
  onRevise,
  isRevising,
}: RevisionPanelProps) {
  const [instruction, setInstruction] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!instruction.trim() || isRevising) return;

    await onRevise(instruction);
    setInstruction('');
  };

  const handleQuickAction = async (quickInstruction: string) => {
    if (isRevising) return;
    await onRevise(quickInstruction);
  };

  if (!currentSlide) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg text-center text-gray-500">
        スライドを選択して修正してください
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 現在のスライド情報 */}
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">選択中のスライド</h4>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium">タイトル:</span> {currentSlide.title}
        </p>
        <p className="text-sm text-gray-600">
          <span className="font-medium">レイアウト:</span> {currentSlide.layout}
        </p>
      </div>

      {/* クイックアクション */}
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-500" />
          クイック修正
        </h4>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.instruction)}
              disabled={isRevising}
              className="px-3 py-1.5 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* カスタム修正指示 */}
      <form onSubmit={handleSubmit} className="space-y-2">
        <h4 className="font-medium text-gray-900">カスタム修正</h4>
        <div className="relative">
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            placeholder="修正内容を入力してください...

例：
- タイトルをより魅力的に
- 箇条書きを3つに減らして
- グラフを円グラフに変更
- 画像をよりモダンなデザインに"
            disabled={isRevising}
            className="w-full h-32 p-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={!instruction.trim() || isRevising}
            className="absolute bottom-3 right-3 p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isRevising ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>

      {/* 処理中の表示 */}
      {isRevising && (
        <div className="flex items-center justify-center gap-2 p-3 bg-blue-50 rounded-lg">
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
          <span className="text-blue-600">AI が修正を生成中...</span>
        </div>
      )}
    </div>
  );
}
