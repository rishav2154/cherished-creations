import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderItem {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  order_number: string;
  status: string;
  payment_status: string;
  payment_method: string;
  subtotal: number;
  shipping: number | null;
  tax: number | null;
  discount: number | null;
  total: number;
  shipping_address: {
    full_name?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state?: string;
    pincode?: string;
    phone?: string;
  };
  created_at: string;
  user_id: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function generateInvoiceHTML(order: Order, items: OrderItem[]): string {
  const itemRows = items
    .map(
      (item, index) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${index + 1}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.product_name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${Number(item.price).toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₹${(item.quantity * Number(item.price)).toFixed(2)}</td>
      </tr>
    `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${order.order_number}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          background: #f3f4f6;
          padding: 20px;
        }
        .invoice-container {
          max-width: 800px;
          margin: 0 auto;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px;
          text-align: center;
        }
        .header h1 { font-size: 28px; margin-bottom: 8px; }
        .header p { opacity: 0.9; font-size: 14px; }
        .content { padding: 40px; }
        .invoice-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 40px;
          flex-wrap: wrap;
          gap: 20px;
        }
        .invoice-info-item h3 {
          color: #6b7280;
          font-size: 12px;
          text-transform: uppercase;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }
        .invoice-info-item p { color: #1f2937; font-size: 14px; line-height: 1.6; }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 600;
        }
        .badge-success { background: #d1fae5; color: #065f46; }
        .badge-warning { background: #fef3c7; color: #92400e; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th {
          background: #f9fafb;
          padding: 14px 12px;
          text-align: left;
          font-size: 12px;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #e5e7eb;
        }
        th:nth-child(3), th:nth-child(4), th:nth-child(5) { text-align: center; }
        th:last-child { text-align: right; }
        .totals {
          border-top: 2px solid #e5e7eb;
          padding-top: 20px;
          margin-left: auto;
          width: 300px;
        }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
          font-size: 14px;
        }
        .totals-row span:first-child { color: #6b7280; }
        .totals-row.total {
          font-size: 18px;
          font-weight: bold;
          border-top: 2px solid #e5e7eb;
          margin-top: 10px;
          padding-top: 15px;
        }
        .totals-row.discount span { color: #059669; }
        .footer {
          background: #f9fafb;
          padding: 30px 40px;
          text-align: center;
          font-size: 12px;
          color: #6b7280;
        }
        @media print {
          body { background: white; padding: 0; }
          .invoice-container { box-shadow: none; border-radius: 0; }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="header">
          <h1>INVOICE</h1>
          <p>${order.order_number}</p>
        </div>
        
        <div class="content">
          <div class="invoice-info">
            <div class="invoice-info-item">
              <h3>Invoice Date</h3>
              <p>${formatDate(order.created_at)}</p>
            </div>
            <div class="invoice-info-item">
              <h3>Payment Status</h3>
              <p>
                <span class="badge ${order.payment_status === 'paid' ? 'badge-success' : 'badge-warning'}">
                  ${order.payment_status === 'paid' ? 'Paid' : 'Pending'}
                </span>
              </p>
            </div>
            <div class="invoice-info-item">
              <h3>Payment Method</h3>
              <p>${order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method}</p>
            </div>
            <div class="invoice-info-item">
              <h3>Ship To</h3>
              <p>
                ${order.shipping_address?.full_name || 'N/A'}<br>
                ${order.shipping_address?.address_line1 || ''}${order.shipping_address?.address_line2 ? ', ' + order.shipping_address.address_line2 : ''}<br>
                ${order.shipping_address?.city || ''}, ${order.shipping_address?.state || ''} - ${order.shipping_address?.pincode || ''}<br>
                Phone: ${order.shipping_address?.phone || 'N/A'}
              </p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Subtotal</span>
              <span>₹${Number(order.subtotal).toFixed(2)}</span>
            </div>
            ${order.shipping && order.shipping > 0 ? `
              <div class="totals-row">
                <span>Shipping</span>
                <span>₹${Number(order.shipping).toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.tax && order.tax > 0 ? `
              <div class="totals-row">
                <span>Tax</span>
                <span>₹${Number(order.tax).toFixed(2)}</span>
              </div>
            ` : ''}
            ${order.discount && order.discount > 0 ? `
              <div class="totals-row discount">
                <span>Discount</span>
                <span>-₹${Number(order.discount).toFixed(2)}</span>
              </div>
            ` : ''}
            <div class="totals-row total">
              <span>Total</span>
              <span>₹${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div class="footer">
          <p>Thank you for your purchase!</p>
          <p style="margin-top: 8px;">For any questions, please contact our customer support.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = user.id;

    // Get order ID from request
    const { orderId } = await req.json();
    
    if (!orderId) {
      return new Response(JSON.stringify({ error: "Order ID is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order - RLS will handle authorization (user can only see their orders, admins can see all)
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Error fetching order:", orderError);
      return new Response(JSON.stringify({ error: "Failed to fetch order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order) {
      return new Response(JSON.stringify({ error: "Order not found or access denied" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order items
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      return new Response(JSON.stringify({ error: "Failed to fetch order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Generate invoice HTML
    const invoiceHTML = generateInvoiceHTML(order as Order, items as OrderItem[]);

    console.log(`Invoice generated for order: ${order.order_number}`);

    return new Response(
      JSON.stringify({
        html: invoiceHTML,
        orderNumber: order.order_number,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating invoice:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate invoice" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
