import { subMinutes } from 'date-fns';

const now = new Date();

export const CATEGORIES = [
  { id: 'all', name: 'TODAS', color: 'bg-gray-700' },
  { id: 'tv-chilena', name: 'TV CHILENA', color: 'bg-brand-blue' },
  { id: 'fiebre-de-baile', name: 'FIEBRE DE BAILE', color: 'bg-brand-pink' },
  { id: 'musica', name: 'MÚSICA', color: 'bg-brand-purple' },
  { id: 'famosos', name: 'FAMOSOS', color: 'bg-brand-green' },
  { id: 'tendencias', name: 'TENDENCIAS', color: 'bg-brand-orange' },
];

export const SOURCES = {
  lacuarta: { name: 'La Cuarta', icon: 'LA CUARTA', color: 'text-red-500' },
  biobio: { name: 'Bío-Bío', icon: 'BÍO-BÍO', color: 'text-blue-500' },
  pagina7: { name: 'Página 7', icon: 'PÁGINA 7', color: 'text-orange-500' },
  glamorama: { name: 'Glamorama', icon: 'GLAMORAMA', color: 'text-pink-500' },
  lahora: { name: 'La Hora', icon: 'LA HORA', color: 'text-yellow-500' },
  publimetro: { name: 'Publimetro', icon: 'PUBLIMETRO', color: 'text-green-500' },
  t13: { name: 'T13', icon: 'T13', color: 'text-orange-600' },
  mega: { name: 'Mega', icon: 'MEGA', color: 'text-purple-600' },
  chv: { name: 'CHV Noticias', icon: 'CHV', color: 'text-red-600' },
  tvn: { name: '24 Horas', icon: '24 HORAS', color: 'text-blue-600' },
  billboard: { name: 'Billboard', icon: 'BILLBOARD', color: 'text-yellow-400' },
  officialcharts: { name: 'Official Charts', icon: 'OFF. CHARTS', color: 'text-green-400' },
  rollingstone: { name: 'Rolling Stone', icon: 'ROLLING STONE', color: 'text-red-400' },
  soloartistas: { name: 'Solo Artistas Chilenos', icon: 'ARTISTAS CL', color: 'text-sky-400' },
};

