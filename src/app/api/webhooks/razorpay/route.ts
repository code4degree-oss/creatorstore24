import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';
import { ReceiptEmail } from '@/lib/emails/ReceiptEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        const bodyText = await req.text(); // Raw body needed for signature verification
        const signature = req.headers.get('x-razorpay-signature');

        if (!signature) {
            return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
        }

        const expectedSignature = crypto
            .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
            .update(bodyText)
            .digest('hex');

        if (expectedSignature !== signature) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        const body = JSON.parse(bodyText);

        // Handle payment.captured
        if (body.event === 'payment.captured') {
            const payment = body.payload.payment.entity;
            const orderId = payment.notes?.orderId || payment.description; // Usually passed in notes

            const supabase = await createClient();

            // Ensure we haven't already processed this (idempotency check optional but good)

            // Update the order status
            const { data: order, error } = await supabase
                .from('orders')
                .update({ payment_status: 'paid' })
                .eq('id', orderId)
                .select('*, products(*)')
                .single();

            if (error || !order) {
                console.error("Error updating order:", error);
                return NextResponse.json({ error: 'Order not found' }, { status: 404 });
            }

            // Record payment
            await supabase.from('payments').insert({
                order_id: orderId,
                gateway_id: payment.id,
                amount: payment.amount / 100,
                status: 'captured'
            });

            // Send Receipt Email via Resend
            try {
                const product = order.products || {};
                const downloadLink = product.product_type === 'digital' 
                    ? `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/download?orderId=${order.id}`
                    : undefined;

                await resend.emails.send({
                    from: 'Creator Store <onboarding@resend.dev>', // Use verified domain string in production
                    to: [order.customer_email],
                    subject: `Your receipt for ${product.name}`,
                    react: ReceiptEmail({
                        orderId: order.id,
                        productName: product.name,
                        customerName: order.customer_name,
                        amount: order.total_amount,
                        productType: product.product_type,
                        downloadLink
                    }) as React.ReactElement
                });
                console.log('Receipt email sent to', order.customer_email);
            } catch (emailError) {
                console.error('Failed to send receipt email:', emailError);
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (err: any) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
