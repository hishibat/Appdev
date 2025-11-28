'use client';

import { Slide, Theme } from '@/types';
import SlidePreview from './SlidePreview';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

interface SlideThumbnailListProps {
  slides: Slide[];
  theme: Theme;
  currentIndex: number;
  onSelectSlide: (index: number) => void;
  onDeleteSlide?: (slideId: string) => void;
  onAddSlide?: (index: number) => void;
}

export default function SlideThumbnailList({
  slides,
  theme,
  currentIndex,
  onSelectSlide,
  onDeleteSlide,
  onAddSlide,
}: SlideThumbnailListProps) {
  return (
    <div className="h-full overflow-y-auto p-2 space-y-3">
      {slides.map((slide, index) => (
        <div key={slide.id} className="group relative">
          {/* スライド番号 */}
          <div className="absolute -left-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-60">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab" />
            <span className="text-xs text-gray-500 w-4">{index + 1}</span>
          </div>

          {/* サムネイル */}
          <div className="ml-6">
            <SlidePreview
              slide={slide}
              theme={theme}
              isSelected={currentIndex === index}
              onClick={() => onSelectSlide(index)}
              size="small"
            />
          </div>

          {/* アクションボタン */}
          <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onDeleteSlide && slides.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSlide(slide.id);
                }}
                className="p-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                title="スライドを削除"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* スライド追加ボタン（スライド間） */}
          {onAddSlide && (
            <button
              onClick={() => onAddSlide(index + 1)}
              className="w-full mt-2 py-1 flex items-center justify-center gap-1 text-xs text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded transition-colors opacity-0 group-hover:opacity-100"
            >
              <Plus className="w-3 h-3" />
              <span>スライドを追加</span>
            </button>
          )}
        </div>
      ))}

      {/* 末尾に追加ボタン */}
      {onAddSlide && (
        <button
          onClick={() => onAddSlide(slides.length)}
          className="w-full py-4 flex items-center justify-center gap-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:text-blue-500 hover:border-blue-400 hover:bg-blue-50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>新しいスライド</span>
        </button>
      )}
    </div>
  );
}
