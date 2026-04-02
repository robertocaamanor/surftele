import React from 'react';
import NewsSection from '../components/NewsSection';
import { type NewsItem } from '../data/mockNews';

interface ProgramasProps {
  news: NewsItem[];
}

export default function Programas({ news }: ProgramasProps) {
  const keywordSearch = (arr, term) => arr.filter(n => n.title.toLowerCase().includes(term.toLowerCase()) || n.link.toLowerCase().includes(term.toLowerCase()));

  // Bloques específicos de realitys solicitados
  const fiebreNews = keywordSearch(news, 'fiebre');
  const internadoNews = keywordSearch(news, 'internado');
  const vecinosNews = keywordSearch(news, 'vecinos');
  const matinalesNews = keywordSearch(news, 'matinal');
  
  // Resto de tv chilena
  const allProgramas = news.filter(n => n.category === 'tv-chilena' || n.category === 'fiebre-de-baile');

  return (
    <div className="flex-1 bg-[#0f1115] overflow-y-auto custom-scrollbar">
      <div className="max-w-[850px] mx-auto py-8 px-4 w-full h-full">
         
         {/* Cabecera Tipo Google News */}
         <div className="flex items-center justify-center gap-3 mb-6 pb-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
            </div>
            <h1 className="text-[28px] font-normal tracking-tight text-white">Programas y Realities</h1>
         </div>
         
         {/* Pestañas de Navegación */}
         <div className="flex gap-2 mb-8 text-sm justify-center border-b border-gray-800 pb-4">
           <span className="px-4 py-1.5 bg-[#1a1d24] text-gray-300 rounded-full hover:bg-gray-800 transition cursor-pointer font-medium">Reciente</span>
           <span className="px-4 py-1.5 bg-blue-600/10 text-blue-400 rounded-full cursor-pointer font-bold border border-blue-600/30">Programas</span>
           <span className="px-4 py-1.5 bg-[#1a1d24] text-gray-300 rounded-full hover:bg-gray-800 transition cursor-pointer font-medium">Matinales</span>
         </div>

         {flexRenderSection('Fiebre de Baile (CHV)', fiebreNews)}
         {flexRenderSection('El Internado (Mega)', internadoNews)}
         {flexRenderSection('Vecinos al Límite (Canal 13)', vecinosNews)}
         {flexRenderSection('Batalla de Matinales', matinalesNews)}

         <NewsSection title="Actualidad Televisiva" articles={allProgramas} />
      </div>
    </div>
  );

  function flexRenderSection(title, articles) {
    if (articles.length === 0) return null;
    return <NewsSection title={title} articles={articles} />;
  }
}
