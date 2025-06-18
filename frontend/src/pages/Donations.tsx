import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { donationAPI, userAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import DonationModal from '../components/modals/DonationModal';

interface Donation {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  amount: number;
  donation_date: string;
  payment_method: string;
  donation_status: string;
  note: string;
}

const Donations: React.FC = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [donationsRes, usersRes] = await Promise.all([
        donationAPI.getAll(),
        userAPI.getAll()
      ]);
      setDonations(donationsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to move this donation to trash?')) {
      try {
        await donationAPI.delete(id);
        addToast('Donation moved to trash successfully', 'success');
        fetchData();
      } catch (error) {
        addToast('Error deleting donation', 'error');
      }
    }
  };

  const handleCreate = () => {
    setSelectedDonation(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (donation: Donation) => {
    setSelectedDonation(donation);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (donation: Donation) => {
    setSelectedDonation(donation);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (donationData: any) => {
    try {
      if (modalMode === 'create') {
        await donationAPI.create(donationData);
        addToast('Donation created successfully', 'success');
      } else if (modalMode === 'edit') {
        await donationAPI.update(selectedDonation!._id, donationData);
        addToast('Donation updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      addToast(`Error ${modalMode === 'create' ? 'creating' : 'updating'} donation`, 'error');
    }
  };

  const filteredDonations = donations.filter((donation) =>
    donation.user_id?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    donation.donation_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Sukses':
        return 'bg-green-100 text-green-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'Gagal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Donations</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Donation
        </button>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search donations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Donor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDonations.map((donation) => (
                <tr key={donation._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {donation.user_id?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {donation.user_id?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rp {donation.amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {donation.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(donation.donation_status)}`}>
                      {donation.donation_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(donation.donation_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(donation)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(donation)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(donation._id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredDonations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No donations found</p>
          </div>
        )}
      </div>

      <DonationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        donation={selectedDonation}
        users={users}
        mode={modalMode}
      />
    </div>
  );
};

export default Donations;