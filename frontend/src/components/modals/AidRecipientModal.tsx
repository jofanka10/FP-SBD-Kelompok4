import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

interface AidRecipientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  aidRecipient: AidRecipient | null;
  users: any[];
  mode: 'create' | 'edit' | 'view';
}

const AidRecipientModal: React.FC<AidRecipientModalProps> = ({ isOpen, onClose, onSubmit, aidRecipient, users, mode }) => {
  const [formData, setFormData] = useState({
    user: '',
    aid_type_received: 'Uang tunai',
    recipient_status: 'Belum Terverifikasi',
    delivery_address: '',
    number_of_family_members: 1,
    notes: '',
  });

  useEffect(() => {
    if (aidRecipient && (mode === 'edit' || mode === 'view')) {
      setFormData({
        user: aidRecipient.user._id,
        aid_type_received: aidRecipient.aid_type_received,
        recipient_status: aidRecipient.recipient_status,
        delivery_address: aidRecipient.delivery_address,
        number_of_family_members: aidRecipient.number_of_family_members,
        notes: aidRecipient.notes || '',
      });
    } else {
      setFormData({
        user: '',
        aid_type_received: 'Uang tunai',
        recipient_status: 'Belum Terverifikasi',
        delivery_address: '',
        number_of_family_members: 1,
        notes: '',
      });
    }
  }, [aidRecipient, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        number_of_family_members: parseInt(formData.number_of_family_members.toString()),
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  const isReadOnly = mode === 'view';
  const title = mode === 'create' ? 'Add New Aid Recipient' : mode === 'edit' ? 'Edit Aid Recipient' : 'View Aid Recipient';

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
                  User
                </label>
                <select
                  name="user"
                  value={formData.user}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select a user</option>
                  {users.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aid Type Received
                </label>
                <select
                  name="aid_type_received"
                  value={formData.aid_type_received}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Uang tunai">Uang tunai</option>
                  <option value="Barang">Barang</option>
                  <option value="Makanan">Makanan</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Recipient Status
                </label>
                <select
                  name="recipient_status"
                  value={formData.recipient_status}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="Terverifikasi">Terverifikasi</option>
                  <option value="Belum Terverifikasi">Belum Terverifikasi</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery Address
                </label>
                <textarea
                  name="delivery_address"
                  value={formData.delivery_address}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Family Members
                </label>
                <input
                  type="number"
                  name="number_of_family_members"
                  value={formData.number_of_family_members}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Optional notes about the recipient..."
                />
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

export default AidRecipientModal;