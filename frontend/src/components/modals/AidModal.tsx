import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

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

interface AidModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  aid: Aid | null;
  categories: any[];
  mode: 'create' | 'edit' | 'view';
}

const AidModal: React.FC<AidModalProps> = ({ isOpen, onClose, onSubmit, aid, categories, mode }) => {
  const [formData, setFormData] = useState({
    aid_name: '',
    aid_type: 'Uang tunai',
    aid_description: '',
    available_amount: '',
    aid_category: '',
  });

  useEffect(() => {
    if (aid && (mode === 'edit' || mode === 'view')) {
      setFormData({
        aid_name: aid.aid_name,
        aid_type: aid.aid_type,
        aid_description: aid.aid_description,
        available_amount: aid.available_amount.toString(),
        aid_category: aid.aid_category?._id || '',
      });
    } else {
      setFormData({
        aid_name: '',
        aid_type: 'Uang tunai',
        aid_description: '',
        available_amount: '',
        aid_category: '',
      });
    }
  }, [aid, mode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode !== 'view') {
      onSubmit({
        ...formData,
        available_amount: parseFloat(formData.available_amount),
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
  const title = mode === 'create' ? 'Add New Aid' : mode === 'edit' ? 'Edit Aid' : 'View Aid';

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
                  Aid Name
                </label>
                <input
                  type="text"
                  name="aid_name"
                  value={formData.aid_name}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aid Type
                </label>
                <select
                  name="aid_type"
                  value={formData.aid_type}
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
                  Category
                </label>
                <select
                  name="aid_category"
                  value={formData.aid_category}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Available Amount
                </label>
                <input
                  type="number"
                  name="available_amount"
                  value={formData.available_amount}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  required
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="aid_description"
                  value={formData.aid_description}
                  onChange={handleChange}
                  disabled={isReadOnly}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                  placeholder="Description of the aid..."
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

export default AidModal;