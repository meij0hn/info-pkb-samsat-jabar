'use client';

import { CarIcon, MotorcycleIcon, CalendarIcon, MapPinIcon, CurrencyDollarIcon, ClockIcon, PrinterIcon, CheckCircleIcon, XCircleIcon, InfoIcon } from '@phosphor-icons/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Updated interface to match actual API response
export interface VehicleData {
    'informasi-umum': {
        merk: string;
        model: string;
        'nomor-polisi': string;
        warna: string;
        'milik-ke': string;
        jenis: string;
        'tahun-buatan': string;
    };
    'informasi-pkb-pnbp': {
        dari: string;
        ke: string;
        'tanggal-pajak': string;
        'tanggal-stnk': string;
        wilayah: string;
    };
    'pembayaran-pkb-pnbp': {
        'pkb-pokok': number;
        'pkb-denda': number;
        'opsen-pkb-pokok': number;
        'opsen-pkb-denda': number;
        'swdkllj-pokok': number;
        'swdkllj-denda': number;
        'pnbp-stnk': number;
        'pnbp-tnkb': number;
        total: number;
    };
    'pembayaran-pkb-pnbp-non-program': {
        'pkb-pokok': number;
        'pkb-denda': number;
        'opsen-pkb-pokok': number;
        'opsen-pkb-denda': number;
        'swdkllj-pokok': number;
        'swdkllj-denda': number;
        'pnbp-stnk': number;
        'pnbp-tnkb': number;
        total: number;
    };
    'tanggal-proses': string;
    keterangan: string;
    isFiveYear: boolean;
    canBePaid: boolean;
}

interface ResultCardProps {
    data: VehicleData;
}

// Format currency to Indonesian Rupiah
const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

// Format date from YYYY-MM-DD to DD MMMM YYYY
const formatDate = (dateStr: string): string => {
    if (!dateStr || dateStr === '-') return '-';
    try {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    } catch {
        return dateStr;
    }
};

// Check if date is expired
const isDateExpired = (dateStr: string): boolean => {
    if (!dateStr || dateStr === '-') return false;
    try {
        const date = new Date(dateStr);
        return date < new Date();
    } catch {
        return false;
    }
};

export default function ResultCard({ data }: ResultCardProps) {
    const info = data['informasi-umum'];
    const pkbInfo = data['informasi-pkb-pnbp'];
    const payment = data['pembayaran-pkb-pnbp'];
    const paymentNonProgram = data['pembayaran-pkb-pnbp-non-program'];

    const brand = info?.merk || '-';
    const model = info?.model || '-';
    const plate = info?.['nomor-polisi'] || '-';
    const color = info?.warna || '-';
    const ownership = info?.['milik-ke'] || '-';
    const vehicleType = info?.jenis || '-';
    const year = info?.['tahun-buatan'] || '-';

    const taxStartDate = pkbInfo?.dari || '-';
    const taxEndDate = pkbInfo?.ke || '-';
    const pkbDate = pkbInfo?.['tanggal-pajak'] || '-';
    const stnkDate = pkbInfo?.['tanggal-stnk'] || '-';
    const region = pkbInfo?.wilayah || '-';

    const isExpired = isDateExpired(pkbDate);
    const isMotorcycle = vehicleType?.toLowerCase().includes('roda 2');

    const hasDiscount = payment?.total < paymentNonProgram?.total;
    const discountAmount = hasDiscount ? paymentNonProgram?.total - payment?.total : 0;

    return (
        <Card className="glass-panel slide-up border-0 printable-area">
            {/* Header - Vehicle Info */}
            <CardHeader className="p-0 pb-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-primary/30 to-primary/10 rounded-xl flex items-center justify-center text-primary">
                        {isMotorcycle ? (
                            <MotorcycleIcon weight="duotone" size={32} />
                        ) : (
                            <CarIcon weight="duotone" size={32} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold">{brand} {model}</h3>
                        <p className="text-sm text-muted-foreground">{plate} • {year}</p>
                    </div>
                    <Badge variant={isExpired ? 'danger' : 'success'} className="flex items-center gap-1">
                        {isExpired ? (
                            <>
                                <XCircleIcon size={14} weight="fill" />
                                TERLAMBAT
                            </>
                        ) : (
                            <>
                                <CheckCircleIcon size={14} weight="fill" />
                                AKTIF
                            </>
                        )}
                    </Badge>
                </div>
            </CardHeader>

            <div className="h-px bg-border mb-4" />

            <CardContent className="p-0 space-y-5">
                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-4">
                    <DetailItem
                        icon={<CarIcon size={16} weight="duotone" />}
                        label="Jenis Kendaraan"
                        value={vehicleType}
                    />
                    <DetailItem
                        icon={<InfoIcon size={16} weight="duotone" />}
                        label="Warna"
                        value={color}
                        capitalize
                    />
                    <DetailItem
                        icon={<InfoIcon size={16} weight="duotone" />}
                        label="Kepemilikan Ke"
                        value={ownership}
                    />
                    <DetailItem
                        icon={<MapPinIcon size={16} weight="duotone" />}
                        label="Wilayah Samsat"
                        value={region}
                        capitalize
                    />
                </div>

                <div className="h-px bg-border" />

                {/* Tax Period Info */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CalendarIcon size={16} weight="duotone" className="text-primary" />
                        Masa Berlaku
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem
                            label="Pajak (PKB)"
                            value={formatDate(pkbDate)}
                            highlight={isExpired}
                        />
                        <DetailItem
                            label="STNK"
                            value={formatDate(stnkDate)}
                        />
                        <DetailItem
                            label="Periode Pajak"
                            value={`${formatDate(taxStartDate)} - ${formatDate(taxEndDate)}`}
                            className="col-span-2"
                        />
                    </div>
                </div>

                <div className="h-px bg-border" />

                {/* Payment Breakdown */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <CurrencyDollarIcon size={16} weight="duotone" className="text-primary" />
                        Rincian Pembayaran
                    </h4>
                    <div className="space-y-2 bg-black/5 rounded-xl" style={{ padding: '1rem' }}>
                        <PaymentRow label="PKB Pokok" value={payment?.['pkb-pokok'] || 0} />
                        {payment?.['pkb-denda'] > 0 && (
                            <PaymentRow label="Denda PKB" value={payment?.['pkb-denda']} isDenda />
                        )}
                        <PaymentRow label="Opsen PKB Pokok" value={payment?.['opsen-pkb-pokok'] || 0} />
                        {payment?.['opsen-pkb-denda'] > 0 && (
                            <PaymentRow label="Denda Opsen PKB" value={payment?.['opsen-pkb-denda']} isDenda />
                        )}
                        <PaymentRow label="SWDKLLJ Pokok" value={payment?.['swdkllj-pokok'] || 0} />
                        {payment?.['swdkllj-denda'] > 0 && (
                            <PaymentRow label="Denda SWDKLLJ" value={payment?.['swdkllj-denda']} isDenda />
                        )}
                        {payment?.['pnbp-stnk'] > 0 && (
                            <PaymentRow label="PNBP STNK" value={payment?.['pnbp-stnk']} />
                        )}
                        {payment?.['pnbp-tnkb'] > 0 && (
                            <PaymentRow label="PNBP TNKB" value={payment?.['pnbp-tnkb']} />
                        )}
                    </div>
                </div>

                {/* Discount Notice */}
                {hasDiscount && (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-start gap-3" style={{ padding: '1rem' }}>
                        <CheckCircleIcon size={20} weight="fill" className="text-green-500 mt-0.5" />
                        <div>
                            <p className="text-sm font-medium text-green-400">Program Diskon Aktif!</p>
                            <p className="text-xs text-muted-foreground">
                                Anda hemat {formatCurrency(discountAmount)} dari harga normal {formatCurrency(paymentNonProgram?.total || 0)}
                            </p>
                        </div>
                    </div>
                )}

                {/* Total Payment */}
                <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-4 rounded-xl" style={{ padding: '1rem' }}>
                    <div className="flex justify-between items-center">
                        <div>
                            <span className="text-sm text-muted-foreground">Total Tagihan</span>
                            {hasDiscount && (
                                <p className="text-xs text-muted-foreground line-through">
                                    {formatCurrency(paymentNonProgram?.total || 0)}
                                </p>
                            )}
                        </div>
                        <span className="text-2xl font-bold text-primary">
                            {formatCurrency(payment?.total || 0)}
                        </span>
                    </div>
                </div>

                {/* Status Flags */}
                <div className="flex gap-2 flex-wrap">
                    {data.isFiveYear && (
                        <Badge variant="outline" className="text-xs">
                            <ClockIcon size={12} className="mr-1" />
                            Perpanjangan 5 Tahun
                        </Badge>
                    )}
                    {data.canBePaid ? (
                        <Badge variant="success" className="text-xs">
                            <CheckCircleIcon size={12} className="mr-1" />
                            Dapat Dibayar Online
                        </Badge>
                    ) : (
                        <Badge variant="outline" className="text-xs border-yellow-500/50 text-yellow-500">
                            <InfoIcon size={12} className="mr-1" />
                            Kunjungi Samsat
                        </Badge>
                    )}
                </div>

                {/* Keterangan */}
                {data.keterangan && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-3">
                        <p className="text-xs text-yellow-400">{data.keterangan}</p>
                    </div>
                )}

                {/* Process Date */}
                <p className="text-xs text-muted-foreground text-center">
                    Data diproses: {data['tanggal-proses'] || '-'}
                </p>

                {/* Print Button */}
                <Button
                    variant="outline"
                    className="w-full rounded-xl border-border hover:bg-white/5 no-print"
                    onClick={() => window.print()}
                >
                    <PrinterIcon size={20} />
                    Cetak Bukti Info
                </Button>
            </CardContent>
        </Card>
    );
}

function DetailItem({
    icon,
    label,
    value,
    capitalize,
    className,
    highlight,
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    capitalize?: boolean;
    className?: string;
    highlight?: boolean;
}) {
    return (
        <div className={`space-y-1 ${className || ''}`}>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
                {icon}
                {label}
            </span>
            <p className={`text-sm font-medium ${capitalize ? 'capitalize' : ''} ${highlight ? 'text-destructive' : ''}`}>
                {value}
            </p>
        </div>
    );
}

function PaymentRow({
    label,
    value,
    isDenda,
}: {
    label: string;
    value: number;
    isDenda?: boolean;
}) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className={`${isDenda ? 'text-destructive' : 'text-muted-foreground'}`}>
                {label}
            </span>
            <span className={`font-medium ${isDenda ? 'text-destructive' : ''}`}>
                {formatCurrency(value)}
            </span>
        </div>
    );
}
