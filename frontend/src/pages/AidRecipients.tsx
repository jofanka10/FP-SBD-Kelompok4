import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { aidRecipientAPI, userAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AidRecipientModal from '../components/modals/AidRecipientModal';

interface AidRecipient {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  aid_type_received: string;
  recipient_status: string;
  delivery_address: string;
  number_of_family_members: number;
  notes: string;
  createdAt: string;
}

const AidRecipients: React.FC = () => {
  const [aidRecipients, setAidRecipients] = useState<AidRecipient[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAidRecipient, setSelectedAidRecipient] = useState<AidRecipient | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aidRecipientsRes, usersRes] = await Promise.all([
        aidRecipientAPI.getAll(),
        userAPI.getAll()
      ]);
      setAidRecipients(aidRecipientsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to move this aid recipient to trash?')) {
      try {
        await aidRecipientAPI.delete(id);
        addToast('Aid recipient moved to trash successfully', 'success');
        fetchData();
      } catch (error) {
        addToast('Error deleting aid recipient', 'error');
      }
    }
  };

  const handleCreate = () => {
    setSelectedAidRecipient(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (aidRecipient: AidRecipient) => {
    setSelectedAidRecipient(aidRecipient);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (aidRecipient: AidRecipient) => {
    setSelectedAidRecipient(aidRecipient);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (aidRecipientData: any) => {
    try {
      if (modalMode === 'create') {
        await aidRecipientAPI.create(aidRecipientData);
        addToast('Aid recipient created successfully', 'success');
      } else if (modalMode === 'edit') {
        await aidRecipientAPI.update(selectedAidRecipient!._id, aidRecipientData);
        addToast('Aid recipient updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      addToast(`Error ${modalMode === 'create' ? 'creating' : 'updating'} aid recipient`, 'error');
    }
  };

  const filteredAidRecipients = aidRecipients.filter((recipient) =>
    recipient.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.aid_type_received.toLowerCase().includes(searchTerm.toLowerCase()) ||
    recipient.recipient_status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeColor = (status: string) => {
    return status === 'Terverifikasi' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Aid Recipients</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Aid Recipient
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
              placeholder="Search aid recipients..."
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
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aid Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Family Members
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Address
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAidRecipients.map((recipient) => (
                <tr key={recipient._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {recipient.user?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {recipient.user?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipient.aid_type_received}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(recipient.recipient_status)}`}>
                      {recipient.recipient_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recipient.number_of_family_members}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {recipient.delivery_address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(recipient)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(recipient)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(recipient._id)}
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

        {filteredAidRecipients.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No aid recipients found</p>
          </div>
        )}
      </div>

      <AidRecipientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        aidRecipient={selectedAidRecipient}
        users={users}
        mode={modalMode}
      />
    </div>
  );
};

export default AidRecipients;