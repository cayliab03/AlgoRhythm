'use client';
import { useEffect, useState, useRef } from 'react';
import Uploader from '../components/Uploader';
import Waveform from '../components/Waveform';
import { Play, Pause, ChevronUp, ChevronDown, Hash, Copyright, Mail, Github, Linkedin, Youtube } from 'lucide-react'; 

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categorySort, setCategorySort] = useState<{ [key: string]: 'none' | 'bpm-asc' | 'bpm-desc' }>({});
  
  const waveformRefs = useRef<{ [key: number]: { playPause: () => void } | null }>({});
  const [playingMap, setPlayingMap] = useState<{ [key: number]: boolean }>({});

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
    fetchSongs();
  }, []);

  const fetchSongs = () => {
    const startTime = Date.now();
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/library`)
      .then((res) => res.json())
      .then((data) => {
        setSongs(data.library);
        const elapsed = Date.now() - startTime;
        const delay = Math.max(0, 2000 - elapsed);
        
        setTimeout(() => {
                  setIsLoading(false);
                  // FORCE SCROLL TO TOP ONCE LOADED
                  window.scrollTo(0, 0);
                }, delay);
              });
          };

  const deleteSong = (id: number) => {
    if (confirm("Delete this song?")) {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/songs/${id}`, { method: 'DELETE' }).then(fetchSongs);
    }
  };

  const groupedSongs = songs.reduce((acc: any, song: any) => {
    const fileName = song[1].toLowerCase();
    const category = song[4] || "UNCATEGORIZED";
    const query = searchQuery.toLowerCase();
    
    if (fileName.includes(query) || category.toLowerCase().includes(query) || song[2].toString().includes(query)) {
      if (!acc[category]) acc[category] = [];
      acc[category].push(song);
    }
    return acc;
  }, {});

  Object.keys(groupedSongs).forEach(cat => {
    const sortType = categorySort[cat] || 'none';
    if (sortType === 'bpm-asc') groupedSongs[cat].sort((a: any, b: any) => a[2] - b[2]);
    if (sortType === 'bpm-desc') groupedSongs[cat].sort((a: any, b: any) => b[2] - a[2]);
  });

  return (
    <main className="min-h-screen bg-[#030303] text-white p-6 md:p-10 font-sans selection:bg-blue-500/30 relative scroll-smooth flex flex-col">
      
      {/* --- QUICK-JUMP SIDEBAR --- */}
      {!isLoading && (
        <aside className="fixed right-4 md:right-8 top-1/2 -translate-y-1/2 z-50 hidden xl:flex flex-col gap-3 p-2 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl">
          {Object.keys(groupedSongs).map((cat) => (
            <button
              key={cat}
              onClick={() => document.getElementById(cat)?.scrollIntoView({ behavior: 'smooth' })}
              className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-zinc-900 border border-white/5 hover:border-blue-500/50 hover:bg-white transition-all duration-500"
            >
              <span className="text-[10px] font-black text-zinc-500 group-hover:text-black uppercase">
                {cat.substring(0, 2)}
              </span>
              <span className="absolute right-14 px-3 py-1.5 bg-black border border-white/10 text-[8px] font-black text-white uppercase opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap rounded-md tracking-[0.2em] translate-x-2 group-hover:translate-x-0">
                {cat}
              </span>
            </button>
          ))}
        </aside>
      )}

      {/* --- SPECTRUM ANALYZER LOADING OVERLAY --- */}
      {isLoading && (
        <div className="fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-1000">
          <div className="flex items-end gap-[3px] h-32 mb-12">
            {[...Array(40)].map((_, i) => {
              const color = i > 30 ? '#ef4444' : i > 20 ? '#f97316' : i > 10 ? '#a855f7' : '#3b82f6';
              const h = isMounted ? `${20 + Math.random() * 80}%` : '50%';
              return (
                <div key={i} className="w-[3px] rounded-t-sm animate-spectrum"
                  style={{ backgroundColor: color, animationDelay: `${i * 0.04}s`, height: h, boxShadow: `0 0 15px ${color}44` }} />
              );
            })}
          </div>
          <div className="flex flex-col items-center gap-3">
            {/* Keeping your preferred loading text here */}
            <span className="text-[10px] font-black tracking-[1em] text-white uppercase italic animate-pulse">Tuning Signal</span>
            <span className="text-[7px] font-mono text-zinc-700 uppercase tracking-widest mt-2">Dreaming in Stereo // Finding the Rhythm</span>
          </div>
        </div>
      )}

      <div className={`max-w-6xl mx-auto flex-1 transition-all duration-1000 ${isLoading ? 'opacity-0 scale-95 blur-xl' : 'opacity-100 scale-100 blur-0'}`}>
        
        <header className="mb-10 pt-2 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-black py-4 mb-1 pr-10 bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500 bg-clip-text text-transparent tracking-tighter italic leading-none animate-gradient-slow select-none filter drop-shadow-[0_0_15px_rgba(168,85,247,0.3)] overflow-visible">
              AlgoRhythm
            </h1>
            <p className="text-zinc-600 text-xs font-bold tracking-[0.5em] uppercase opacity-80">THE GHOST IN THE MACHINE</p>
          </div>
          
          <div className="hidden md:flex flex-col items-end opacity-20 hover:opacity-100 transition-opacity duration-700 cursor-default">
             <span className="text-[7px] font-black text-zinc-500 uppercase tracking-widest">Dreamed into Existence</span>
             <span className="text-[9px] font-black italic text-white tracking-tighter">by Caylia Bonnick</span>
          </div>
        </header>

        <div className="mb-8">
          <input 
            type="text"
            placeholder="Search archive..."
            className="w-full p-4 bg-zinc-900/30 border border-white/5 rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500/40 text-white transition placeholder:text-zinc-800 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Uploader onUploadSuccess={fetchSongs} />

        <div className="mt-16 space-y-32">
          {Object.keys(groupedSongs).length > 0 ? (
            Object.keys(groupedSongs).map((category) => (
              <section key={category} id={category} className="relative scroll-mt-28">
                
                <div className="sticky top-0 z-30 pt-8 pb-4 bg-[#030303]/90 backdrop-blur-md border-b border-white/5 mb-8">
                  <div className="flex items-end justify-between">
                    <div className="flex flex-col gap-1">
                      <span className="text-[7px] font-black text-blue-500/60 tracking-[0.5em] uppercase ml-1">Archive Segment</span>
                      <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white italic uppercase leading-none pr-4">{category}</h2>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex bg-zinc-900/50 p-1 rounded-lg border border-white/5 items-center">
                        {[
                          { id: 'none', icon: <Hash size={10}/> },
                          { id: 'bpm-asc', icon: <ChevronUp size={10}/> },
                          { id: 'bpm-desc', icon: <ChevronDown size={10}/> }
                        ].map((btn) => (
                          <button 
                            key={btn.id}
                            onClick={() => setCategorySort(prev => ({ ...prev, [category]: btn.id as any }))}
                            className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 text-[8px] font-bold tracking-widest uppercase
                              ${(categorySort[category] || 'none') === btn.id ? 'bg-white text-black shadow-[0_0_10px_rgba(255,255,255,0.2)]' : 'text-zinc-500 hover:text-white'}`}
                          >
                            {btn.icon} {btn.id === 'none' ? 'IDX' : 'BPM'}
                          </button>
                        ))}
                      </div>

                      {(() => {
                        const isCategoryActive = groupedSongs[category].some((s: any) => playingMap[s[0]]);
                        return (
                          <div className={`hidden lg:block w-24 h-[1px] transition-all duration-700 
                            ${isCategoryActive 
                              ? 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.8)] scale-x-110' 
                              : 'bg-zinc-800 scale-x-100'}`} 
                          />
                        );
                      })()}

                      <div className="text-right flex flex-col items-end">
                        <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest block">Bank Size</span>
                        <span className="text-xs font-mono text-white font-bold tracking-tighter">
                          {groupedSongs[category].length.toString().padStart(2, '0')} UNITS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {groupedSongs[category].map((song: any) => {
                    const isPlaying = !!playingMap[song[0]];
                    const neonColor = song[3] > 0.23 ? '#ef4444' : song[3] > 0.15 ? '#f97316' : song[3] > 0.12 ? '#a855f7' : '#3b82f6';
                    return (
                      <div key={song[0]} className={`group relative bg-[#080808] border border-white/5 rounded-xl p-5 transition-all duration-500 ${isPlaying ? 'border-opacity-100' : 'hover:border-white/10'}`}
                        style={{ boxShadow: isPlaying ? `0 0 35px -10px ${neonColor}` : 'none', borderColor: isPlaying ? neonColor + '50' : '' }}>
                        <button onClick={() => deleteSong(song[0])} className="absolute -top-2 -right-2 z-50 w-7 h-7 flex items-center justify-center text-zinc-500 hover:text-red-500 transition-opacity opacity-0 group-hover:opacity-100 bg-zinc-900 border border-white/10 rounded-full text-xs">✕</button>
                        <div className="relative z-10 flex items-start gap-6">
                          <button onClick={() => { waveformRefs.current[song[0]]?.playPause(); setPlayingMap(prev => ({ ...prev, [song[0]]: !isPlaying })); }}
                            className={`w-12 h-12 flex-shrink-0 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center transition-all ${isPlaying ? 'animate-bpm' : ''}`}
                            style={{ animationDuration: isPlaying ? `${60 / song[2]}s` : '0s', color: isPlaying ? neonColor : 'white' }}>
                            {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-1" fill="currentColor" />}
                          </button>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-4 gap-6">
                              <div className="min-w-0 pr-12">
                                <h3 className={`text-lg md:text-xl font-black tracking-tight uppercase italic leading-none py-1 line-clamp-1 transition-all duration-500 pr-6 ${isPlaying ? 'scale-[1.02]' : 'text-white/90'}`} style={{ color: isPlaying ? neonColor : '' }}>{song[1].split('.')[0]}</h3>
                                <div className="flex items-center gap-3 mt-1.5"><span className="text-[8px] font-bold text-blue-500 uppercase tracking-widest bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{song[2]} BPM</span></div>
                              </div>
                              <div className="hidden md:flex flex-col items-end gap-1.5 pt-1 pr-2">
                                <span className="text-[7px] font-black text-zinc-700 uppercase tracking-widest">Energy</span>
                                <div className="w-16 h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5"><div className={`h-full transition-all duration-1000`} style={{ width: `${Math.min(song[3] * 400, 100)}%`, backgroundColor: neonColor, boxShadow: `0 0 10px ${neonColor}80` }} /></div>
                              </div>
                            </div>
                            <div className={`transition-opacity duration-700 ${isPlaying ? 'opacity-100' : 'opacity-30 group-hover:opacity-100'}`}>
                              <Waveform ref={(el: any) => (waveformRefs.current[song[0]] = el)} audioUrl={`${process.env.NEXT_PUBLIC_API_URL}/play/${encodeURIComponent(song[1])}`} energy={song[3]} color={neonColor} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="text-center py-20 text-zinc-900 font-black italic uppercase opacity-20 text-xs tracking-[1em]">No matches</div>
          )}
        </div>
      </div>

      {/* --- CUTE HARDWARE FOOTER WITH REACTIVE SOCIALS --- */}
      <footer className={`mt-32 pb-10 border-t border-white/5 transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <div className="max-w-6xl mx-auto pt-8 flex flex-col md:flex-row items-center justify-between gap-6 px-4">
          <div className="flex items-center gap-4">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse shadow-[0_0_10px_#a855f7]" />
              <p className="text-[9px] font-black tracking-[0.4em] text-zinc-600 uppercase">
                AlgoRhythm Interface // OS 1.0.0
              </p>
          </div>
          
          <div className="flex items-center gap-3">
              <Copyright size={10} className="text-zinc-700" />
              <p className="text-[10px] font-black text-zinc-500 tracking-widest uppercase flex items-center gap-2">
                2026 <span className="text-zinc-800">|</span> 
                <span className="flex items-center gap-2">
                    Made with love by 
                    <a 
                      href="https://cayliab03.github.io/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-white hover:text-blue-400 transition-all duration-500 italic px-1 relative group/link"
                    >
                      Caylia Bonnick
                      <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-blue-400 transition-all duration-500 group-hover/link:w-full shadow-[0_0_8px_#60a5fa]"></span>
                    </a>
                </span>
              </p>
          </div>

          <div className="flex gap-4 items-center">
             {[
               { id: 'mail', icon: <Mail size={16}/>, href: 'mailto:cayliab@gmail.com', color: '#FBBC05' },
               { id: 'github', icon: <Github size={16}/>, href: 'https://github.com/cayliab03', color: '#6CC644' },
               { id: 'linkedin', icon: <Linkedin size={16}/>, href: 'https://www.linkedin.com/in/caylia-bonnick/', color: '#0077B5' },
               { id: 'youtube', icon: <Youtube size={16}/>, href: 'https://youtube.com/@cayliab03?si=YAKpW1Dlfaiu6hEz', color: '#CD201F' }
             ].map((link) => (
               <a 
                 key={link.id}
                 href={link.href}
                 target="_blank"
                 rel="noopener noreferrer"
                 className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 border border-white/5 text-zinc-600 group hover:border-white/10 transition-all duration-300 relative overflow-hidden"
                 style={{ boxShadow: 'inset 0 0 10px rgba(0,0,0,0.4)' }}
               >
                 <div className="relative z-10 transition-all duration-300 group-hover:scale-110" style={{ '--hover-color': link.color } as any}>
                    {link.icon}
                 </div>
                 <div 
                   className="absolute inset-0 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                   style={{ background: `radial-gradient(circle, ${link.color}15 0%, transparent 70%)` }}
                 />
               </a>
             ))}
          </div>
        </div>
      </footer>
    </main>
  );
}