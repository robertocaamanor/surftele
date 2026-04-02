import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Radio, Search, Loader2 } from 'lucide-react';
// Force Vite HMR reload
import { supabase } from './lib/supabase';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Programas from './pages/Programas';
import Musica from './pages/Musica';
import { CATEGORIES, SOURCES, type NewsItem } from './data/mockNews';

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const location = useLocation();

  const fetchNews = React.useCallback(async () => {
    setIsRefreshing(true);
    console.log('[Intervalo] Actualizando feed desde Supabase...');
    const limite24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data, error } = await supabase
      .from('news_feed')
      .select('*')
      .gte('published_at', limite24Horas)
      .order('published_at', { ascending: false })
      .limit(50);
    if (!error && data) setNews(data);
    setIsRefreshing(false);
  }, []);
  
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;
    
    setIsSearching(true);
    try {
      // Invocamos la función con el término a buscar (Supabase se encarga de auth y URL mágicamente)
      await supabase.functions.invoke('fetch-news', {
        body: { query: searchQuery }
      });
    } catch (err) {
      console.error("Error ejecutando la búsqueda remota:", err);
    }
    setSearchQuery('');
    setIsSearching(false);
  };

  // Carga inicial y suscripción a Supabase
  useEffect(() => {
    fetchNews();

    // Suscribirse a cambios en tiempo real (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('news_feed_realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'news_feed' },
        (payload) => {
          setNews((prev) => [payload.new, ...prev]);
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'news_feed' },
        (payload) => {
          setNews((prev) =>
            prev.map((n) => (n.id === payload.new.id ? payload.new : n))
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'news_feed' },
        (payload) => {
          setNews((prev) => prev.filter((n) => n.id !== payload.old.id));
        }
      )
      .subscribe((status) => {
        setIsLive(status === 'SUBSCRIBED');
      });

    // Actualizar el feed desde la base de datos cada minuto
    const timeInterval = setInterval(() => {
      fetchNews();
    }, 60000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timeInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#07080b] flex flex-col font-sans text-gray-200 overflow-hidden h-screen">
      
      {/* Top Navbar */}
      <header className="h-14 border-b border-gray-800 bg-[#0f1115] flex items-center justify-between px-6 flex-shrink-0 z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-white" />
            <span className="font-bold text-lg tracking-wide text-white">sonda</span>
          </div>
          
          <nav className="hidden md:flex gap-6 text-sm font-medium items-center">
            <Link to="/" className={location.pathname === '/' ? "text-blue-400 font-bold" : "text-gray-400 hover:text-gray-200 transition-colors"}>Portadas</Link>
            <Link to="/programas" className={location.pathname === '/programas' ? "text-blue-400 font-bold" : "text-gray-400 hover:text-gray-200 transition-colors hidden lg:block"}>Programas</Link>
            <Link to="/musica" className={location.pathname === '/musica' ? "text-blue-400 font-bold" : "text-gray-400 hover:text-gray-200 transition-colors hidden lg:block"}>Música</Link>
            
            <form onSubmit={handleSearch} className="relative flex items-center ml-2 lg:ml-6 group">
              <input 
                type="text" 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar a la IA..." 
                className="bg-[#1a1d24] text-[11px] text-gray-200 pl-8 pr-8 py-1.5 rounded-full outline-none border border-gray-700/50 focus:border-brand-blue/50 w-48 transition-all duration-300 focus:w-64 placeholder-gray-500 disabled:opacity-50 shadow-inner"
                disabled={isSearching}
              />
              <Search className={`w-3.5 h-3.5 absolute left-3 transition-colors ${isSearching ? 'text-gray-600' : 'text-gray-400 group-hover:text-brand-blue'}`} />
              
              {isSearching && (
                <div className="absolute right-3">
                  <Loader2 className="w-3.5 h-3.5 text-brand-blue animate-spin" />
                </div>
              )}
            </form>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-colors ${
            isLive
              ? 'bg-green-500/10 border-green-500/20'
              : 'bg-yellow-500/10 border-yellow-500/20'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isLive ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'
            }`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${
              isLive ? 'text-green-500' : 'text-yellow-500'
            }`}>{isLive ? 'Live' : 'Conectando...'}</span>
          </div>
          <span className="text-xs text-gray-500 hidden lg:block">Actualización en tiempo real</span>
          
          <div className="h-4 w-px bg-gray-800 mx-2" />
          
          <button className="text-xs font-semibold bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded transition border border-gray-700">
            Configurar Columnas (6)
          </button>
          
          <button className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition border border-gray-700 text-gray-300">
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={fetchNews}
            disabled={isRefreshing}
            className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded transition border border-gray-700 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

        <Routes>
          <Route path="/" element={<Dashboard news={news} />} />
          <Route path="/programas" element={<Programas news={news} />} />
          <Route path="/musica" element={<Musica news={news} />} />
        </Routes>

    </div>
  );
}

export default App;
