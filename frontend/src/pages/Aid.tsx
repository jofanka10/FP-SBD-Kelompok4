import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { aidAPI, aidCategoryAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import AidModal from '../components/modals/AidModal';

interface Aid {
  _id: string;
  aid_name: string;
  aid_type: string;
  aid_description: string;
  available_amount: number;
  aid_category: {
    _id: string;
    category_name: string;
  };
  updated_at: string;
}

const Aid: React.FC = () => {
  const [aids, setAids] = useState<Aid[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAid, setSelectedAid] = useState<Aid | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [aidsRes, categoriesRes] = await Promise.all([
        aidAPI.getAll(),
        aidCategoryAPI.getAll()
      ]);
      setAids(aidsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to move this aid to trash?')) {
      try {
        await aidAPI.delete(id);
        addToast('Aid moved to trash successfully', 'success');
        fetchData();
      } catch (error) {
        addToast('Error deleting aid', 'error');
      }
    }
  };

  const handleCreate = () => {
    setSelectedAid(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (aid: Aid) => {
    setSelectedAid(aid);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (aid: Aid) => {
    setSelectedAid(aid);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (aidData: any) => {
    try {
      if (modalMode === 'create') {
        await aidAPI.create(aidData);
        addToast('Aid created successfully', 'success');
      } else if (modalMode === 'edit') {
        await aidAPI.update(selectedAid!._id, aidData);
        addToast('Aid updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      addToast(`Error ${modalMode === 'create' ? 'creating' : 'updating'} aid`, 'error');
    }
  };

  const filteredAids = aids.filter((aid) =>
    aid.aid_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aid.aid_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    aid.aid_category?.category_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'Uang tunai':
        return 'bg-green-100 text-green-800';
      case 'Barang':
        return 'bg-blue-100 text-blue-800';
      case 'Makanan':
        return 'bg-orange-100 text-orange-800';
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
        <h1 className="text-2xl font-bold text-gray-900">Aid</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Aid
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
              placeholder="Search aid..."
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
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Available Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAids.map((aid) => (
                <tr key={aid._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{aid.aid_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getTypeBadgeColor(aid.aid_type)}`}>
                      {aid.aid_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aid.aid_category?.category_name || 'No Category'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {aid.available_amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                    {aid.aid_description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(aid)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(aid)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(aid._id)}
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

        {filteredAids.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No aid found</p>
          </div>
        )}
      </div>

      <AidModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        aid={selectedAid}
        categories={categories}
        mode={modalMode}
      />
    </div>
  );
};

export default Aid;