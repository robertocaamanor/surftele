import React, { useState, useEffect } from 'react';
import { Settings, RefreshCw, Radio, Search } from 'lucide-react';
// Force Vite HMR reload
import { supabase } from './lib/supabase';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Programas from './pages/Programas';
import Musica from './pages/Musica';
import Busqueda from './pages/Busqueda';
import { CATEGORIES, SOURCES, type NewsItem } from './data/mockNews';

function App() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const location = useLocation();

  const isFetchingEdge = React.useRef(false);

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

  const invokeEdgeFunction = React.useCallback(async () => {
    if (isFetchingEdge.current) return;
    isFetchingEdge.current = true;
    console.log('[Auto] Invocando fetch-news para buscar noticias nuevas...');
    try {
      await supabase.functions.invoke('fetch-news');
    } catch (err) {
      console.error('[Auto] Error invocando fetch-news:', err);
    } finally {
      isFetchingEdge.current = false;
    }
  }, []);
  
  // Carga inicial y suscripción a Supabase
  useEffect(() => {
    fetchNews();
    invokeEdgeFunction();

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

    // Invocar la Edge Function cada 2 minutos para scrape de noticias nuevas
    const edgeInterval = setInterval(invokeEdgeFunction, 2 * 60 * 1000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(timeInterval);
      clearInterval(edgeInterval);
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
            <Link to="/busqueda" className={`hidden lg:flex items-center gap-1.5 ml-2 px-3 py-1.5 rounded-full border transition-colors text-[11px] font-medium ${ location.pathname === '/busqueda' ? 'border-blue-500/40 bg-blue-500/10 text-blue-400' : 'border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600'}`}>
              <Search className="w-3 h-3" />
              Buscar IA
            </Link>
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
          <Route path="/busqueda" element={<Busqueda />} />
        </Routes>

    </div>
  );
}

export default App;
