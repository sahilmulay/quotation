import React, { useState, useEffect } from 'react';
import { CompanyDetails, Quotation, TemplateConfig } from '../../types';
import { downloadQuotationPDF } from '../../services/pdfGenerator';
import { downloadQuotationJPG, generateQuotationImageBlob } from '../../services/imageGenerator';
import { openSystemShareSheet } from '../../services/shareService';
import { 
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
  onFinish?: () => void;
}

export const Step5GenerateReview: React.FC<Step5GenerateReviewProps> = ({
  quote,
  company,
  template,
  onSave,
}) => {
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save quotation automatically as soon as the user arrives at Step 5
  useEffect(() => {
    onSave()
      .then(() => setIsSaved(true))
      .catch((err) => console.error('Auto-save on Step 5 error:', err));
  }, []);

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
      // 1. Auto-save quotation
      await onSave();
      setIsSaved(true);

      // 2. Download official vector PDF
      downloadQuotationPDF(quote, company, template, 'full');

      // 3. Download high-resolution JPG image (for Gallery / Photos)
      await downloadQuotationJPG(quote, company);

      setToastMessage('📸 Photo & 📄 PDF downloaded & saved to Quotations!');
      setTimeout(() => setToastMessage(null), 4000);
    } catch (err) {
      console.error('Error downloading:', err);
      setToastMessage('📄 PDF downloaded & saved to Quotations!');
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleShare = async () => {
    try {
      // Auto-save quotation before sharing
      await onSave();
      setIsSaved(true);

      const res = await openSystemShareSheet(quote, company, template);
      if (res.method === 'fallback') {
        setToastMessage('📄 PDF saved to Quotations & opening share!');
        setTimeout(() => setToastMessage(null), 3500);
      }
    } catch (err) {
      console.error('Share error:', err);
    }
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
            <p className="text-xs text-slate-500">Auto-saved to Quotations • Download as PDF & Photo</p>
          </div>
        </div>

        <span
          className={`px-2.5 py-1 text-xs font-extrabold rounded-full border flex items-center gap-1 ${
            isSaved
              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
              : 'bg-sky-100 text-sky-800 border-sky-300'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>{isSaved ? 'Auto-Saved' : 'Saving...'}</span>
        </span>
      </div>

      {/* Success Toast */}
      {toastMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-950 p-3 rounded-xl text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean 2-Button Action Row: Share & Download */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          onClick={handleShare}
          className="py-3.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-sky-100 shrink-0" />
          <span>Share Quote</span>
        </button>

        <button
          type="button"
          onClick={handleDownloadPhotoAndPDF}
          className="py-3.5 px-3 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white rounded-2xl font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition"
        >
          <FileDown className="w-4 h-4 sm:w-5 sm:h-5 text-sky-300 shrink-0" />
          <span>Download PDF</span>
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
