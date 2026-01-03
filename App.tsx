import React, { useState } from 'react';
import { extractReceiptInfo } from './services/geminiService';
import { ReceiptUploader } from './components/ReceiptUploader';
import { EditClaimModal } from './components/EditClaimModal';
import { ClaimList } from './components/ClaimList';
import { ClaimItem, ExtractedReceiptData, PaymentMethod } from './types';
import { FileDown, PlusCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

function App() {
  const [claims, setClaims] = useState<ClaimItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentExtractedData, setCurrentExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [lastClaimant, setLastClaimant] = useState<string>('');

  const handleUpload = async (file: File) => {
    setIsProcessing(true);
    const data = await extractReceiptInfo(file);
    setCurrentExtractedData(data);
    setIsProcessing(false);
    setModalOpen(true);
  };

  const addClaim = (newClaim: Omit<ClaimItem, 'id'>) => {
    setClaims([...claims, { ...newClaim, id: crypto.randomUUID() }]);
    setLastClaimant(newClaim.claimantName);
  };

  const removeClaim = (id: string) => {
    setClaims(claims.filter(c => c.id !== id));
  };

  // Group claims by claimant for the export logic
  const downloadExcel = () => {
    if (claims.length === 0) return;

    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Group items by claimant name
    const groupedClaims = claims.reduce((acc, claim) => {
      if (!acc[claim.claimantName]) acc[claim.claimantName] = [];
      acc[claim.claimantName].push(claim);
      return acc;
    }, {} as Record<string, ClaimItem[]>);

    // Build the sheet data array
    const wsData: (string | number | null)[] [] = [];

    // Main Header
    wsData.push(["SER ENTERPRISE SDN. BHD."]);
    wsData.push([`Monthly Claim as of ${new Date().toLocaleDateString('en-GB')}`]);
    wsData.push([]); // Spacer

    let grandTotalCredit = 0;
    let grandTotalCash = 0;

    // Iterate over each person
    Object.keys(groupedClaims).forEach(claimant => {
      // Sub-header for Claimant
      wsData.push([claimant]); 
      
      // Table Header
      wsData.push(["Date", "Description", "Ref No", "Credit Card", "Cash", "Remarks"]);

      let subTotalCredit = 0;
      let subTotalCash = 0;

      groupedClaims[claimant].forEach(claim => {
        const isCredit = claim.paymentMethod === PaymentMethod.CREDIT_CARD;
        const isCash = claim.paymentMethod === PaymentMethod.CASH;
        
        const creditAmt = isCredit ? claim.amount : null;
        const cashAmt = isCash ? claim.amount : null;

        if (isCredit) subTotalCredit += claim.amount;
        if (isCash) subTotalCash += claim.amount;

        wsData.push([
          claim.date,
          claim.description,
          claim.refNo || "",
          creditAmt || null, // Ensure numeric for excel math
          cashAmt || null,
          claim.remarks
        ]);
      });

      // Subtotals for this person
      wsData.push([
        "", 
        "Subtotal", 
        "", 
        subTotalCredit, 
        subTotalCash, 
        ""
      ]);
      
      wsData.push([]); // Spacer between people
      
      grandTotalCredit += subTotalCredit;
      grandTotalCash += subTotalCash;
    });

    // Grand Total Row
    wsData.push([
      "",
      "GRAND TOTAL (A) :",
      "",
      grandTotalCredit,
      grandTotalCash,
      ""
    ]);

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Merge cells for main title
    if(!ws['!merges']) ws['!merges'] = [];
    ws['!merges'].push({ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }); // SER ENTERPRISE...
    ws['!merges'].push({ s: { r: 1, c: 0 }, e: { r: 1, c: 5 } }); // Monthly Claim...

    // Set column widths
    ws['!cols'] = [
      { wch: 12 }, // Date
      { wch: 40 }, // Description
      { wch: 10 }, // Ref
      { wch: 15 }, // Credit
      { wch: 15 }, // Cash
      { wch: 30 }, // Remarks
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Claims");
    XLSX.writeFile(wb, "Claim_Report.xlsx");
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 text-white p-1.5 rounded-lg">
              <FileDown className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-800 tracking-tight">SmartClaim</h1>
          </div>
          <div className="flex items-center space-x-4">
             <button
              onClick={() => {
                setCurrentExtractedData({});
                setModalOpen(true);
              }}
              className="hidden sm:flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Manual Entry</span>
            </button>
            <button
              onClick={downloadExcel}
              disabled={claims.length === 0}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition shadow-sm
                ${claims.length > 0 
                  ? 'bg-green-600 text-white hover:bg-green-700 active:scale-95' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              <FileDown className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Upload Section */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1">
          <ReceiptUploader onUpload={handleUpload} isProcessing={isProcessing} />
        </section>

        {/* List Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-800">Current Claims</h2>
            <span className="text-sm bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-medium">
              {claims.length} items
            </span>
          </div>
          <ClaimList claims={claims} onRemove={removeClaim} />
        </section>

      </main>

      <EditClaimModal
        extractedData={currentExtractedData}
        currentClaimant={lastClaimant}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={addClaim}
      />
    </div>
  );
}

export default App;
