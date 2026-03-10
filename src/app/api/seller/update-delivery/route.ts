import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { ShippingUpdateEmail } from '@/lib/emails/ShippingUpdateEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const { orderId, status } = await req.json();
        
        if (!orderId || !status) {
            return NextResponse.json({ error: 'Missing data' }, { status: 400 });
        }

        const supabase = await createClient();

        // Security Check: Verify user is logged in
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Update the order in the database
        const { data: order, error } = await supabase
            .from('orders')
            .update({ delivery_status: status })
            .eq('id', orderId)
            .eq('seller_id', user.id) // Security Check: Only the seller can update their own orders
            .select('*, products(name, type:product_type), creators(store_name)')
            .single();

        if (error || !order) {
            console.error("Error updating delivery status:", error);
            return NextResponse.json({ error: 'Order not found or update failed' }, { status: 400 });
        }

        // Send Email if status is shipped or delivered
        if (status === 'shipped' || status === 'delivered') {
            try {
                const product = order.products || {};
                const creator = order.creators || {};
                
                await resend.emails.send({
                    from: 'Creator Store <onboarding@resend.dev>', // Verified domain in prod
                    to: [order.customer_email || order.buyer_email],
                    subject: `Order Update: ${status.toUpperCase()} - ${product.name}`,
                    react: ShippingUpdateEmail({
                        orderId: order.id,
                        productName: product.name,
                        customerName: order.customer_name || order.buyer_name,
                        storeName: creator.store_name || 'Creator Store',
                        status: status
                    }) as React.ReactElement
                });
                console.log(`Shipping update email sent to ${order.customer_email || order.buyer_email} for status ${status}`);
            } catch (emailError) {
                console.error("Failed to send shipping email:", emailError);
            }
        }

        return NextResponse.json({ success: true });

    } catch (err: any) {
        console.error('Update delivery error:', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
