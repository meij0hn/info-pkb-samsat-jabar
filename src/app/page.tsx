'use client';

import { useEffect, useState } from 'react';
import { CarProfileIcon } from '@phosphor-icons/react';
import SearchForm from '@/components/SearchForm';
import ResultCard, { VehicleData } from '@/components/ResultCard';

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VehicleData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (plate: string, color: string, turnstileToken: string) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const regexPlat: RegExp = /^[A-Z]{1,2}\s\d{1,4}\s[A-Z]{1,3}$/;
      if (!regexPlat.test(plate)) {
        throw new Error('Format Nomor polisi tidak valid.');
      }

      const plateSplitted = plate?.split(' ');
      const construnctPlate = `${plateSplitted[0]} ${plateSplitted[2]}${plateSplitted[1]}`;


      // Use our internal proxy API with Turnstile token
      const res = await fetch(
        `/api/check?plate=${encodeURIComponent(construnctPlate)}&color=${color}&cf-turnstile-response=${encodeURIComponent(turnstileToken)}`
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Terjadi kesalahan saat mengambil data.');
      }

      if (data.status === 'gagal' || data.message === 'Data tidak ditemukan') {
        throw new Error('Data tidak ditemukan. Periksa kembali Nomor Polisi Anda.');
      }

      setResult(data.data || data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan jaringan.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (result) {
      window.scrollTo({
        top: 523,
        behavior: "smooth"
      });
    }
  }, [result]);

  return (
    <main className="min-h-screen flex justify-center items-center p-5">
      <div className="w-full max-w-md flex flex-col gap-6">
        <header className="text-center mb-2">
          <div className="flex justify-center gap-3 items-center mb-2">
            <CarProfileIcon size={32} weight="fill" className="text-white" />
            <h1 className="text-3xl font-bold">Samsat Jabar</h1>
          </div>
          <p className="text-sm text-muted-foreground">Info Pajak Kendaraan Bermotor Real-Time</p>
        </header>

        <SearchForm onSearch={handleSearch} isLoading={loading} />

        {error && (
          <div className="glass-panel border-l-4 border-l-destructive p-4">
            <p className="text-destructive font-medium">Error: {error}</p>
          </div>
        )}

        {result && <ResultCard data={result} />}

        <footer className="text-center text-xs text-muted-foreground mt-4">
          &copy; {new Date().getFullYear()} Informasi dari Bapenda Jabar
        </footer>
      </div>
    </main>
  );
}
