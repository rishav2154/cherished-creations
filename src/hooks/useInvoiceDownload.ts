import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useInvoiceDownload() {
  const [downloading, setDownloading] = useState<string | null>(null);
  const { toast } = useToast();

  const downloadInvoice = async (orderId: string) => {
    setDownloading(orderId);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice', {
        body: { orderId },
      });

      if (error) {
        throw new Error(error.message || 'Failed to generate invoice');
      }

      if (!data?.html) {
        throw new Error('No invoice data received');
      }

      // Create a blob from the HTML content
      const blob = new Blob([data.html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      
      // Open in new window for printing/saving as PDF
      const printWindow = window.open(url, '_blank');
      
      if (printWindow) {
        printWindow.onload = () => {
          // Clean up the URL after the window loads
          setTimeout(() => {
            window.URL.revokeObjectURL(url);
          }, 1000);
        };
        
        toast({
          title: 'Invoice Generated',
          description: 'Use Ctrl+P (or Cmd+P) to save as PDF or print',
        });
      } else {
        // Fallback: download as HTML file
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice-${data.orderNumber}.html`;
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
