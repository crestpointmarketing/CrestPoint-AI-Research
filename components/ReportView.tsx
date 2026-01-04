import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { GeneratedReport, SocialPosts, SocialVisuals, VisualAsset, SocialPostContent } from '../types';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { FileText, List, BookOpen, Quote, Download, ArrowLeft, Copy, Check, FileCode, Share2, Twitter, Linkedin, Facebook, Megaphone, Loader2, Image as ImageIcon } from 'lucide-react';
import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from "docx";
import { generateSocialMediaContent, generateSocialAssets } from '../services/geminiService';

interface ReportViewProps {
  report: GeneratedReport;
  onBack: () => void;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, onBack }) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'full' | 'takeaways' | 'citations' | 'social'>('summary');
  const [copied, setCopied] = useState(false);
  const [isExportingWord, setIsExportingWord] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  
  const [socialPosts, setSocialPosts] = useState<SocialPosts | null>(null);
  const [socialVisuals, setSocialVisuals] = useState<SocialVisuals | null>(null);
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [isGeneratingVisuals, setIsGeneratingVisuals] = useState(false);
  const [copyStates, setCopyStates] = useState<Record<string, boolean>>({});

  const handleCopy = (text: string, key: string = 'general') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (key === 'general') {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    } else {
        setCopyStates(prev => ({ ...prev, [key]: true }));
        setTimeout(() => setCopyStates(prev => ({ ...prev, [key]: false })), 2000);
    }
  };

  const handleGenerateSocial = async () => {
    setIsGeneratingSocial(true);
    try {
      const posts = await generateSocialMediaContent(report);
      setSocialPosts(posts);
    } catch (err) {
      console.error("Social generation failed:", err);
      alert("Failed to generate social media content. Please try again.");
    } finally {
      setIsGeneratingSocial(false);
    }
  };

  const handleGenerateVisuals = async () => {
    setIsGeneratingVisuals(true);
    try {
      const visuals = await generateSocialAssets(report);
      setSocialVisuals(visuals);
    } catch (err) {
      console.error("Visual generation failed:", err);
      alert("Failed to generate visual assets. Please try again.");
    } finally {
      setIsGeneratingVisuals(false);
    }
  };

  const handleExportPDF = () => {
    setIsExportingPDF(true);
    setTimeout(() => {
      window.focus();
      window.print();
      setIsExportingPDF(false);
    }, 250);
  };

  const handleExportWord = async () => {
    setIsExportingWord(true);
    try {
      const reportParagraphs = report.fullReport
        .split('\n')
        .filter(p => p.trim().length > 0)
        .map(text => new Paragraph({
          children: [new TextRun({ text: text.trim(), size: 24 })],
          spacing: { after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        }));

      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "CrestPoint AI Brain",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
              spacing: { after: 120 },
            }),
            new Paragraph({
              text: "Strategic Industry Analysis - Full Report",
              heading: HeadingLevel.HEADING_2,
              alignment: AlignmentType.CENTER,
              spacing: { after: 400 },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Date: ${new Date(report.generationTime).toLocaleDateString()}`,
                  italics: true,
                  size: 20,
                }),
              ],
              spacing: { after: 600 },
            }),
            ...reportParagraphs,
            new Paragraph({
              children: [
                new TextRun({
                  text: "\n© CrestPoint AI Brain • Strategic Research Division",
                  size: 16,
                  color: "888888",
                }),
              ],
              alignment: AlignmentType.CENTER,
              spacing: { before: 800 },
            }),
          ],
        }],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CrestPoint_Report_${new Date().getTime()}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Word export failed:", error);
    } finally {
      setIsExportingWord(false);
    }
  };

  const printableContent = (
    <div className="print-portal-root">
      <header style={{ marginBottom: '40px', borderBottom: '6px solid #4f46e5', paddingBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '28pt', fontWeight: 900, textTransform: 'uppercase', margin: 0, color: '#1e293b' }}>CrestPoint AI</h1>
          <p style={{ color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', fontSize: '9pt', marginTop: '4px' }}>Strategic Industry Analysis</p>
        </div>
        <div style={{ textAlign: 'right', fontSize: '8pt', fontWeight: 600, color: '#64748b' }}>
          <p>DATE: {new Date(report.generationTime).toLocaleDateString()}</p>
          <p>CONFIDENTIAL • INTERNAL RESEARCH</p>
        </div>
      </header>

      <section className="printable-item">
        <h2 style={{ fontSize: '16pt', fontWeight: 800, borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '16px', color: '#1e293b' }}>I. Executive Summary</h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '10.5pt', textAlign: 'justify', lineHeight: '1.6', color: '#334155' }}>
          {report.executiveSummary}
        </div>
      </section>

      <section className="printable-item">
        <h2 style={{ fontSize: '16pt', fontWeight: 800, borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '16px', color: '#1e293b' }}>II. Detailed Industry Analysis</h2>
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '10.5pt', textAlign: 'justify', lineHeight: '1.8', color: '#334155' }}>
          {report.fullReport}
        </div>
      </section>

      <section className="printable-item">
        <h2 style={{ fontSize: '16pt', fontWeight: 800, borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '16px', color: '#1e293b' }}>III. Strategic Takeaways</h2>
        <div style={{ display: 'block' }}>
          {report.keyTakeaways.map((point, idx) => (
            <div key={idx} style={{ display: 'flex', marginBottom: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontWeight: 800, color: '#4f46e5', marginRight: '12px', minWidth: '20px', fontSize: '12pt' }}>{idx + 1}.</span>
              <p style={{ fontWeight: 600, fontSize: '10.5pt', margin: 0, color: '#1e293b' }}>{point}</p>
            </div>
          ))}
        </div>
      </section>

      {report.citations.length > 0 && (
        <section className="printable-item">
          <h2 style={{ fontSize: '16pt', fontWeight: 800, borderBottom: '2px solid #e2e8f0', paddingBottom: '6px', marginBottom: '16px', color: '#1e293b' }}>IV. Supporting Evidence</h2>
          <div style={{ display: 'block' }}>
            {report.citations.map((citation, idx) => (
              <div key={idx} style={{ marginBottom: '18px' }}>
                <p style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: '7.5pt', marginBottom: '2px', color: '#64748b' }}>
                  SOURCE: {citation.sourceName}
                </p>
                <p style={{ fontStyle: 'italic', borderLeft: '3px solid #4f46e5', paddingLeft: '12px', color: '#475569', fontSize: '10pt', margin: 0 }}>
                  "{citation.quote}"
                </p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
      {createPortal(printableContent, document.body)}

      <div className="flex items-center justify-between no-print">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Research Insights</h2>
        </div>
        <div className="flex space-x-2">
           <Button variant="outline" size="sm" onClick={() => handleCopy(report.fullReport)}>
              {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
              {copied ? 'Copied' : 'Copy Text'}
           </Button>
           <Button variant="outline" size="sm" onClick={handleExportWord} isLoading={isExportingWord}>
              <FileCode className="w-4 h-4 mr-1" /> Export Word
           </Button>
           <Button variant="primary" size="sm" onClick={handleExportPDF} isLoading={isExportingPDF}>
              <Download className="w-4 h-4 mr-1" /> Export PDF
           </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden no-print">
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50">
          {[
            { id: 'summary', label: 'Summary', icon: FileText },
            { id: 'full', label: 'Full Analysis', icon: BookOpen },
            { id: 'takeaways', label: 'Takeaways', icon: List },
            { id: 'citations', label: 'Evidence', icon: Quote },
            { id: 'social', label: 'Amplify', icon: Share2 },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center py-4 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-indigo-600 text-indigo-600 bg-white dark:bg-slate-900' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              >
                <Icon className={`w-4 h-4 mr-2 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-8 bg-white dark:bg-slate-900">
          {activeTab === 'summary' && (
            <div className="max-w-none">
              <h3 className="text-xl font-semibold mb-6 text-slate-900 dark:text-white border-l-4 border-indigo-600 pl-4">Executive Summary</h3>
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                {report.executiveSummary}
              </div>
            </div>
          )}

          {activeTab === 'full' && (
            <div className="max-w-none">
              <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-300 leading-loose text-lg font-normal">
                {report.fullReport}
              </div>
            </div>
          )}

          {activeTab === 'takeaways' && (
            <div className="max-w-4xl mx-auto">
              <ul className="space-y-4">
                {report.keyTakeaways.map((point, idx) => (
                  <li key={idx} className="flex items-start p-5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-indigo-600 text-white text-xs font-bold mr-4">
                      {idx + 1}
                    </span>
                    <span className="text-slate-800 dark:text-slate-200 font-medium leading-tight">{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'citations' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {report.citations.map((citation, idx) => (
                <div key={idx} className="p-5 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/30 dark:bg-slate-900/30">
                  <div className="flex justify-between items-start mb-3">
                     <h4 className="font-bold text-slate-900 dark:text-slate-100">{citation.sourceName}</h4>
                  </div>
                  <blockquote className="pl-4 border-l-2 border-indigo-400 dark:border-indigo-600 italic text-slate-600 dark:text-slate-400 text-sm">
                    "{citation.quote}"
                  </blockquote>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8 max-w-5xl mx-auto pb-12">
               <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-600 rounded-xl text-white">
                      <Megaphone className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Social Media Copy</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Generate viral professional text for all platforms.</p>
                    </div>
                  </div>
                  <Button 
                    variant="primary" 
                    onClick={handleGenerateSocial} 
                    isLoading={isGeneratingSocial}
                    disabled={!!socialPosts}
                  >
                    {socialPosts ? 'Copy Generated' : 'Generate Copy'}
                  </Button>
               </div>

               {isGeneratingSocial && (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-slate-500 font-medium italic">Strategizing platform hooks...</p>
                 </div>
               )}

               {socialPosts && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <SocialCard icon={Linkedin} title="LinkedIn" content={socialPosts.linkedin} isCopied={copyStates['linkedin']} onCopy={() => handleCopy(socialPosts.linkedin?.content, 'linkedin')} />
                    <SocialCard icon={Twitter} title="X (Twitter Thread)" content={socialPosts.twitter} isCopied={copyStates['twitter']} onCopy={() => handleCopy(socialPosts.twitter?.content, 'twitter')} />
                    <SocialCard icon={Facebook} title="Facebook" content={socialPosts.facebook} isCopied={copyStates['facebook']} onCopy={() => handleCopy(socialPosts.facebook?.content, 'facebook')} />
                    <SocialCard icon={Share2} title="Xiaohongshu (Rednote)" content={socialPosts.xiaohongshu} isCopied={copyStates['xhs']} onCopy={() => handleCopy(socialPosts.xiaohongshu?.content, 'xhs')} />
                 </div>
               )}

               <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-2xl border border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-emerald-600 rounded-xl text-white">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">Visual Assets</h4>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Create branded, platform-ready images.</p>
                    </div>
                  </div>
                  <Button variant="primary" onClick={handleGenerateVisuals} isLoading={isGeneratingVisuals} disabled={!!socialVisuals} className="bg-emerald-600 hover:bg-emerald-700">
                    {socialVisuals ? 'Assets Ready' : 'Generate Images'}
                  </Button>
               </div>

               {isGeneratingVisuals && (
                 <div className="flex flex-col items-center justify-center py-10 space-y-4">
                    <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                    <p className="text-slate-500 font-medium italic">Designing assets (this may take a moment)...</p>
                 </div>
               )}

               {socialVisuals && (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <VisualPreview asset={socialVisuals.linkedin} title="LinkedIn (16:9)" />
                    <VisualPreview asset={socialVisuals.twitter} title="X / Twitter (16:9)" />
                    <VisualPreview asset={socialVisuals.facebook} title="Facebook (16:9)" />
                    <VisualPreview asset={socialVisuals.xiaohongshu} title="Xiaohongshu (3:4)" />
                 </div>
               )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SocialCard: React.FC<{ 
  icon: any, 
  title: string, 
  content: SocialPostContent | undefined,
  onCopy: () => void,
  isCopied: boolean 
}> = ({ icon: Icon, title, content, onCopy, isCopied }) => {
  const cleanContent = (text: string) => (text || '').replace(/\*\*/g, '').replace(/__/g, '');

  if (!content) return null;

  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center space-x-2">
            <Icon className="w-5 h-5 text-indigo-600" />
            <h5 className="font-bold text-slate-800 dark:text-slate-200">{title}</h5>
         </div>
         <button onClick={onCopy} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors">
           {isCopied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-slate-400" />}
         </button>
      </div>
      <div className="pl-1 border-l-4 border-indigo-200 dark:border-indigo-800 mb-4">
        <h4 className="font-bold text-md text-slate-800 dark:text-slate-200 leading-snug pl-3">{content.title || 'Draft Title'}</h4>
      </div>
      <div className="flex-1 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400 font-mono bg-slate-50 dark:bg-slate-950 p-4 rounded-lg overflow-y-auto max-h-96">
        {cleanContent(content.content)}
      </div>
    </Card>
  );
};

const VisualPreview: React.FC<{ asset: VisualAsset | undefined, title: string }> = ({ asset, title }) => {
  const [copiedBase64, setCopiedBase64] = useState(false);
  if (!asset) return null;

  const isVertical = asset.platform === 'xiaohongshu';

  const downloadImage = () => {
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${asset.imageBase64}`;
    link.download = `crestpoint_${asset.platform}_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyBase64 = () => {
    if (!asset.imageBase64) return;
    navigator.clipboard.writeText(asset.imageBase64);
    setCopiedBase64(true);
    setTimeout(() => setCopiedBase64(false), 2000);
  };
  
  return (
    <div className="space-y-3">
      <h5 className="font-semibold text-sm text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</h5>
      <div className={`relative overflow-hidden rounded-lg shadow-lg group ${isVertical ? 'aspect-[3/4]' : 'aspect-video'}`}>
        <img src={`data:image/png;base64,${asset.imageBase64}`} className="w-full h-full object-cover" alt={`Generated asset`} />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center space-x-2">
          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={downloadImage}>
            <Download className="w-4 h-4 mr-2" /> Download
          </Button>
          <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity shadow-lg" onClick={copyBase64}>
            {copiedBase64 ? <Check className="w-4 h-4 mr-2 text-emerald-500" /> : <Copy className="w-4 h-4 mr-2" />} {copiedBase64 ? 'Copied' : 'Base64'}
          </Button>
        </div>
      </div>
      <div className="text-xs text-slate-400 truncate px-1">Prompt: {asset.prompt}</div>
    </div>
  );
};