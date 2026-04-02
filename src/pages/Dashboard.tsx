import React from 'react';
import { Volume2, GripVertical, Plus } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CATEGORIES, SOURCES, type NewsItem } from '../data/mockNews';

interface NewsCardProps {
  news: NewsItem;
}

const NewsCard = ({ news }: NewsCardProps) => {
  const source = SOURCES[news.source] || { name: news.source, icon: news.source, color: 'text-gray-500' };
  
  return (
    <div className="bg-[#16191f] border border-gray-800 rounded-lg p-3 mb-4 hover:border-gray-600 transition-colors shadow-sm">
      <div className="flex items-center justify-between mb-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400">
            {formatDistanceToNow(parseISO(news.published_at || news.timestamp), { addSuffix: true, locale: es })}
          </span>
          <span className={`font-bold ${source.color}`}>{source.icon}</span>
        </div>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-gray-800 text-gray-300 tracking-wider uppercase border border-gray-700">
          {news.category.replace('-', ' ')}
        </span>
      </div>
      
      <a href={news.link} target="_blank" rel="noreferrer" className="text-sm font-medium leading-snug mb-3 hover:text-blue-400 transition-colors block">
        {news.title}
      </a>
      
      <a href={news.link} target="_blank" rel="noreferrer" className="flex gap-1 mb-3 bg-gray-800/50 p-1.5 rounded text-xs items-center text-blue-400 truncate cursor-pointer hover:bg-gray-800 transition-colors border border-gray-700/50">
        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
        <span className="truncate">Ver noticia completa</span>
      </a>
      
      {news.image_url && (
        <a href={news.link} target="_blank" rel="noreferrer" className="block rounded-md overflow-hidden h-32 mb-2 relative group cursor-pointer">
          <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors z-10" />
          <img src={news.image_url} alt={news.title} className="w-full h-full object-cover" />
        </a>
      )}
    </div>
  );
};

interface ColumnProps {
  category: { id: string; name: string; color: string };
  allNews: NewsItem[];
}

const Column = ({ category, allNews }: ColumnProps) => {
  const isAll = category.id === 'all';
  const filteredNews = isAll ? allNews : allNews.filter(n => n.category === category.id);
  
  return (
    <div className="flex flex-col h-full bg-[#0f1115] rounded-xl border border-gray-800 overflow-hidden w-[320px] flex-shrink-0 relative">
       {/* Top Border Accent */}
      <div className={`h-1 w-full ${category.color}`}></div>
      
      {/* Header */}
      <div className="px-4 py-3 flex items-center justify-between border-b border-gray-800/80 bg-[#14171d]">
        <div className="flex items-center gap-2">
          <GripVertical className="w-4 h-4 text-gray-500" />
          <h2 className="font-bold text-sm tracking-wider text-gray-100">{category.name}</h2>
          <span className="text-xs text-gray-500 font-medium ml-1">({filteredNews.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <button className="bg-gray-800 p-1.5 rounded hover:bg-gray-700 text-gray-300 transition border border-gray-700">
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      
      {/* Filter Input */}
      <div className="px-3 py-2 bg-[#12141a] border-b border-gray-800/80">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filter..." 
            className="w-full bg-[#1a1d24] text-xs text-gray-300 px-3 py-2 rounded-md outline-none border border-gray-800 focus:border-gray-600 focus:bg-[#1e222a] transition-colors"
          />
        </div>
      </div>
      
      {/* Content Scrollable Area */}
      <div className="flex-1 overflow-y-auto p-3 bg-[#0a0c0f] custom-scrollbar">
        {filteredNews.length > 0 ? (
          filteredNews.map(news => <NewsCard key={news.id} news={news} />)
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 text-sm">
            Sin noticias recientes
          </div>
        )}
      </div>

       {/* Footer Status */}
       <div className="px-4 py-2 bg-[#14171d] border-t border-gray-800 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-widest z-10">
        <span>Feed: {category.name}</span>
        <div className="flex items-center gap-1.5 text-brand-green">
          <div className="w-1.5 h-1.5 rounded-full bg-brand-green animate-pulse" />
          ACTIVE
        </div>
      </div>
    </div>
  );
};

interface DashboardProps {
  news: NewsItem[];
}

export default function Dashboard({ news }: DashboardProps) {
  return (
    <main className="flex-1 overflow-x-auto overflow-y-hidden p-4 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-opacity-5">
      <div className="flex h-full gap-4 pb-2 items-stretch" style={{ width: 'max-content' }}>
        {CATEGORIES.map(cat => (
          <Column key={cat.id} category={cat} allNews={news} />
        ))}
        
        {/* Add Column Button */}
        <div className="flex flex-col h-full w-[320px] rounded-xl border border-gray-800 border-dashed bg-[#0f1115]/50 items-center justify-center cursor-pointer hover:bg-[#16191f]/80 transition-colors group">
          <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-gray-400 group-hover:text-white" />
          </div>
          <span className="text-sm font-medium text-gray-400 group-hover:text-gray-200">Añadir Feed de Noticias</span>
        </div>
      </div>
    </main>
  );
}
