export const AFGHAN_PROVINCES: string[] = [
  'Badakhshan',
  'Badghis',
  'Baghlan',
  'Balkh',
  'Bamyan',
  'Daykundi',
  'Farah',
  'Faryab',
  'Ghazni',
  'Ghor',
  'Helmand',
  'Herat',
  'Jowzjan',
  'Kabul',
  'Kandahar',
  'Kapisa',
  'Khost',
  'Kunar',
  'Kunduz',
  'Laghman',
  'Logar',
  'Nangarhar',
  'Nimruz',
  'Nuristan',
  'Paktia',
  'Paktika',
  'Panjshir',
  'Parwan',
  'Samangan',
  'Sar-e Pol',
  'Takhar',
  'Uruzgan',
  'Wardak',
  'Zabul',
];

/**
 * True if a job's (free-text) location field mentions the given province —
 * handles jobs listing multiple provinces (e.g. "Kabul, Herat" or
 * "Multiple locations: Kandahar, Helmand") by substring match rather than
 * requiring an exact field match.
 */
export function locationMatchesProvince(jobLocation: string | null, province: string): boolean {
  if (!jobLocation) return false;
  return jobLocation.toLowerCase().includes(province.toLowerCase());
}
