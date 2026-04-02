import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SOURCES = [
  { id: 'lacuarta', name: 'La Cuarta', url: 'https://www.lacuarta.com/espectaculos/', category: 'famosos' },
  { id: 'biobio', name: 'Bío-Bío', url: 'https://www.biobiochile.cl/lista/categorias/espectaculos-y-tv', category: 'tv-chilena' },
  { id: 'pagina7', name: 'Página 7', url: 'https://www.pagina7.cl/entretencion', category: 'tendencias' },
  { id: 'glamorama', name: 'Glamorama', url: 'https://www.lacuarta.com/glamorama/', category: 'famosos' },
  { id: 'lahora', name: 'La Hora', url: 'https://lahora.cl/categoria/entretencion/', category: 'tv-chilena' },
  { id: 'publimetro', name: 'Publimetro', url: 'https://www.publimetro.cl/entretenimiento/', category: 'tendencias' },
  { id: 't13', name: 'T13', url: 'https://www.t13.cl/espectaculos', category: 'tv-chilena' },
  { id: 'mega', name: 'Mega', url: 'https://www.mega.cl/entretenimiento/', category: 'tv-chilena' },
  { id: 'chv', name: 'CHV Noticias', url: 'https://www.chilevision.cl/noticias/show/', category: 'fiebre-de-baile' },
  { id: 'tvn', name: '24 Horas', url: 'https://www.24horas.cl/tendencias/espectaculos', category: 'musica' },
];

async function scrapeSource(source) {
  try {
    console.log(`Scraping ${source.name}...`);
    // Añadimos headers de navegador para evitar bloqueos por bot
    const response = await axios.get(source.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/113.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'es-CL,es;q=0.9,en;q=0.8'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    const articles = [];
    const seenTitles = new Set();
    
    // Heurística general para encontrar tarjetas de noticias
    // Buscamos elementos que comúnmente envuelven noticias
    let cards = $('article');
    if (cards.length < 3) {
       // Si no hay articles, buscamos contenedores de grid o anchors que incluyan imágenes
       cards = $('a:has(img), .card, .post, .item-noticia, .news-item, .box-nota');
    }

    cards.each((i, el) => {
      // Intentar encontrar el texto/título
      const titleEl = $(el).find('h1, h2, h3, h4').first();
      let title = '';
      if (titleEl.length > 0) {
        title = titleEl.text().trim();
      } else {
        title = $(el).text().trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      }
      
      // Si el texto es muy corto o muy largo, probablemente no es un buen título
      if (!title || title.length < 15 || title.length > 150) return;

      // Intentar encontrar la URL
      let linkRaw = $(el).find('a').attr('href');
      if (!linkRaw && el.tagName.toLowerCase() === 'a') {
        linkRaw = $(el).attr('href');
      }
      
      if (!linkRaw) return;
      
      let finalUrl = '';
      try {
        finalUrl = new URL(linkRaw, source.url).href;
      } catch (e) { return; }

      // Intentar encontrar la imagen
      let imgSrc = $(el).find('img').attr('src') || $(el).find('img').attr('data-src') || $(el).find('source').attr('srcset');
      // Asegurarse de que la imagen sea relativa a la ruta absoluta
      if (imgSrc && !imgSrc.startsWith('http') && !imgSrc.startsWith('data:')) {
         try { imgSrc = new URL(imgSrc, source.url).href; } catch(e){}
      }
      
      // Filtrar basura o íconos SVG/transparentes
      if (!imgSrc || imgSrc.includes('data:image/svg') || imgSrc.includes('transparent')) {
         // Alternative fallback for background images or lazy load
         const style = $(el).find('[style*="background-image"]').attr('style');
         if (style) {
            const urlMatch = style.match(/url\(['"]?(.*?)['"]?\)/);
            if (urlMatch && urlMatch[1]) imgSrc = urlMatch[1];
         }
      }

      if (title && finalUrl && imgSrc && !seenTitles.has(title)) {
        seenTitles.add(title);
        articles.push({
          id: Math.random().toString(36).substring(2, 9),
          title: title,
          source: source.id,
          url: finalUrl,
          category: source.category,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(), // Random time up to 24h as mock timestamp if none parsed
          image: imgSrc,
          tags: ['Actualidad']
        });
      }
    });

    console.log(`✓ ${source.name}: Encontradas ${articles.length} noticias.`);
    // Tomar solo las primeras 6 para no saturar
    return articles.slice(0, 6);
  } catch (error) {
    console.error(`✗ Error raspando ${source.name}: ${error.message}`);
    return [];
  }
}

async function runScraper() {
  console.log('Iniciando extracción de noticias en vivo...\n');
  let allNews = [];
  
  // Extraer concurrentemente
  const results = await Promise.allSettled(SOURCES.map(source => scrapeSource(source)));
  
  results.forEach(result => {
    if (result.status === 'fulfilled') {
      allNews = [...allNews, ...result.value];
    }
  });

  console.log(`\nExtracción completada. Total noticias guardadas: ${allNews.length}`);
  
  if (allNews.length > 0) {
    const outputPath = path.join(__dirname, '../src/data/scrapedNews.json');
    await fs.writeFile(outputPath, JSON.stringify(allNews, null, 2));
    console.log(`Datos exportados exitosamente a ${outputPath}`);
  }
}

runScraper();
