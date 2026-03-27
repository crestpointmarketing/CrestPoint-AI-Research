import React from 'react';
import { BarChart3, Globe, Database, Settings, LayoutGrid } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: string;
  onChangeView: (view: any) => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, onChangeView }) => {
  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-slate-900 text-white hidden md:flex flex-col border-r border-slate-800">
        <div className="p-6">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-xl">
             <LayoutGrid className="w-6 h-6" />
             <span>Big Brain</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Industry Research Center</p>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem 
            icon={BarChart3} 
            label="Generate Report" 
            active={activeView === 'input' || activeView === 'report' || activeView === 'generating'} 
            onClick={() => onChangeView('input')} 
          />
          <NavItem 
            icon={Database} 
            label="Knowledge Base" 
            active={activeView === 'knowledge'}
            onClick={() => onChangeView('knowledge')} 
          />
          <NavItem 
            icon={Globe} 
            label="Global Sources" 
            active={activeView === 'sources'} 
            onClick={() => onChangeView('sources')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
           <NavItem 
            icon={Settings} 
            label="Setting" 
            active={false} 
            onClick={() => {}} 
          />
           <div className="mt-4 flex items-center space-x-3 px-2">
              <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-xs font-bold">JD</div>
              <div className="text-sm">
                <div className="font-medium">Jane Doe</div>
                <div className="text-slate-500 text-xs">Local Workspace</div>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'bg-indigo-600 text-white' 
        : 'text-slate-400 hover:text-white hover:bg-slate-800'
    }`}
  >
    <Icon size={18} />
    <span>{label}</span>
  </button>
);