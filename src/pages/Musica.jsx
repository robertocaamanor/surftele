import React from 'react';
import NewsSection from '../components/NewsSection';

export default function Musica({ news }) {
  const keywordSearch = (arr, term) => arr.filter(n => n.title.toLowerCase().includes(term.toLowerCase()));
  
  const musicaNews = news.filter(n => n.category === 'musica');
  const urbanoNews = keywordSearch(news, 'urbano').concat(keywordSearch(news, 'reggaeton'));
  const conciertosNews = keywordSearch(news, 'concierto').concat(keywordSearch(news, 'arena'));

  const chartsNews = news.filter(n => n.source === 'billboard' || n.source === 'officialcharts');
  const rockNews = news.filter(n => n.source === 'rollingstone');
  const artistasChilenosNews = news.filter(n => n.source === 'soloartistas');

  return (
    <div className="flex-1 bg-[#0f1115] overflow-y-auto custom-scrollbar">
      <div className="max-w-[850px] mx-auto py-8 px-4 w-full h-full">
         
         <div className="flex items-center justify-center gap-3 mb-6 pb-2">
            <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0">
               <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
            </div>
            <h1 className="text-[28px] font-normal tracking-tight text-white">Música</h1>
         </div>
         
         <div className="flex gap-2 mb-8 text-sm justify-center border-b border-gray-800 pb-4">
           <span className="px-4 py-1.5 bg-[#1a1d24] text-gray-300 rounded-full hover:bg-gray-800 transition cursor-pointer font-medium">Reciente</span>
           <span className="px-4 py-1.5 bg-purple-600/10 text-purple-400 rounded-full cursor-pointer font-bold border border-purple-600/30">Top Hits</span>
           <span className="px-4 py-1.5 bg-[#1a1d24] text-gray-300 rounded-full hover:bg-gray-800 transition cursor-pointer font-medium">Tours</span>
         </div>

         {urbanoNews.length > 0 && <NewsSection title="Género Urbano" articles={Array.from(new Set(urbanoNews))} />}
         {conciertosNews.length > 0 && <NewsSection title="Conciertos y Shows" articles={Array.from(new Set(conciertosNews))} />}
         {chartsNews.length > 0 && <NewsSection title="Charts Internacionales" articles={chartsNews} />}
         {rockNews.length > 0 && <NewsSection title="Rock & Pop Mundial" articles={rockNews} />}
         {artistasChilenosNews.length > 0 && <NewsSection title="Artistas Chilenos" articles={artistasChilenosNews} />}
         <NewsSection title="Noticias Musicales" articles={musicaNews} />
         
      </div>
    </div>
  );
}
