import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import { 
  UserPlus, 
  FileText, 
  SearchCheck, 
  Award, 
  ArrowRight, 
  Briefcase, 
  Users, 
  ScrollText,
  Rocket
} from "lucide-react"; 

export const metadata = {
  title: "Beranda",
};

export default async function LandingPage() {
  const session = await getServerSession(authOptions);

  // LOGIC FIX: Tentukan tujuan redirect berdasarkan Role
  // Jika Admin -> ke /admin, Jika User Biasa -> ke /dashboard
  const dashboardLink = session?.user?.role === "ADMIN" ? "/admin" : "/dashboard";
  const dashboardText = session?.user?.role === "ADMIN" ? "Panel Admin" : "Dashboard Saya";

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      {/* --- 1. HERO SECTION --- */}
      <main className="relative pt-16 pb-20 sm:pt-24 sm:pb-32 bg-white overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl mix-blend-multiply animate-blob"></div>
            <div className="absolute top-20 right-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl mix-blend-multiply animate-blob animation-delay-2000"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-[#1193b5] text-xs font-bold px-4 py-1.5 rounded-full mb-8 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1193b5]"></span>
            </span>
            Open Registration for Batch 2026
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 leading-tight">
            Start Your Career Journey <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#1193b5] to-blue-600">
              With Us Today.
            </span>
          </h1>
          
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Apply for internships at Dinas Kominfo Sulut. Gain real-world experience, 
            work on impactful government projects, and build your professional network.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link 
                href={dashboardLink} // <--- SUDAH DIPERBAIKI (Dinamis)
                className="bg-[#1193b5] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue transition shadow-lg hover:shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                {dashboardText} <ArrowRight size={20} />
              </Link>
            ) : (
              <Link 
                href="/register"
                className="bg-[#1193b5] text-white px-8 py-4 rounded-xl text-lg font-bold hover:bg-blue transition shadow-lg hover:shadow-xl shadow-blue-200 flex items-center justify-center gap-2"
              >
                Apply Now <ArrowRight size={20} />
              </Link>
            )}
            <a 
                href="#features"
                className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-bold hover:bg-gray-50 transition flex items-center justify-center"
            >
                Learn More
            </a>
          </div>
        </div>
      </main>

      {/* --- 2. FEATURES --- */}
      <section id="features" className="py-24 bg-white scroll-mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                 <h2 className="text-base text-[#1193b5] font-bold tracking-wide uppercase mb-2">Benefits</h2>
                 <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">Why Join Us?</h2>
                 <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Rasakan pengalaman magang yang berbeda dengan terjun langsung ke dunia pemerintahan digital.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                <div className="p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-blue-100 transition duration-300 group">
                    <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition duration-300">
                        <Briefcase size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Real Projects</h3>
                    <p className="text-gray-500 leading-relaxed">Bukan sekadar bikin kopi. Anda akan terlibat dalam pengembangan aplikasi layanan publik dan pengelolaan data riil.</p>
                </div>
                <div className="p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-purple-100 transition duration-300 group">
                    <div className="w-14 h-14 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:-rotate-3 transition duration-300">
                        <Users size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Expert Mentorship</h3>
                    <p className="text-gray-500 leading-relaxed">Dibimbing langsung oleh praktisi IT senior dan ASN berpengalaman yang siap berbagi ilmu industri.</p>
                </div>
                <div className="p-8 rounded-2xl border border-gray-100 bg-white hover:shadow-xl hover:border-green-100 transition duration-300 group">
                    <div className="w-14 h-14 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition duration-300">
                        <ScrollText size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Official Certificate</h3>
                    <p className="text-gray-500 leading-relaxed">Dapatkan sertifikat resmi dari Dinas Kominfo yang valid dan diakui untuk portofolio karier Anda.</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- 3. REGISTRATION PROCESS --- */}
      <section id="process" className="py-24 bg-gray-50/50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-base text-[#1193b5] font-bold tracking-wide uppercase mb-2">How It Works</h2>
                <p className="text-3xl md:text-4xl font-extrabold text-gray-900">Alur Pendaftaran</p>
                <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">4 langkah mudah menuju pengalaman magang yang berharga.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gray-200 -z-10 transform translate-y-4"></div>

                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-white text-[#1193b5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-2 border-blue-50 shadow-sm z-10 relative">
                        <UserPlus size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">1. Buat Akun</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Registrasi akun baru menggunakan email aktif Anda.</p>
                </div>

                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-white text-[#1193b5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-2 border-blue-50 shadow-sm z-10 relative">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">2. Isi Formulir</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Lengkapi biodata, informasi akademik, dan upload CV (PDF).</p>
                </div>

                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-white text-[#1193b5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-2 border-blue-50 shadow-sm z-10 relative">
                        <SearchCheck size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">3. Verifikasi</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Tunggu proses review oleh admin. Pantau status di dashboard.</p>
                </div>

                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center hover:-translate-y-2 transition duration-300">
                    <div className="w-16 h-16 bg-white text-[#1193b5] rounded-2xl flex items-center justify-center mx-auto mb-6 text-2xl font-bold border-2 border-blue-50 shadow-sm z-10 relative">
                        <Award size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">4. Accepted</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">Unduh Surat Balasan resmi dan mulai perjalanan magang Anda!</p>
                </div>
            </div>
        </div>
      </section>

      {/* --- 4. CTA SECTION --- */}
      <section className="py-20 bg-[#1193b5] relative overflow-hidden">
         <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
         <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-black/10 rounded-full blur-3xl"></div>
         
         <div className="relative max-w-4xl mx-auto text-center px-4 z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">Ready to Start Your Journey?</h2>
            <p className="text-blue-50 text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed">
                Kuota magang terbatas untuk setiap batch. Segera daftarkan diri Anda dan lengkapi berkas administrasi sekarang juga.
            </p>
            
            <div className="flex justify-center">
                {session ? (
                     <Link 
                        href={dashboardLink} // <--- FIX DISINI JUGA
                        className="group relative bg-white text-[#1193b5] px-10 py-5 rounded-2xl text-xl font-bold shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] flex items-center gap-3"
                      >
                        <span className="relative z-10">{dashboardText}</span>
                        <ArrowRight className="group-hover:translate-x-1 transition-transform relative z-10" />
                        <div className="absolute inset-0 rounded-2xl bg-white/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                ) : (
                    <Link 
                        href="/register"
                        className="group relative bg-white text-[#1193b5] px-12 py-5 rounded-2xl text-xl font-bold shadow-xl transition-all duration-300 ease-out hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.7)] flex items-center gap-3"
                      >
                        <Rocket className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform relative z-10" />
                        <span className="relative z-10">Daftar Sekarang</span>
                        <div className="absolute inset-0 rounded-2xl bg-white/50 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      </Link>
                )}
            </div>
         </div>
      </section>

      <Footer />
    </div>
  );
}