/**
 * Fetches property images from the Spanish Catastro (OVC) services.
 * Images are used only for PDF generation — never stored in the database.
 *
 * Three image types:
 *  - Facade photo: SOAP service at OVCFotoFachada
 *  - Parcel scheme: GeneraMapa.aspx?tipo=G — clearly highlights the specific parcel
 *  - Cartographic map: WMS GetMap with the parcel bounding box (geographic context)
 */

const FOTO_FACHADA_ENDPOINT =
  'https://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCFotoFachada.svc';

const GENERA_MAPA_BASE =
  'https://www1.sedecatastro.gob.es/Cartografia/GeneraMapa.aspx';

const WMS_ENDPOINT =
  'https://ovc.catastro.meh.es/cartografia/WMS/ServidorWMS.aspx';

const FETCH_TIMEOUT_MS = 6000;

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ---------------------------------------------------------------------------
// Facade photo — SOAP
// ---------------------------------------------------------------------------

function buildFacadeSoapBody(rc: string): string {
  return `<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:tem="http://tempuri.org/">
  <soap:Body>
    <tem:RecuperarFotoFachada>
      <tem:Provincia></tem:Provincia>
      <tem:Municipio></tem:Municipio>
      <tem:RC>${rc}</tem:RC>
    </tem:RecuperarFotoFachada>
  </soap:Body>
</soap:Envelope>`;
}

/** Extract base64 content from the <raster> element in the SOAP response XML. */
function extractRasterBase64(xml: string): string | null {
  const match = xml.match(/<raster[^>]*>([\s\S]*?)<\/raster>/i);
  if (!match) return null;
  const raw = match[1].replace(/\s/g, '');
  return raw.length > 100 ? raw : null;
}

export async function fetchCatastroFacadeImage(
  cadastralReference: string,
): Promise<string | null> {
  try {
    const response = await fetch(FOTO_FACHADA_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        SOAPAction: '"http://tempuri.org/IOVCFotoFachada/RecuperarFotoFachada"',
      },
      body: buildFacadeSoapBody(cadastralReference),
      signal: withTimeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const xml = await response.text();
    const base64 = extractRasterBase64(xml);
    if (!base64) return null;
    return `data:image/jpeg;base64,${base64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parcel scheme — GeneraMapa.aspx?tipo=G  (highlights the specific parcel)
// ---------------------------------------------------------------------------

/**
 * The RC passed to GeneraMapa must be the 14-character parcel reference
 * (the first 14 chars of the full 20-char cadastral reference).
 * Returns a GIF/PNG with the parcel clearly highlighted.
 */
export async function fetchCatastroParcelScheme(
  cadastralReference: string,
): Promise<string | null> {
  try {
    const rc14 = cadastralReference.slice(0, 14);
    const params = new URLSearchParams({ tipo: 'G', RC: rc14 });
    const response = await fetch(`${GENERA_MAPA_BASE}?${params.toString()}`, {
      signal: withTimeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    // Catastro returns GIF or PNG; detect from content-type
    const mime = contentType.includes('gif') ? 'image/gif' : 'image/png';
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Cartographic map — WMS GetMap
// ---------------------------------------------------------------------------

const MAP_WIDTH = 400;
const MAP_HEIGHT = 300;
// Buffer in decimal degrees around the property centre (~200 m at mid-latitudes)
const MAP_BUFFER_DEG = 0.0015;

export async function fetchCatastroMapImage(
  lat: number,
  lng: number,
): Promise<string | null> {
  try {
    const minLng = (lng - MAP_BUFFER_DEG).toFixed(6);
    const minLat = (lat - MAP_BUFFER_DEG * (MAP_HEIGHT / MAP_WIDTH)).toFixed(6);
    const maxLng = (lng + MAP_BUFFER_DEG).toFixed(6);
    const maxLat = (lat + MAP_BUFFER_DEG * (MAP_HEIGHT / MAP_WIDTH)).toFixed(6);

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.1.1',
      REQUEST: 'GetMap',
      LAYERS: 'Catastro',
      STYLES: '',
      FORMAT: 'image/png',
      BGCOLOR: '0xFFFFFF',
      TRANSPARENT: 'FALSE',
      WIDTH: String(MAP_WIDTH),
      HEIGHT: String(MAP_HEIGHT),
      SRS: 'EPSG:4326',
      BBOX: `${minLng},${minLat},${maxLng},${maxLat}`,
    });

    const response = await fetch(`${WMS_ENDPOINT}?${params.toString()}`, {
      signal: withTimeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) return null;

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Combined helper
// ---------------------------------------------------------------------------

export interface CatastroImages {
  facadeDataUri?: string;
  /** Parcel scheme from GeneraMapa.aspx?tipo=G — clearly highlights the specific parcel. */
  schemeDataUri?: string;
  mapDataUri?: string;
}

export async function fetchCatastroImages(
  cadastralReference: string | undefined,
  lat: number | undefined,
  lng: number | undefined,
): Promise<CatastroImages> {
  const [facadeDataUri, schemeDataUri, mapDataUri] = await Promise.all([
    cadastralReference ? fetchCatastroFacadeImage(cadastralReference) : Promise.resolve(null),
    cadastralReference ? fetchCatastroParcelScheme(cadastralReference) : Promise.resolve(null),
    lat != null && lng != null ? fetchCatastroMapImage(lat, lng) : Promise.resolve(null),
  ]);
  return {
    facadeDataUri: facadeDataUri ?? undefined,
    schemeDataUri: schemeDataUri ?? undefined,
    mapDataUri: mapDataUri ?? undefined,
  };
}
