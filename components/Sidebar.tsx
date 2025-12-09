import React from 'react';
import { CORE_VALUES } from '../constants';

const Sidebar: React.FC = () => {
  return (
    <div className="hidden md:flex flex-col w-80 h-screen bg-strategic-dark text-slate-300 border-r border-slate-800 flex-shrink-0 sticky top-0">
      <div className="p-8 border-b border-slate-800">
        <h1 className="font-serif text-2xl text-white tracking-wide font-light">
          The Ethical <br />
          <span className="font-bold text-slate-100">Strategist</span>
        </h1>
        <p className="text-xs mt-2 text-slate-400 uppercase tracking-widest">
          Mentor & Guide
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="space-y-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Det Etiske Kompas
          </h2>
          {CORE_VALUES.map((value, index) => (
            <div key={index} className="group relative">
              <div className="flex items-center space-x-3 cursor-default">
                <span className="flex-shrink-0 w-6 h-6 rounded-full border border-slate-600 flex items-center justify-center text-xs font-serif text-slate-400 group-hover:border-slate-300 group-hover:text-white transition-colors">
                  {index + 1}
                </span>
                <span className="text-sm font-medium group-hover:text-white transition-colors">
                  {value.title}
                </span>
              </div>
              
              {/* Tooltip-like description */}
              <div className="hidden group-hover:block absolute left-0 top-8 z-10 w-64 bg-slate-800 p-3 rounded shadow-xl border border-slate-700 text-xs text-slate-300 leading-relaxed pointer-events-none animate-fade-in-up">
                {value.description}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-slate-800">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
            Proces
          </h2>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 mr-2"></span>
              Fase 1: Stop & Reflekter
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              Fase 2: Strategisk Valg
            </li>
            <li className="flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span>
              Fase 3: Eksekvering
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;