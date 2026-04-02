import React from 'react';
import { SOURCES, type NewsItem } from '../data/mockNews';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface NewsSectionProps {
  title: string;
  articles?: NewsItem[];
}

export default function NewsSection({ title, articles = [] }: NewsSectionProps) {
  if (!articles || articles.length === 0) return null;

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1, 4); // Max 3 on the side
  
  const getSourceInfo = (sourceStr) => {
    return SOURCES[sourceStr] || { name: sourceStr, icon: sourceStr, color: 'text-gray-400' };
  };

  const getMainSource = getSourceInfo(mainArticle.source);

  return (
    <div className="mb-8 border-b border-gray-800 pb-8">
      <h2 className="text-xl text-gray-200 font-medium mb-4 hover:underline cursor-pointer inline-flex items-center gap-1 group">
        {title} 
        <span className="text-gray-500 group-hover:text-gray-300">&gt;</span>
      </h2>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Noticia Principal (Izquierda) */}
        <div className="flex-1 md:w-3/5 group cursor-pointer">
          {mainArticle.image_url ? (
            <div className="rounded-2xl overflow-hidden mb-3 aspect-video relative">
              <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
              <img src={mainArticle.image_url} alt={mainArticle.title} className="w-full h-full object-cover" />
            </div>
          ) : (
             <div className="rounded-2xl bg-[#1f2228] mb-3 aspect-video flex items-center justify-center text-gray-700">Sin imagen principal</div>
          )}
          
          <div className="flex items-center gap-2 text-xs mb-2">
             <span className={`font-bold ${getMainSource.color} text-[10px]`}>{getMainSource.icon}</span>
          </div>
          
          <a href={mainArticle.link} target="_blank" rel="noreferrer" className="text-xl font-medium leading-tight mb-2 hover:text-blue-400 block text-gray-100">
            {mainArticle.title}
          </a>
          
          <span className="text-gray-400 text-xs mt-1 block">
             Hace {formatDistanceToNow(parseISO(mainArticle.published_at), { locale: es })}
          </span>
        </div>

        {/* Noticias Secundarias (Derecha) */}
        <div className="flex-1 md:w-2/5 flex flex-col gap-4">
          {sideArticles.map((article, idx) => {
            const srcInfo = getSourceInfo(article.source);
            return (
              <div key={idx} className="flex gap-4 group cursor-pointer border-b border-gray-800/50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 text-xs mb-1">
                     <span className={`font-bold ${srcInfo.color} text-[10px]`}>{srcInfo.icon}</span>
                  </div>
                  <a href={article.link} target="_blank" rel="noreferrer" className="text-sm font-medium leading-snug hover:text-blue-400 block text-gray-200">
                    {article.title}
                  </a>
                  <span className="text-gray-500 text-xs mt-1 block">
                     Ayer
                  </span>
                </div>
                {article.image_url && (
                   <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden relative">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10" />
                      <img src={article.image_url} alt={article.title} className="w-full h-full object-cover" />
                   </div>
                )}
              </div>
            );
          })}
          
          <button className="mt-2 w-full flex items-center justify-center gap-2 bg-[#2a2c33] hover:bg-[#343740] transition-colors py-2.5 rounded-full text-sm text-blue-400 font-medium border border-gray-700/50">
             <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
             Ver más títulos y perspectivas
          </button>
        </div>
      </div>
    </div>
  );
}
