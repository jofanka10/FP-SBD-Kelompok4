import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react';
import { transactionAPI, donationAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import TransactionModal from '../components/modals/TransactionModal';

interface Transaction {
  _id: string;
  donation: {
    _id: string;
    user_id: {
      name: string;
      email: string;
    };
    amount: number;
  };
  payment_amount: number;
  transaction_date: string;
  payment_method: string;
  transaction_status: string;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transactionsRes, donationsRes] = await Promise.all([
        transactionAPI.getAll(),
        donationAPI.getAll()
      ]);
      setTransactions(transactionsRes.data);
      setDonations(donationsRes.data);
    } catch (error) {
      addToast('Error fetching data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to move this transaction to trash?')) {
      try {
        await transactionAPI.delete(id);
        addToast('Transaction moved to trash successfully', 'success');
        fetchData();
      } catch (error) {
        addToast('Error deleting transaction', 'error');
      }
    }
  };

  const handleCreate = () => {
    setSelectedTransaction(null);
    setModalMode('create');
    setIsModalOpen(true);
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleView = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (transactionData: any) => {
    try {
      if (modalMode === 'create') {
        await transactionAPI.create(transactionData);
        addToast('Transaction created successfully', 'success');
      } else if (modalMode === 'edit') {
        await transactionAPI.update(selectedTransaction!._id, transactionData);
        addToast('Transaction updated successfully', 'success');
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      addToast(`Error ${modalMode === 'create' ? 'creating' : 'updating'} transaction`, 'error');
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const donorName = transaction.donation?.user_id?.name || '';
    const donorEmail = transaction.donation?.user_id?.email || '';
    return (
      donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.payment_method.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.transaction_status.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
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
              placeholder="Search transactions..."
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
              {filteredTransactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {transaction.donation?.user_id?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {transaction.donation?.user_id?.email || 'No email'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Rp {transaction.payment_amount.toLocaleString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.payment_method}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(transaction.transaction_status)}`}>
                      {transaction.transaction_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.transaction_date).toLocaleDateString('id-ID')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleView(transaction)}
                        className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-100"
                        title="View"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(transaction)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Edit"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(transaction._id)}
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

        {filteredTransactions.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No transactions found</p>
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        transaction={selectedTransaction}
        donations={donations}
        mode={modalMode}
      />
    </div>
  );
};

export default Transactions;