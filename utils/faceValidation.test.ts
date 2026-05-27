import { describe, it, expect, vi } from 'vitest';
import { validateFaceMatch } from './faceValidation';

describe('Facial Recognition Logic (White-Box Testing)', () => {

  // 1. MOCKING: Membuat "AI Palsu" untuk pengujian
  // Kita menyimulasikan FaceMatcher agar tidak perlu memuat model AI sungguhan yang berat
  const mockMatcher = {
    findBestMatch: vi.fn((descriptor) => {
      // Jika angka array bernilai 1, anggap sistem mengenali wajah peserta
      if (descriptor[0] === 1) return { label: 'Peserta_Magang', distance: 0.4 };
      // Jika tidak, sistem merespons sebagai orang tak dikenal
      return { label: 'unknown', distance: 0.85 };
    })
  } as any; // (Cast ke any agar TypeScript tidak mencari class asli face-api)

  // 2. SKENARIO HAPPY PATH
  it('Skenario 1: Wajah dikenali dan pengguna tersenyum (Status: Lolos Uji)', () => {
    const mockDetection = {
      descriptor: [1, 0, 0], // Memicu label 'Peserta_Magang'
      expressions: { happy: 0.85 } // Tingkat senyuman 85% (Lebih dari batas 70%)
    } as any;

    const result = validateFaceMatch(mockDetection, mockMatcher, 0.7);

    expect(result.isMatched).toBe(true);
    expect(result.isSmiling).toBe(true);
    expect(result.error).toBeNull();
    expect(result.matchDetails?.label).toBe('Peserta_Magang');
  });

  // 3. SKENARIO SAD PATH 1
  it('Skenario 2: Wajah dikenali tetapi TIDAK tersenyum (Status: Ditolak)', () => {
    const mockDetection = {
      descriptor: [1, 0, 0], // Wajah benar
      expressions: { happy: 0.30 } // Tingkat senyuman hanya 30%
    } as any;

    const result = validateFaceMatch(mockDetection, mockMatcher, 0.7);

    expect(result.isMatched).toBe(false);
    expect(result.isSmiling).toBe(false);
    expect(result.error).toBe('Identitas cocok. Tolong tersenyum untuk konfirmasi absensi.');
  });

  // 4. SKENARIO SAD PATH 2
  it('Skenario 3: Wajah tidak dikenali sama sekali (Status: Ditolak)', () => {
    const mockDetection = {
      descriptor: [0, 0, 0], // Memicu label 'unknown' (misal: orang lain mencoba absen)
      expressions: { happy: 0.95 } // Walaupun dia tersenyum lebar
    } as any;

    const result = validateFaceMatch(mockDetection, mockMatcher, 0.7);

    expect(result.isMatched).toBe(false);
    expect(result.error).toBe('Wajah tidak cocok dengan data pendaftar.');
  });

  // 5. EDGE CASE
  it('Skenario 4: Menangani error saat kamera gagal memuat data wajah', () => {
    const result = validateFaceMatch(undefined, mockMatcher, 0.7);

    expect(result.isMatched).toBe(false);
    expect(result.error).toContain('Wajah tidak terdeteksi');
  });

});