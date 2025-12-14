import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { BrutalistButton } from './components/BrutalistButton';
import { MapBackground } from './components/MapBackground';
import { generateBerlinNarrative } from './services/geminiService';
import { AppMode, Language, NarrativeContent, THEMES, UI_TEXT } from './types';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>('intro');
  const [lang, setLang] = useState<Language>('en');
  const [content, setContent] = useState<NarrativeContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  const apiKey = process.env.API_KEY || '';
  const hasKey = !!apiKey;

  const fontClass = lang === 'fa' ? 'font-persian' : 'font-mono';
  const dir = lang === 'fa' ? 'rtl' : 'ltr';

  const handleThemeSelect = async (themeId: string) => {
    if (!hasKey) {
      alert("API KEY MISSING. Cannot generate narrative.");
      return;
    }
    setMode('generating');
    setIsMinimized(false);
    setError(null);
    const theme = THEMES.find(t => t.id === themeId);
    
    if (theme) {
      try {
        const data = await generateBerlinNarrative(apiKey, theme.promptContext, lang);
        setContent(data);
        setMode('reading');
      } catch (err) {
        setError(UI_TEXT.error[lang]);
        setMode('selection');
      }
    }
  };

  const handleHotspotClick = () => {
    if (mode === 'reading' && isMinimized) {
      setIsMinimized(false);
    } 
  };

  const handleRevealClick = () => {
    setMode('revealed');
  }

  const handleReset = () => {
    setContent(null);
    setMode('selection');
    setIsMinimized(false);
  };

  const isMapFocused = (mode === 'reading' && isMinimized) || mode === 'revealed';

  return (
    <div className={`relative w-full h-screen flex flex-col ${dir} overflow-hidden bg-berlin-black text-berlin-white`}>
      
      {/* Layer 0: The Base Reality (Map) */}
      <MapBackground 
        isIntro={mode === 'intro'}
        isFocused={isMapFocused} 
        coordinates={content?.coordinates}
        onHotspotClick={handleHotspotClick}
      />

      {/* Layer 1: The Palimpsest Interface (UI Overlay) */}
      <div className={`
        absolute inset-0 z-10 p-6 md:p-12 flex flex-col justify-between pointer-events-none
        transition-all duration-1000
        ${(mode === 'revealed' || (mode === 'reading' && isMinimized)) ? 'bg-transparent' : 'bg-berlin-black/30'}
      `}>
        
        {/* Header */}
        <header className={`flex justify-between items-start pointer-events-auto transition-opacity duration-500 ${mode === 'revealed' ? 'opacity-0' : 'opacity-100'}`}>
          <div className="border-l-4 border-neon-magenta pl-4 bg-black/40 backdrop-blur-md p-2">
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none text-shadow-neon">
              Berlin<br/>Palimpsest
            </h1>
            <p className="text-xs text-concrete mt-2 font-mono">DAAD ARTISTS-IN-BERLIN</p>
          </div>
          
          <div className="flex gap-2">
            {(['en', 'de', 'fa'] as Language[]).map((l) => (
              <button 
                key={l}
                onClick={() => setLang(l)}
                className={`w-10 h-10 border-2 text-sm font-bold no-radius transition-colors ${lang === l ? 'bg-white text-black border-white' : 'border-gray-700 text-gray-500 hover:border-gray-500 bg-black/80'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {/* MAIN CONTENT AREA */}
        <main className="flex-grow flex flex-col justify-center items-center pointer-events-auto max-w-4xl mx-auto w-full relative">
          
          {/* INTRO */}
          {mode === 'intro' && (
            <div className="text-center space-y-8 animate-in fade-in zoom-in duration-500 p-8 bg-black/70 border border-gray-800 backdrop-blur-sm shadow-2xl">
              <p className={`text-xl md:text-2xl leading-relaxed max-w-2xl text-neon-magenta font-bold ${fontClass}`}>
                 {lang === 'en' && "The city is a text written by other texts over time."}
                 {lang === 'de' && "Die Stadt ist ein Text, der durch andere Texte überschrieben wird."}
                 {lang === 'fa' && "شهر متنی است که در طول زمان توسط متن‌های دیگر بازنویسی می‌شود."}
              </p>
              <div className="w-full h-px bg-gray-600 my-4"></div>
              <p className={`text-lg md:text-xl leading-relaxed max-w-2xl ${fontClass}`}>
                {lang === 'en' && "The city is not a flat surface. It is a layering of memories. Scratch the surface to find the objective reality underneath."}
                {lang === 'de' && "Die Stadt ist keine flache Oberfläche. Sie ist eine Schichtung von Erinnerungen. Kratzen Sie an der Oberfläche, um die objektive Realität darunter zu finden."}
                {lang === 'fa' && "شهر سطحی هموار نیست. لایه‌بندی خاطرات است. سطح را بخراشید تا واقعیت عینی زیرین را بیابید."}
              </p>
              <BrutalistButton onClick={() => setMode('selection')}>
                {UI_TEXT.start[lang]}
              </BrutalistButton>
            </div>
          )}

          {/* SELECTION */}
          {mode === 'selection' && (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-bottom-10 duration-500">
               {error && <div className="col-span-full border-2 border-red-500 text-red-500 p-4 font-mono mb-4 bg-red-900/80">{error}</div>}
               <div className="col-span-full text-center mb-8">
                  <h2 className="text-concrete text-sm uppercase tracking-[0.2em] mb-2 bg-black px-4 py-1 border border-concrete inline-block">
                    {UI_TEXT.select[lang]}
                  </h2>
               </div>
               {THEMES.map(theme => (
                 <BrutalistButton key={theme.id} onClick={() => handleThemeSelect(theme.id)} className="h-32 text-xl bg-black/70 hover:bg-black/90 backdrop-blur-sm">
                   {theme.label[lang]}
                 </BrutalistButton>
               ))}
            </div>
          )}

          {/* GENERATING */}
          {mode === 'generating' && (
            <div className="flex flex-col items-center gap-4 bg-black/90 p-12 border border-neon-magenta z-50">
              <div className="w-16 h-16 border-4 border-t-neon-magenta border-r-transparent border-b-white border-l-transparent rounded-full animate-spin"></div>
              <p className="font-mono text-neon-magenta animate-pulse">{UI_TEXT.loading[lang]}</p>
            </div>
          )}

          {/* READING */}
          {mode === 'reading' && content && (
            <div 
              className={`
                relative w-full border-2 border-white bg-berlin-black p-8 md:p-12 
                shadow-[10px_10px_0px_0px_rgba(255,0,255,1)] 
                transition-all duration-500 transform
                ${isMinimized ? 'opacity-0 translate-y-20 scale-90 pointer-events-none' : 'opacity-100 translate-y-0 scale-100'}
                ${fontClass}
              `}
            >
              <div className="absolute -top-3 -left-3 w-6 h-6 bg-white z-20"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-neon-magenta z-20"></div>

              <button 
                onClick={() => setIsMinimized(true)}
                className="absolute top-0 right-0 p-4 hover:bg-white hover:text-black transition-colors border-l border-b border-gray-800"
              >
                <div className="w-4 h-1 bg-current"></div>
              </button>

              <div className="mb-6 flex justify-between items-end border-b border-gray-800 pb-4">
                <h2 className="text-2xl font-bold text-neon-magenta uppercase">{content.title}</h2>
                <span className="font-mono text-xs bg-white text-black px-2 py-1 mr-12">{content.locationName}</span>
              </div>
              
              <p className="text-lg md:text-xl leading-loose text-justify">
                {content.narrative}
              </p>

              <div className="mt-8 pt-6 border-t border-gray-800 text-center flex flex-col items-center gap-4">
                 <p className="text-xs text-concrete uppercase tracking-widest animate-pulse">
                   {lang === 'en' ? 'LOCATION IDENTIFIED' : lang === 'de' ? 'STANDORT IDENTIFIZIERT' : 'موقعیت شناسایی شد'}
                 </p>
                 <BrutalistButton onClick={handleRevealClick} className="w-full md:w-auto text-sm bg-neon-magenta/10 border-neon-magenta hover:bg-neon-magenta">
                   {UI_TEXT.reveal[lang]}
                 </BrutalistButton>
              </div>
            </div>
          )}

        </main>

        <footer className="pointer-events-auto h-12 flex items-end justify-between w-full">
           <span className="font-mono text-[10px] text-gray-400 bg-black/80 px-2 border border-gray-800">APP_V.1.0 // PALIMPSEST_ENGINE</span>
           
           {isMinimized && mode === 'reading' && (
             <span className="animate-bounce font-mono text-neon-magenta bg-black px-2 text-xs mr-4 mb-4 border border-neon-magenta shadow-[4px_4px_0_0_#fff]">
               {lang === 'en' ? 'TAP TARGET TO RESTORE' : lang === 'de' ? 'ZIEL ANTIPPEN ZUM WIEDERHERSTELLEN' : 'برای بازگرداندن روی هدف بزنید'}
             </span>
           )}
        </footer>
      </div>

      {/* Layer 2: The Truth (Revealed) */}
      {mode === 'revealed' && content && (
        <div className="absolute inset-0 z-30 pointer-events-none flex items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
           <div className="absolute top-6 right-6 pointer-events-auto">
              <BrutalistButton onClick={handleReset} className="bg-black border-neon-magenta text-sm py-2 px-4 shadow-[4px_4px_0_0_#ff00ff]">
                {UI_TEXT.back[lang]}
              </BrutalistButton>
           </div>

           <div className={`
              pointer-events-auto max-w-2xl w-full bg-berlin-white text-berlin-black p-8 
              border-l-8 border-neon-magenta shadow-2xl
              animate-in fade-in zoom-in-95 duration-700
              ${fontClass}
           `}>
              <div className="flex items-center gap-4 mb-4 border-b-2 border-black pb-2">
                <span className="bg-black text-white px-2 py-1 font-mono text-xs">{UI_TEXT.factLabel[lang]}</span>
                <span className="font-bold text-neon-magenta text-xl">{content.year}</span>
              </div>
              
              <p className="text-xl md:text-2xl font-bold leading-tight">
                {content.historicalFact}
              </p>

              <div className="mt-6 flex gap-2 font-mono text-[10px] text-gray-500 uppercase bg-gray-200 p-2 inline-block">
                 COORDINATES: {content.coordinates.lat.toFixed(4)}, {content.coordinates.lng.toFixed(4)}
              </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default App;