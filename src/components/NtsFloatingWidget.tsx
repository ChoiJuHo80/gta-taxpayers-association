'use client';

import { useState } from 'react';
import { ExternalLink, X } from 'lucide-react';

export default function NtsFloatingWidget() {
  const [minimized, setMinimized] = useState(false);

  return (
    <div className="fixed top-24 sm:top-28 right-4 sm:right-8 z-40 animate-in slide-in-from-top-5 duration-300">
      {!minimized ? (
        <div className="bg-white/95 backdrop-blur-md border-2 border-amber-400 p-3 sm:p-3.5 rounded-2xl shadow-2xl flex items-center space-x-3 text-xs font-bold text-slate-900 group hover:shadow-amber-500/20 hover:border-amber-500 transition-all">
          
          {/* NTS Badge Logo */}
          <a
            href="https://www.nts.go.kr/english/main.do"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-2.5 group-hover:opacity-90"
          >
            <div className="flex items-center font-black rounded-lg overflow-hidden border border-amber-400 shadow-xs shrink-0">
              <span className="bg-amber-500 text-slate-950 px-2 py-1 text-[11px]">NTS</span>
              <span className="bg-gta-700 text-white px-2 py-1 text-[11px]">국세청</span>
            </div>

            <div className="flex flex-col text-left">
              <span className="font-extrabold text-slate-900 text-xs flex items-center space-x-1 group-hover:text-gta-600 transition-colors">
                <span>National Tax Service</span>
                <ExternalLink className="w-3.5 h-3.5 text-amber-600 ml-0.5" />
              </span>
              <span className="text-[10px] text-slate-500 font-semibold">Official English Portal ↗</span>
            </div>
          </a>

          {/* Minimize / Close Button */}
          <button
            onClick={() => setMinimized(true)}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors ml-1 shrink-0"
            title="Minimize NTS Floating Badge"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        /* Minimized Floating Circle Button */
        <button
          onClick={() => setMinimized(false)}
          className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-gradient-to-tr from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-black text-xs shadow-xl hover:scale-110 transition-transform flex items-center justify-center border-2 border-white ring-2 ring-amber-400/50"
          title="Open National Tax Service Direct Link"
        >
          NTS
        </button>
      )}
    </div>
  );
}
