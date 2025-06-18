import React, { useState, useEffect } from 'react';
import { RotateCcw, Trash2, Search } from 'lucide-react';
import { trashAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';

interface TrashItem {
  _id: string;
  collection: string;
  documentId: string;
  deletedAt: string;
  originalData: any;
}

const Trash: React.FC = () => {
  const [trashItems, setTrashItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchTrashItems();
  }, []);

  const fetchTrashItems = async () => {
    try {
      const response = await trashAPI.getAll();
      setTrashItems(response.data);
    } catch (error) {
      addToast('Error fetching trash items', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (collection: string, documentId: string) => {
    if (window.confirm('Are you sure you want to restore this item?')) {
      try {
        await trashAPI.restore(collection, documentId);
        addToast('Item restored successfully', 'success');
        fetchTrashItems();
      } catch (error) {
        addToast('Error restoring item', 'error');
      }
    }
  };

  const handlePermanentDelete = async (collection: string, documentId: string) => {
    if (window.confirm('Are you sure you want to permanently delete this item? This action cannot be undone.')) {
      try {
        await trashAPI.permanentDelete(collection, documentId);
        addToast('Item permanently deleted', 'success');
        fetchTrashItems();
      } catch (error) {
        addToast('Error permanently deleting item', 'error');
      }
    }
  };

  const getDisplayName = (item: TrashItem) => {
    const data = item.originalData;
    switch (item.collection) {
      case 'User':
        return data.name || data.email || 'Unknown User';
      case 'Donation':
        return `Donation - Rp ${data.amount?.toLocaleString('id-ID') || '0'}`;
      case 'Transaction':
        return `Transaction - Rp ${data.payment_amount?.toLocaleString('id-ID') || '0'}`;
      case 'AidRecipient':
        return `Aid Recipient - ${data.aid_type_received || 'Unknown Type'}`;
      case 'Aid':
        return data.aid_name || 'Unknown Aid';
      case 'AidCategory':
        return data.category_name || 'Unknown Category';
      default:
        return `${item.collection} Item`;
    }
  };

  const getCollectionBadgeColor = (collection: string) => {
    switch (collection) {
      case 'User':
        return 'bg-blue-100 text-blue-800';
      case 'Donation':
        return 'bg-green-100 text-green-800';
      case 'Transaction':
        return 'bg-purple-100 text-purple-800';
      case 'AidRecipient':
        return 'bg-orange-100 text-orange-800';
      case 'Aid':
        return 'bg-cyan-100 text-cyan-800';
      case 'AidCategory':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredTrashItems = trashItems.filter((item) =>
    getDisplayName(item).toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.collection.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
        <div className="text-sm text-gray-500">
          {trashItems.length} item{trashItems.length !== 1 ? 's' : ''} in trash
        </div>
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
              placeholder="Search trash items..."
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
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Deleted At
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTrashItems.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getDisplayName(item)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCollectionBadgeColor(item.collection)}`}>
                      {item.collection}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.deletedAt).toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleRestore(item.collection, item.documentId)}
                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                        title="Restore"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handlePermanentDelete(item.collection, item.documentId)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete Permanently"
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

        {filteredTrashItems.length === 0 && (
          <div className="text-center py-12">
            <Trash2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No items in trash</h3>
            <p className="mt-1 text-sm text-gray-500">
              {trashItems.length === 0 ? 'Trash is empty.' : 'No items match your search.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Trash;