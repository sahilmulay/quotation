import React, { useState, useEffect } from 'react';
import { CompanyDetails, Quotation, TemplateConfig } from '../../types';
import { downloadQuotationPDF, printQuotationPDF } from '../../services/pdfGenerator';
import { downloadQuotationJPG, generateQuotationImageBlob } from '../../services/imageGenerator';
import { openSystemShareSheet } from '../../services/shareService';
import { 
  Printer, 
  CheckCircle2, 
  FileCheck, 
  FileDown, 
  Check,
  Eye,
  Share2
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
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate crisp visual image preview for 100% mobile compatibility
  useEffect(() => {
    let active = true;
    let urlToRevoke: string | null = null;

    generateQuotationImageBlob(quote, company, 'image/jpeg')
      .then((blob) => {
        if (!active) return;
        const url = URL.createObjectURL(blob);
        urlToRevoke = url;
        setPreviewImageUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate quotation preview:', err);
      });

    return () => {
      active = false;
      if (urlToRevoke) URL.revokeObjectURL(urlToRevoke);
    };
  }, [quote, company]);

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

  const handleShare = async () => {
    const res = await openSystemShareSheet(quote, company, template);
    if (res.method === 'fallback') {
      setToastMessage('📄 PDF saved to Downloads & opening share!');
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
            <h3 className="font-bold text-slate-800 text-sm">Download & Share Quotation</h3>
            <p className="text-xs text-slate-500">Save as PDF & Photo (JPG) or share to any app</p>
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

      {/* Primary Action Buttons: Download & Share */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Download Photo & PDF */}
        <button
          type="button"
          onClick={handleDownloadPhotoAndPDF}
          className="py-3.5 px-4 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
        >
          <FileDown className="w-5 h-5 text-sky-300" />
          <span>Download Photo & PDF</span>
        </button>

        {/* Share Button (Opens Android/iOS System Share Drawer) */}
        <button
          type="button"
          onClick={handleShare}
          className="py-3.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-sm shadow-md flex items-center justify-center gap-2.5 active:scale-[0.98] transition"
        >
          <Share2 className="w-5 h-5 text-sky-100" />
          <span>Share Quotation</span>
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

      {/* Preview Section Header */}
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 px-1 pt-1">
        <Eye className="w-4 h-4 text-sky-600" />
        <span>Quotation Preview</span>
      </div>

      {/* Crystal Clear 100% Mobile Compatible Preview */}
      {previewImageUrl ? (
        <div className="bg-white rounded-2xl border-2 border-slate-300 overflow-hidden shadow-lg p-1 sm:p-2">
          <img
            src={previewImageUrl}
            alt="Quotation Preview"
            className="w-full h-auto rounded-xl shadow-xs object-contain"
          />
        </div>
      ) : (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <div className="w-8 h-8 border-3 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-600">Generating crisp quotation preview...</p>
        </div>
      )}
    </div>
  );
};
