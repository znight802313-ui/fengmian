import { useState, useRef, useEffect } from 'react';
import { Download, Sparkles, Image as ImageIcon, Loader2, ChevronDown, Check, RefreshCw, Upload, FileSpreadsheet, Package, Play, SlidersHorizontal, X } from 'lucide-react';
import JSZip from 'jszip';
import * as XLSX from 'xlsx';
import { generatePromptWithAI, generateImageWithAI } from './services/api';

function CustomDropdown({ label, value, options, onChange }: { label: string, value: string, options: {value: string, label: string}[], onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative flex items-center" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center bg-white/70 hover:bg-white backdrop-blur-md border rounded-full shadow-sm px-3.5 py-1.5 transition-colors cursor-pointer select-none ${isOpen ? 'border-orange-300' : 'border-stone-200/50'}`}
      >
        <span className="text-[11px] font-bold text-stone-400 mr-2 whitespace-nowrap">{label}</span>
        <span className="w-[100px] text-[12px] font-bold text-stone-700 truncate pr-2">{selectedOption.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1.5 right-0 w-[170px] bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100">
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-3 py-2.5 text-[12px] cursor-pointer transition-colors flex items-center justify-between ${
                opt.value === value 
                  ? 'bg-orange-50/50 text-orange-600 font-bold' 
                  : 'text-stone-600 hover:bg-stone-50 font-medium'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-3.5 h-3.5 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const LLM_OPTIONS = [
  { value: 'deepseek-v4-flash', label: 'DeepSeek Flash' },
  { value: 'deepseek-v4-pro', label: 'DeepSeek Pro Thinking' },
  { value: 'claude-sonnet-4-5-20250929', label: 'Claude Sonnet 4.5' },
  { value: '[次]gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { value: '[次]gemini-3-flash-preview', label: 'Gemini 3 Flash' },
  { value: 'gpt-5.5', label: 'GPT-5.5' }
];

const IMAGE_OPTIONS = [
  { value: 'gpt-image-2', label: 'GPT Image 2' },
  { value: '[A]gemini-3-pro-image-preview-2k', label: 'Gemini Image 2K' },
  { value: '[A]gemini-3-pro-image-preview-4k', label: 'Gemini Image 4K' }
];

const LAYOUT_OPTIONS = [
  { value: '默认自由发挥', label: '默认自由发挥' },
  { value: '顶部居中 (画面上方)', label: '顶部居中' },
  { value: '底部排版 (画面下方)', label: '底部排版' },
  { value: '正中央大字 (视觉中心)', label: '正中央大字' },
  { value: '左侧对齐 (画面左边)', label: '左侧对齐' },
  { value: '右侧对齐 (画面右边)', label: '右侧对齐' }
];

const CHARACTER_LAYOUT_OPTIONS = [
  { value: '默认自由发挥', label: '模型自由发挥' },
  { value: '单人主角特写', label: '单人主角特写' },
  { value: '单人半身氛围', label: '单人半身氛围' },
  { value: '双人对峙张力', label: '双人对峙张力' },
  { value: '双人错位互动', label: '双人错位互动' },
  { value: '背靠背关系', label: '背靠背关系' },
  { value: '权力压制关系', label: '权力压制关系' },
  { value: '多人群像关系', label: '多人群像关系' },
  { value: '孤独远景/背影', label: '孤独远景 / 背影' }
];

const RATIO_OPTIONS = [
  { value: '3:4', label: '竖图 (3:4)' },
  { value: '1:1', label: '正方形 (1:1)' },
  { value: '4:3', label: '横图 (4:3)' },
  { value: '16:9', label: '宽屏 (16:9)' },
  { value: '9:16', label: '竖屏 (9:16)' }
];

const getImageGenerationConcurrency = (model: string) => {
  if (model === 'gpt-image-2') return 3;
  return 3;
};

const getDefaultCompositions = (lang: string) => {
  if (['英语', '西班牙语', '葡萄牙语'].includes(lang)) {
    return ['角色特写', '中景氛围感'];
  }

  if (lang === '日语') {
    return ['中景氛围感', '宏大场景'];
  }

  return ['角色特写', '宏大场景'];
};

const getDefaultArtStyle = (lang: string) => {
  if (lang === '中文') return '3DCG动漫';
  if (lang === '日语') return '真人唯美';
  return '真人写实';
};

const DEFAULT_LANGUAGE = '中文';
const DEFAULT_LLM_MODEL = 'deepseek-v4-flash';
const DEFAULT_IMAGE_MODEL = 'gpt-image-2';
const DEFAULT_FALLBACK_IMAGE_MODEL = '[A]gemini-3-pro-image-preview-2k';
const DEFAULT_RATIO = '3:4';
const DEFAULT_TITLE_LAYOUT = '默认自由发挥';
const DEFAULT_CHARACTER_LAYOUT = '默认自由发挥';
const DEFAULT_COUNT = 1;
const DEFAULT_BATCH_COUNT = 1;
const BATCH_LLM_CONCURRENCY = 6;
const BATCH_IMAGE_CONCURRENCY = 3;
const GENERATION_HISTORY_STORAGE_KEY = 'novel-cover-generation-history-v1';
const HISTORY_IMAGE_DB_NAME = 'novel-cover-history-images-v1';
const HISTORY_IMAGE_STORE_NAME = 'images';
const HISTORY_IMAGE_URL_PREFIX = 'indexeddb://history-cover/';
const MAX_GENERATION_HISTORY = 10;
const MAX_STANDARD_COVER_BYTES = 500 * 1024;

type GeneratedImageResult = {
  url: string;
  comp: string;
  error?: string;
  imageModel: string;
  isHistoryPreview?: boolean;
  historyImageKey?: string;
};

type GenerationRecord = {
  id: string;
  title: string;
  language: string;
  artStyle: string;
  titleLayout: string;
  characterLayout?: string;
  tags: string;
  summary: string;
  llmModel: string;
  imageModel: string;
  ratio: string;
  compositions: string[];
  prompts: Record<string, string>;
  images?: GeneratedImageResult[];
  generatedAt: string;
  successCount: number;
  failedCount: number;
};

type BatchBookInput = {
  id: string;
  title: string;
  tags: string;
  summary: string;
};

type BatchBookStatus = 'waiting' | 'prompting' | 'imaging' | 'fallback' | 'completed' | 'failed';

type BatchGeneratedImage = GeneratedImageResult & {
  bookId: string;
  title: string;
  indexInComposition: number;
  prompt: string;
};

type BatchBookTask = BatchBookInput & {
  language: string;
  artStyle: string;
  titleLayout: string;
  characterLayout: string;
  ratio: string;
  compositions: string[];
  llmModel: string;
  imageModel: string;
  fallbackImageModel: string;
  count: number;
  prompts: Record<string, string>;
  status: BatchBookStatus;
  totalImageTasks: number;
  completedImageTasks: number;
  successCount: number;
  failedCount: number;
  error?: string;
  images: BatchGeneratedImage[];
};

type BatchImageJob = {
  bookId: string;
  title: string;
  composition: string;
  prompt: string;
  imageModel: string;
  ratio: string;
  indexInComposition: number;
  isFallback?: boolean;
};

type BatchImageEditTarget = {
  bookId: string;
  imageKey: string;
  composition: string;
  prompt: string;
  imageModel: string;
};

const getCompositionLabel = (comp: string, lang: string) => {
  if (lang === '日语' && comp === '宏大场景') return '纯景无人';
  return comp;
};

const getErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

const isAsciiOnly = (text: string) => {
  return [...text].every(char => char.charCodeAt(0) <= 127);
};

const detectTitleLanguage = (value: string, currentLanguage = DEFAULT_LANGUAGE) => {
  const text = value.trim().toLowerCase();
  if (!text) return currentLanguage;

  if (/[\u3040-\u30ff\u31f0-\u31ff]/.test(text)) return '日语';
  if (/[\u4e00-\u9fa5]/.test(text)) return '中文';

  let ptScore = (text.match(/\b(na|no|do|da|um|uma|não|eu|você|com|em|para|que|os|as|seu|sua|das|dos|e|é)\b/gi) || []).length;
  ptScore += (text.match(/[ãõç]/gi) || []).length * 3;

  let esScore = (text.match(/\b(el|la|los|las|un|una|y|de|en|por|con|del|al|su|para|que)\b/gi) || []).length;
  esScore += (text.match(/[ñ¿¡]/gi) || []).length * 3;

  const enScore = (text.match(/\b(the|to|of|and|in|that|have|it|for|with|is|are|was|were|on|at|by|my)\b/gi) || []).length;

  if (ptScore > esScore && ptScore > enScore) return '葡萄牙语';
  if (esScore > ptScore && esScore > enScore) return '西班牙语';
  if (enScore > ptScore && enScore > esScore) return '英语';

  if (isAsciiOnly(text)) {
    if (currentLanguage !== '西班牙语' && currentLanguage !== '葡萄牙语') return '英语';
  } else if (/[áéíóú]/i.test(text)) {
    if (currentLanguage !== '葡萄牙语') return '西班牙语';
  }

  return currentLanguage;
};

const sanitizeFileName = (name: string) => {
  const clean = name
    .trim()
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 80);
  return clean || '未命名';
};

const createBatchBookTask = (
  input: BatchBookInput,
  llmModel = DEFAULT_LLM_MODEL,
  imageModel = DEFAULT_IMAGE_MODEL,
  fallbackImageModel = DEFAULT_FALLBACK_IMAGE_MODEL,
  ratio = DEFAULT_RATIO,
  count = DEFAULT_COUNT
): BatchBookTask => {
  const language = detectTitleLanguage(input.title);
  const compositions = getDefaultCompositions(language);

  return {
    ...input,
    language,
    artStyle: getDefaultArtStyle(language),
    titleLayout: DEFAULT_TITLE_LAYOUT,
    characterLayout: DEFAULT_CHARACTER_LAYOUT,
    ratio,
    compositions,
    llmModel,
    imageModel,
    fallbackImageModel,
    count,
    prompts: {},
    status: 'waiting',
    totalImageTasks: compositions.length * count,
    completedImageTasks: 0,
    successCount: 0,
    failedCount: 0,
    images: []
  };
};

async function runWithConcurrency<T>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<void>
) {
  let nextIndex = 0;

  const runNext = async () => {
    const index = nextIndex;
    nextIndex += 1;
    if (index >= items.length) return;
    await worker(items[index], index);
    await runNext();
  };

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runNext));
}

const formatRecordTime = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return iso;
  }
};

const loadGenerationHistory = (): GenerationRecord[] => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GENERATION_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const persistGenerationHistory = (records: GenerationRecord[]) => {
  if (typeof window === 'undefined') return;

  const persistableRecords = records.map(record => ({
    ...record,
    images: (record.images || []).map(img => {
      const historyImageKey = getHistoryImageStorageKey(img);
      if (!historyImageKey) return img;
      return {
        ...img,
        url: `${HISTORY_IMAGE_URL_PREFIX}${historyImageKey}`,
        historyImageKey
      };
    })
  }));

  try {
    window.localStorage.setItem(GENERATION_HISTORY_STORAGE_KEY, JSON.stringify(persistableRecords));
  } catch (error) {
    console.warn('[CoverHistory] 生产记录过大，尝试减少历史条数', error);

    for (let keepCount = Math.min(persistableRecords.length, MAX_GENERATION_HISTORY - 1); keepCount >= 1; keepCount--) {
      try {
        window.localStorage.setItem(GENERATION_HISTORY_STORAGE_KEY, JSON.stringify(persistableRecords.slice(0, keepCount)));
        console.warn(`[CoverHistory] 已保留最近 ${keepCount} 条生产记录`);
        return;
      } catch {
        // Try fewer records until localStorage accepts it.
      }
    }

    try {
      window.localStorage.removeItem(GENERATION_HISTORY_STORAGE_KEY);
    } catch {
      // ignore cleanup failure
    }
    console.error('[CoverHistory] 生产记录保存失败，已清空本地历史');
  }
};

const openHistoryImageDb = async (): Promise<IDBDatabase> => {
  return await new Promise((resolve, reject) => {
    const request = window.indexedDB.open(HISTORY_IMAGE_DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(HISTORY_IMAGE_STORE_NAME)) {
        db.createObjectStore(HISTORY_IMAGE_STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('历史图片数据库打开失败'));
  });
};

const putHistoryImageBlob = async (key: string, blob: Blob) => {
  const db = await openHistoryImageDb();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(HISTORY_IMAGE_STORE_NAME, 'readwrite');
      tx.objectStore(HISTORY_IMAGE_STORE_NAME).put(blob, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error || new Error('历史图片保存失败'));
      tx.onabort = () => reject(tx.error || new Error('历史图片保存中断'));
    });
  } finally {
    db.close();
  }
};

const getHistoryImageBlob = async (key: string): Promise<Blob | null> => {
  const db = await openHistoryImageDb();
  try {
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(HISTORY_IMAGE_STORE_NAME, 'readonly');
      const request = tx.objectStore(HISTORY_IMAGE_STORE_NAME).get(key);
      request.onsuccess = () => resolve(request.result instanceof Blob ? request.result : null);
      request.onerror = () => reject(request.error || new Error('历史图片读取失败'));
    });
  } finally {
    db.close();
  }
};

const getHistoryImageKeyFromUrl = (url: string) => {
  if (!url.startsWith(HISTORY_IMAGE_URL_PREFIX)) return '';
  return url.slice(HISTORY_IMAGE_URL_PREFIX.length);
};

const getStandardCoverSize = (ratio: string) => {
  if (ratio === '1:1') return { width: 800, height: 800 };
  if (ratio === '4:3') return { width: 800, height: 600 };
  if (ratio === '16:9') return { width: 960, height: 540 };
  if (ratio === '9:16') return { width: 540, height: 960 };
  return { width: 600, height: 800 };
};

const loadImageElement = async (url: string, errorMessage: string): Promise<HTMLImageElement> => {
  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(errorMessage));
    img.src = url;
  });

  return img;
};

const buildStandardCoverBlob = async (url: string, ratio: string): Promise<Blob> => {
  const img = await loadImageElement(url, '标准封面加载失败');
  const { width, height } = getStandardCoverSize(ratio);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas not supported');

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blobFromCanvas = (quality: number) => new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, 'image/jpeg', quality);
  });

  let finalBlob: Blob | null = null;
  for (const quality of [0.92, 0.88, 0.84, 0.8, 0.76, 0.72]) {
    const blob = await blobFromCanvas(quality);
    if (!blob) continue;
    finalBlob = blob;
    if (blob.size <= MAX_STANDARD_COVER_BYTES) break;
  }

  if (!finalBlob) throw new Error('标准封面压缩失败');
  return finalBlob;
};

const createHistoryImageKey = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const createHistoryImageRecord = async (url: string, ratio: string): Promise<{ url: string; historyImageKey: string }> => {
  const blob = await buildStandardCoverBlob(url, ratio);
  const historyImageKey = createHistoryImageKey();
  await putHistoryImageBlob(historyImageKey, blob);
  return {
    url: `${HISTORY_IMAGE_URL_PREFIX}${historyImageKey}`,
    historyImageKey
  };
};

const createHistoryImageResult = async (img: GeneratedImageResult, ratio: string): Promise<GeneratedImageResult> => {
  if (img.url === 'error') {
    return { ...img, isHistoryPreview: true };
  }

  try {
    const historyImage = await createHistoryImageRecord(img.url, ratio);
    return {
      ...img,
      ...historyImage,
      isHistoryPreview: true
    };
  } catch (error) {
    console.warn('[CoverHistory] 历史标准封面保存失败，使用轻量记录', error);

    return {
      ...img,
      url: 'error',
      error: '历史标准封面保存失败',
      isHistoryPreview: true
    };
  }
};

const getHistoryImageStorageKey = (img: GeneratedImageResult) => {
  return img.historyImageKey || getHistoryImageKeyFromUrl(img.url) || '';
};

const revokeObjectUrls = (urls: string[]) => {
  urls.forEach(url => window.URL.revokeObjectURL(url));
};

function FormDropdown({ value, options, onChange }: { value: string, options: {value: string, label: string}[], onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(o => o.value === value) || options[0];

  return (
    <div className="relative w-full" ref={ref}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between bg-white border rounded-xl px-3.5 py-2.5 transition-all cursor-pointer select-none shadow-sm ${isOpen ? 'border-orange-400 ring-4 ring-orange-500/10' : 'border-stone-200 hover:border-stone-300'}`}
      >
        <span className="text-sm font-medium text-stone-800 truncate pr-2">{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 text-stone-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      
      {isOpen && (
        <div className="absolute top-full mt-1.5 left-0 w-full bg-white rounded-xl shadow-xl border border-stone-100 py-1.5 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map(opt => (
            <div 
              key={opt.value}
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`px-3.5 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between ${
                opt.value === value 
                  ? 'bg-orange-50 text-orange-600 font-bold' 
                  : 'text-stone-600 hover:bg-stone-50 font-medium'
              }`}
            >
              <span className="truncate">{opt.label}</span>
              {opt.value === value && <Check className="w-4 h-4 shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function App() {
  const generationRunIdRef = useRef(0);
  const batchRunIdRef = useRef(0);
  const batchFileInputRef = useRef<HTMLInputElement>(null);
  const historyObjectUrlsRef = useRef<string[]>([]);
  const [mode, setMode] = useState<'single' | 'batch'>('single');
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [artStyle, setArtStyle] = useState(getDefaultArtStyle(DEFAULT_LANGUAGE));
  const [titleLayout, setTitleLayout] = useState(DEFAULT_TITLE_LAYOUT);
  const [characterLayout, setCharacterLayout] = useState(DEFAULT_CHARACTER_LAYOUT);
  const [tags, setTags] = useState('');
  const [summary, setSummary] = useState('');

  const [llmModel, setLlmModel] = useState(DEFAULT_LLM_MODEL);
  const [imageModel, setImageModel] = useState(DEFAULT_IMAGE_MODEL);
  const [ratio, setRatio] = useState(DEFAULT_RATIO);
  
  // 新的并发状态逻辑
  const [compositions, setCompositions] = useState<string[]>(['角色特写', '宏大场景']);
  const [activeTab, setActiveTab] = useState<string>('角色特写');
  const [count, setCount] = useState(DEFAULT_COUNT);

  const [prompts, setPrompts] = useState<Record<string, string>>({});
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [images, setImages] = useState<GeneratedImageResult[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [generationHistory, setGenerationHistory] = useState<GenerationRecord[]>(() => loadGenerationHistory());
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [batchTasks, setBatchTasks] = useState<BatchBookTask[]>([]);
  const [batchFileName, setBatchFileName] = useState('');
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [batchLastRefreshAt, setBatchLastRefreshAt] = useState<string>('');
  const [selectedBatchImageKeys, setSelectedBatchImageKeys] = useState<Set<string>>(() => new Set());
  const [activeBatchBookId, setActiveBatchBookId] = useState<string>('');
  const [batchImageEditTarget, setBatchImageEditTarget] = useState<BatchImageEditTarget | null>(null);
  const [batchImageEditPrompt, setBatchImageEditPrompt] = useState('');
  const [batchImageEditModel, setBatchImageEditModel] = useState(DEFAULT_IMAGE_MODEL);
  const [isRegeneratingBatchImage, setIsRegeneratingBatchImage] = useState(false);

  const [toast, setToast] = useState<{message: string, type: 'error' | 'success'} | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    let cancelled = false;

    const syncHistoryPreviewImages = async () => {
      const needsStoredImageResolution = generationHistory.some(record =>
        (record.images || []).some(img => Boolean(img.url && img.url !== 'error' && img.url.startsWith(HISTORY_IMAGE_URL_PREFIX)))
      );

      if (!needsStoredImageResolution) return;

      try {
        const nextHistory = await Promise.all(generationHistory.map(async record => {
          const resolved = await Promise.all((record.images || []).map(async img => {
            const historyImageKey = getHistoryImageStorageKey(img);
            if (!historyImageKey || !img.url.startsWith(HISTORY_IMAGE_URL_PREFIX)) return img;

            const blob = await getHistoryImageBlob(historyImageKey);
            if (!blob) {
              return {
                ...img,
                url: 'error',
                error: img.error || '历史图片不存在',
                historyImageKey,
                isHistoryPreview: true
              };
            }

            const objectUrl = window.URL.createObjectURL(blob);
            return {
              ...img,
              url: objectUrl,
              historyImageKey,
              isHistoryPreview: true
            };
          }));

          return { ...record, images: resolved };
        }));

        if (cancelled) {
          const generatedUrls = nextHistory.flatMap(record =>
            (record.images || [])
              .map(img => img.url)
              .filter((url): url is string => Boolean(url && url.startsWith('blob:')))
          );
          revokeObjectUrls(generatedUrls);
          return;
        }

        revokeObjectUrls(historyObjectUrlsRef.current);
        historyObjectUrlsRef.current = nextHistory.flatMap(record =>
          (record.images || [])
            .map(img => img.url)
            .filter((url): url is string => Boolean(url && url.startsWith('blob:')))
        );
        setGenerationHistory(nextHistory);
      } catch (error) {
        console.warn('[CoverHistory] 历史图片恢复失败', error);
      }
    };

    void syncHistoryPreviewImages();

    return () => {
      cancelled = true;
    };
  }, [generationHistory]);

  useEffect(() => {
    persistGenerationHistory(generationHistory);
  }, [generationHistory]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(historyObjectUrlsRef.current);
    };
  }, []);

  useEffect(() => {
    if (!isBatchRunning) return;

    const updateRefreshTime = () => {
      setBatchLastRefreshAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
    };
    updateRefreshTime();
    const intervalId = window.setInterval(updateRefreshTime, 60 * 1000);

    return () => window.clearInterval(intervalId);
  }, [isBatchRunning]);

  const toggleComposition = (comp: string) => {
    setCompositions(prev => {
      const isSelected = prev.includes(comp);
      if (isSelected && prev.length === 1) {
        return prev; // 保证至少选择一个
      }
      const newComps = isSelected ? prev.filter(c => c !== comp) : [...prev, comp];
      
      if (isSelected && activeTab === comp) {
        setActiveTab(newComps[0]);
      } else if (!isSelected && newComps.length === 1) {
        setActiveTab(comp);
      }
      return newComps;
    });
  };

  const updateLanguageAndStyle = (newLang: string) => {
    setLanguage(prevLang => {
      if (prevLang !== newLang) {
        setArtStyle(getDefaultArtStyle(newLang));

        const defaultCompositions = getDefaultCompositions(newLang);
        setCompositions(defaultCompositions);
        setActiveTab(defaultCompositions[0]);
      }
      return newLang;
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    
    if (!val.trim()) return;
    updateLanguageAndStyle(detectTitleLanguage(val, language));
  };

  const handleGeneratePrompt = async () => {
    if (!title.trim()) {
      showToast('请先输入小说标题');
      return;
    }
    setIsGeneratingPrompt(true);
    setErrorMsg('');
    try {
      const promises = compositions.map(comp => 
        generatePromptWithAI({
          title, tags, summary, ratio, composition: comp, llmModel, language, artStyle, titleLayout, characterLayout
        })
      );
      
      const results = await Promise.all(promises);
      
      const newPrompts = { ...prompts };
      compositions.forEach((comp, idx) => {
        newPrompts[comp] = results[idx];
      });
      setPrompts(newPrompts);
      setActiveTab(compositions[0]); // 生成完切到第一个
    } catch (e: unknown) {
      setErrorMsg(getErrorMessage(e, '生成指令词失败'));
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerateImages = async () => {
    const activeComps = compositions.filter(comp => (prompts[comp] || '').trim() !== '');
    if (activeComps.length === 0) {
      showToast('请先生成或手动输入生图指令词');
      return;
    }

    const runId = generationRunIdRef.current + 1;
    generationRunIdRef.current = runId;

    setIsGeneratingImage(true);
    setErrorMsg('');
    
    // Fill initial loaders with composition mapping
    const initialImages: GeneratedImageResult[] = [];
    activeComps.forEach(comp => {
      for(let i = 0; i < count; i++) {
        initialImages.push({ url: '', comp, error: '', imageModel });
      }
    });
    setImages(initialImages); 

    const currentImages = [...initialImages];

    try {
      let nextIndex = 0;
      let failedCount = 0;

      const runNext = async () => {
        if (runId !== generationRunIdRef.current) return;

        const index = nextIndex;
        nextIndex += 1;

        if (index >= initialImages.length) return;

        const item = initialImages[index];
        try {
          const currentModel = currentImages[index]?.imageModel || item.imageModel;
          const url = await generateImageWithAI(prompts[item.comp], currentModel, ratio);
          if (runId !== generationRunIdRef.current) return;
          currentImages[index] = { url: url || 'error', comp: item.comp, error: '', imageModel: currentModel };
        } catch (e: unknown) {
          if (runId !== generationRunIdRef.current) return;
          failedCount += 1;
          const currentModel = currentImages[index]?.imageModel || item.imageModel;
          console.error('[CoverImage] 图片生成失败', {
            index,
            composition: item.comp,
            imageModel: currentModel,
            ratio,
            prompt: prompts[item.comp],
            error: e
          });
          currentImages[index] = { url: 'error', comp: item.comp, error: getErrorMessage(e, '生成失败'), imageModel: currentModel };
        }

        if (runId !== generationRunIdRef.current) return;

        // 每成功或失败一张，立即更新界面，让用户有视觉反馈
        setImages([...currentImages]);
        await runNext();
      };

      const workerCount = Math.min(getImageGenerationConcurrency(imageModel), initialImages.length);
      await Promise.all(Array.from({ length: workerCount }, runNext));

      if (runId !== generationRunIdRef.current) return;

      await saveGenerationRecord(currentImages);
      
      if (currentImages.every(img => img.url === 'error')) {
        setErrorMsg('所有图片生成均失败，请稍后重试');
      } else if (failedCount > 0) {
        setErrorMsg(`有 ${failedCount} 张生成失败，可点击失败卡片重试`);
      }
    } catch (e: unknown) {
      if (runId !== generationRunIdRef.current) return;
      console.error('[CoverImage] 生成封面流程异常', {
        imageModel,
        ratio,
        error: e
      });
      setErrorMsg('生成封面过程中发生异常');
    } finally {
      if (runId === generationRunIdRef.current) {
        setIsGeneratingImage(false);
      }
    }
  };

  const handleRetryImage = async (index: number, comp: string) => {
    // 设置当前图片状态为正在生成
    const currentModel = images[index]?.imageModel || imageModel;
    setImages(prev => {
      const next = [...prev];
      next[index].url = '';
      next[index].error = '';
      next[index].imageModel = currentModel;
      return next;
    });

    try {
      const url = await generateImageWithAI(prompts[comp], currentModel, ratio);
      setImages(prev => {
        const next = [...prev];
        next[index].url = url || 'error';
        next[index].error = '';
        next[index].imageModel = currentModel;
        return next;
      });
    } catch (e: unknown) {
      console.error('[CoverImage] 单张重试失败', {
        index,
        composition: comp,
        imageModel: currentModel,
        ratio,
        prompt: prompts[comp],
        error: e
      });
      setImages(prev => {
        const next = [...prev];
        next[index].url = 'error';
        next[index].error = getErrorMessage(e, '生成失败');
        next[index].imageModel = currentModel;
        return next;
      });
    }
  };

  const updateImageCardModel = (index: number, nextModel: string) => {
    setImages(prev => {
      const next = [...prev];
      if (!next[index]) return prev;
      next[index] = {
        ...next[index],
        imageModel: nextModel
      };
      return next;
    });
  };

  const saveGenerationRecord = async (currentImages: GeneratedImageResult[]) => {
    const resolvedImages = currentImages.filter(img => img.url === 'error' || (img.url && img.url !== ''));
    const historyImages = await Promise.all(
      resolvedImages.map(img => createHistoryImageResult(img, ratio))
    );

    const record: GenerationRecord = {
      id: `${Date.now()}`,
      title: title.trim(),
      language,
      artStyle,
      titleLayout,
      characterLayout,
      tags,
      summary,
      llmModel,
      imageModel,
      ratio,
      compositions: [...compositions],
      prompts: { ...prompts },
      images: historyImages,
      generatedAt: new Date().toISOString(),
      successCount: currentImages.filter(img => img.url && img.url !== 'error').length,
      failedCount: currentImages.filter(img => img.url === 'error').length
    };

    if (!record.title) return;

    setGenerationHistory(prev => [record, ...prev].slice(0, MAX_GENERATION_HISTORY));
  };

  const updateBatchTask = (bookId: string, updater: (task: BatchBookTask) => BatchBookTask) => {
    setBatchTasks(prev => prev.map(task => task.id === bookId ? updater(task) : task));
  };

  const getBatchImageKey = (image: BatchGeneratedImage) => {
    return `${image.bookId}::${image.comp}::${image.imageModel}::${image.indexInComposition}::${image.url}`;
  };

  const toggleBatchImageSelection = (image: BatchGeneratedImage) => {
    const key = getBatchImageKey(image);
    setSelectedBatchImageKeys(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const openBatchImageEditor = (image: BatchGeneratedImage) => {
    setBatchImageEditTarget({
      bookId: image.bookId,
      imageKey: getBatchImageKey(image),
      composition: image.comp,
      prompt: image.prompt,
      imageModel: image.imageModel
    });
    setBatchImageEditPrompt(image.prompt);
    setBatchImageEditModel(image.imageModel);
  };

  const handleRegenerateBatchImage = async () => {
    if (!batchImageEditTarget) return;

    const targetBook = batchTasks.find(task => task.id === batchImageEditTarget.bookId);
    if (!targetBook) {
      showToast('未找到对应书籍');
      return;
    }

    const prompt = batchImageEditPrompt.trim();
    if (!prompt) {
      showToast('请先填写图片提示词');
      return;
    }

    setIsRegeneratingBatchImage(true);

    try {
      const url = await generateImageWithAI(prompt, batchImageEditModel, targetBook.ratio);
      const nextIndex = targetBook.images.filter(img => img.comp === batchImageEditTarget.composition).length + 1;

      updateBatchTask(targetBook.id, task => ({
        ...task,
        successCount: task.successCount + 1,
        completedImageTasks: task.completedImageTasks + 1,
        totalImageTasks: Math.max(task.totalImageTasks + 1, task.completedImageTasks + 1),
        images: [
          ...task.images,
          {
            bookId: task.id,
            title: task.title,
            comp: batchImageEditTarget.composition,
            url: url || 'error',
            error: '',
            imageModel: batchImageEditModel,
            indexInComposition: nextIndex,
            prompt
          }
        ]
      }));
      setBatchImageEditTarget(null);
      showToast('已追加一张二次生成结果', 'success');
    } catch (error: unknown) {
      showToast(getErrorMessage(error, '二次生成失败'));
    } finally {
      setIsRegeneratingBatchImage(false);
    }
  };

  const getAvailableStyles = (lang: string) => {
    if (['英语', '西班牙语', '葡萄牙语'].includes(lang)) {
      return ['真人写实', '美漫'];
    } else if (lang === '日语') {
      return ['真人唯美', '二次元手绘'];
    }
    return ['3DCG动漫', '二次元手绘'];
  };

  const updateBatchBookLanguage = (bookId: string, nextLanguage: string) => {
    updateBatchTask(bookId, task => {
      const nextCompositions = getDefaultCompositions(nextLanguage);
      return {
        ...task,
        language: nextLanguage,
        artStyle: getDefaultArtStyle(nextLanguage),
        compositions: nextCompositions,
        prompts: {},
        totalImageTasks: nextCompositions.length * task.count,
        completedImageTasks: 0,
        successCount: 0,
        failedCount: 0,
        images: [],
        status: 'waiting',
        error: ''
      };
    });
    setSelectedBatchImageKeys(new Set());
  };

  const updateBatchBookCompositions = (bookId: string, composition: string) => {
    updateBatchTask(bookId, task => {
      const isSelected = task.compositions.includes(composition);
      if (isSelected && task.compositions.length === 1) return task;

      const nextCompositions = isSelected
        ? task.compositions.filter(item => item !== composition)
        : [...task.compositions, composition];
      const nextPrompts = Object.fromEntries(
        Object.entries(task.prompts).filter(([comp]) => nextCompositions.includes(comp))
      );

      return {
        ...task,
        compositions: nextCompositions,
        prompts: nextPrompts,
        totalImageTasks: nextCompositions.length * task.count,
        completedImageTasks: 0,
        successCount: 0,
        failedCount: 0,
        images: [],
        status: 'waiting',
        error: ''
      };
    });
    setSelectedBatchImageKeys(new Set());
  };

  const parseBatchFile = async (file: File) => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    if (!firstSheetName) throw new Error('Excel 文件中没有可读取的工作表');

    const sheet = workbook.Sheets[firstSheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    if (rows.length === 0) throw new Error('表格没有数据行');

    const headers = Object.keys(rows[0] || {}).map(header => header.trim());
    const requiredHeaders = ['书名', '标签', '简介'];
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
    if (missingHeaders.length > 0) {
      throw new Error(`表头缺少：${missingHeaders.join('、')}`);
    }

    const books = rows
      .map((row, index) => ({
        id: `${Date.now()}-${index}`,
        title: String(row['书名'] || '').trim(),
        tags: String(row['标签'] || '').trim(),
        summary: String(row['简介'] || '').trim()
      }))
      .filter(book => book.title);

    if (books.length === 0) throw new Error('没有读取到有效书名');
    if (books.length > 30) throw new Error('当前轻量批量模式建议单次不超过 30 本');

    return books;
  };

  const handleBatchFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const books = await parseBatchFile(file);
      setBatchFileName(file.name);
      const nextTasks = books.map(book => createBatchBookTask(book, DEFAULT_LLM_MODEL, DEFAULT_IMAGE_MODEL, DEFAULT_FALLBACK_IMAGE_MODEL, DEFAULT_RATIO, DEFAULT_BATCH_COUNT));
      setBatchTasks(nextTasks);
      setActiveBatchBookId(nextTasks[0]?.id || '');
      setSelectedBatchImageKeys(new Set());
      setBatchLastRefreshAt('');
      showToast(`已导入 ${books.length} 本书`, 'success');
    } catch (error: unknown) {
      showToast(getErrorMessage(error, '表格解析失败'));
      if (batchFileInputRef.current) {
        batchFileInputRef.current.value = '';
      }
    }
  };

  const runBatchPromptStage = async (runId: number, sourceTasks: BatchBookTask[]) => {
    const promptJobs = sourceTasks.flatMap(task =>
      task.compositions.map(composition => ({ bookId: task.id, composition }))
    );

    await runWithConcurrency(promptJobs, BATCH_LLM_CONCURRENCY, async (job) => {
      if (runId !== batchRunIdRef.current) return;

      const task = sourceTasks.find(item => item.id === job.bookId);
      if (!task) return;

      updateBatchTask(task.id, current => ({ ...current, status: 'prompting', error: '' }));

      try {
        const prompt = await generatePromptWithAI({
          title: task.title,
          tags: task.tags,
          summary: task.summary,
          ratio: task.ratio,
          composition: job.composition,
          llmModel: task.llmModel,
          language: task.language,
          artStyle: task.artStyle,
          titleLayout: task.titleLayout,
          characterLayout: task.characterLayout
        });

        if (runId !== batchRunIdRef.current) return;

        updateBatchTask(task.id, current => {
          const nextPrompts = { ...current.prompts, [job.composition]: prompt };
          return {
            ...current,
            prompts: nextPrompts,
            status: Object.keys(nextPrompts).length >= current.compositions.length ? 'imaging' : current.status
          };
        });
      } catch (error: unknown) {
        updateBatchTask(task.id, current => ({
          ...current,
          status: 'failed',
          error: getErrorMessage(error, '提示词生成失败')
        }));
      }
    });
  };

  const buildBatchImageJobs = (tasks: BatchBookTask[], fallbackOnlyBookIds = new Set<string>()): BatchImageJob[] => {
    return tasks.flatMap(task => {
      const model = fallbackOnlyBookIds.has(task.id) ? task.fallbackImageModel : task.imageModel;
      return task.compositions.flatMap(composition => {
        const prompt = task.prompts[composition];
        if (!prompt) return [];

        return Array.from({ length: task.count }, (_, index) => ({
          bookId: task.id,
          title: task.title,
          composition,
          prompt,
          imageModel: model,
          ratio: task.ratio,
          indexInComposition: index + 1,
          isFallback: fallbackOnlyBookIds.has(task.id)
        }));
      });
    });
  };

  const runBatchImageJobs = async (runId: number, jobs: BatchImageJob[]) => {
    await runWithConcurrency(jobs, BATCH_IMAGE_CONCURRENCY, async (job) => {
      if (runId !== batchRunIdRef.current) return;

      updateBatchTask(job.bookId, current => ({
        ...current,
        status: job.isFallback ? 'fallback' : 'imaging',
        totalImageTasks: job.isFallback ? Math.max(current.totalImageTasks, current.completedImageTasks + 1) : current.totalImageTasks
      }));

      try {
        const url = await generateImageWithAI(job.prompt, job.imageModel, job.ratio);
        if (runId !== batchRunIdRef.current) return;

        updateBatchTask(job.bookId, current => ({
          ...current,
          completedImageTasks: current.completedImageTasks + 1,
          successCount: current.successCount + 1,
          images: [
            ...current.images,
            {
              bookId: job.bookId,
              title: job.title,
              comp: job.composition,
              url: url || 'error',
              error: '',
              imageModel: job.imageModel,
              indexInComposition: job.indexInComposition,
              prompt: job.prompt
            }
          ]
        }));
      } catch (error: unknown) {
        if (runId !== batchRunIdRef.current) return;

        updateBatchTask(job.bookId, current => ({
          ...current,
          completedImageTasks: current.completedImageTasks + 1,
          failedCount: current.failedCount + 1,
          images: [
            ...current.images,
            {
              bookId: job.bookId,
              title: job.title,
              comp: job.composition,
              url: 'error',
              error: getErrorMessage(error, '生成失败'),
              imageModel: job.imageModel,
              indexInComposition: job.indexInComposition,
              prompt: job.prompt
            }
          ]
        }));
      }
    });
  };

  const handleStartBatch = async () => {
    if (batchTasks.length === 0) {
      showToast('请先上传 Excel 表格');
      return;
    }

    const runId = batchRunIdRef.current + 1;
    batchRunIdRef.current = runId;
    setIsBatchRunning(true);
    setSelectedBatchImageKeys(new Set());
    setBatchLastRefreshAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));

    const resetTasks = batchTasks.map(task => ({
      ...task,
      prompts: {},
      status: 'waiting' as BatchBookStatus,
      totalImageTasks: task.compositions.length * task.count,
      completedImageTasks: 0,
      successCount: 0,
      failedCount: 0,
      error: '',
      images: [],
      id: task.id
    }));
    setBatchTasks(resetTasks);

    try {
      await runBatchPromptStage(runId, resetTasks);
      if (runId !== batchRunIdRef.current) return;

      const tasksAfterPrompt = await new Promise<BatchBookTask[]>(resolve => {
        setBatchTasks(current => {
          resolve(current);
          return current;
        });
      });
      const readyTasks = tasksAfterPrompt.filter(task => task.status !== 'failed' && task.compositions.every(comp => task.prompts[comp]));
      const mainJobs = buildBatchImageJobs(readyTasks);

      await runBatchImageJobs(runId, mainJobs);
      if (runId !== batchRunIdRef.current) return;

      const tasksAfterMain = await new Promise<BatchBookTask[]>(resolve => {
        setBatchTasks(current => {
          resolve(current);
          return current;
        });
      });
      const fallbackBookIds = new Set(tasksAfterMain.filter(task =>
        task.status !== 'failed' &&
        task.images.some(img => img.imageModel === task.imageModel) &&
        task.images.filter(img => img.imageModel === task.imageModel).every(img => img.url === 'error')
      ).map(task => task.id));

      if (fallbackBookIds.size > 0) {
        setBatchTasks(prev => prev.map(task => fallbackBookIds.has(task.id)
          ? { ...task, status: 'fallback', totalImageTasks: task.totalImageTasks + task.compositions.length * task.count }
          : task
        ));
        const fallbackTasks = tasksAfterMain.filter(task => fallbackBookIds.has(task.id));
        await runBatchImageJobs(runId, buildBatchImageJobs(fallbackTasks, fallbackBookIds));
      }

      if (runId !== batchRunIdRef.current) return;

      setBatchTasks(prev => prev.map(task => {
        if (task.status === 'failed') return task;
        return {
          ...task,
          status: task.successCount > 0 ? 'completed' : 'failed',
          error: task.successCount > 0 ? '' : task.error || '主模型与兜底模型均未产出图片'
        };
      }));
      showToast('批量生产完成，可以导出 ZIP', 'success');
    } catch (error: unknown) {
      showToast(getErrorMessage(error, '批量生产异常'));
    } finally {
      if (runId === batchRunIdRef.current) {
        setIsBatchRunning(false);
        setBatchLastRefreshAt(new Date().toLocaleTimeString('zh-CN', { hour12: false }));
      }
    }
  };

  const handleExportBatchZip = async () => {
    const selectedImagesByTask = batchTasks.map(task => ({
      task,
      images: task.images.filter(img => img.url && img.url !== 'error' && selectedBatchImageKeys.has(getBatchImageKey(img)))
    })).filter(item => item.images.length > 0);

    const selectedCount = selectedImagesByTask.reduce((sum, item) => sum + item.images.length, 0);
    if (selectedCount === 0) {
      showToast('请先勾选需要导出的封面');
      return;
    }

    setIsExportingZip(true);
    try {
      const zip = new JSZip();
      const nameCounts = new Map<string, number>();

      for (const { task, images } of selectedImagesByTask) {
        const folder = zip.folder(sanitizeFileName(task.title));
        if (!folder) continue;

        for (const image of images) {
          const blob = await buildStandardCoverBlob(image.url, task.ratio);
          const baseName = sanitizeFileName(`${task.title}_${getCompositionLabel(image.comp, task.language)}_${image.imageModel}`);
          const nextCount = (nameCounts.get(baseName) || 0) + 1;
          nameCounts.set(baseName, nextCount);
          folder.file(`${baseName}_${String(nextCount).padStart(2, '0')}.jpg`, blob);
        }
      }

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const objectUrl = window.URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `小说封面批量生产_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
      showToast('ZIP 已导出', 'success');
    } catch (error) {
      console.error('[BatchExport] ZIP 导出失败', error);
      showToast('ZIP 导出失败');
    } finally {
      setIsExportingZip(false);
    }
  };

  const resetCurrentBook = () => {
    if (isGeneratingImage) {
      generationRunIdRef.current += 1;

      const hasAnyResolvedResult = images.some(img => img.url === 'error' || (img.url && img.url !== ''));
      if (hasAnyResolvedResult) {
        void saveGenerationRecord(images);
      }
    }

    setIsGeneratingImage(false);
    setTitle('');
    setLanguage(DEFAULT_LANGUAGE);
    setArtStyle(getDefaultArtStyle(DEFAULT_LANGUAGE));
    setTitleLayout(DEFAULT_TITLE_LAYOUT);
    setCharacterLayout(DEFAULT_CHARACTER_LAYOUT);
    setTags('');
    setSummary('');
    setLlmModel(DEFAULT_LLM_MODEL);
    setImageModel(DEFAULT_IMAGE_MODEL);
    setRatio(DEFAULT_RATIO);
    setCompositions(getDefaultCompositions(DEFAULT_LANGUAGE));
    setActiveTab(getDefaultCompositions(DEFAULT_LANGUAGE)[0]);
    setCount(DEFAULT_COUNT);
    setPrompts({});
    setImages([]);
    setErrorMsg('');
    showToast(isGeneratingImage ? '已结束当前任务，准备生成下一本' : '已清空，准备生成下一本', 'success');
  };

  const restoreGenerationRecord = (record: GenerationRecord) => {
    setTitle(record.title);
    setLanguage(record.language);
    setArtStyle(record.artStyle);
    setTitleLayout(record.titleLayout);
    setCharacterLayout(record.characterLayout || DEFAULT_CHARACTER_LAYOUT);
    setTags(record.tags);
    setSummary(record.summary);
    setLlmModel(record.llmModel);
    setImageModel(record.imageModel);
    setRatio(record.ratio);
    setCompositions(record.compositions);
    setActiveTab(record.compositions[0] || '角色特写');
    setCount(DEFAULT_COUNT);
    setPrompts(record.prompts);
    setImages(record.images || []);
    setErrorMsg('');
    setIsHistoryOpen(false);
    showToast(record.images?.length ? `已载入《${record.title}》和图片记录` : `已载入《${record.title}》`, 'success');
  };

  const downloadImage = async (url: string, comp: string, index: number) => {
    if (url === 'error' || !url) return;
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${title || '小说'}_${comp}_超清原图_${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch {
      showToast('原图下载失败');
    }
  };

  const downloadCompressedImage = async (url: string, comp: string, index: number) => {
    if (url === 'error' || !url) return;
    try {
      showToast('正在压缩处理中...', 'success');
      const finalBlob = await buildStandardCoverBlob(url, ratio);

      const objectUrl = window.URL.createObjectURL(finalBlob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${title || '小说'}_${comp}_标准版_${index + 1}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);

    } catch {
      showToast('压缩下载失败');
    }
  };

  const isAllPromptsEmpty = compositions.every(comp => !(prompts[comp] || '').trim());
  const activeValidPromptsCount = compositions.filter(comp => (prompts[comp] || '').trim() !== '').length;
  const totalImageCountText = activeValidPromptsCount > 0 ? `生成 ${activeValidPromptsCount * count} 张对比图` : '开始生成封面';
  const hasImageResult = images.some(img => img.url === 'error' || (img.url && img.url !== ''));
  const batchPromptTotal = batchTasks.reduce((sum, task) => sum + task.compositions.length, 0);
  const batchPromptDone = batchTasks.reduce((sum, task) => sum + Object.keys(task.prompts).length, 0);
  const batchImageTotal = batchTasks.reduce((sum, task) => sum + task.totalImageTasks, 0);
  const batchImageDone = batchTasks.reduce((sum, task) => sum + task.completedImageTasks, 0);
  const batchSuccessImages = batchTasks.reduce((sum, task) => sum + task.successCount, 0);
  const batchFinishedBooks = batchTasks.filter(task => task.status === 'completed' || task.status === 'failed').length;
  const batchOverallTotal = batchPromptTotal + batchImageTotal;
  const batchOverallDone = batchPromptDone + batchImageDone;
  const batchProgressPercent = batchOverallTotal > 0 ? Math.round((batchOverallDone / batchOverallTotal) * 100) : 0;
  const selectedBatchImageCount = selectedBatchImageKeys.size;
  const canExportBatch = !isBatchRunning && selectedBatchImageCount > 0;
  const batchStatusLabel: Record<BatchBookStatus, string> = {
    waiting: '等待中',
    prompting: '提示词中',
    imaging: '生图中',
    fallback: '兜底中',
    completed: '完成',
    failed: '失败'
  };
  const batchStatusClass: Record<BatchBookStatus, string> = {
    waiting: 'bg-stone-100 text-stone-500',
    prompting: 'bg-blue-50 text-blue-600',
    imaging: 'bg-orange-50 text-orange-600',
    fallback: 'bg-amber-50 text-amber-700',
    completed: 'bg-emerald-50 text-emerald-600',
    failed: 'bg-red-50 text-red-500'
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] text-stone-800 flex flex-col md:flex-row font-sans selection:bg-red-500/20 relative">
      {/* 全局 Toast 提示 */}
      {toast && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`px-6 py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border flex items-center gap-3 backdrop-blur-md font-bold text-sm
            ${toast.type === 'error' ? 'bg-red-50/95 border-red-200 text-red-600' : 'bg-emerald-50/95 border-emerald-200 text-emerald-600'}`}
          >
            {toast.type === 'error' ? <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> : <div className="w-2 h-2 rounded-full bg-emerald-500" />}
            {toast.message}
          </div>
        </div>
      )}

      {/* 左侧配置栏 - 浅色暖光材质 */}
      <aside className="w-full md:w-[400px] lg:w-[460px] bg-white/95 backdrop-blur-xl border-r border-stone-200/60 p-5 lg:p-6 flex flex-col h-screen overflow-y-auto custom-scrollbar shadow-[4px_0_32px_rgba(0,0,0,0.03)] relative z-10">
        
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6 px-1">
          <div className="flex items-center gap-2 min-w-0">
            <div className="text-3xl select-none drop-shadow-md">
              🍁
            </div>
            <h1 className="text-xl font-black text-stone-800 tracking-tight truncate">
              枫叶 <span className="font-medium text-stone-400">|</span> <span className="font-bold text-stone-600">小说封面生成器</span>
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-5 rounded-2xl bg-stone-100 p-1">
          <button
            onClick={() => setMode('single')}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${mode === 'single' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            单本生产
          </button>
          <button
            onClick={() => setMode('batch')}
            className={`rounded-xl px-3 py-2 text-sm font-bold transition-all ${mode === 'batch' ? 'bg-white text-orange-600 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            批量生产
          </button>
        </div>

        {mode === 'single' ? (
        <div className="space-y-5 lg:space-y-6">
          {/* 基础信息 */}
          <section className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100/80 space-y-4 shadow-sm hover:border-orange-100 transition-colors">
            <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 核心设定
            </h2>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">书名 <span className="text-red-500">*</span></label>
              <input 
                type="text" 
                value={title} 
                onChange={handleTitleChange}
                placeholder="例如：剑道独尊" 
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none font-medium placeholder:font-normal shadow-sm"
              />
              <div className="flex gap-1.5 pt-1.5 overflow-x-auto custom-scrollbar">
                {['中文', '英语', '日语', '西班牙语', '葡萄牙语'].map(lang => (
                  <button
                    key={lang}
                    onClick={() => updateLanguageAndStyle(lang)}
                    className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                      language === lang 
                        ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm' 
                        : 'bg-stone-100 text-stone-500 border border-transparent hover:bg-stone-200'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">标签 / 风格</label>
              <input 
                type="text" 
                value={tags} 
                onChange={e => setTags(e.target.value)}
                placeholder="例如：玄幻、热血、修仙" 
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none placeholder:font-normal shadow-sm"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">简介概要</label>
              <textarea 
                value={summary} 
                onChange={e => setSummary(e.target.value)}
                placeholder="简短描述主角背景或核心设定，让 AI 更好理解..." 
                className="w-full px-3.5 py-2.5 bg-white border border-stone-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none h-20 resize-none leading-relaxed placeholder:font-normal shadow-sm"
              />
            </div>
          </section>

          {/* 生成配置 */}
          <section className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100/80 space-y-5 shadow-sm hover:border-orange-100 transition-colors">
            <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 美术参数
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500">画风风格</label>
              <div className="flex gap-2">
                {getAvailableStyles(language).map(style => (
                  <button
                    key={style}
                    onClick={() => setArtStyle(style)}
                    className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${
                      artStyle === style ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm shadow-orange-500/10' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5 min-w-0">
                <label className="block truncate text-xs font-bold text-stone-500">书名排版布局</label>
                <FormDropdown value={titleLayout} options={LAYOUT_OPTIONS} onChange={setTitleLayout} />
              </div>

              <div className="space-y-1.5 min-w-0">
                <label className="block truncate text-xs font-bold text-stone-500">角色站位布局</label>
                <FormDropdown value={characterLayout} options={CHARACTER_LAYOUT_OPTIONS} onChange={setCharacterLayout} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-stone-500 flex justify-between">
                <span>构图模板 <span className="font-normal text-stone-400">(可多选对比)</span></span>
              </label>
              <div className="flex gap-2">
                {['角色特写', '中景氛围感', '宏大场景'].map(comp => {
                  const isSelected = compositions.includes(comp);
                  return (
                    <button
                      key={comp}
                      onClick={() => toggleComposition(comp)}
                      className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${
                        isSelected ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm shadow-orange-500/10' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                      }`}
                    >
                      {getCompositionLabel(comp, language)}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">封面尺寸</label>
                <FormDropdown value={ratio} options={RATIO_OPTIONS} onChange={setRatio} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">单模板并发张数</label>
                <div className="flex gap-2">
                  {[1, 2, 3].map(n => (
                    <button
                      key={n}
                      onClick={() => setCount(n)}
                      className={`flex-1 py-2 rounded-xl border transition-all text-sm shadow-sm ${count === n ? 'bg-orange-50 border-orange-500 text-orange-600 font-bold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 font-medium'}`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* 指令词区 - 选项卡模式排版 */}
          <section className="bg-gradient-to-b from-orange-50/60 to-white p-5 rounded-2xl border border-orange-100/80 space-y-4 shadow-sm">
            <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2 mb-1">
              <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 多视角提示词 <span className="font-normal text-stone-400 ml-1 text-xs">自动拆分多套构图组合</span>
            </h2>
            
            <button 
              onClick={handleGeneratePrompt}
              disabled={isGeneratingPrompt}
              className="w-full py-3.5 bg-white hover:bg-orange-50 text-orange-600 rounded-xl font-bold shadow-sm border border-orange-200 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
            >
              {isGeneratingPrompt ? <Loader2 className="w-5 h-5 animate-spin text-orange-500" /> : <Sparkles className="w-5 h-5 text-orange-500" />}
              {isGeneratingPrompt ? '正在脑暴多套提示词...' : '✨ AI 一键生成提示词'}
            </button>

            <div className="space-y-0 pt-2">
              <div className="flex gap-1.5 overflow-x-auto custom-scrollbar pb-1">
                {compositions.map(comp => (
                  <button
                    key={comp}
                    onClick={() => setActiveTab(comp)}
                    className={`px-4 py-1.5 rounded-t-xl text-xs font-bold transition-all border-t border-l border-r ${
                      activeTab === comp 
                        ? 'bg-white text-orange-600 border-orange-200 shadow-[0_-4px_6px_-2px_rgba(234,88,12,0.05)] relative z-10 top-[1px]' 
                        : 'bg-stone-50/50 text-stone-400 border-transparent hover:text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    {getCompositionLabel(comp, language)}
                  </button>
                ))}
              </div>
              
              <div className="relative">
                <textarea 
                  value={prompts[activeTab] || ''} 
                  onChange={e => setPrompts({ ...prompts, [activeTab]: e.target.value })}
                  placeholder={`点击上方按钮生成，或直接在此输入【${getCompositionLabel(activeTab, language)}】版本的指令词...`} 
                  className="w-full px-4 py-3 bg-white border border-stone-200 rounded-b-xl rounded-tr-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all outline-none h-32 resize-none text-sm leading-relaxed text-stone-700 placeholder:text-stone-400 shadow-inner relative z-0"
                />
                {!prompts[activeTab] && !isGeneratingPrompt && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-stone-300 text-xs tracking-wider">该视角暂无指令词</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 font-medium flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
              {errorMsg}
            </div>
          )}

          {/* 最终生图按钮 */}
          <div className="pt-2 pb-8">
            <div className={`flex gap-3 ${hasImageResult ? 'flex-col sm:flex-row' : 'flex-col'}`}>
              <button
                onClick={handleGenerateImages}
                disabled={isGeneratingImage || isAllPromptsEmpty || isGeneratingPrompt}
                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                  (isGeneratingImage || isAllPromptsEmpty || isGeneratingPrompt) 
                    ? 'bg-stone-100 text-stone-400 cursor-not-allowed border border-stone-200 shadow-none' 
                    : 'bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.4)] active:scale-[0.98]'
                } ${hasImageResult ? 'sm:flex-1' : ''}`}
              >
                {isGeneratingImage ? <Loader2 className="w-6 h-6 animate-spin" /> : <ImageIcon className="w-6 h-6" />}
                {isGeneratingImage ? '魔法渲染中...' : totalImageCountText}
              </button>

              {hasImageResult && (
                <button
                  onClick={resetCurrentBook}
                  className="w-full sm:w-auto sm:min-w-[138px] py-4 px-5 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 bg-white hover:bg-stone-50 text-stone-700 border border-stone-200 shadow-sm active:scale-[0.98]"
                >
                  {isGeneratingImage ? '下一本书' : '生成下一本书'}
                </button>
              )}
            </div>
          </div>

        </div>
        ) : (
          <div className="space-y-5 lg:space-y-6">
            <section className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100/80 space-y-4 shadow-sm">
              <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 批量导入
              </h2>

              <input
                ref={batchFileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={handleBatchFileChange}
              />

              <button
                onClick={() => batchFileInputRef.current?.click()}
                disabled={isBatchRunning}
                className="w-full rounded-2xl border-2 border-dashed border-orange-200 bg-white px-4 py-6 text-left transition-all hover:border-orange-300 hover:bg-orange-50/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-bold text-stone-800">{batchFileName || '上传 Excel 表格'}</div>
                    <div className="mt-1 text-xs text-stone-400">表头必须包含：书名、标签、简介；建议单次 10-30 本</div>
                  </div>
                </div>
              </button>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                  <div className="font-bold text-stone-400">文本模型</div>
                  <div className="mt-1 font-bold text-stone-700">DeepSeek Flash</div>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white px-3 py-2.5">
                  <div className="font-bold text-stone-400">生图队列</div>
                  <div className="mt-1 font-bold text-stone-700">GPT Image 2 · 3 并发</div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs font-medium leading-relaxed text-amber-700 border border-amber-100">
                批量生产过程中请保持页面打开。若某本书 GPT Image 2 全部失败，会自动使用 Gemini Image 2K 兜底。
              </div>
            </section>

            <section className="bg-white p-5 rounded-2xl border border-stone-100/80 space-y-4 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 生产进度
                </h2>
                {batchLastRefreshAt && (
                  <span className="text-[11px] font-bold text-stone-400">刷新 {batchLastRefreshAt}</span>
                )}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs font-bold text-stone-500">
                  <span>总进度</span>
                  <span>{batchProgressPercent}%</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
                    style={{ width: `${Math.min(100, batchProgressPercent)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="rounded-xl bg-stone-50 px-2 py-3">
                  <div className="font-black text-stone-800">{batchFinishedBooks}/{batchTasks.length}</div>
                  <div className="mt-1 text-stone-400 font-bold">书籍</div>
                </div>
                <div className="rounded-xl bg-stone-50 px-2 py-3">
                  <div className="font-black text-stone-800">{batchPromptDone}/{batchPromptTotal}</div>
                  <div className="mt-1 text-stone-400 font-bold">提示词</div>
                </div>
                <div className="rounded-xl bg-stone-50 px-2 py-3">
                  <div className="font-black text-stone-800">{batchImageDone}/{batchImageTotal}</div>
                  <div className="mt-1 text-stone-400 font-bold">图片</div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleStartBatch}
                  disabled={isBatchRunning || batchTasks.length === 0}
                  className={`w-full rounded-2xl py-3.5 font-bold transition-all flex items-center justify-center gap-2 ${
                    isBatchRunning || batchTasks.length === 0
                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.4)] active:scale-[0.98]'
                  }`}
                >
                  {isBatchRunning ? <Loader2 className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5" />}
                  {isBatchRunning ? '批量生产中...' : '开始批量生产'}
                </button>

                <button
                  onClick={handleExportBatchZip}
                  disabled={!canExportBatch || isExportingZip}
                  className={`w-full rounded-2xl py-3.5 font-bold transition-all flex items-center justify-center gap-2 ${
                    !canExportBatch || isExportingZip
                      ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                      : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50 shadow-sm active:scale-[0.98]'
                  }`}
                >
                  {isExportingZip ? <Loader2 className="h-5 w-5 animate-spin" /> : <Package className="h-5 w-5" />}
                  {isExportingZip ? '正在打包...' : `导出已选 ZIP (${selectedBatchImageCount} 张)`}
                </button>
              </div>
            </section>

            <section className="bg-stone-50/50 p-5 rounded-2xl border border-stone-100/80 space-y-3 shadow-sm">
              <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-orange-400 rounded-full"></span> 书单队列
              </h2>

              {batchTasks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-white px-4 py-8 text-center text-xs text-stone-400">
                  上传表格后会在这里显示批量任务
                </div>
              ) : (
                <div className="max-h-[420px] space-y-2 overflow-y-auto pr-1 custom-scrollbar">
                  {batchTasks.map((task, index) => (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setActiveBatchBookId(task.id)}
                      className={`w-full rounded-2xl border bg-white px-3.5 py-3 text-left shadow-sm transition-all ${
                        activeBatchBookId === task.id ? 'border-orange-300 ring-4 ring-orange-500/10' : 'border-stone-200 hover:border-orange-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="truncate text-sm font-bold text-stone-800">{index + 1}. {task.title}</div>
                          <div className="mt-1 truncate text-[11px] text-stone-400">
                            {task.language} · {task.artStyle} · {task.compositions.map(comp => getCompositionLabel(comp, task.language)).join(' / ')}
                          </div>
                        </div>
                        <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${batchStatusClass[task.status]}`}>
                          {batchStatusLabel[task.status]}
                        </span>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">成功 {task.successCount}</span>
                        <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-500">失败 {task.failedCount}</span>
                        <span className="rounded-full bg-stone-100 px-2 py-0.5 text-stone-500">图片 {task.completedImageTasks}/{task.totalImageTasks}</span>
                      </div>
                      {task.error && (
                        <div className="mt-2 line-clamp-2 rounded-xl bg-red-50 px-3 py-2 text-[11px] leading-relaxed text-red-500">
                          {task.error}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {batchTasks.find(task => task.id === activeBatchBookId) && (() => {
              const task = batchTasks.find(item => item.id === activeBatchBookId)!;
              return (
                <section className="bg-white p-5 rounded-2xl border border-orange-100 space-y-4 shadow-sm">
                  <h2 className="text-sm font-bold text-stone-800 flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-orange-500" /> 单书参数
                  </h2>

                  <div>
                    <div className="mb-2 truncate text-sm font-black text-stone-800">{task.title}</div>
                    <div className="text-[11px] font-medium text-stone-400">调整后点击“开始批量生产”会按最新设置执行</div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500">语言</label>
                    <div className="flex gap-1.5 overflow-x-auto custom-scrollbar">
                      {['中文', '英语', '日语', '西班牙语', '葡萄牙语'].map(lang => (
                        <button
                          key={lang}
                          type="button"
                          onClick={() => updateBatchBookLanguage(task.id, lang)}
                          disabled={isBatchRunning}
                          className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all whitespace-nowrap ${
                            task.language === lang
                              ? 'bg-orange-50 text-orange-600 border border-orange-200 shadow-sm'
                              : 'bg-stone-100 text-stone-500 border border-transparent hover:bg-stone-200'
                          }`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500">画风风格</label>
                    <div className="flex gap-2">
                      {getAvailableStyles(task.language).map(style => (
                        <button
                          key={style}
                          type="button"
                          onClick={() => updateBatchTask(task.id, current => ({ ...current, artStyle: style, prompts: {}, status: 'waiting', images: [], successCount: 0, failedCount: 0, completedImageTasks: 0 }))}
                          disabled={isBatchRunning}
                          className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${
                            task.artStyle === style ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          {style}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5 min-w-0">
                      <label className="block truncate text-xs font-bold text-stone-500">书名排版</label>
                      <FormDropdown value={task.titleLayout} options={LAYOUT_OPTIONS} onChange={(value) => updateBatchTask(task.id, current => ({ ...current, titleLayout: value, prompts: {}, status: 'waiting', images: [], successCount: 0, failedCount: 0, completedImageTasks: 0 }))} />
                    </div>
                    <div className="space-y-1.5 min-w-0">
                      <label className="block truncate text-xs font-bold text-stone-500">角色站位</label>
                      <FormDropdown value={task.characterLayout} options={CHARACTER_LAYOUT_OPTIONS} onChange={(value) => updateBatchTask(task.id, current => ({ ...current, characterLayout: value, prompts: {}, status: 'waiting', images: [], successCount: 0, failedCount: 0, completedImageTasks: 0 }))} />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-stone-500">构图模板</label>
                    <div className="flex gap-2">
                      {['角色特写', '中景氛围感', '宏大场景'].map(comp => (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => updateBatchBookCompositions(task.id, comp)}
                          disabled={isBatchRunning}
                          className={`flex-1 py-2 rounded-xl border transition-all text-xs font-bold ${
                            task.compositions.includes(comp) ? 'bg-orange-50 border-orange-500 text-orange-600 shadow-sm' : 'bg-white border-stone-200 text-stone-500 hover:bg-stone-50'
                          }`}
                        >
                          {getCompositionLabel(comp, task.language)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500">封面尺寸</label>
                      <FormDropdown value={task.ratio} options={RATIO_OPTIONS} onChange={(value) => updateBatchTask(task.id, current => ({ ...current, ratio: value, prompts: {}, status: 'waiting', images: [], successCount: 0, failedCount: 0, completedImageTasks: 0 }))} />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-500">单模板张数</label>
                      <div className="flex gap-2">
                        {[1, 2, 3].map(n => (
                          <button
                            key={n}
                            type="button"
                            onClick={() => updateBatchTask(task.id, current => ({ ...current, count: n, totalImageTasks: current.compositions.length * n, completedImageTasks: 0, successCount: 0, failedCount: 0, images: [], status: 'waiting' }))}
                            disabled={isBatchRunning}
                            className={`flex-1 py-2 rounded-xl border text-sm shadow-sm ${task.count === n ? 'bg-orange-50 border-orange-500 text-orange-600 font-bold' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50 font-medium'}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              );
            })()}
          </div>
        )}
      </aside>

      {/* 右侧展示栏 - 清新暖色调 */}
      <main className="flex-1 p-6 md:p-10 h-screen overflow-y-auto relative bg-[#fdfbf9] flex flex-col">
        {/* 氛围光影背景 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] rounded-full bg-orange-100/60 blur-[100px]" />
          <div className="absolute bottom-[0%] -left-[5%] w-[40%] h-[40%] rounded-full bg-red-50/60 blur-[100px]" />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] mix-blend-multiply"></div>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-stone-800 tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-gradient-to-b from-red-500 to-orange-500 rounded-full inline-block"></span>
              {mode === 'single' ? '预览画板' : '批量结果'}
            </h2>
            {mode === 'single' ? (
            <div className="flex items-center gap-2.5">
              <CustomDropdown 
                label="文本"
                value={llmModel}
                options={LLM_OPTIONS}
                onChange={setLlmModel}
              />
              <CustomDropdown 
                label="生图"
                value={imageModel}
                options={IMAGE_OPTIONS}
                onChange={setImageModel}
              />

              <div className="h-4 w-px bg-stone-300/40 mx-0.5"></div>

              <div className="text-[13px] font-bold text-stone-700 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200/50 shadow-sm flex items-center">
                <span className="text-[11px] text-stone-400 mr-2">比例</span> {ratio}
              </div>
              <button
                onClick={() => setIsHistoryOpen(prev => !prev)}
                className={`text-[13px] font-bold px-4 py-2 rounded-full border shadow-sm flex items-center gap-2 transition-all ${
                  isHistoryOpen
                    ? 'bg-orange-50 text-orange-700 border-orange-200'
                    : 'bg-white/70 text-stone-700 border-stone-200/50 hover:border-orange-200 hover:bg-orange-50/60'
                }`}
              >
                生产记录
                {generationHistory.length > 0 && (
                  <span className="text-[11px] font-bold text-orange-500">({generationHistory.length})</span>
                )}
              </button>
            </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <div className="text-[13px] font-bold text-stone-700 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200/50 shadow-sm flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-orange-500" />
                  {batchTasks.length} 本 · 成功 {batchSuccessImages} 张 · 已选 {selectedBatchImageCount} 张
                </div>
                <div className="text-[13px] font-bold text-stone-700 bg-white/70 backdrop-blur-md px-4 py-2 rounded-full border border-stone-200/50 shadow-sm">
                  3 并发生图队列
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col w-full h-full">
            {mode === 'batch' ? (
              batchSuccessImages === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-200/80 rounded-3xl bg-white/50 backdrop-blur-sm">
                  <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-400 shadow-sm border border-orange-100/50">
                    <FileSpreadsheet className="w-10 h-10" />
                  </div>
                  <p className="text-stone-600 font-medium text-lg tracking-wide">上传书单后开始批量生产</p>
                  <p className="text-stone-400 text-sm mt-2">完成后这里会展示可导出的成功封面</p>
                </div>
              ) : (
                <div className="space-y-6 pb-10">
                  {batchTasks
                    .filter(task => task.images.some(img => img.url && img.url !== 'error'))
                    .map(task => {
                      const successImages = task.images.filter(img => img.url && img.url !== 'error');
                      const selectedInBook = successImages.filter(img => selectedBatchImageKeys.has(getBatchImageKey(img))).length;

                      return (
                        <section key={task.id} className="rounded-[1.75rem] border border-stone-100 bg-white/80 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] backdrop-blur-md">
                          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="truncate text-lg font-black text-stone-800">{task.title}</h3>
                              <div className="mt-1 text-xs font-medium text-stone-400">
                                {task.language} · {task.artStyle} · 成功 {successImages.length} 张 · 已选 {selectedInBook} 张
                              </div>
                            </div>
                            <div className={`rounded-full px-3 py-1.5 text-xs font-bold ${batchStatusClass[task.status]}`}>
                              {batchStatusLabel[task.status]}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                            {successImages.map((img) => {
                              const imageKey = getBatchImageKey(img);
                              const isSelected = selectedBatchImageKeys.has(imageKey);

                              return (
                                <div
                                  key={imageKey}
                                  className={`group relative rounded-[1.35rem] border p-2 text-left transition-all hover:-translate-y-0.5 ${
                                    isSelected
                                      ? 'border-orange-400 bg-orange-50 shadow-[0_16px_34px_-18px_rgba(234,88,12,0.8)]'
                                      : 'border-stone-100 bg-white hover:border-orange-200 hover:shadow-[0_12px_28px_-18px_rgba(234,88,12,0.55)]'
                                  }`}
                                >
                                  <div className={`relative w-full overflow-hidden rounded-[1rem] bg-stone-50 border border-stone-100
                                    ${task.ratio === '1:1' ? 'aspect-square' :
                                      task.ratio === '3:4' ? 'aspect-[3/4]' :
                                      task.ratio === '4:3' ? 'aspect-[4/3]' :
                                      task.ratio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}
                                  >
                                    <img src={img.url} alt={task.title} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                                    <button
                                      type="button"
                                      onClick={() => toggleBatchImageSelection(img)}
                                      className={`absolute right-3 top-3 z-20 flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all ${
                                        isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-white/80 bg-white/90 text-stone-300 hover:text-orange-500'
                                      }`}
                                      aria-label={isSelected ? '取消选择' : '选择导出'}
                                    >
                                      {isSelected && <Check className="h-5 w-5" />}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openBatchImageEditor(img)}
                                      className="absolute left-3 top-3 z-20 rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[11px] font-bold text-stone-700 shadow-sm transition-all hover:bg-orange-50 hover:text-orange-600"
                                    >
                                      调整
                                    </button>
                                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-3 pb-3 pt-12 text-white">
                                      <div className="truncate text-sm font-bold">{getCompositionLabel(img.comp, task.language)}</div>
                                      <div className="mt-1 truncate text-[11px] text-white/70">{img.imageModel}</div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                </div>
              )
            ) : images.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-stone-200/80 rounded-3xl bg-white/50 backdrop-blur-sm">
                <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-6 text-orange-400 shadow-sm border border-orange-100/50">
                  <ImageIcon className="w-10 h-10" />
                </div>
                <p className="text-stone-600 font-medium text-lg tracking-wide">在左侧调配参数，生成极具质感的封面</p>
                <p className="text-stone-400 text-sm mt-2 flex items-center gap-4">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5"/> 自动构图解析</span>
                  <span className="flex items-center gap-1"><Loader2 className="w-3.5 h-3.5"/> 多线程并发渲染</span>
                </p>
              </div>
            ) : (
              <div className={`grid gap-6 lg:gap-8 pb-10 w-full mx-auto auto-rows-max transition-all duration-500 ${
                images.length === 1 ? 'grid-cols-1 max-w-[40vw]' :
                images.length === 2 ? 'grid-cols-1 xl:grid-cols-2 max-w-[70vw]' :
                images.length === 3 ? 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 max-w-[90vw]' :
                images.length === 4 ? 'grid-cols-1 md:grid-cols-2 2xl:grid-cols-4 max-w-[95vw]' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 max-w-full'
              }`}>
                {images.map((imgObj, idx) => (
                  <div key={idx} className="group relative bg-white/80 p-3 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-stone-100/80 backdrop-blur-md transition-all duration-500 hover:shadow-[0_20px_40px_-10px_rgba(234,88,12,0.15)] hover:border-orange-200 hover:-translate-y-1">
                    <div className={`relative w-full rounded-[1.5rem] ${imgObj.url === 'error' ? 'overflow-visible' : 'overflow-hidden'} bg-stone-50 flex items-center justify-center border border-stone-100/50
                      ${ratio === '1:1' ? 'aspect-square' : 
                        ratio === '3:4' ? 'aspect-[3/4]' : 
                        ratio === '4:3' ? 'aspect-[4/3]' : 
                        ratio === '16:9' ? 'aspect-video' : 'aspect-[9/16]'}`}
                    >
                      {/* 构图标识 Badge */}
                      <div className="absolute top-4 left-4 z-20 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] border border-white/60 text-xs font-bold text-stone-700 flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${imgObj.url === '' ? 'bg-orange-500 animate-pulse' : imgObj.url === 'error' ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                        {getCompositionLabel(imgObj.comp, language)}
                      </div>

                      {imgObj.url === '' ? (
                        <div className="flex flex-col items-center gap-4 text-orange-400">
                          <Loader2 className="w-10 h-10 animate-spin" />
                          <span className="text-sm font-medium animate-pulse tracking-widest uppercase">Rendering...</span>
                        </div>
                      ) : imgObj.url === 'error' ? (
                        <div className="text-red-500 text-sm flex flex-col items-center justify-center h-full gap-3 p-4 text-center bg-red-50/30">
                          <div className="p-3 bg-red-50 rounded-full">
                            <ImageIcon className="w-8 h-8 opacity-50" />
                          </div>
                          <div className="font-bold text-base">生成失败</div>
                          <div className="text-xs text-red-400 mb-2 leading-relaxed">
                            可能遇到了接口超时或受限<br/>建议重试或切换右上角生图模型
                          </div>
                          {imgObj.error && (
                            <pre className="w-[90%] max-h-28 overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-white/80 border border-red-100 px-3 py-2 text-[10px] leading-relaxed text-red-500 text-left">
                              {imgObj.error}
                            </pre>
                          )}
                          <div className="w-[90%] text-left">
                            <div className="text-[10px] font-bold text-stone-400 mb-1.5">本卡生图模型</div>
                            <FormDropdown
                              value={imgObj.imageModel || imageModel}
                              options={IMAGE_OPTIONS}
                              onChange={(value) => updateImageCardModel(idx, value)}
                            />
                          </div>
                          <button 
                            onClick={() => handleRetryImage(idx, imgObj.comp)}
                            className="px-5 py-2 bg-white hover:bg-red-50 text-red-600 rounded-full text-xs font-bold transition-all border border-red-200 shadow-sm flex items-center gap-1.5 active:scale-95"
                          >
                            <RefreshCw className="w-3.5 h-3.5" />
                            重新生成
                          </button>
                        </div>
                      ) : (
                        <>
                          <img src={imgObj.url} alt="Generated Cover" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-[1.03]" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-end pb-6 gap-2.5">
                            <button 
                              onClick={() => downloadCompressedImage(imgObj.url, imgObj.comp, idx)}
                              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-400 hover:to-red-400 backdrop-blur-md text-white font-bold rounded-full shadow-[0_4px_15px_rgba(234,88,12,0.4)] flex items-center gap-2 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 w-[85%] justify-center text-sm border border-orange-400/50"
                            >
                              <Download className="w-4 h-4" />
                              保存标准封面 <span className="text-xs font-normal opacity-90 text-white/80">(极速)</span>
                            </button>
                            <button 
                              onClick={() => downloadImage(imgObj.url, imgObj.comp, idx)}
                              className="px-5 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white/90 text-xs font-medium rounded-full border border-white/20 flex items-center gap-1.5 transition-all transform translate-y-4 group-hover:translate-y-0 duration-300 w-[85%] justify-center"
                            >
                              <Download className="w-3.5 h-3.5" />
                              下载超清原图
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {isHistoryOpen && (
        <div className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-[2px]" onClick={() => setIsHistoryOpen(false)}>
          <div
            className="absolute right-4 top-4 bottom-4 w-[420px] max-w-[calc(100vw-2rem)] bg-white rounded-[1.75rem] shadow-[0_20px_80px_rgba(0,0,0,0.16)] border border-stone-200 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-stone-800">生产记录</div>
                <div className="text-[11px] text-stone-400 mt-0.5">最近 10 本</div>
              </div>
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="rounded-full border border-stone-200 bg-white px-3 py-1.5 text-xs font-bold text-stone-600 hover:bg-stone-50"
              >
                关闭
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {generationHistory.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-stone-200 bg-stone-50 px-4 py-8 text-center text-xs text-stone-400">
                  还没有生成记录
                </div>
              ) : (
                generationHistory.map(record => (
                  <button
                    key={record.id}
                    onClick={() => restoreGenerationRecord(record)}
                    className="w-full rounded-2xl border border-stone-200 bg-white px-3.5 py-3 text-left shadow-sm transition-all hover:border-orange-200 hover:bg-orange-50/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-bold text-stone-800">{record.title}</div>
                        <div className="mt-1 text-[11px] text-stone-400">
                          {record.language} · {record.artStyle} · {record.ratio}
                        </div>
                      </div>
                      <div className="shrink-0 text-[10px] font-medium text-stone-400">
                        {formatRecordTime(record.generatedAt)}
                      </div>
                    </div>

                    {record.images && record.images.length > 0 && (
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        {record.images.slice(0, 3).map((img, idx) => (
                          <div
                            key={`${record.id}-${idx}`}
                            className="aspect-[3/4] rounded-xl border border-stone-100 bg-stone-50 overflow-hidden flex items-center justify-center"
                          >
                            {img.url && img.url !== 'error' ? (
                              <img src={img.url} alt={record.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="text-[10px] text-red-400 px-2 text-center leading-tight">失败</div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-500">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-600">成功 {record.successCount}</span>
                      <span className="rounded-full bg-red-50 px-2 py-0.5 text-red-500">失败 {record.failedCount}</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {batchImageEditTarget && (
        <div className="fixed inset-0 z-[95] bg-black/30 backdrop-blur-[2px]" onClick={() => !isRegeneratingBatchImage && setBatchImageEditTarget(null)}>
          <div
            className="absolute left-1/2 top-1/2 w-[720px] max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-[1.75rem] border border-stone-200 bg-white shadow-[0_24px_90px_rgba(0,0,0,0.18)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-stone-100 px-5 py-4">
              <div className="min-w-0">
                <div className="truncate text-sm font-black text-stone-800">二次调整生成</div>
                <div className="mt-1 text-xs text-stone-400">{batchImageEditTarget.composition} · 新图会追加到该书结果中</div>
              </div>
              <button
                type="button"
                onClick={() => setBatchImageEditTarget(null)}
                disabled={isRegeneratingBatchImage}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-stone-200 text-stone-500 transition-all hover:bg-stone-50 disabled:opacity-50"
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">生图模型</label>
                <FormDropdown value={batchImageEditModel} options={IMAGE_OPTIONS} onChange={setBatchImageEditModel} />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-500">图片提示词</label>
                <textarea
                  value={batchImageEditPrompt}
                  onChange={(event) => setBatchImageEditPrompt(event.target.value)}
                  className="h-64 w-full resize-none rounded-2xl border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm leading-relaxed text-stone-700 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-500/10"
                />
              </div>

              <button
                type="button"
                onClick={handleRegenerateBatchImage}
                disabled={isRegeneratingBatchImage || !batchImageEditPrompt.trim()}
                className={`w-full rounded-2xl py-3.5 font-bold transition-all flex items-center justify-center gap-2 ${
                  isRegeneratingBatchImage || !batchImageEditPrompt.trim()
                    ? 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                    : 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-[0_8px_20px_-6px_rgba(234,88,12,0.4)] active:scale-[0.98]'
                }`}
              >
                {isRegeneratingBatchImage ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                {isRegeneratingBatchImage ? '二次生成中...' : '按当前提示词重新生成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
