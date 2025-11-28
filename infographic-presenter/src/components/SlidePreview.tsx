'use client';

import { Slide, Theme, ChartData } from '@/types';

interface SlidePreviewProps {
  slide: Slide;
  theme: Theme;
  isSelected?: boolean;
  onClick?: () => void;
  size?: 'small' | 'large';
}

export default function SlidePreview({
  slide,
  theme,
  isSelected = false,
  onClick,
  size = 'large',
}: SlidePreviewProps) {
  const isSmall = size === 'small';
  const containerClass = isSmall
    ? 'w-48 h-27 cursor-pointer'
    : 'w-full aspect-video';

  return (
    <div
      onClick={onClick}
      className={`${containerClass} relative overflow-hidden rounded-lg shadow-lg transition-all ${
        isSelected ? 'ring-4 ring-blue-500' : ''
      } ${onClick ? 'hover:shadow-xl' : ''}`}
      style={{ backgroundColor: slide.backgroundColor || theme.backgroundColor }}
    >
      {renderSlideContent(slide, theme, isSmall)}
    </div>
  );
}

function renderSlideContent(slide: Slide, theme: Theme, isSmall: boolean) {
  const titleSize = isSmall ? 'text-xs' : 'text-2xl md:text-3xl';
  const contentSize = isSmall ? 'text-[8px]' : 'text-sm md:text-base';
  const padding = isSmall ? 'p-2' : 'p-6 md:p-8';

  switch (slide.layout) {
    case 'title':
      return (
        <div className={`${padding} h-full flex flex-col justify-center items-center text-center`}>
          <h2
            className={`${titleSize} font-bold mb-2`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h2>
          <p className={`${contentSize}`} style={{ color: theme.textColor }}>
            {slide.content}
          </p>
          {slide.imageUrl && !isSmall && (
            <img
              src={slide.imageUrl}
              alt=""
              className="mt-4 max-h-32 object-contain"
            />
          )}
        </div>
      );

    case 'content':
      return (
        <div className={`${padding} h-full flex flex-col`}>
          <h3
            className={`${titleSize} font-bold mb-3`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h3>
          <div className="flex flex-1 gap-4">
            <div className="flex-1">
              <ContentList content={slide.content} theme={theme} isSmall={isSmall} />
            </div>
            {slide.imageUrl && (
              <div className="w-1/3 flex items-center justify-center">
                <img src={slide.imageUrl} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>
      );

    case 'image-left':
      return (
        <div className={`${padding} h-full flex flex-col`}>
          <h3
            className={`${titleSize} font-bold mb-3`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h3>
          <div className="flex flex-1 gap-4">
            {slide.imageUrl && (
              <div className="w-1/2 flex items-center justify-center">
                <img src={slide.imageUrl} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
            <div className="w-1/2">
              <ContentList content={slide.content} theme={theme} isSmall={isSmall} />
            </div>
          </div>
        </div>
      );

    case 'image-right':
      return (
        <div className={`${padding} h-full flex flex-col`}>
          <h3
            className={`${titleSize} font-bold mb-3`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h3>
          <div className="flex flex-1 gap-4">
            <div className="w-1/2">
              <ContentList content={slide.content} theme={theme} isSmall={isSmall} />
            </div>
            {slide.imageUrl && (
              <div className="w-1/2 flex items-center justify-center">
                <img src={slide.imageUrl} alt="" className="max-w-full max-h-full object-contain rounded-lg" />
              </div>
            )}
          </div>
        </div>
      );

    case 'full-image':
      return (
        <div className="h-full relative">
          {slide.imageUrl && (
            <img src={slide.imageUrl} alt="" className="w-full h-full object-cover" />
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
            <h3 className={`${titleSize} font-bold text-white`}>{slide.title}</h3>
          </div>
        </div>
      );

    case 'chart':
      return (
        <div className={`${padding} h-full flex flex-col`}>
          <h3
            className={`${titleSize} font-bold mb-3`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h3>
          <div className="flex flex-1 gap-4">
            <div className="flex-1 flex items-center justify-center">
              {slide.chartData && (
                <SimpleChart chartData={slide.chartData} theme={theme} isSmall={isSmall} />
              )}
            </div>
            {slide.content && (
              <div className="w-1/3">
                <p className={`${contentSize}`} style={{ color: theme.textColor }}>
                  {slide.content}
                </p>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className={`${padding} h-full flex flex-col`}>
          <h3
            className={`${titleSize} font-bold mb-3`}
            style={{ color: theme.primaryColor }}
          >
            {slide.title}
          </h3>
          <p className={`${contentSize}`} style={{ color: theme.textColor }}>
            {slide.content}
          </p>
        </div>
      );
  }
}

interface ContentListProps {
  content: string;
  theme: Theme;
  isSmall: boolean;
}

function ContentList({ content, theme, isSmall }: ContentListProps) {
  const lines = content.split('\n').filter((l) => l.trim());
  const textSize = isSmall ? 'text-[8px]' : 'text-sm md:text-base';

  return (
    <ul className={`space-y-1 ${textSize}`} style={{ color: theme.textColor }}>
      {lines.slice(0, isSmall ? 4 : 8).map((line, i) => (
        <li key={i} className="flex items-start gap-2">
          <span
            className={`${isSmall ? 'w-1 h-1 mt-1' : 'w-2 h-2 mt-1.5'} rounded-full flex-shrink-0`}
            style={{ backgroundColor: theme.primaryColor }}
          />
          <span>{line.replace(/^[-•*]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  );
}

interface SimpleChartProps {
  chartData: ChartData;
  theme: Theme;
  isSmall: boolean;
}

function SimpleChart({ chartData, theme, isSmall }: SimpleChartProps) {
  const maxValue = Math.max(...chartData.values);
  const barWidth = isSmall ? 20 : 40;
  const maxHeight = isSmall ? 60 : 150;
  const gap = isSmall ? 8 : 16;

  if (chartData.type === 'pie') {
    return <PieChart chartData={chartData} theme={theme} isSmall={isSmall} />;
  }

  return (
    <div className="flex items-end justify-center" style={{ gap }}>
      {chartData.values.map((value, i) => {
        const height = (value / maxValue) * maxHeight;
        const color = chartData.colors?.[i] || theme.primaryColor;

        return (
          <div key={i} className="flex flex-col items-center">
            <span
              className={`${isSmall ? 'text-[8px]' : 'text-xs'} mb-1`}
              style={{ color: theme.textColor }}
            >
              {value}
            </span>
            <div
              className="rounded-t transition-all"
              style={{
                width: barWidth,
                height,
                backgroundColor: color,
              }}
            />
            <span
              className={`${isSmall ? 'text-[6px]' : 'text-xs'} mt-1 text-center`}
              style={{ color: theme.textColor, maxWidth: barWidth + 10 }}
            >
              {chartData.labels[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function PieChart({ chartData, theme, isSmall }: SimpleChartProps) {
  const total = chartData.values.reduce((a, b) => a + b, 0);
  const size = isSmall ? 60 : 120;
  let currentAngle = 0;

  return (
    <div className="flex items-center gap-4">
      <svg width={size} height={size} viewBox="0 0 100 100">
        {chartData.values.map((value, i) => {
          const angle = (value / total) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          currentAngle = endAngle;

          const x1 = 50 + 40 * Math.cos((Math.PI * startAngle) / 180);
          const y1 = 50 + 40 * Math.sin((Math.PI * startAngle) / 180);
          const x2 = 50 + 40 * Math.cos((Math.PI * endAngle) / 180);
          const y2 = 50 + 40 * Math.sin((Math.PI * endAngle) / 180);

          const largeArc = angle > 180 ? 1 : 0;
          const color = chartData.colors?.[i] || theme.primaryColor;

          return (
            <path
              key={i}
              d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArc} 1 ${x2} ${y2} Z`}
              fill={color}
            />
          );
        })}
      </svg>
      {!isSmall && (
        <div className="flex flex-col gap-1">
          {chartData.labels.map((label, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: chartData.colors?.[i] || theme.primaryColor }}
              />
              <span style={{ color: theme.textColor }}>{label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
