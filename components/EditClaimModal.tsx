import React, { useState, useEffect } from 'react';
import { ClaimItem, PaymentMethod, ExtractedReceiptData } from '../types';
import { X, Check, FileText, Calendar, DollarSign, User, CreditCard } from 'lucide-react';

interface EditClaimModalProps {
  extractedData: ExtractedReceiptData | null;
  currentClaimant: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (claim: Omit<ClaimItem, 'id'>) => void;
}

export const EditClaimModal: React.FC<EditClaimModalProps> = ({ 
  extractedData, 
  currentClaimant,
  isOpen, 
  onClose, 
  onSave 
}) => {
  const [formData, setFormData] = useState({
    date: '',
    description: '',
    amount: '',
    paymentMethod: PaymentMethod.CASH,
    remarks: '',
    claimantName: ''
  });

  useEffect(() => {
    if (isOpen) {
      setFormData({
        date: extractedData?.date || new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
        description: extractedData?.merchant || '',
        amount: extractedData?.total?.toString() || '',
        paymentMethod: PaymentMethod.CASH,
        remarks: '',
        claimantName: currentClaimant || ''
      });
    }
  }, [extractedData, isOpen, currentClaimant]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      date: formData.date,
      description: formData.description,
      amount: parseFloat(formData.amount) || 0,
      paymentMethod: formData.paymentMethod,
      remarks: formData.remarks,
      claimantName: formData.claimantName
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Verify Claim Details</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 transition">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Claimant Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Claimant Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="e.g. Datin Pang"
                value={formData.claimantName}
                onChange={(e) => setFormData({...formData, claimantName: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="DD.MM.YYYY"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({...formData, amount: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company / Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="Shop Name or Item"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.CASH})}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition ${formData.paymentMethod === PaymentMethod.CASH ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <span>💵 Cash</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, paymentMethod: PaymentMethod.CREDIT_CARD})}
                className={`flex items-center justify-center space-x-2 py-2 px-4 rounded-lg border transition ${formData.paymentMethod === PaymentMethod.CREDIT_CARD ? 'bg-purple-50 border-purple-500 text-purple-700 ring-1 ring-purple-500' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit Card</span>
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Optional)</label>
            <textarea
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition resize-none"
              placeholder="e.g. For project A, Lunch meeting..."
              value={formData.remarks}
              onChange={(e) => setFormData({...formData, remarks: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg shadow-md transition-all active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Check className="w-5 h-5" />
              <span>Confirm & Add to List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
