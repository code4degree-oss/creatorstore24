import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';

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
                .select('*, products(product_type)')
                .single();

            if (error) console.error("Error updating order:", error);

            // Record payment
            await supabase.from('payments').insert({
                order_id: orderId,
                gateway_id: payment.id,
                amount: payment.amount / 100,
                status: 'captured'
            });

            // If product is digital, auto-fulfill (generate link & email)
            // This is MVP: in production, you would trigger a serverless queue worker using Resend here.
        }

        return NextResponse.json({ status: 'ok' });
    } catch (err: any) {
        console.error('Webhook error:', err);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
