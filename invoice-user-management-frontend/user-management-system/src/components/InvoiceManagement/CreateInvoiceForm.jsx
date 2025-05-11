// components/InvoiceManagement/CreateInvoiceForm.jsx

import React, { useState } from 'react';
import { createInvoice } from '../../api/userService';

const CreateInvoiceForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({
    customerName: '',
    invoiceDate: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, price: 0 }],
    notes: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index][field] = value;
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };
  
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { description: '', quantity: 1, price: 0 }]
    }));
  };
  
  const removeItem = (index) => {
    if (formData.items.length === 1) return;
    
    const updatedItems = [...formData.items];
    updatedItems.splice(index, 1);
    setFormData(prev => ({ ...prev, items: updatedItems }));
  };
  
  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.price);
    }, 0).toFixed(2);
  };
  
  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError('Customer name is required');
      return false;
    }
    
    if (!formData.invoiceDate) {
      setError('Invoice date is required');
      return false;
    }
    
    if (!formData.dueDate) {
      setError('Due date is required');
      return false;
    }
    
    // Validate items
    for (const item of formData.items) {
      if (!item.description.trim()) {
        setError('All items must have a description');
        return false;
      }
      
      if (item.quantity <= 0) {
        setError('Quantity must be greater than 0');
        return false;
      }
      
      if (item.price < 0) {
        setError('Price cannot be negative');
        return false;
      }
    }
    
    return true;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await createInvoice(formData);
      setFormData({
        customerName: '',
        invoiceDate: '',
        dueDate: '',
        items: [{ description: '', quantity: 1, price: 0 }],
        notes: ''
      });
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Create New Invoice</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Customer Name
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        
        <div className="flex flex-wrap -mx-2 mb-4">
          <div className="w-1/2 px-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Invoice Date
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="w-1/2 px-2">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Due Date
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-gray-700 text-sm font-bold">
              Invoice Items
            </label>
            <button
              type="button"
              onClick={addItem}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-sm focus:outline-none focus:shadow-outline"
            >
              + Add Item
            </button>
          </div>
          
          {formData.items.map((item, index) => (
            <div key={index} className="flex flex-wrap -mx-2 mb-2 items-center">
              <div className="w-1/2 px-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="w-1/6 px-2">
                <input
                  type="number"
                  placeholder="Qty"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="w-1/4 px-2">
                <input
                  type="number"
                  placeholder="Price"
                  step="0.01"
                  min="0"
                  value={item.price}
                  onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value))}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              <div className="w-1/12 px-2">
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  disabled={formData.items.length === 1}
                  className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline ${
                    formData.items.length === 1 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          
          <div className="flex justify-end mt-2">
            <p className="text-lg font-bold">
              Total: ${calculateTotal()}
            </p>
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            rows="3"
          ></textarea>
        </div>
        
        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {loading ? 'Creating...' : 'Create Invoice'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateInvoiceForm;