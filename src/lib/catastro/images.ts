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
  mapDataUri?: string;
}

export async function fetchCatastroImages(
  cadastralReference: string | undefined,
  lat: number | undefined,
  lng: number | undefined,
): Promise<CatastroImages> {
  const [facadeDataUri, mapDataUri] = await Promise.all([
    cadastralReference ? fetchCatastroFacadeImage(cadastralReference) : Promise.resolve(null),
    lat != null && lng != null ? fetchCatastroMapImage(lat, lng) : Promise.resolve(null),
  ]);
  return {
    facadeDataUri: facadeDataUri ?? undefined,
    mapDataUri: mapDataUri ?? undefined,
  };
}
