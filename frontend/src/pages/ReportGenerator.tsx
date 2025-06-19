import React, { useEffect, useState } from 'react';
import reportService, { Report } from '../services/reportService';
import moment from 'moment';
import { Trash2, Eye } from 'lucide-react';

const ReportGenerator: React.FC = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    
    const adminIdPlaceholder = '60d5ec49f8c6e3001c9a67e2';

    useEffect(() => {
        const fetchReports = async () => {
            try {
                setLoading(true);
                const data = await reportService.getAllReports();
                setReports(data);
            } catch (err) {
                console.error('Error fetching reports:', err);
                setError('Gagal mengambil daftar laporan.');
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, []);

    const handleGenerateReport = async () => {
        setError(null);
        setSuccessMessage(null);
        try {
            const startOfMonth = moment([selectedYear, selectedMonth - 1, 1]).startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment([selectedYear, selectedMonth - 1, 1]).endOf('month').format('YYYY-MM-DD');

            const payload: any = {
                report_type: 'Laporan Keuangan (Semua)',
                admin_id: adminIdPlaceholder,
                startDate: startOfMonth,
                endDate: endOfMonth
            };
            
            const newReport = await reportService.generateReport(payload);
            setReports([newReport, ...reports]);
            setSuccessMessage('Laporan berhasil dibuat!');
        } catch (err: any) {
            console.error('Error generating report:', err);
            setError(err.response?.data?.message || 'Gagal membuat laporan.');
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
            try {
                await reportService.deleteReport(id);
                setReports(reports.filter(report => report._id !== id));
                setSuccessMessage('Laporan berhasil dihapus!');
            } catch (err) {
                console.error('Error deleting report:', err);
                setError('Gagal menghapus laporan.');
            }
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const renderFinancialReportContent = (content: any, type: string) => {
        if (type.includes('Laporan Keuangan') && (content.totalIncome !== undefined || content.totalExpenses !== undefined || content.netBalance !== undefined)) {
            return (
                <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">{content.title}</h3>
                    <p><strong>Periode:</strong> {content.period}</p>
                    <p><strong>Total Pemasukan:</strong> <span className="text-green-600">{formatCurrency(content.totalIncome || 0)}</span></p>
                    <p><strong>Total Pengeluaran:</strong> <span className="text-red-600">{formatCurrency(content.totalExpenses || 0)}</span></p>
                    <p><strong>Saldo Bersih:</strong> <span className="font-semibold">{formatCurrency(content.netBalance || 0)}</span></p>
                </div>
            );
        }
        return <pre className="p-4 bg-gray-50 rounded-lg overflow-auto text-sm">{JSON.stringify(content, null, 2)}</pre>;
    };

    const handleOpenModal = (report: Report) => {
        const modal = document.getElementById(`report-modal-${report._id}`);
        if (modal) {
            modal.style.display = 'block';
        }
    };

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-6">Pengelola Laporan Keuangan Bulanan</h1>

            <div className="bg-white shadow-md rounded-lg p-6 mb-8">
                <h2 className="text-xl font-semibold mb-4">Buat Laporan Baru</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="month">Bulan:</label>
                        <select
                            id="month"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        >
                            {moment.months().map((monthName, index) => (
                                <option key={index + 1} value={index + 1}>{monthName}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="year">Tahun:</label>
                        <input
                            type="number"
                            id="year"
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value) || new Date().getFullYear())}
                            min="2000"
                            max={new Date().getFullYear() + 10}
                        />
                    </div>
                    {/* Teks ID Admin telah dihapus dari UI */}
                </div>
                <button
                    onClick={handleGenerateReport}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
                >
                    Hasilkan Laporan
                </button>
            </div>

            <h2 className="text-xl font-semibold mb-4">Daftar Laporan yang Dihasilkan</h2>
            {loading && <p>Memuat laporan...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {successMessage && <p className="text-green-500 mb-4">{successMessage}</p>}

            {!loading && !error && reports.length === 0 && (
                <p>Tidak ada laporan yang dihasilkan.</p>
            )}

            {!loading && !error && reports.length > 0 && (
                <div className="bg-white shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID Laporan</th>
                                {/* Kolom Admin telah dihapus */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                                {/* Kolom Tipe Laporan dan Status telah dihapus */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {reports.map((report) => (
                                <tr key={report._id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{report.report_id.substring(0, 8)}...</td>
                                    {/* Data Admin telah dihapus */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{moment(report.report_date).format('YYYY-MM-DD HH:mm')}</td>
                                    {/* Data Tipe Laporan dan Status telah dihapus */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => handleOpenModal(report)}
                                            className="text-gray-600 hover:text-gray-900 mr-3"
                                            title="Lihat Detail Laporan"
                                        >
                                            <Eye size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteReport(report._id)}
                                            className="text-red-600 hover:text-red-900"
                                            title="Hapus Laporan"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            {reports.map((report) => (
                <div
                    key={`modal-${report._id}`}
                    id={`report-modal-${report._id}`}
                    className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50"
                >
                    <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
                        <div className="mt-3 text-center">
                            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Detail Laporan: {report.report_type}</h3>
                            <div className="mt-2 px-7 py-3">
                                {renderFinancialReportContent(report.report_content, report.report_type)}
                            </div>
                            <div className="items-center px-4 py-3">
                                <button
                                    id={`close-modal-${report._id}`}
                                    className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                                    onClick={() => document.getElementById(`report-modal-${report._id}`)!.style.display = 'none'}
                                >
                                    Tutup
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReportGenerator;
