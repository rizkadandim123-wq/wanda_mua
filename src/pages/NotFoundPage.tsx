import { Link } from 'react-router-dom';
import { Flower2 } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#FFF9F5] flex items-center justify-center p-6 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto w-14 h-14 rounded-full bg-[#F8E6EB] flex items-center justify-center text-[#8F454B]">
          <Flower2 className="w-7 h-7 stroke-[1.4]" />
        </div>
        <h1 className="font-serif text-4xl text-[#8F454B]">Halaman tidak ditemukan</h1>
        <p className="text-sm text-[#594448]/85 leading-relaxed">
          Maaf, halaman yang Anda cari tidak tersedia atau telah berpindah alamat.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-full bg-[#B96B78] hover:bg-[#a35b68] text-white px-6 py-2.5 text-sm font-medium transition-colors"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}
