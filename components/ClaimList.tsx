import React from 'react';
import { ClaimItem, PaymentMethod } from '../types';
import { Trash2 } from 'lucide-react';

interface ClaimListProps {
  claims: ClaimItem[];
  onRemove: (id: string) => void;
}

export const ClaimList: React.FC<ClaimListProps> = ({ claims, onRemove }) => {
  if (claims.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
        <p className="text-gray-500">No claims added yet. Upload a receipt to get started.</p>
      </div>
    );
  }

  // Calculate totals
  const totalCash = claims
    .filter(c => c.paymentMethod === PaymentMethod.CASH)
    .reduce((sum, c) => sum + c.amount, 0);
  
  const totalCredit = claims
    .filter(c => c.paymentMethod === PaymentMethod.CREDIT_CARD)
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 text-gray-700 font-semibold border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 whitespace-nowrap">Date</th>
              <th className="px-4 py-3">Claimant</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-right text-purple-700">Credit Card</th>
              <th className="px-4 py-3 text-right text-green-700">Cash</th>
              <th className="px-4 py-3">Remarks</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {claims.map((claim) => (
              <tr key={claim.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">{claim.date}</td>
                <td className="px-4 py-3 text-gray-600">{claim.claimantName}</td>
                <td className="px-4 py-3 text-gray-800">{claim.description}</td>
                <td className="px-4 py-3 text-right font-medium text-purple-600">
                  {claim.paymentMethod === PaymentMethod.CREDIT_CARD ? claim.amount.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-3 text-right font-medium text-green-600">
                  {claim.paymentMethod === PaymentMethod.CASH ? claim.amount.toFixed(2) : '-'}
                </td>
                <td className="px-4 py-3 text-gray-500 truncate max-w-xs" title={claim.remarks}>
                  {claim.remarks}
                </td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => onRemove(claim.id)}
                    className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {/* Totals Row */}
            <tr className="bg-gray-50 font-bold border-t-2 border-gray-200">
              <td colSpan={3} className="px-4 py-3 text-right text-gray-700">Grand Total:</td>
              <td className="px-4 py-3 text-right text-purple-700">{totalCredit.toFixed(2)}</td>
              <td className="px-4 py-3 text-right text-green-700">{totalCash.toFixed(2)}</td>
              <td colSpan={2}></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
