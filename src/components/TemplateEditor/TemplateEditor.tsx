import React, { useState, useRef, useEffect } from 'react';
import { CompanyDetails, FieldPosition, Quotation, TemplateConfig } from '../../types';
import { resetTemplateToDefault, saveActiveTemplateConfig } from '../../db/db';
import { getQuotationPDFBlobUrl } from '../../services/pdfGenerator';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Save, 
  Eye, 
  Move, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Check, 
  Sliders, 
  Sparkles
} from 'lucide-react';

interface TemplateEditorProps {
  template: TemplateConfig;
  company: CompanyDetails;
  sampleQuote: Quotation;
  onTemplateSaved: (newConfig: TemplateConfig) => void;
}

export const TemplateEditor: React.FC<TemplateEditorProps> = ({
  template: initialTemplate,
  company,
  sampleQuote,
  onTemplateSaved,
}) => {
  const [template, setTemplate] = useState<TemplateConfig>(initialTemplate);
  const [selectedFieldId, setSelectedFieldId] = useState<string>('customerName');
  const [zoom, setZoom] = useState<number>(0.85); // 85% default for mobile screen
  const [showLivePdf, setShowLivePdf] = useState<boolean>(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // A4 dimensions in mm
  const A4_WIDTH_MM = 210;
  const A4_HEIGHT_MM = 297;

  // Convert mm to pixels on the canvas based on current zoom scale
  // Base scale: 1mm = 3.7795px (96 DPI)
  const MM_TO_PX = 3.7795275591;
  const canvasWidthPx = A4_WIDTH_MM * MM_TO_PX * zoom;
  const canvasHeightPx = A4_HEIGHT_MM * MM_TO_PX * zoom;

  useEffect(() => {
    setTemplate(initialTemplate);
  }, [initialTemplate]);

  // Update Live PDF Preview when template changes
  useEffect(() => {
    if (showLivePdf) {
      try {
        const url = getQuotationPDFBlobUrl(sampleQuote, company, template);
        setPdfPreviewUrl(url);
        return () => {
          if (url) URL.revokeObjectURL(url);
        };
      } catch (e) {
        console.error('PDF Preview failed:', e);
      }
    }
  }, [showLivePdf, template, sampleQuote, company]);

  const selectedField = template.positions[selectedFieldId] || template.positions.customerName;

  const handleUpdateField = (fieldId: string, updates: Partial<FieldPosition>) => {
    setTemplate((prev) => ({
      ...prev,
      positions: {
        ...prev.positions,
        [fieldId]: {
          ...prev.positions[fieldId],
          ...updates,
        },
      },
    }));
  };

  // Dragging handlers on canvas
  const handlePointerDown = (fieldId: string, e: React.PointerEvent) => {
    e.stopPropagation();
    setSelectedFieldId(fieldId);
    setIsDragging(true);

    const pos = template.positions[fieldId];
    if (pos && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const pointerX_mm = (e.clientX - rect.left) / (MM_TO_PX * zoom);
      const pointerY_mm = (e.clientY - rect.top) / (MM_TO_PX * zoom);
      setDragOffset({
        x: pointerX_mm - pos.x,
        y: pointerY_mm - pos.y,
      });
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !selectedFieldId || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const pointerX_mm = (e.clientX - rect.left) / (MM_TO_PX * zoom);
    const pointerY_mm = (e.clientY - rect.top) / (MM_TO_PX * zoom);

    let newX = Math.round((pointerX_mm - dragOffset.x) * 2) / 2; // snap to 0.5mm
    let newY = Math.round((pointerY_mm - dragOffset.y) * 2) / 2;

    // Constrain within A4 bounds
    newX = Math.max(5, Math.min(newX, A4_WIDTH_MM - 15));
    newY = Math.max(10, Math.min(newY, A4_HEIGHT_MM - 15));

    handleUpdateField(selectedFieldId, { x: newX, y: newY });
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleSave = async () => {
    await saveActiveTemplateConfig(template);
    onTemplateSaved(template);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleReset = async () => {
    if (confirm('Reset all field positions to the official factory default layout?')) {
      const def = await resetTemplateToDefault();
      setTemplate(def);
      onTemplateSaved(def);
    }
  };

  return (
    <div className="space-y-4 pb-24 pt-2">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-sm">Visual Template Editor</h2>
            <p className="text-[11px] text-slate-500">Drag & position placeholders for pixel-perfect printing</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setShowLivePdf(!showLivePdf)}
            className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition ${
              showLivePdf ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-slate-50 text-slate-700'
            }`}
            title="Toggle Live PDF Preview"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Live PDF</span>
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 active:scale-95 transition"
            title="Reset to Factory Default"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-2 bg-[#0F2C59] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition"
          >
            {saveSuccess ? <Check className="w-4 h-4 text-emerald-400" /> : <Save className="w-4 h-4" />}
            <span>{saveSuccess ? 'Saved!' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Field Selector & Inspector Panel (Sticky on mobile) */}
      <div className="bg-white rounded-2xl p-3 shadow-xs border border-slate-200/80 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
            <Move className="w-3.5 h-3.5 text-indigo-600" />
            <span>Select Element to Adjust</span>
          </label>

          <select
            value={selectedFieldId}
            onChange={(e) => setSelectedFieldId(e.target.value)}
            className="text-xs font-bold bg-slate-100 border border-slate-300 rounded-xl px-2.5 py-1.5 outline-none max-w-[200px]"
          >
            {Object.entries(template.positions).map(([id, pos]) => (
              <option key={id} value={id}>
                {pos.label}
              </option>
            ))}
          </select>
        </div>

        {/* Selected Field Fine-Tuning Controls */}
        {selectedField && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            {/* X Position (mm) */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">X Position (mm)</span>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { x: Math.max(0, selectedField.x - 0.5) })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={selectedField.x}
                  onChange={(e) => handleUpdateField(selectedField.id, { x: parseFloat(e.target.value) || 0 })}
                  className="w-14 text-center font-bold bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { x: selectedField.x + 0.5 })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Y Position (mm) */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Y Position (mm)</span>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { y: Math.max(0, selectedField.y - 0.5) })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  -
                </button>
                <input
                  type="number"
                  step="0.5"
                  value={selectedField.y}
                  onChange={(e) => handleUpdateField(selectedField.id, { y: parseFloat(e.target.value) || 0 })}
                  className="w-14 text-center font-bold bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { y: selectedField.y + 0.5 })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Font Size (pt) */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Font Size (pt)</span>
              <div className="flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { fontSize: Math.max(6, selectedField.fontSize - 0.5) })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  -
                </button>
                <span className="font-bold text-slate-900">{selectedField.fontSize}pt</span>
                <button
                  type="button"
                  onClick={() => handleUpdateField(selectedField.id, { fontSize: selectedField.fontSize + 0.5 })}
                  className="w-6 h-6 rounded bg-white border border-slate-300 font-bold text-slate-700 active:scale-95"
                >
                  +
                </button>
              </div>
            </div>

            {/* Font Styling & Alignment */}
            <div className="bg-slate-50 p-2 rounded-xl border border-slate-200 flex items-center justify-around">
              <button
                type="button"
                onClick={() =>
                  handleUpdateField(selectedField.id, {
                    fontWeight: selectedField.fontWeight === 'bold' ? 'normal' : 'bold',
                  })
                }
                className={`px-2 py-1 rounded font-bold text-xs ${
                  selectedField.fontWeight === 'bold' ? 'bg-[#0F2C59] text-white' : 'bg-white border border-slate-300 text-slate-700'
                }`}
                title="Toggle Bold"
              >
                B
              </button>

              <div className="flex rounded border border-slate-300 overflow-hidden">
                {(['left', 'center', 'right'] as const).map((aln) => (
                  <button
                    key={aln}
                    type="button"
                    onClick={() => handleUpdateField(selectedField.id, { align: aln })}
                    className={`p-1 ${
                      selectedField.align === aln ? 'bg-[#0F2C59] text-white' : 'bg-white text-slate-600'
                    }`}
                  >
                    {aln === 'left' && <AlignLeft className="w-3 h-3" />}
                    {aln === 'center' && <AlignCenter className="w-3 h-3" />}
                    {aln === 'right' && <AlignRight className="w-3 h-3" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Toolbar */}
      <div className="flex items-center justify-between px-2">
        <span className="text-xs text-slate-500 font-medium">
          Drag fields on paper below to reposition
        </span>

        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-xl border border-slate-200 shadow-xs">
          <button
            type="button"
            onClick={() => setZoom((z) => Math.max(0.4, Math.round((z - 0.1) * 10) / 10))}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
            title="Zoom Out"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-bold text-slate-700 min-w-[36px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoom((z) => Math.min(1.5, Math.round((z + 0.1) * 10) / 10))}
            className="p-1 rounded hover:bg-slate-100 text-slate-700"
            title="Zoom In"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Live PDF Modal Drawer */}
      {showLivePdf && pdfPreviewUrl && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6">
          <div className="bg-white w-full max-w-2xl h-[85vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden">
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm">Live PDF Rendering Preview</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowLivePdf(false)}
                className="w-7 h-7 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>
            <iframe
              src={`${pdfPreviewUrl}#toolbar=0`}
              className="w-full flex-1 border-none"
              title="Live PDF Render"
            />
          </div>
        </div>
      )}

      {/* Interactive Visual Canvas Container */}
      <div className="overflow-auto bg-slate-200/80 p-4 rounded-2xl border border-slate-300 flex justify-center shadow-inner min-h-[500px]">
        <div
          ref={canvasRef}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          style={{
            width: `${canvasWidthPx}px`,
            height: `${canvasHeightPx}px`,
            transformOrigin: 'top center',
          }}
          className="bg-white relative shadow-xl border border-slate-400 select-none cursor-crosshair overflow-hidden"
        >
          {/* Static A4 Quotation Layout Background Grid */}
          <div className="absolute inset-0 pointer-events-none text-slate-400 font-sans">
            {/* Header Box (10mm to 200mm, 32mm to 62mm) */}
            <div
              style={{
                left: `${10 * MM_TO_PX * zoom}px`,
                top: `${32 * MM_TO_PX * zoom}px`,
                width: `${190 * MM_TO_PX * zoom}px`,
                height: `${240 * MM_TO_PX * zoom}px`,
                border: `${1.5 * zoom}px solid #1E293B`,
              }}
              className="absolute"
            >
              {/* Header bottom divider */}
              <div
                style={{
                  top: `${30 * MM_TO_PX * zoom}px`,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute w-full"
              />

              {/* Customer Box vs Quote Info Box vertical line */}
              <div
                style={{
                  top: `${30 * MM_TO_PX * zoom}px`,
                  left: `${110 * MM_TO_PX * zoom}px`,
                  width: `${1 * zoom}px`,
                  height: `${26 * MM_TO_PX * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute"
              />

              {/* Meta box horizontal split */}
              <div
                style={{
                  top: `${43 * MM_TO_PX * zoom}px`,
                  left: `${110 * MM_TO_PX * zoom}px`,
                  right: 0,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute"
              />

              {/* Salutation bottom line */}
              <div
                style={{
                  top: `${70 * MM_TO_PX * zoom}px`,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute w-full"
              />

              {/* Table Header row bottom */}
              <div
                style={{
                  top: `${78 * MM_TO_PX * zoom}px`,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute w-full"
              />

              {/* Table Column Lines */}
              {[16, 125, 143, 167].map((cx) => (
                <div
                  key={cx}
                  style={{
                    left: `${cx * MM_TO_PX * zoom}px`,
                    top: `${70 * MM_TO_PX * zoom}px`,
                    height: `${108 * MM_TO_PX * zoom}px`,
                    width: `${1 * zoom}px`,
                    backgroundColor: '#1E293B',
                  }}
                  className="absolute"
                />
              ))}

              {/* Table items bottom line */}
              <div
                style={{
                  top: `${178 * MM_TO_PX * zoom}px`,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute w-full"
              />

              {/* Total row bottom line */}
              <div
                style={{
                  top: `${186 * MM_TO_PX * zoom}px`,
                  height: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute w-full"
              />

              {/* Terms vertical center split */}
              <div
                style={{
                  top: `${186 * MM_TO_PX * zoom}px`,
                  left: `${110 * MM_TO_PX * zoom}px`,
                  bottom: 0,
                  width: `${1 * zoom}px`,
                  backgroundColor: '#1E293B',
                }}
                className="absolute"
              />
            </div>
          </div>

          {/* Draggable & Selectable Field Placeholders */}
          {Object.entries(template.positions).map(([fieldId, field]) => {
            const isSelected = selectedFieldId === fieldId;
            const leftPx = field.x * MM_TO_PX * zoom;
            const topPx = field.y * MM_TO_PX * zoom;
            const widthPx = (field.width || 60) * MM_TO_PX * zoom;
            const heightPx = (field.height || 6) * MM_TO_PX * zoom;
            const fontPx = field.fontSize * (MM_TO_PX / 2.8346) * zoom;

            let sampleText = field.label;
            if (fieldId === 'quotationTitle') sampleText = 'QUOTATION';
            if (fieldId === 'companyName') sampleText = company.name;
            if (fieldId === 'companyAddress') sampleText = company.address;
            if (fieldId === 'companyPhones') sampleText = `Mobile No – ${company.phones}`;
            if (fieldId === 'companyEmail') sampleText = `e-mail ${company.email}`;
            if (fieldId === 'companyGstn') sampleText = `GSTN No -${company.gstn}`;
            if (fieldId === 'customerName') sampleText = sampleQuote.customerName;
            if (fieldId === 'quoteNo') sampleText = sampleQuote.quotationNo;
            if (fieldId === 'quoteDate') sampleText = sampleQuote.quotationDate;
            if (fieldId === 'signatoryName') sampleText = company.signatoryName;

            return (
              <div
                key={fieldId}
                onPointerDown={(e) => handlePointerDown(fieldId, e)}
                style={{
                  left: `${leftPx}px`,
                  top: `${topPx}px`,
                  width: `${widthPx}px`,
                  minHeight: `${heightPx}px`,
                  fontSize: `${Math.max(8, fontPx)}px`,
                  fontWeight: field.fontWeight === 'bold' ? 700 : 400,
                  textAlign: field.align || 'left',
                  transform: field.align === 'center' ? 'translateX(-50%)' : 'none',
                }}
                className={`absolute cursor-move px-1 py-0.5 rounded transition-colors touch-none flex items-center ${
                  isSelected
                    ? 'ring-2 ring-indigo-600 bg-indigo-500/20 text-indigo-950 font-bold z-30 shadow-md'
                    : 'border border-dashed border-sky-400/80 bg-sky-500/10 text-slate-800 hover:bg-sky-500/20 z-10'
                }`}
              >
                <span className="truncate w-full pointer-events-none">
                  {sampleText}
                </span>

                {/* Coordinate badge if selected */}
                {isSelected && (
                  <span className="absolute -top-4 left-0 bg-indigo-600 text-white text-[8px] px-1 py-0.2 rounded font-mono font-bold whitespace-nowrap shadow-xs pointer-events-none">
                    X:{field.x} Y:{field.y}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
