import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { ResearchForm } from './components/ResearchForm';
import { SourceManager } from './components/SourceManager';
import { ReportView } from './components/ReportView';
import { Button } from './components/ui/Button';
import { INITIAL_RESEARCH_CONFIG, MAX_DOC_SOURCES, MAX_URL_SOURCES } from './constants';
import { GeneratedReport, ResearchConfig, Source, ViewState } from './types';
import { generateIndustryReport } from './services/geminiService';
import { Sparkles, AlertCircle, Database, Globe } from 'lucide-react';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [config, setConfig] = useState<ResearchConfig>(INITIAL_RESEARCH_CONFIG);
  const [sources, setSources] = useState<Source[]>([]); // Project Sources (documents for current project)
  const [knowledgeBase, setKnowledgeBase] = useState<Source[]>([]); // Persistent Knowledge Base (documents)
  const [globalSources, setGlobalSources] = useState<Source[]>([]); // Global Sources (URLs)
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const handleSourceManagerWarning = (message: string) => {
    setWarningMessage(message);
    setTimeout(() => setWarningMessage(null), 5000); // Clear warning after 5 seconds
  };

  const handleAddSource = (source: Source) => {
    setSources(prev => [...prev, source]);
  };

  const handleRemoveSource = (id: string) => {
    setSources(prev => prev.filter(s => s.id !== id));
  };

  const handleGenerate = async () => {
    if (!config.industry) {
      setError("Please enter an Industry or Research Topic.");
      return;
    }
    setError(null);
    setWarningMessage(null); // Clear any existing warnings/errors
    setIsGenerating(true);
    setViewState('generating');

    try {
      // Combine Project Sources, Global Sources, AND Knowledge Base
      const allSources = [...sources, ...knowledgeBase, ...globalSources];
      const result = await generateIndustryReport(config, allSources);
      setReport(result);
      setViewState('report');
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please check your API key and try again.");
      setViewState('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const renderContent = () => {
    switch (viewState) {
      case 'input':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Research Project</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your AI analyst parameters below.</p>
              </div>

              <ResearchForm config={config} onChange={setConfig} />

              <div className="flex justify-end pt-4">
                <Button 
                  size="lg" 
                  onClick={handleGenerate} 
                  disabled={isGenerating || !config.industry}
                  className="shadow-lg shadow-indigo-500/30"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Industry Report
                </Button>
              </div>
              {error && (
                <div role="alert" className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              )}
              {warningMessage && ( 
                <div role="alert" className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {warningMessage}
                </div>
              )}
            </div>

            <div className="lg:col-span-1">
               <div className="sticky top-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Sources ({sources.length} / {MAX_DOC_SOURCES} documents)</h3>
                    <SourceManager 
                      sources={sources} 
                      onAddSource={handleAddSource} 
                      onRemoveSource={handleRemoveSource}
                      compact={true}
                      maxSources={MAX_DOC_SOURCES}
                      sourceType="document"
                      onShowWarning={handleSourceManagerWarning}
                    />
                  </div>

                  {globalSources.length > 0 && (
                     <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-800">
                        <div className="flex items-center text-purple-700 dark:text-purple-300 mb-2">
                           <Globe className="w-4 h-4 mr-2" />
                           <span className="font-semibold text-sm">Global Sources Active</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                           The AI will also reference <strong>{globalSources.length}</strong> external web pages from your Global Sources during analysis.
                        </p>
                     </div>
                  )}

                  {knowledgeBase.length > 0 && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center text-indigo-700 dark:text-indigo-300 mb-2">
                        <Database className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-sm">Knowledge Base Active</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        The AI will also reference <strong>{knowledgeBase.length}</strong> documents from your global Knowledge Base during analysis.
                      </p>
                    </div>
                  )}
               </div>
            </div>
          </div>
        );

      case 'generating':
        return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
             <div className="relative w-24 h-24">
                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full animate-pulse"></div>
                <div className="absolute inset-0 border-4 border-t-indigo-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                <Sparkles className="absolute inset-0 m-auto text-indigo-600 w-8 h-8 animate-pulse" />
             </div>
             <div>
               <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Analyzing Sources & Generating Report</h2>
               <p className="text-slate-500 mt-2 max-w-md mx-auto">
                 Synthesizing trends for {config.industry} based on {sources.length + knowledgeBase.length + globalSources.length} sources...
               </p>
             </div>
          </div>
        );

      case 'report':
        return report ? <ReportView report={report} onBack={() => setViewState('input')} /> : null;

      case 'knowledge':
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Knowledge Base</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Manage persistent documents and resources for all research projects.</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                  {knowledgeBase.length} / {MAX_DOC_SOURCES} Documents
                </div>
             </div>
             {warningMessage && ( 
                <div role="alert" className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {warningMessage}
                </div>
              )}
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <SourceManager 
                  sources={knowledgeBase} 
                  onAddSource={(s) => setKnowledgeBase(prev => [...prev, s])} 
                  onRemoveSource={(id) => setKnowledgeBase(prev => prev.filter(s => s.id !== id))} 
                  compact={false}
                  maxSources={MAX_DOC_SOURCES}
                  sourceType="document"
                  onShowWarning={handleSourceManagerWarning}
                />
            </div>
          </div>
        );

      case 'sources': 
        return (
          <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Sources</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">Add external web pages for AI to reference in its analysis.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {globalSources.length} / {MAX_URL_SOURCES} URLs
                </div>
             </div>
             {warningMessage && ( 
                <div role="alert" className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {warningMessage}
                </div>
              )}
            
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
                <SourceManager 
                  sources={globalSources} 
                  onAddSource={(s) => setGlobalSources(prev => [...prev, s])} 
                  onRemoveSource={(id) => setGlobalSources(prev => prev.filter(s => s.id !== id))} 
                  compact={false}
                  maxSources={MAX_URL_SOURCES}
                  sourceType="url"
                  onShowWarning={handleSourceManagerWarning}
                />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Layout activeView={viewState} onChangeView={(v) => {
      setViewState(v);
      setWarningMessage(null); 
      setError(null); 
    }}>
      {renderContent()}
    </Layout>
  );
}