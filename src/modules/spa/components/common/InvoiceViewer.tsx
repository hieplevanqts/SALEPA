import { useState, useRef } from 'react';
import { X, ZoomIn, ZoomOut, Printer, Download } from 'lucide-react';
import { InvoicePDFDocument } from '../documents/InvoicePDFDocument';
import type { Order } from '../../../../lib/spa-lib/store';
import { useStore } from '../../../../lib/spa-lib/store';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

interface InvoiceViewerProps {
  order: Order;
  onClose: () => void;
}

export function InvoiceViewer({ order, onClose }: InvoiceViewerProps) {
  const { customers } = useStore();
  const [zoom, setZoom] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);
  const pdfDocumentRef = useRef<HTMLDivElement>(null);

  // Get customer details if customerId exists
  const customer = order.customerId ? customers.find(c => c.id === order.customerId) : undefined;

  const zoomLevels = [0.5, 0.75, 0.8, 1, 1.2, 1.5];
  const currentZoomIndex = zoomLevels.indexOf(zoom);

  const handleZoomIn = () => {
    const nextIndex = Math.min(currentZoomIndex + 1, zoomLevels.length - 1);
    setZoom(zoomLevels[nextIndex]);
  };

  const handleZoomOut = () => {
    const nextIndex = Math.max(currentZoomIndex - 1, 0);
    setZoom(zoomLevels[nextIndex]);
  };

  const handlePrint = () => {
    if (!invoiceRef.current) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Không thể mở cửa sổ in. Vui lòng kiểm tra popup blocker.');
      return;
    }

    // Get the invoice HTML
    const invoiceHTML = invoiceRef.current.innerHTML;
    
    // Write to new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn ${order.id}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Inter, sans-serif; }
            @media print {
              @page { size: A4; margin: 0; }
              body { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${invoiceHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleDownload = async () => {
    if (!pdfDocumentRef.current || isGenerating) return;

    setIsGenerating(true);
    toast.loading('Đang tạo file PDF...', { id: 'pdf-generation' });

    try {
      // Temporarily set zoom to 1 for PDF generation
      const originalZoom = zoom;
      setZoom(1);

      // Wait for render and images to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const element = pdfDocumentRef.current;
      
      console.log('Starting PDF generation...', element);
      
      // Check if all images are loaded
      const images = element.querySelectorAll('img');
      console.log('Found images:', images.length);
      
      for (const img of Array.from(images)) {
        if (!img.complete) {
          console.log('Waiting for image to load:', img.src);
          await new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        }
      }
      
      console.log('All images loaded, generating canvas...');
      
      // Generate canvas from HTML - capture directly from ref
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: true,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Remove all Tailwind classes and convert oklch colors to hex
          const allElements = clonedDoc.querySelectorAll('*');
          allElements.forEach((el: any) => {
            const element = el as HTMLElement;
            
            // Remove all classes to prevent Tailwind oklch colors
            if (element.className && typeof element.className === 'string') {
              element.className = '';
            }
            
            // Force background colors to hex
            const computedStyle = window.getComputedStyle(element);
            const bgColor = computedStyle.backgroundColor;
            if (bgColor && bgColor.includes('oklch')) {
              element.style.backgroundColor = '#ffffff';
            }
            
            const color = computedStyle.color;
            if (color && color.includes('oklch')) {
              element.style.color = '#000000';
            }
          });
          
          console.log('Cloned document cleaned from oklch colors');
        }
      });
      
      console.log('Canvas generated:', canvas.width, 'x', canvas.height);

      // Calculate PDF dimensions (A4)
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      console.log('PDF dimensions:', imgWidth, 'x', imgHeight);

      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Download
      const fileName = `HoaDon_${order.id}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      console.log('PDF saved:', fileName);

      toast.success('✅ Tải xuống PDF thành công!', { id: 'pdf-generation' });

      // Restore original zoom
      setZoom(originalZoom);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      console.error('Error stack:', error?.stack);
      console.error('Error message:', error?.message);
      toast.error(`❌ Lỗi: ${error?.message || 'Không thể tạo PDF'}`, { id: 'pdf-generation' });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-gray-900">
            Xem hóa đơn điện tử
          </h2>
          <div className="h-6 w-px bg-gray-300"></div>
          <span className="text-sm text-gray-600">
            Mã: {order.id.slice(-8).toUpperCase()}
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            order.invoiceStatus === 'issued' 
              ? 'bg-green-100 text-green-700'
              : order.invoiceStatus === 'error'
              ? 'bg-red-100 text-red-700'
              : 'bg-gray-100 text-gray-700'
          }`}>
            {order.invoiceStatus === 'issued' 
              ? 'Đã phát hành' 
              : order.invoiceStatus === 'error'
              ? 'Phát hành lỗi'
              : 'Nháp'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Zoom controls */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-2 py-1">
            <button
              onClick={handleZoomOut}
              disabled={currentZoomIndex === 0}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5 text-gray-700" />
            </button>
            <span className="text-sm font-semibold text-gray-700 min-w-[60px] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={currentZoomIndex === zoomLevels.length - 1}
              className="p-1.5 hover:bg-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Phóng to"
            >
              <ZoomIn className="w-5 h-5 text-gray-700" />
            </button>
          </div>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
            title="In hóa đơn"
          >
            <Printer className="w-5 h-5" />
            <span>In</span>
          </button>

          {/* Download button */}
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            title="Tải xuống PDF"
          >
            <Download className="w-5 h-5" />
            <span>{isGenerating ? 'Đang tạo...' : 'Tải xuống'}</span>
          </button>

          <div className="h-6 w-px bg-gray-300"></div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Đóng"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </div>

      {/* Invoice viewer */}
      <div className="flex-1 overflow-auto" style={{ backgroundColor: '#1F2937' }}>
        <div style={{ padding: '32px', display: 'flex', justifyContent: 'center' }}>
          <div 
            ref={invoiceRef}
            style={{ 
              display: 'inline-block'
            }}
          >
            <div ref={pdfDocumentRef}>
              <InvoicePDFDocument order={order} zoom={zoom} customer={customer} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}