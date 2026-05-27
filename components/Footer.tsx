import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-blue-600 border-t border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Column 1 */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Image
                src="/sulut-icon.png"
                alt="Logo Pemprov Sulut"
                width={50}
                height={50}
                // className="brightness-0 invert"
              />

              <h3 className="font-bold text-white leading-tight">
                Dinas Komunikasi, Informatika, Persandian dan Statistik Daerah<br />
                <span className="text-white/80 font-normal text-m">
                  Provinsi Sulawesi Utara
                </span>
              </h3>
            </div>

            <p className="text-sm leading-relaxed text-blue-50/80">
              Portal resmi pendaftaran Magang dan Praktik Kerja Lapangan
              di lingkungan Dinas Komunikasi, Informatika, Persandian,
              dan Statistik Provinsi Sulawesi Utara.
            </p>
          </div>

          {/* Column 2 */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-b border-blue-700 inline-block pb-1">
              Alamat Kantor
            </h4>

            <div className="space-y-3 text-sm text-blue-50/90">
              <p className="flex items-start gap-3">
                <span className="text-blue-400 mt-1">📍</span>
                <span>
                  Jl. 17 Agustus No.69, Teling Atas,<br />
                  Kec. Wanea, Kota Manado,<br />
                  Sulawesi Utara 95119
                </span>
              </p>

              <a
                href="https://maps.google.com"
                target="_blank"
                className="inline-block text-white hover:text-blue-300 text-xs font-medium transition"
              >
                Lihat di Google Maps →
              </a>
            </div>
          </div>

          {/* Column 3 */}
          <div>
            <h4 className="text-white font-semibold text-lg mb-4 border-b border-blue-700 inline-block pb-1">
              Hubungi Kami
            </h4>

            <ul className="space-y-4 text-sm text-blue-50/90">
              <li className="flex items-center gap-3">
                <span className="bg-blue-800 p-2 rounded-full text-blue-400">
                  📞
                </span>
                <span>(0431) 851001</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="bg-blue-800 p-2 rounded-full text-blue-400">
                  ✉️
                </span>
                <span>diskominfo@sulutprov.go.id</span>
              </li>

              <li className="text-xs text-blue-50/90 pt-2">
                <strong className="text-blue-70">
                  Waktu Layanan
                </strong><br />
                Senin – Jumat (08:00 – 17:00 WITA)
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-blue-800 text-center text-xs text-blue-50/60">
          © 2026 Dinas Komunikasi, Informatika, Persandian dan Statistik Daerah
          Provinsi Sulawesi Utara.
        </div>
      </div>
    </footer>
  );
}

