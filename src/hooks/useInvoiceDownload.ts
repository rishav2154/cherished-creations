import { useState } from 'react';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useInvoiceDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadInvoice = async (orderId: string) => {
    setDownloading(orderId);
    
    try {
      const html = await apiFetch<string>(`/orders/${orderId}/invoice`);

      if (!html) {
        throw new Error('No invoice data received');
      }

      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
        
        toast({
          title: 'Invoice Generated',
          description: 'Use Ctrl+P (or Cmd+P) to save as PDF or print',
        });
      } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${orderId.slice(0, 8)}.html`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: 'Invoice Downloaded',
          description: 'Open the file in a browser to print or save as PDF',
        });
      }
    } catch (error: any) {
      console.error('Invoice download error:', error);
      toast({
        title: 'Download Failed',
        description: error.message || 'Could not generate invoice',
        variant: 'destructive',
      });
    } finally {
      setDownloading(null);
    }
  };

  return { downloadInvoice, downloading };
}
