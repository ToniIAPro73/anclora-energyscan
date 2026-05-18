import type { SpainRegionCode } from './constants';

// Maps the first 2 digits of a Spanish postal code to its CCAA code
const ZIP_PREFIX_TO_REGION: Record<string, SpainRegionCode> = {
  '01': 'PVA', // Álava
  '02': 'CLM', // Albacete
  '03': 'VAL', // Alicante
  '04': 'AND', // Almería
  '05': 'CLE', // Ávila
  '06': 'EXT', // Badajoz
  '07': 'BAL', // Baleares
  '08': 'CAT', // Barcelona
  '09': 'CLE', // Burgos
  '10': 'EXT', // Cáceres
  '11': 'AND', // Cádiz
  '12': 'VAL', // Castellón
  '13': 'CLM', // Ciudad Real
  '14': 'AND', // Córdoba
  '15': 'GAL', // A Coruña
  '16': 'CLM', // Cuenca
  '17': 'CAT', // Girona
  '18': 'AND', // Granada
  '19': 'CLM', // Guadalajara
  '20': 'PVA', // Gipuzkoa
  '21': 'AND', // Huelva
  '22': 'ARA', // Huesca
  '23': 'AND', // Jaén
  '24': 'CLE', // León
  '25': 'CAT', // Lleida
  '26': 'LRI', // La Rioja
  '27': 'GAL', // Lugo
  '28': 'MAD', // Madrid
  '29': 'AND', // Málaga
  '30': 'MUR', // Murcia
  '31': 'NAV', // Navarra
  '32': 'GAL', // Ourense
  '33': 'AST', // Asturias
  '34': 'CLE', // Palencia
  '35': 'CAN', // Las Palmas
  '36': 'GAL', // Pontevedra
  '37': 'CLE', // Salamanca
  '38': 'CAN', // Santa Cruz de Tenerife
  '39': 'CNT', // Cantabria
  '40': 'CLE', // Segovia
  '41': 'AND', // Sevilla
  '42': 'CLE', // Soria
  '43': 'CAT', // Tarragona
  '44': 'ARA', // Teruel
  '45': 'CLM', // Toledo
  '46': 'VAL', // Valencia
  '47': 'CLE', // Valladolid
  '48': 'PVA', // Bizkaia
  '49': 'CLE', // Zamora
  '50': 'ARA', // Zaragoza
  '51': 'CEU', // Ceuta
  '52': 'MEL', // Melilla
};

export function zipToRegion(zip: string): SpainRegionCode | null {
  const prefix = zip.replace(/\D/g, '').slice(0, 2);
  return ZIP_PREFIX_TO_REGION[prefix] ?? null;
}

// Extracts the first valid 5-digit Spanish postal code from free text
export function extractZipFromText(text: string): string | null {
  const match = text.match(/\b(0[1-9]|[1-4]\d|5[0-2])\d{3}\b/);
  return match ? match[0] : null;
}
