// utils/faceValidation.ts
import * as faceapi from 'face-api.js';

export interface FaceValidationResult {
  isMatched: boolean;
  isSmiling: boolean;
  error: string | null;
  matchDetails?: {
    label: string;
    distance: number;
    happyScore: number;
  };
}

/**
 * Memvalidasi hasil deteksi wajah berdasarkan identitas dan ekspresi (senyum).
 * * @param detection Hasil deteksi dari faceapi (harus memiliki descriptor & expressions)
 * @param matcher Instance FaceMatcher yang memuat Face ID dari database
 * @param smileThreshold Batas minimal tingkat senyuman (default: 0.7 atau 70%)
 * @returns Objek hasil validasi beserta pesan error jika ada
 */
export function validateFaceMatch(
  detection: faceapi.WithFaceExpressions<faceapi.WithFaceDescriptor<unknown>> | undefined,
  matcher: faceapi.FaceMatcher | null,
  smileThreshold: number = 0.7
): FaceValidationResult {
  
  // 1. Guard Clauses: Validasi input dasar
  if (!matcher) {
    return { isMatched: false, isSmiling: false, error: "Sistem belum siap (Data wajah belum dimuat)." };
  }
  
  if (!detection) {
    return { isMatched: false, isSmiling: false, error: "Wajah tidak terdeteksi. Pastikan pencahayaan cukup." };
  }

  // 2. Ekstraksi Data dari AI
  const { descriptor, expressions } = detection;
  const happyScore = expressions.happy || 0;

  // 3. Proses Pencocokan Identitas
  // FaceMatcher secara otomatis menggunakan Euclidean Distance.
  // Jika jaraknya melewati batas toleransi, ia akan mengembalikan 'unknown'.
  const bestMatch = matcher.findBestMatch(descriptor);
  const isIdentified = bestMatch.label !== 'unknown';
  const isSmiling = happyScore >= smileThreshold;

  // 4. Penentuan Status dan Pesan Peringatan
  let error = null;
  if (!isIdentified) {
    error = "Wajah tidak cocok dengan data pendaftar.";
  } else if (!isSmiling) {
    error = "Identitas cocok. Tolong tersenyum untuk konfirmasi absensi.";
  }

  // 5. Kembalikan Hasil Terstruktur
  return {
    isMatched: isIdentified && isSmiling, // Harus valid keduanya untuk lolos absen
    isSmiling,
    error,
    matchDetails: {
      label: bestMatch.label,
      distance: bestMatch.distance, // Semakin mendekati 0, semakin mirip
      happyScore
    }
  };
}