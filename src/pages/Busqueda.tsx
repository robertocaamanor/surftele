import React, { useState } from 'react';
import { Search, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { SOURCES, type NewsItem } from '../data/mockNews';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Busqueda() {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingWeb, setIsFetchingWeb] = useState(false);
  const [results, setResults] = useState<NewsItem[] | null>(null);
  const [lastQuery, setLastQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || isSearching) return;

    const trimmed = query.trim();
    setIsSearching(true);
    setIsFetchingWeb(true);
    setLastQuery(trimmed);
    setResults(null);

    try {
      // Invocar la Edge Function en modo preview: busca en Google News (30d) sin guardar en BD
      const { data, error } = await supabase.functions.invoke('fetch-news', {
        body: { query: trimmed, preview: true },
      });

      if (error) throw error;
      setResults(data?.noticias ?? []);
    } catch (err) {
      console.error('Error en búsqueda:', err);
      setResults([]);
    } finally {
      setIsFetchingWeb(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0f1115] overflow-y-auto custom-scrollbar">
      <div className="max-w-[750px] mx-auto py-10 px-4 w-full">

        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-600/20 border border-blue-600/30 flex items-center justify-center">
            <Search className="w-5 h-5 text-blue-400" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-white">Buscador IA</h1>
          <p className="text-sm text-gray-500 text-center">Escribe un término y la IA buscará noticias relevantes en los medios</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-10">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ej: Shakira, Fiebre de Baile, CHV..."
              className="w-full bg-[#16191f] border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-sm text-gray-200 placeholder-gray-500 outline-none focus:border-blue-500/60 transition-colors"
              disabled={isSearching}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSearching || !query.trim()}
            className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 rounded-lg transition-colors flex items-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {isSearching ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* Searching indicator */}
        {isSearching && (
          <div className="flex flex-col items-center gap-4 py-16 text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            {isFetchingWeb ? (
              <>
                <p className="text-sm text-gray-300 font-medium">Buscando en Google News con IA...</p>
                <p className="text-xs text-gray-600">Esto puede tomar hasta un minuto mientras se clasifican las noticias</p>
              </>
            ) : (
              <p className="text-sm">Cargando resultados...</p>
            )}
          </div>
        )}

        {/* Results */}
        {!isSearching && results !== null && (
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-4">
              {results.length > 0
                ? `${results.length} resultado${results.length !== 1 ? 's' : ''} para "${lastQuery}"`
                : `Sin resultados para "${lastQuery}"`}
            </p>

            {results.length === 0 && (
              <div className="flex flex-col items-center py-16 text-gray-600 gap-2">
                <Search className="w-10 h-10" />
                <p className="text-sm">No se encontraron noticias con ese término.</p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              {results.map((item) => {
                const src = SOURCES[item.source] || { name: item.source, icon: item.source, color: 'text-gray-400' };
                return (
                  <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex gap-4 bg-[#16191f] border border-gray-800 rounded-xl p-4 hover:border-gray-600 transition-colors group"
                  >
                    {item.image_url && (
                      <div className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden">
                        <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-bold uppercase ${src.color}`}>{src.icon}</span>
                        <span className="text-[10px] text-gray-600">·</span>
                        <span className="text-[10px] text-gray-500">
                          {formatDistanceToNow(parseISO(item.published_at), { addSuffix: true, locale: es })}
                        </span>
                        <span className="ml-auto text-[10px] px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded uppercase tracking-wider border border-gray-700">
                          {item.category.replace('-', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-200 group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                        {item.title}
                      </p>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 self-start mt-1 transition-colors" />
                  </a>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state before first search */}
        {!isSearching && results === null && (
          <div className="flex flex-col items-center py-20 text-gray-700 gap-2">
            <Search className="w-12 h-12" />
            <p className="text-sm">Ingresa un término para comenzar</p>
          </div>
        )}

      </div>
    </div>
  );
}
