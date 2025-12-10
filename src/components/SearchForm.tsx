'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, SpinnerIcon } from '@phosphor-icons/react';
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
    onSearch: (plate: string, color: string) => Promise<void>;
    isLoading: boolean;
}

export default function SearchForm({ onSearch, isLoading }: SearchFormProps) {
    const [plate, setPlate] = useState('');
    const [color, setColor] = useState('1'); // Default Black (1)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (plate.length < 3) return;
        onSearch(plate, color);
    };

    return (
        <section className="glass-panel">
            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                    <Label htmlFor="plate" className="text-muted-foreground block mb-4">
                        Nomor Polisi
                    </Label>
                    <Cleave
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

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90 text-base font-semibold shadow-lg shadow-primary/30"
                >
                    {isLoading ? (
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
