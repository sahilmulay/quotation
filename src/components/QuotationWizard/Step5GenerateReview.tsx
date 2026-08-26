import React, { useState, useEffect } from 'react';
import { CompanyDetails, Quotation, TemplateConfig } from '../../types';
import { downloadQuotationPDF, getQuotationPDFBlobUrl, printQuotationPDF } from '../../services/pdfGenerator';
import { downloadQuotationJPG } from '../../services/imageGenerator';
import { 
  Printer, 
  CheckCircle2, 
  FileCheck, 
  FileDown, 
  Check 
} from 'lucide-react';

interface Step5GenerateReviewProps {
  quote: Quotation;
  company: CompanyDetails;
  template: TemplateConfig;
  onSave: () => Promise<void>;
  onFinish: () => void;
}

export const Step5GenerateReview: React.FC<Step5GenerateReviewProps> = ({
  quote,
  company,
  template,
  onSave,
  onFinish,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      const url = getQuotationPDFBlobUrl(quote, company, template, 'full');
      setPdfUrl(url);
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } catch (err) {
      console.error('Failed to create PDF preview blob:', err);
    }
  }, [quote, company, template]);

  const handleDownloadPhotoAndPDF = async () => {
    try {
      // 1. Download official vector PDF
      downloadQuotationPDF(quote, company, template, 'full');

      // 2. Download high-resolution JPG image (for Gallery / Photos)
      await downloadQuotationJPG(quote, company);

      setToastMessage('📸 Photo (JPG) & 📄 PDF downloaded successfully!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error downloading:', err);
      setToastMessage('📄 PDF downloaded successfully!');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handlePrint = () => {
    printQuotationPDF(quote, company, template, 'full');
  };

  const handleSaveAndDone = async () => {
    setIsSaving(true);
    await onSave();
    setIsSaving(false);
    setIsSaved(true);
    setTimeout(() => {
      onFinish();
    }, 600);
  };

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
            5
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Download & Print Quotation</h3>
            <p className="text-xs text-slate-500">Save as PDF & Photo (JPG) directly in your gallery</p>
          </div>
        </div>

        <span className="px-2.5 py-1 text-xs font-extrabold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300 flex items-center gap-1">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Ready</span>
        </span>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Single Combined Download Button: Photo & PDF */}
      <div>
        <button
          type="button"
          onClick={handleDownloadPhotoAndPDF}
          className="w-full py-4 px-4 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
        >
          <FileDown className="w-5 h-5 text-sky-300" />
          <span>Download Photo & PDF</span>
        </button>
      </div>

      {/* Secondary Actions: Print & Save */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Print Document */}
        <button
          type="button"
          onClick={handlePrint}
          className="py-3 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold text-xs shadow-xs flex items-center justify-center gap-2 transition active:scale-[0.98]"
        >
          <Printer className="w-4 h-4 text-slate-300" />
          <span>Print Document</span>
        </button>

        {/* Save & Finish Button */}
        <button
          type="button"
          onClick={handleSaveAndDone}
          disabled={isSaving}
          className={`py-3 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition active:scale-[0.98] ${
            isSaved
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-50 shadow-xs'
          }`}
        >
          <CheckCircle2 className={`w-4 h-4 ${isSaved ? 'text-white' : 'text-emerald-600'}`} />
          <span>{isSaving ? 'Saving...' : isSaved ? 'Saved to Records!' : 'Save & Finish'}</span>
        </button>
      </div>

      {/* Direct Official PDF Viewport */}
      {pdfUrl ? (
        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-lg aspect-[1/1.414] w-full min-h-[480px]">
          <iframe
            src={`${pdfUrl}#toolbar=0&navpanes=0`}
            className="w-full h-full min-h-[480px] border-none"
            title="Quotation PDF Preview"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-400">
          Generating PDF preview...
        </div>
      )}
    </div>
  );
};
