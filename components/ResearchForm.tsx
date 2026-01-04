import React from 'react';
import { ResearchConfig } from '../types';
import { FOCUS_AREAS, GEOGRAPHIES, REPORT_DEPTHS, TARGET_AUDIENCES, TIME_HORIZONS } from '../constants';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Card } from './ui/Card';
import { Badge } from './ui/Badge';

interface ResearchFormProps {
  config: ResearchConfig;
  onChange: (newConfig: ResearchConfig) => void;
}

export const ResearchForm: React.FC<ResearchFormProps> = ({ config, onChange }) => {
  
  const toggleFocusArea = (areaId: string) => {
    const newAreas = config.focusAreas.includes(areaId)
      ? config.focusAreas.filter(id => id !== areaId)
      : [...config.focusAreas, areaId];
    onChange({ ...config, focusAreas: newAreas });
  };

  return (
    <div className="space-y-6">
      <Card title="Core Research Parameters">
        <div className="space-y-4">
          <Input
            label="Industry or Research Topic"
            placeholder="e.g. Enterprise SaaS in Southeast Asia"
            value={config.industry}
            onChange={(e) => onChange({ ...config, industry: e.target.value })}
            className="font-medium"
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Focus Areas</label>
            <div className="flex flex-wrap gap-2">
              {FOCUS_AREAS.map((area) => {
                const isSelected = config.focusAreas.includes(area.id);
                const Icon = area.icon;
                return (
                  <div
                    key={area.id}
                    onClick={() => toggleFocusArea(area.id)}
                    className={`
                      cursor-pointer flex items-center px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-200
                      ${isSelected 
                        ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300' 
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800'}
                    `}
                  >
                    <Icon size={14} className={`mr-2 ${isSelected ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                    {area.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      <Card title="Context & Output">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="Target Audience"
            options={TARGET_AUDIENCES}
            value={config.targetAudience}
            onChange={(e) => onChange({ ...config, targetAudience: e.target.value })}
          />
          <Select
            label="Geography"
            options={GEOGRAPHIES}
            value={config.geography}
            onChange={(e) => onChange({ ...config, geography: e.target.value })}
          />
          <Select
            label="Time Horizon"
            options={TIME_HORIZONS}
            value={config.timeHorizon}
            onChange={(e) => onChange({ ...config, timeHorizon: e.target.value })}
          />
          <Select
            label="Report Depth"
            options={REPORT_DEPTHS}
            value={config.reportDepth}
            onChange={(e) => onChange({ ...config, reportDepth: e.target.value })}
          />
          <Select
            label="Language"
            options={['English', 'Chinese']}
            value={config.outputLanguage}
            onChange={(e) => onChange({ ...config, outputLanguage: e.target.value as any })}
          />
          <Select
            label="Format"
            options={['Markdown', 'Word', 'PPT']}
            value={config.outputFormat}
            onChange={(e) => onChange({ ...config, outputFormat: e.target.value as any })}
          />
        </div>
        <div className="mt-4">
           <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Additional Notes / Instructions</label>
           <textarea
             className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-slate-100 text-sm h-24 resize-none"
             placeholder="Any specific companies to mention, or specific data points required..."
             value={config.additionalNotes}
             onChange={(e) => onChange({ ...config, additionalNotes: e.target.value })}
           />
        </div>
      </Card>
    </div>
  );
};
