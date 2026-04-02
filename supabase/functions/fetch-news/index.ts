import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"
import { extract } from "https://esm.sh/@extractus/feed-extractor@7.1.1"

// Variables de entorno de Supabase y Gemini
// SUPABASE_URL y SUPABASE_ANON_KEY son automáticas en las Edge Functions
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
// ATENCIÓN: Usamos SERVICE_ROLE_KEY para ignorar las Row Level Security (RLS) al insertar
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')! 
const geminiApiKey = Deno.env.get('GEMINI_API_KEY')!

const supabase = createClient(supabaseUrl, supabaseKey)

// Función para traducir un título en inglés al español con Gemini
async function traducirTitulo(titulo: string): Promise<string> {
  const prompt = `Traduce este titular de noticias musicales al español neutro, de forma concisa y periodística. Responde ÚNICAMENTE con el titular traducido, sin comillas ni explicaciones.\n\nTitular: ${titulo}`;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`traducirTitulo HTTP ${res.status}:`, errBody);
      return titulo;
    }
    const data = await res.json();
    const traduccion = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!traduccion) {
      console.error("traducirTitulo: respuesta vacía de Gemini, raw:", JSON.stringify(data).slice(0, 200));
    }
    return traduccion || titulo;
  } catch (e) {
    console.error("traducirTitulo error:", (e as Error).message);
    return titulo;
  }
}

// Función para llamar a Gemini y categorizar
async function categorizarNoticia(titulo: string, descripcion: string) {
  const prompt = `
  Eres un categorizador de noticias chileno para un canal de dashboard de TV.
  Debes clasificar esta noticia en EXACTAMENTE UNA de estas categorías:
  'tv-chilena', 'fiebre-de-baile', 'musica', 'famosos', 'tendencias'.
  
  Reglas esenciales:
  - Responde ÚNICAMENTE con el ID de la categoría (ej: tv-chilena).
  - No uses comillas, ni símbolos, ni oraciones extra. Solo la palabra o frase separada por guión.
  - Si una noticia trata sobre un artista pero está relacionada con televisión, prioriza 'tv-chilena'.
  - Si trata sobre cantantes, es 'musica'.
  - Si trata de farándula sin programa específico, 'famosos'.
  - Sobre el estelar de baile en Chile, 'fiebre-de-baile'.
  - Si no encaja en nada o es general, 'tendencias'.
  
  Título de la noticia: ${titulo}
  Extracto: ${descripcion}
  `;

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });
    
    if(!res.ok) {
        console.error("Gemini API Error:", res.statusText);
        return 'tendencias';
    }

    const data = await res.json();
    let categoria = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim().toLowerCase() || 'tendencias';
    
    const validCategorias = ['tv-chilena', 'fiebre-de-baile', 'musica', 'famosos', 'tendencias'];
    if (!validCategorias.includes(categoria)) categoria = 'tendencias';
    
    return categoria;
  } catch (error) {
    console.error("Error contactando a Gemini:", error);
    return 'tendencias';
  }
}

// URLs de Google News y feeds directos
const FEEDS: { url: string; source: string; defaultCategory?: string; translateToSpanish?: boolean }[] = [
  // Medios Específicos Chile
  { url: "https://news.google.com/rss/search?q=espectaculos+when:24h+site:lacuarta.com&hl=es-419&gl=CL&ceid=CL:es-419", source: "lacuarta" },
  { url: "https://news.google.com/rss/search?q=espectaculos+when:24h+site:biobiochile.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "biobio" },
  { url: "https://news.google.com/rss/search?q=entretencion+when:24h+site:pagina7.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "pagina7" },
  { url: "https://news.google.com/rss/search?q=when:24h+site:lacuarta.com/glamorama&hl=es-419&gl=CL&ceid=CL:es-419", source: "glamorama" },
  { url: "https://news.google.com/rss/search?q=entretencion+when:24h+site:lahora.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "lahora" },
  { url: "https://news.google.com/rss/search?q=entretenimiento+when:24h+site:publimetro.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "publimetro" },
  { url: "https://news.google.com/rss/search?q=espectaculos+when:24h+site:t13.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "t13" },
  { url: "https://news.google.com/rss/search?q=entretenimiento+when:24h+site:mega.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "mega" },
  { url: "https://news.google.com/rss/search?q=show+when:24h+site:chilevision.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "chv" },
  { url: "https://news.google.com/rss/search?q=espectaculos+when:24h+site:24horas.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "tvn" },

  // Categorías amplias de refuerzo Chile
  { url: "https://news.google.com/rss/search?q=TV+Chilena+farándula+when:24h&hl=es-419&gl=CL&ceid=CL:es-419", source: "Google News" },
  { url: "https://news.google.com/rss/search?q=Fiebre+de+Baile+CHV+when:24h&hl=es-419&gl=CL&ceid=CL:es-419", source: "Google News" },

  // Música Internacional (categoría fija + traducción automática)
  { url: "https://www.billboard.com/c/music/feed/", source: "billboard", defaultCategory: "musica", translateToSpanish: true },
  { url: "https://www.rollingstone.com/music/feed/", source: "rollingstone", defaultCategory: "musica", translateToSpanish: true },
  { url: "https://news.google.com/rss/search?q=music+charts+when:24h+site:officialcharts.com&hl=en-US&gl=GB&ceid=GB:en", source: "officialcharts", defaultCategory: "musica", translateToSpanish: true },

  // Artistas Chilenos (categoría fija, ya en español)
  { url: "https://news.google.com/rss/search?q=artistas+chilenos+musica+when:24h+site:soloartistaschilenos.cl&hl=es-419&gl=CL&ceid=CL:es-419", source: "soloartistas", defaultCategory: "musica" },
];

serve(async (req) => {
  // CORS handles
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Expose-Headers': 'Content-Length, X-JSON',
      'Access-Control-Allow-Headers': 'apikey,X-Client-Info, Content-Type, Authorization, Accept, Accept-Language, X-Authorization',
    }})
  }

  try {
    let customQuery = null;
    if (req.method === 'POST') {
      try {
        const bodyText = await req.text();
        if (bodyText) {
          const body = JSON.parse(bodyText);
          if (body.query) customQuery = body.query;
        }
      } catch (e) {
        // ignore if not valid JSON
      }
    }

    let feedsToProcess: typeof FEEDS = FEEDS;

    if (customQuery) {
       console.log("Búsqueda personalizada detectada:", customQuery);
       feedsToProcess = [
         { url: `https://news.google.com/rss/search?q=${encodeURIComponent(customQuery)}+when:24h&hl=es-419&gl=CL&ceid=CL:es-419`, source: "Google News" }
       ];
    }

    const noticiasProcesadas = [];
    let llamadasGemini = 0;
    const MAX_LLAMADAS_GEMINI = 8; // ~10 RPM free tier, dejamos margen
    
    for (const feedConfig of feedsToProcess) {
      if (llamadasGemini >= MAX_LLAMADAS_GEMINI) break; // Evitar saturar Gemini
      console.log("Extrayendo de:", feedConfig.url);
      const feed = await extract(feedConfig.url); // Extractor de XML ligero
      
      if (!feed || !feed.entries) continue;
      
      const recentEntries = feed.entries.slice(0, 2); // 2 por fuente para no exceder cuotas
      
      const limite24Horas = new Date(Date.now() - 24 * 60 * 60 * 1000);

      for (const item of recentEntries) {
        // Filtrar estricto 24 horas por código también
        const fechaPub = new Date(item.published || Date.now());
        if (fechaPub < limite24Horas) continue;

        // Verificar existencia en base de datos para no duplicar
        const { data: existente } = await supabase
          .from('news_feed')
          .select('id')
          .eq('link', item.link)
          .single();
          
        if (!existente && llamadasGemini < MAX_LLAMADAS_GEMINI) {
          // Categorizar: si el feed ya tiene categoría fija, no llamamos a Gemini
          let categoria: string;
          if (feedConfig.defaultCategory) {
            categoria = feedConfig.defaultCategory;
          } else {
            categoria = await categorizarNoticia(
              item.title || "",
              item.description || item.title || ""
            );
            llamadasGemini++;
            await new Promise(r => setTimeout(r, 7000)); // 7s → respeta ~8 RPM
          }

          // Traducir título si el feed viene en inglés
          let titulo: string;
          if (feedConfig.translateToSpanish) {
            titulo = await traducirTitulo(item.title || "");
            llamadasGemini++;
            await new Promise(r => setTimeout(r, 7000));
          } else {
            titulo = item.title || "";
          }
          
          const noticiaData = {
            title: titulo,
            link: item.link,
            source: feedConfig.source,
            category: categoria,
            published_at: item.published || new Date().toISOString()
          };
          
          await supabase.from('news_feed').insert([noticiaData]);
          noticiasProcesadas.push(noticiaData);
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      procesadas: noticiasProcesadas.length,
      noticias: noticiasProcesadas
    }), { headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } })
    
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json", 'Access-Control-Allow-Origin': '*' } 
    })
  }
})
