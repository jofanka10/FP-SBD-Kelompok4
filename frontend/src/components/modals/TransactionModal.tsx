import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  transaction: Transaction | null;
  donations: any[];
  mode: 'create' | 'edit' | 'view';
}

const TransactionModal: React.FC<TransactionModalProps> = ({ isOpen, onClose, onSubmit, transaction, donations, mode }) => {
  const [formData, setFormData] = useState({
    donation: '',
    payment_amount: '',
    payment_method: 'Transfer bank',
    transaction_status: 'Pending',
  });

  useEffect(() => {
    if (transaction && (mode === 'edit' || mode === 'view')) {
      setFormData({
        donation: transaction.donation._id,
        payment_amount: transaction.payment_amount.toString(),
        payment_method: transaction.payment_method,
        transaction_status: transaction.transaction_status,
      });
    } else {
      setFormData({
        donation: '',
        payment_amount: '',
        payment_method: 'Transfer bank',
        transaction_status: 'Pending',
      });
    }
  }, [transaction, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        payment_amount: parseFloat(formData.payment_amount),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Transaction' : mode === 'edit' ? 'Edit Transaction' : 'View Transaction';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Donation
                </label>
                <select
                  name="donation"
                  value={formData.donation}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select a donation</option>
                  {donations.map((donation) => (
                    <option key={donation._id} value={donation._id}>
                      {donation.user_id?.name} - Rp {donation.amount.toLocaleString('id-ID')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Amount (Rp)
                </label>
                <input
                  type="number"
                  name="payment_amount"
                  value={formData.payment_amount}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  min="0"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Transfer bank">Transfer bank</option>
                  <option value="E-wallet">E-wallet</option>
                  <option value="Tunai">Tunai</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Transaction Status
                </label>
                <select
                  name="transaction_status"
                  value={formData.transaction_status}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Sukses">Sukses</option>
                  <option value="Gagal">Gagal</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>
            </form>
          </div>

          {mode !== 'view' && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                onClick={handleSubmit}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {mode === 'create' ? 'Create' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionModal;