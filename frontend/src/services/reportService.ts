import axios from 'axios';

const API_URL = 'http://localhost:5001/api/reports';

interface GenerateReportPayload {
    report_type: string;
    admin_id: string; // ID admin yang membuat laporan
    startDate?: string;
    endDate?: string;
    year?: number; // Added for monthly financial reports
}

export interface Report {
    _id: string;
    report_id: string;
    admin_id: {
        _id: string;
        username: string; // Changed from name
        email: string;
    };
    report_date: string;
    report_type: string;
    report_content: any;
    report_status: 'Terbuka' | 'Tertutup';
}

const generateReport = async (payload: GenerateReportPayload): Promise<Report> => {
    const response = await axios.post(`${API_URL}/generate`, payload);
    return response.data;
};

const getAllReports = async (): Promise<Report[]> => {
    const response = await axios.get(API_URL);
    return response.data;
};

const getReportById = async (id: string): Promise<Report> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
};

const updateReportStatus = async (id: string, status: 'Terbuka' | 'Tertutup'): Promise<Report> => {
    const response = await axios.put(`${API_URL}/${id}/status`, { report_status: status });
    return response.data;
};

const deleteReport = async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`);
};

export default {
    generateReport,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport
};
