import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { ResearchForm } from './components/ResearchForm';
import { SourceManager } from './components/SourceManager';
import { ReportView } from './components/ReportView';
import { Button } from './components/ui/Button';
import { INITIAL_RESEARCH_CONFIG, MAX_DOC_SOURCES, MAX_URL_SOURCES } from './constants';
import { GeneratedReport, ResearchConfig, Source, ViewState } from './types';
import { generateIndustryReport } from './services/geminiService';
import { Sparkles, AlertCircle, Database, Globe, Trash2 } from 'lucide-react';

export default function App() {
  const [viewState, setViewState] = useState<ViewState>('input');
  const [config, setConfig] = useState<ResearchConfig>(INITIAL_RESEARCH_CONFIG);
  const [sources, setSources] = useState<Source[]>([]); // Project Sources
  
  // Persistent States
  const [knowledgeBase, setKnowledgeBase] = useState<Source[]>(() => {
    const saved = localStorage.getItem('crestpoint_kb');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [globalSources, setGlobalSources] = useState<Source[]>(() => {
    const saved = localStorage.getItem('crestpoint_gs');
    return saved ? JSON.parse(saved) : [];
  });

  const [report, setReport] = useState<GeneratedReport | null>(() => {
    const saved = localStorage.getItem('crestpoint_last_report');
    return saved ? JSON.parse(saved) : null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  // Persistence Effects
  useEffect(() => {
    localStorage.setItem('crestpoint_kb', JSON.stringify(knowledgeBase));
  }, [knowledgeBase]);

  useEffect(() => {
    localStorage.setItem('crestpoint_gs', JSON.stringify(globalSources));
  }, [globalSources]);

  useEffect(() => {
    if (report) {
      localStorage.setItem('crestpoint_last_report', JSON.stringify(report));
    }
  }, [report]);

  const handleSourceManagerWarning = (message: string) => {
    setWarningMessage(message);
    setTimeout(() => setWarningMessage(null), 5000);
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all saved research and sources? This cannot be undone.")) {
      setKnowledgeBase([]);
      setGlobalSources([]);
      setReport(null);
      setSources([]);
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleGenerate = async () => {
    if (!config.industry) {
      setError("Please enter an Industry or Research Topic.");
      return;
    }
    setError(null);
    setWarningMessage(null);
    setIsGenerating(true);
    setViewState('generating');

    try {
      const allSources = [...sources, ...knowledgeBase, ...globalSources];
      const result = await generateIndustryReport(config, allSources);
      setReport(result);
      setViewState('report');
    } catch (err) {
      console.error(err);
      setError("Failed to generate report. Please check your network and try again.");
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
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">New Research Project</h1>
                  <p className="text-slate-500 dark:text-slate-400 mt-1">Configure your AI analyst parameters below.</p>
                </div>
                {report && (
                  <Button variant="ghost" size="sm" onClick={() => setViewState('report')} className="text-indigo-600">
                    View Last Report
                  </Button>
                )}
              </div>

              <ResearchForm config={config} onChange={setConfig} />

              <div className="flex justify-end pt-4 space-x-4">
                <Button variant="ghost" onClick={handleClearAllData} className="text-slate-400 hover:text-red-500">
                  <Trash2 className="w-4 h-4 mr-2" /> Reset Workspace
                </Button>
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
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Project Sources ({sources.length} / {MAX_DOC_SOURCES})</h3>
                    <SourceManager 
                      sources={sources} 
                      onAddSource={(s) => setSources(prev => [...prev, s])} 
                      onRemoveSource={(id) => setSources(prev => prev.filter(s => s.id !== id))}
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
                           <span className="font-semibold text-sm">Global Sources Syncing</span>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400">
                           AI will reference <strong>{globalSources.length}</strong> persistent web sources.
                        </p>
                     </div>
                  )}

                  {knowledgeBase.length > 0 && (
                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                      <div className="flex items-center text-indigo-700 dark:text-indigo-300 mb-2">
                        <Database className="w-4 h-4 mr-2" />
                        <span className="font-semibold text-sm">Knowledge Base Syncing</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        AI will reference <strong>{knowledgeBase.length}</strong> persistent private documents.
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
               <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Synthesizing Professional Insights</h2>
               <p className="text-slate-500 mt-2 max-w-md mx-auto">
                 Analyzing {sources.length + knowledgeBase.length + globalSources.length} sources...
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
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Persistent Knowledge Base</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">These documents are saved locally and used for all future reports.</p>
                </div>
                <div className="bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-sm font-medium">
                  {knowledgeBase.length} / {MAX_DOC_SOURCES} Documents
                </div>
             </div>
             {warningMessage && ( 
                <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center">
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
                   <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Global Web Sources</h1>
                   <p className="text-slate-500 dark:text-slate-400 mt-1">URLs stored here provide persistent industry context for your analyst.</p>
                </div>
                <div className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-1 rounded-full text-sm font-medium">
                  {globalSources.length} / {MAX_URL_SOURCES} URLs
                </div>
             </div>
             {warningMessage && ( 
                <div className="bg-amber-50 text-amber-700 p-4 rounded-lg flex items-center">
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