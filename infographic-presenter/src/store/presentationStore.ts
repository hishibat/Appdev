import { create } from 'zustand';
import { Presentation, Slide, Theme, DEFAULT_THEME, ParsedData } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface PresentationState {
  presentation: Presentation | null;
  currentSlideIndex: number;
  isGenerating: boolean;
  isExporting: boolean;
  parsedData: ParsedData | null;
  error: string | null;

  // Actions
  setPresentation: (presentation: Presentation) => void;
  setParsedData: (data: ParsedData) => void;
  setCurrentSlideIndex: (index: number) => void;
  updateSlide: (slideId: string, updates: Partial<Slide>) => void;
  addSlide: (slide: Slide, index?: number) => void;
  removeSlide: (slideId: string) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  updateTheme: (theme: Partial<Theme>) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setIsExporting: (isExporting: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  presentation: null,
  currentSlideIndex: 0,
  isGenerating: false,
  isExporting: false,
  parsedData: null,
  error: null,
};

export const usePresentationStore = create<PresentationState>((set, get) => ({
  ...initialState,

  setPresentation: (presentation) => set({ presentation, currentSlideIndex: 0 }),

  setParsedData: (data) => set({ parsedData: data }),

  setCurrentSlideIndex: (index) => set({ currentSlideIndex: index }),

  updateSlide: (slideId, updates) => {
    const { presentation } = get();
    if (!presentation) return;

    const updatedSlides = presentation.slides.map((slide) =>
      slide.id === slideId ? { ...slide, ...updates } : slide
    );

    set({
      presentation: {
        ...presentation,
        slides: updatedSlides,
        updatedAt: new Date(),
      },
    });
  },

  addSlide: (slide, index) => {
    const { presentation } = get();
    if (!presentation) return;

    const newSlides = [...presentation.slides];
    if (index !== undefined) {
      newSlides.splice(index, 0, slide);
    } else {
      newSlides.push(slide);
    }

    set({
      presentation: {
        ...presentation,
        slides: newSlides,
        updatedAt: new Date(),
      },
    });
  },

  removeSlide: (slideId) => {
    const { presentation, currentSlideIndex } = get();
    if (!presentation) return;

    const newSlides = presentation.slides.filter((s) => s.id !== slideId);
    const newIndex = Math.min(currentSlideIndex, newSlides.length - 1);

    set({
      presentation: {
        ...presentation,
        slides: newSlides,
        updatedAt: new Date(),
      },
      currentSlideIndex: Math.max(0, newIndex),
    });
  },

  reorderSlides: (fromIndex, toIndex) => {
    const { presentation } = get();
    if (!presentation) return;

    const newSlides = [...presentation.slides];
    const [removed] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, removed);

    set({
      presentation: {
        ...presentation,
        slides: newSlides,
        updatedAt: new Date(),
      },
    });
  },

  updateTheme: (theme) => {
    const { presentation } = get();
    if (!presentation) return;

    set({
      presentation: {
        ...presentation,
        theme: { ...presentation.theme, ...theme },
        updatedAt: new Date(),
      },
    });
  },

  setIsGenerating: (isGenerating) => set({ isGenerating }),

  setIsExporting: (isExporting) => set({ isExporting }),

  setError: (error) => set({ error }),

  reset: () => set(initialState),
}));

export const createEmptyPresentation = (): Presentation => ({
  id: uuidv4(),
  title: '新しいプレゼンテーション',
  slides: [],
  theme: DEFAULT_THEME,
  createdAt: new Date(),
  updatedAt: new Date(),
});
