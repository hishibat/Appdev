'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, FileSpreadsheet, Image, File, X } from 'lucide-react';
import { parseFile, parseDirectTextInput } from '@/lib/fileParser';
import { ParsedData } from '@/types';

interface FileUploaderProps {
  onDataParsed: (data: ParsedData) => void;
  onError: (error: string) => void;
}

export default function FileUploader({ onDataParsed, onError }: FileUploaderProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [inputMode, setInputMode] = useState<'file' | 'text'>('file');

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setUploadedFile(file);
      setIsProcessing(true);

      try {
        const parsedData = await parseFile(file);
        onDataParsed(parsedData);
      } catch (error) {
        onError(error instanceof Error ? error.message : 'ファイルの解析に失敗しました');
      } finally {
        setIsProcessing(false);
      }
    },
    [onDataParsed, onError]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/plain': ['.txt', '.md'],
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  const handleTextSubmit = () => {
    if (!textInput.trim()) {
      onError('テキストを入力してください');
      return;
    }

    const parsedData = parseDirectTextInput(textInput);
    onDataParsed(parsedData);
  };

  const clearFile = () => {
    setUploadedFile(null);
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'txt':
      case 'md':
        return <FileText className="w-8 h-8 text-blue-500" />;
      case 'csv':
      case 'xlsx':
      case 'xls':
        return <FileSpreadsheet className="w-8 h-8 text-green-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
      case 'webp':
        return <Image className="w-8 h-8 text-purple-500" />;
      case 'pdf':
        return <File className="w-8 h-8 text-red-500" />;
      default:
        return <File className="w-8 h-8 text-gray-500" />;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* タブ切り替え */}
      <div className="flex mb-4 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setInputMode('file')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'file'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ファイルアップロード
        </button>
        <button
          onClick={() => setInputMode('text')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            inputMode === 'text'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          テキスト入力
        </button>
      </div>

      {inputMode === 'file' ? (
        <>
          {/* ドロップゾーン */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
              isDragActive
                ? 'border-blue-500 bg-blue-50'
                : isProcessing
                ? 'border-gray-300 bg-gray-50 cursor-not-allowed'
                : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
            }`}
          >
            <input {...getInputProps()} />
            <Upload
              className={`w-12 h-12 mx-auto mb-4 ${
                isDragActive ? 'text-blue-500' : 'text-gray-400'
              }`}
            />
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-gray-600">処理中...</span>
              </div>
            ) : isDragActive ? (
              <p className="text-blue-500 font-medium">ファイルをドロップしてください</p>
            ) : (
              <>
                <p className="text-gray-600 font-medium mb-2">
                  ファイルをドラッグ＆ドロップ
                </p>
                <p className="text-gray-400 text-sm">
                  または クリックしてファイルを選択
                </p>
              </>
            )}
          </div>

          {/* サポートファイル形式 */}
          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            {['TXT', 'CSV', 'Excel', 'PDF', '画像'].map((type) => (
              <span
                key={type}
                className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
              >
                {type}
              </span>
            ))}
          </div>

          {/* アップロード済みファイル */}
          {uploadedFile && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg flex items-center gap-3">
              {getFileIcon(uploadedFile.name)}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{uploadedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(uploadedFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearFile();
                }}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* テキスト入力 */}
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="プレゼンテーションの内容を入力してください...

例：
- 会社概要
- 売上データ
- プロジェクト計画
など"
            className="w-full h-64 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          />
          <button
            onClick={handleTextSubmit}
            disabled={!textInput.trim()}
            className="mt-4 w-full py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            このテキストを使用
          </button>
        </>
      )}
    </div>
  );
}
