import { expect, test, describe } from 'vitest';
import { calculateDistance, OFFICE_LOCATION, MAX_DISTANCE_METERS } from './location';

describe('Location Logic (White Box Tests)', () => {
  
  test('Exact Location: Should return 0 when coordinates match the office exactly', () => {
    const distance = calculateDistance(
      OFFICE_LOCATION.lat, 
      OFFICE_LOCATION.lng, 
      OFFICE_LOCATION.lat, 
      OFFICE_LOCATION.lng
    );
    expect(distance).toBe(0);
  });

  test('Boundary Check: Should identify a point clearly within the 132.52m limit', () => {
    const lokasiApelDKIPSLat = 1.4707212667240877;
    const lokasiApelDKIPSLon = 124.8453110445156;
    
    const distance = calculateDistance(
      OFFICE_LOCATION.lat, 
      OFFICE_LOCATION.lng, 
      lokasiApelDKIPSLat, 
      lokasiApelDKIPSLon
    );
    
    expect(distance).toBeLessThan(MAX_DISTANCE_METERS);
  });

  test('Out of Bounds: Should identify a point clearly outside the 132.52m limit', () => {
    // Lokasi kantor Inspektorat Provinsi Sulawesi Utara (+- 198.13m dari Diskominfo)
    const inspektoratLat = 1.4697418200501653;
    const inspektoratLng = 124.84662464374688;

    const distance = calculateDistance(
      OFFICE_LOCATION.lat, 
      OFFICE_LOCATION.lng, 
      inspektoratLat, 
      inspektoratLng
    );

    expect(distance).toBeGreaterThan(MAX_DISTANCE_METERS);
  });

  test('Edge Case: Should handle invalid or missing coordinate data gracefully', () => {
    // Assuming your function is designed to throw an error or return a specific fallback
    expect(() => calculateDistance(
      OFFICE_LOCATION.lat, 
      OFFICE_LOCATION.lng, 
      undefined as unknown as number, 
      undefined as unknown as number
    )).toThrowError(); 
  });
});