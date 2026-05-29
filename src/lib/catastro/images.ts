/**
 * Fetches property images from the Spanish Catastro (OVC) services.
 * Images are used only for PDF generation — never stored in the database.
 *
 * Two working image types:
 *  - Facade photo: GET /RecuperarFotoFachadaGet?ReferenciaCatastral=&Delegacion=&Municipio=
 *  - Cartographic map: WMS GetMap centred on the parcel coordinates
 *
 * Note: GeneraMapa.aspx (parcel scheme/croquis) requires a browser session cookie and
 * cannot be fetched server-side. WMS is used instead as it works without auth.
 */

const FOTO_FACHADA_ENDPOINT =
  'http://ovc.catastro.meh.es/OVCServWeb/OVCWcfLibres/OVCFotoFachada.svc';

const WMS_ENDPOINT =
  'https://ovc.catastro.meh.es/cartografia/WMS/ServidorWMS.aspx';

const INSPIRE_WFS_ENDPOINT =
  'https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx';

const FETCH_TIMEOUT_MS = 6000;

function withTimeout(ms: number): AbortSignal {
  return AbortSignal.timeout(ms);
}

// ---------------------------------------------------------------------------
// Facade photo — GET RecuperarFotoFachadaGet
// ---------------------------------------------------------------------------

/**
 * Fetches the facade photo via the Catastro GET endpoint.
 * Delegacion and Municipio can be empty strings; the service resolves from RC.
 * Returns a JPEG data URI or null if no photo exists for this parcel.
 */
export async function fetchCatastroFacadeImage(
  cadastralReference: string,
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      ReferenciaCatastral: cadastralReference,
      Delegacion: '',
      Municipio: '',
    });
    const response = await fetch(
      `${FOTO_FACHADA_ENDPOINT}/RecuperarFotoFachadaGet?${params.toString()}`,
      { signal: withTimeout(FETCH_TIMEOUT_MS) },
    );

    if (!response.ok) return null;
    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) return null;

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength < 100) return null;
    const base64 = Buffer.from(buffer).toString('base64');
    const mime = contentType.includes('png') ? 'image/png' : 'image/jpeg';
    return `data:${mime};base64,${base64}`;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Parcel scheme — INSPIRE WFS geometry + WMS tight bbox
// ---------------------------------------------------------------------------

/**
 * Fetches the exact parcel polygon from the INSPIRE WFS endpoint, then
 * renders a WMS image tightly zoomed to that parcel so it fills the frame.
 * This replaces the old GeneraMapa.aspx approach (which required a browser session).
 */
export async function fetchCatastroParcelScheme(
  cadastralReference: string,
): Promise<string | null> {
  try {
    const rc14 = cadastralReference.slice(0, 14);
    const wfsUrl = `${INSPIRE_WFS_ENDPOINT}?service=wfs&version=2&request=getfeature&STOREDQUERIE_ID=getParcel&srsname=EPSG:4258&refcat=${rc14}`;
    const wfsResponse = await fetch(wfsUrl, { signal: withTimeout(FETCH_TIMEOUT_MS) });
    if (!wfsResponse.ok) return null;
    const xml = await wfsResponse.text();

    // INSPIRE EPSG:4258 returns coordinates as "lat lng" pairs in posList
    const posListMatch = xml.match(/<gml:posList[^>]*>([\s\S]*?)<\/gml:posList>/i);
    if (!posListMatch) return null;
    const vals = posListMatch[1].trim().split(/\s+/).map(Number).filter((n) => !isNaN(n));
    if (vals.length < 4) return null;

    // Extract lat/lng pairs (EPSG:4258 delivers lat first, then lng)
    const lats: number[] = [];
    const lngs: number[] = [];
    for (let i = 0; i < vals.length - 1; i += 2) {
      lats.push(vals[i]);
      lngs.push(vals[i + 1]);
    }

    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    // Add a 15% margin around the parcel so it doesn't touch the edges
    const latPad = Math.max((maxLat - minLat) * 0.25, 0.0002);
    const lngPad = Math.max((maxLng - minLng) * 0.25, 0.0002);

    const bbox = `${(minLng - lngPad).toFixed(7)},${(minLat - latPad).toFixed(7)},${(maxLng + lngPad).toFixed(7)},${(maxLat + latPad).toFixed(7)}`;

    const params = new URLSearchParams({
      SERVICE: 'WMS',
      VERSION: '1.1.1',
      REQUEST: 'GetMap',
      LAYERS: 'Catastro',
      STYLES: '',
      FORMAT: 'image/png',
      BGCOLOR: '0xFFFFFF',
      TRANSPARENT: 'FALSE',
      WIDTH: '300',
      HEIGHT: '300',
      SRS: 'EPSG:4326',
      BBOX: bbox,
    });

    const wmsResponse = await fetch(`${WMS_ENDPOINT}?${params.toString()}`, {
      signal: withTimeout(FETCH_TIMEOUT_MS),
    });
    if (!wmsResponse.ok) return null;
    const contentType = wmsResponse.headers.get('content-type') ?? '';
    if (!contentType.includes('image/')) return null;

    const buffer = await wmsResponse.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
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
  /** Parcel tightly zoomed via INSPIRE geometry + WMS — highlights the specific parcel. */
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
