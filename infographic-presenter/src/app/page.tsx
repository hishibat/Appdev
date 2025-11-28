'use client';

import { useState, useCallback } from 'react';
import { Presentation, Layout, Sparkles, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import FileUploader from '@/components/FileUploader';
import SlidePreview from '@/components/SlidePreview';
import SlideThumbnailList from '@/components/SlideThumbnailList';
import RevisionPanel from '@/components/RevisionPanel';
import GenerationSettings from '@/components/GenerationSettings';
import ExportPanel from '@/components/ExportPanel';
import { usePresentationStore, createEmptyPresentation } from '@/store/presentationStore';
import { ParsedData, Theme, DEFAULT_THEME, Slide } from '@/types';
import { v4 as uuidv4 } from 'uuid';

type AppState = 'input' | 'generating' | 'preview';

export default function Home() {
  const [appState, setAppState] = useState<AppState>('input');
  const [slideCount, setSlideCount] = useState(5);
  const [template, setTemplate] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [customTheme, setCustomTheme] = useState<Partial<Theme>>({});
  const [isRevising, setIsRevising] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    presentation,
    setPresentation,
    parsedData,
    setParsedData,
    currentSlideIndex,
    setCurrentSlideIndex,
    updateSlide,
    addSlide,
    removeSlide,
    isGenerating,
    setIsGenerating,
    isExporting,
    setIsExporting,
    reset,
  } = usePresentationStore();

  const handleDataParsed = useCallback((data: ParsedData) => {
    setParsedData(data);
    setError(null);
  }, [setParsedData]);

  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
  }, []);

  const handleGenerate = async () => {
    if (!parsedData) {
      setError('データを入力してください');
      return;
    }

    setIsGenerating(true);
    setAppState('generating');
    setError(null);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: parsedData,
          slideCount,
          template: template || undefined,
          customInstructions: customInstructions || undefined,
          theme: customTheme,
        }),
      });

      if (!response.ok) {
        throw new Error('生成に失敗しました');
      }

      const generatedPresentation = await response.json();
      setPresentation(generatedPresentation);
      setAppState('preview');
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成に失敗しました');
      setAppState('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRevise = async (instruction: string) => {
    if (!presentation || currentSlideIndex < 0) return;

    const currentSlide = presentation.slides[currentSlideIndex];
    setIsRevising(true);

    try {
      const response = await fetch('/api/revise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slideId: currentSlide.id,
          instruction,
          currentSlide,
        }),
      });

      if (!response.ok) {
        throw new Error('修正に失敗しました');
      }

      const revisedSlide = await response.json();
      updateSlide(currentSlide.id, revisedSlide);
    } catch (err) {
      setError(err instanceof Error ? err.message : '修正に失敗しました');
    } finally {
      setIsRevising(false);
    }
  };

  const handleAddSlide = (index: number) => {
    if (!presentation) return;

    const newSlide: Slide = {
      id: uuidv4(),
      title: '新しいスライド',
      content: '内容を編集してください',
      layout: 'content',
      backgroundColor: presentation.theme.backgroundColor,
      textColor: presentation.theme.textColor,
    };

    addSlide(newSlide, index);
    setCurrentSlideIndex(index);
  };

  const handleReset = () => {
    reset();
    setAppState('input');
    setSlideCount(5);
    setTemplate('');
    setCustomInstructions('');
    setCustomTheme({});
    setError(null);
  };

  const currentSlide = presentation?.slides[currentSlideIndex] || null;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* ヘッダー */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Presentation className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Infographic Presenter</h1>
              <p className="text-xs text-gray-500">AI-Powered Presentation Generator</p>
            </div>
          </div>

          {appState === 'preview' && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              最初から
            </button>
          )}
        </div>
      </header>

      {/* エラー表示 */}
      {error && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        </div>
      )}

      {/* 入力画面 */}
      {appState === 'input' && (
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              データからプレゼンを作成
            </h2>
            <p className="text-gray-600">
              テキスト、CSV、Excel、PDF、画像をアップロードして、
              <br />
              AIがインフォグラフィックなプレゼン資料を自動生成します
            </p>
          </div>

          <div className="space-y-6">
            <FileUploader onDataParsed={handleDataParsed} onError={handleError} />

            {parsedData && (
              <>
                {/* 解析済みデータの表示 */}
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-700 font-medium">データを読み込みました</p>
                  <p className="text-green-600 text-sm mt-1">
                    タイプ: {parsedData.type} |
                    {parsedData.metadata?.filename && ` ファイル名: ${parsedData.metadata.filename}`}
                  </p>
                </div>

                {/* 生成設定 */}
                <GenerationSettings
                  slideCount={slideCount}
                  onSlideCountChange={setSlideCount}
                  template={template}
                  onTemplateChange={setTemplate}
                  customInstructions={customInstructions}
                  onCustomInstructionsChange={setCustomInstructions}
                  theme={customTheme}
                  onThemeChange={setCustomTheme}
                />

                {/* 生成ボタン */}
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
                >
                  <Sparkles className="w-6 h-6" />
                  プレゼンテーションを生成
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* 生成中 */}
      {appState === 'generating' && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-blue-200 rounded-full animate-pulse" />
            <div className="absolute inset-0 w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="mt-6 text-xl font-semibold text-gray-700">
            プレゼンテーションを生成中...
          </p>
          <p className="mt-2 text-gray-500">
            AIが最適なレイアウトとデザインを考えています
          </p>
        </div>
      )}

      {/* プレビュー画面 */}
      {appState === 'preview' && presentation && (
        <div className="flex h-[calc(100vh-73px)]">
          {/* 左サイドバー: サムネイル */}
          <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
            <div className="p-3 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <Layout className="w-4 h-4" />
                スライド一覧
              </h3>
            </div>
            <div className="flex-1 overflow-hidden">
              <SlideThumbnailList
                slides={presentation.slides}
                theme={presentation.theme}
                currentIndex={currentSlideIndex}
                onSelectSlide={setCurrentSlideIndex}
                onDeleteSlide={removeSlide}
                onAddSlide={handleAddSlide}
              />
            </div>
          </div>

          {/* 中央: プレビュー */}
          <div className="flex-1 flex flex-col bg-gray-100 p-6">
            <div className="flex-1 flex items-center justify-center">
              {currentSlide && (
                <div className="w-full max-w-4xl">
                  <SlidePreview
                    slide={currentSlide}
                    theme={presentation.theme}
                    size="large"
                  />
                </div>
              )}
            </div>

            {/* ナビゲーション */}
            <div className="flex items-center justify-center gap-4 mt-4">
              <button
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <span className="text-gray-600 font-medium">
                {currentSlideIndex + 1} / {presentation.slides.length}
              </span>
              <button
                onClick={() =>
                  setCurrentSlideIndex(
                    Math.min(presentation.slides.length - 1, currentSlideIndex + 1)
                  )
                }
                disabled={currentSlideIndex === presentation.slides.length - 1}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* 右サイドバー: 修正・エクスポート */}
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <RevisionPanel
                currentSlide={currentSlide}
                onRevise={handleRevise}
                isRevising={isRevising}
              />
            </div>
            <div className="border-t border-gray-200">
              <ExportPanel
                presentation={presentation}
                isExporting={isExporting}
                onExportStart={() => setIsExporting(true)}
                onExportEnd={() => setIsExporting(false)}
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
