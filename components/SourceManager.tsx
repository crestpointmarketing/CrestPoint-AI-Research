import React, { useState, useRef } from 'react';
import { Upload, Link as LinkIcon, FileText, Trash2, Globe, CheckCircle, Loader2 } from 'lucide-react';
import { Source } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

// Define PDF.js types since we load it from CDN
declare const pdfjsLib: any;

interface SourceManagerProps {
  sources: Source[];
  onAddSource: (source: Source) => void;
  onRemoveSource: (id: string) => void;
  compact?: boolean;
}

export const SourceManager: React.FC<SourceManagerProps> = ({ 
  sources, 
  onAddSource, 
  onRemoveSource,
  compact = true 
}) => {
  const [activeTab, setActiveTab] = useState<'docs' | 'urls'>('docs');
  const [urlInput, setUrlInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      return fullText;
    } catch (error) {
      console.error('PDF parsing error:', error);
      return `[Error parsing PDF: ${file.name}. Falling back to metadata only.]`;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    
    // Explicitly cast FileList to File array to resolve 'unknown' type errors for file properties
    const fileArray = Array.from(files) as File[];
    for (const file of fileArray) {
      let content = '';
      if (file.type === 'application/pdf') {
        content = await extractTextFromPdf(file);
      } else {
        content = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target?.result as string || '');
          reader.readAsText(file);
        });
      }

      const newSource: Source = {
        id: Math.random().toString(36).substr(2, 9),
        type: 'document',
        name: file.name,
        content: content || `[Empty content from ${file.name}]`,
        metadata: {
          size: (file.size / 1024).toFixed(1) + ' KB',
          uploadTime: new Date().toLocaleTimeString(),
          status: 'indexed'
        }
      };
      onAddSource(newSource);
    }
    
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUrlAdd = () => {
    if (!urlInput.trim()) return;
    
    const newSource: Source = {
      id: Math.random().toString(36).substr(2, 9),
      type: 'url',
      name: urlInput.replace(/^https?:\/\//, '').split('/')[0] + ' (Web Page)',
      content: `[Simulated crawled content from ${urlInput}]`,
      metadata: {
        url: urlInput,
        uploadTime: new Date().toLocaleTimeString(),
        status: 'indexed'
      }
    };
    onAddSource(newSource);
    setUrlInput('');
  };

  return (
    <div className="space-y-6">
      <div className="flex space-x-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          className={`pb-2 text-sm font-medium ${activeTab === 'docs' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('docs')}
        >
          <div className="flex items-center"><FileText className="w-4 h-4 mr-2" />Documents</div>
        </button>
        <button
          className={`pb-2 text-sm font-medium ${activeTab === 'urls' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
          onClick={() => setActiveTab('urls')}
        >
          <div className="flex items-center"><LinkIcon className="w-4 h-4 mr-2" />Web Sources</div>
        </button>
      </div>

      {activeTab === 'docs' && (
        <div className="space-y-4">
           <div 
             className={`border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg p-8 text-center transition-colors cursor-pointer ${isProcessing ? 'bg-slate-100 cursor-wait' : 'hover:bg-slate-50 dark:hover:bg-slate-900/50'}`} 
             onClick={() => !isProcessing && fileInputRef.current?.click()}
           >
              {isProcessing ? (
                <Loader2 className="mx-auto h-12 w-12 text-indigo-600 animate-spin" />
              ) : (
                <Upload className="mx-auto h-12 w-12 text-slate-400" />
              )}
              <div className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                {isProcessing ? (
                  <span className="font-semibold text-indigo-600">Processing Knowledge Base...</span>
                ) : (
                  <>
                    <span className="font-semibold text-indigo-600 hover:text-indigo-500">Click to upload</span> or drag and drop
                  </>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">PDF, TXT, MD, CSV supported</p>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                multiple 
                accept=".pdf,.txt,.md,.csv,.json"
                onChange={handleFileUpload}
                disabled={isProcessing}
              />
           </div>
        </div>
      )}

      {activeTab === 'urls' && (
        <div className="flex space-x-2">
          <Input 
            placeholder="https://example.com/market-report" 
            value={urlInput} 
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlAdd()}
          />
          <Button onClick={handleUrlAdd} disabled={!urlInput}>Add URL</Button>
        </div>
      )}

      {/* Source List */}
      <div className={`space-y-3 overflow-y-auto ${compact ? 'max-h-96' : ''}`}>
        {sources.length === 0 && !isProcessing && (
          <div className="text-center py-8 text-slate-500 text-sm">No sources added yet. The AI will rely on general knowledge.</div>
        )}
        {sources.map((source) => (
          <div key={source.id} className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className={`p-2 rounded-lg ${source.type === 'document' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                {source.type === 'document' ? <FileText size={18} /> : <Globe size={18} />}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">{source.name}</p>
                <div className="flex items-center text-xs text-slate-500 space-x-2">
                  <span>{source.metadata?.size || 'Web Source'}</span>
                  <span>•</span>
                  <span className="flex items-center text-emerald-600"><CheckCircle size={10} className="mr-1" /> Indexed</span>
                </div>
              </div>
            </div>
            <button onClick={() => onRemoveSource(source.id)} className="text-slate-400 hover:text-red-500 transition-colors p-2">
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};