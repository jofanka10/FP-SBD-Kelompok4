import React, { useEffect, useState } from 'react';
import axios from 'axios';
import moment from 'moment';

interface ActivityLog {
    _id: string;
    userId: {
        _id: string;
        username: string;
        email: string;
    };
    action: string;
    entityType: string;
    entityId?: string;
    oldData?: any;
    newData?: any;
    timestamp: string;
}

const Reports: React.FC = () => {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchActivityLogs = async () => {
            try {
                setLoading(true);
                const response = await axios.get('http://localhost:5001/api/activity-logs');
                setLogs(response.data);
            } catch (err) {
                console.error('Error fetching activity logs:', err);
                setError('Failed to fetch activity logs.');
            } finally {
                setLoading(false);
            }
        };

        fetchActivityLogs();
    }, []);

    const getActionDescription = (log: ActivityLog) => {
        const userName = log.userId?.username || 'Tidak Dikenal';
        const userEmail = log.userId?.email || 'N/A';

        switch (log.action) {
            case 'CREATE_USER':
                return `Pengguna '${userName} (${userEmail})' membuat entri ${log.entityType} baru.`;
            case 'UPDATE_USER':
                return `Pengguna '${userName} (${userEmail})' memperbarui entri ${log.entityType}.`;
            case 'DELETE_USER':
                return `Pengguna '${userName} (${userEmail})' menghapus entri ${log.entityType}.`;
            default:
                return `Pengguna '${userName} (${userEmail})' melakukan aksi: ${log.action} pada ${log.entityType}.`;
        }
    };

    return (
        // <React.Fragment> atau <> adalah pembungkus ekstra yang kadang membantu mengatasi error caching/file corrupt
        <>
            <div className="container mx-auto p-4">
                <h1 className="text-2xl font-bold mb-6">Laporan Aktivitas</h1>

                {loading && <p>Memuat laporan...</p>}
                {error && <p className="text-red-500">{error}</p>}

                {!loading && !error && logs.length === 0 && (
                    <p>Tidak ada log aktivitas ditemukan.</p>
                )}

                {!loading && !error && logs.length > 0 && (
                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Waktu</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktor (Pengguna)</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipe Entitas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detail</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {logs.map((log) => (
                                    <tr key={log._id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.userId ? `${log.userId.username || 'Tidak Dikenal'} (${log.userId.email || 'N/A'})` : 'N/A (Pengguna Dihapus/Tidak Dikenal)'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {log.entityType}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            <p>{getActionDescription(log)}</p>
                                        </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </>
    );
};

export default Reports;
