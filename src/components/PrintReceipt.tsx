// PrintReceipt Component

type ReceiptItem = {
    name: string;
    qty: number;
    price: number;
    subtotal: number;
};

type PrintReceiptProps = {
    shopName: string;
    shopAddress?: string;
    shopPhone?: string;
    transactionNumber: string;
    transactionDate: string;
    items: ReceiptItem[];
    subtotal: number;
    discount?: number;
    tax?: number;
    total: number;
    cashReceived: number;
    change: number;
    paymentMethod: string;
};

export default function PrintReceipt({
    shopName,
    shopAddress,
    shopPhone,
    transactionNumber,
    transactionDate,
    items,
    subtotal,
    discount = 0,
    tax = 0,
    total,
    cashReceived,
    change,
    paymentMethod
}: PrintReceiptProps) {

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="font-mono text-xs bg-white p-4 w-[280px] mx-auto print:p-0 print:w-full">
            {/* Header */}
            <div className="text-center mb-4 border-b border-dashed border-slate-300 pb-4">
                <h1 className="font-bold text-base uppercase">{shopName}</h1>
                {shopAddress && <p className="text-[10px] text-slate-500 mt-1">{shopAddress}</p>}
                {shopPhone && <p className="text-[10px] text-slate-500">Telp: {shopPhone}</p>}
            </div>

            {/* Transaction Info */}
            <div className="text-[10px] mb-4 space-y-1">
                <div className="flex justify-between">
                    <span>No:</span>
                    <span className="font-bold">{transactionNumber}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tanggal:</span>
                    <span>{transactionDate}</span>
                </div>
                <div className="flex justify-between">
                    <span>Bayar:</span>
                    <span className="uppercase">{paymentMethod}</span>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-300 my-2"></div>

            {/* Items */}
            <div className="space-y-2 mb-4">
                {items.map((item, index) => (
                    <div key={index}>
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                            <span>{item.qty} x Rp {item.price.toLocaleString()}</span>
                            <span className="font-bold text-slate-700">Rp {item.subtotal.toLocaleString()}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-dashed border-slate-300 my-2"></div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>Rp {subtotal.toLocaleString()}</span>
                </div>
                {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                        <span>Diskon</span>
                        <span>-Rp {discount.toLocaleString()}</span>
                    </div>
                )}
                {tax > 0 && (
                    <div className="flex justify-between">
                        <span>Pajak</span>
                        <span>Rp {tax.toLocaleString()}</span>
                    </div>
                )}
                <div className="flex justify-between font-bold text-sm border-t border-slate-200 pt-2 mt-2">
                    <span>TOTAL</span>
                    <span>Rp {total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tunai</span>
                    <span>Rp {cashReceived.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-bold">
                    <span>Kembali</span>
                    <span>Rp {change.toLocaleString()}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="text-center mt-6 pt-4 border-t border-dashed border-slate-300">
                <p className="text-[10px] text-slate-400">Terima Kasih</p>
                <p className="text-[10px] text-slate-400">Simpan struk ini sebagai bukti pembayaran</p>
                <p className="text-[8px] text-slate-300 mt-2">Powered by KasirKu</p>
            </div>

            {/* Print Button - Hidden on Print */}
            <button
                onClick={handlePrint}
                className="mt-6 w-full bg-slate-800 text-white py-3 rounded-lg font-bold text-sm print:hidden"
            >
                🖨️ Cetak Struk
            </button>
        </div>
    );
}
