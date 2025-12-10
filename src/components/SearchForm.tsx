'use client';

import { useEffect, useRef, useState } from 'react';
import { MagnifyingGlassIcon, SpinnerIcon, ShieldWarningIcon, XIcon } from '@phosphor-icons/react';
import { Turnstile, type TurnstileInstance } from '@marsidev/react-turnstile';
import Cleave from 'cleave.js/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface SearchFormProps {
    onSearch: (plate: string, color: string, turnstileToken: string) => Promise<void>;
    isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [plate, setPlate] = useState('');
    const [color, setColor] = useState('1'); // Default Black (1)
    const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const plateInputRef = useRef<HTMLInputElement>(null);
    const turnstileRef = useRef<TurnstileInstance>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage(null);

        if (plate.length < 3) return;

        // Validate Turnstile is completed
        if (!turnstileToken) {
            setErrorMessage('Mohon selesaikan verifikasi keamanan Cloudflare terlebih dahulu.');
            return;
        }

        // Submit with token
        onSearch(plate, color, turnstileToken);
        // Reset Turnstile after successful submit for next use
        turnstileRef.current?.reset();
        setTurnstileToken(null);
    };

    // Handle Turnstile success - proceed with search
    const handleTurnstileSuccess = (token: string) => {
        setTurnstileToken(token);
        setIsVerifying(false);
        setErrorMessage(null); // Clear error when verification succeeds

        // Auto-submit if we were waiting for verification
        if (isVerifying && plate.length >= 3) {
            onSearch(plate, color, token);
            // Reset for next use
            setTimeout(() => {
                turnstileRef.current?.reset();
                setTurnstileToken(null);
            }, 100);
        }
    };

    const handleTurnstileError = () => {
        setTurnstileToken(null);
        setIsVerifying(false);
        setErrorMessage('Verifikasi keamanan gagal. Silakan refresh halaman dan coba lagi.');
    };

    const handleTurnstileExpire = () => {
        setTurnstileToken(null);
        // Don't show error on expire, just reset silently
    };

    useEffect(() => {
        if (plateInputRef.current) {
            plateInputRef.current.focus();
        }
    }, []);

    return (
        <section className="glass-panel">
            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Error Alert */}
                {errorMessage && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <ShieldWarningIcon size={20} weight="fill" className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-amber-400">Verifikasi Diperlukan</p>
                            <p className="text-xs text-amber-300/80 mt-1">{errorMessage}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setErrorMessage(null)}
                            className="text-amber-500/70 hover:text-amber-500 transition-colors"
                        >
                            <XIcon size={18} />
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <Label htmlFor="plate" className="text-muted-foreground block mb-4">
                        Nomor Polisi
                    </Label>
                    <Cleave
                        htmlRef={(ref: HTMLInputElement) => (plateInputRef.current = ref)}
                        options={{
                            blocks: [1, 4, 3],
                            delimiter: ' ',
                            uppercase: true
                        }}
                        value={plate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlate(e.target.value)}
                        placeholder="CONTOH: D 1234 ABC"
                        className={cn(
                            "flex h-12 w-full rounded-xl border border-input bg-black/5 px-4 py-3 text-base",
                            "ring-offset-background placeholder:text-muted-foreground",
                            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "disabled:cursor-not-allowed disabled:opacity-50"
                        )}
                        required
                    />
                    <p className="text-xs text-muted-foreground">
                        Masukkan Nomor Polisi lengkap (Contoh: D 1234 ABC)
                    </p>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="color" className="text-muted-foreground block mb-4">
                        Warna TNKB
                    </Label>
                    <Select value={color} onValueChange={setColor}>
                        <SelectTrigger className="h-12 rounded-xl bg-black/5 border-input">
                            <SelectValue placeholder="Pilih Warna TNKB" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">Hitam/Putih (Pribadi)</SelectItem>
                            <SelectItem value="2">Kuning (Umum)</SelectItem>
                            <SelectItem value="3">Merah (Dinas)</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Cloudflare Turnstile - Interactive mode with refresh on expire */}
                <div className="flex justify-center">
                    <Turnstile
                        ref={turnstileRef}
                        siteKey="0x4AAAAAACF0pwAoXWFLE_Qf"
                        onSuccess={handleTurnstileSuccess}
                        onError={handleTurnstileError}
                        onExpire={handleTurnstileExpire}
                        options={{
                            theme: 'auto',
                            size: 'flexible',
                            refreshExpired: 'auto', // Auto refresh when expired
                        }}
                    />
                </div>

                <Button
                    type="submit"
                    disabled={isLoading || isVerifying}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-base font-semibold shadow-lg shadow-primary/30"
                >
                    {isLoading || isVerifying ? (
                        <SpinnerIcon className="animate-spin" size={24} />
                    ) : (
                        <>
                            <span>Cek Pajak</span>
                            <MagnifyingGlassIcon weight="bold" size={20} />
                        </>
                    )}
                </Button>
            </form>
        </section>
    );
}
