import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
    try {
        const razorpay = new Razorpay({
            key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'dummy',
            key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy',
        });
        const { productId, buyerInfo } = await req.json();

        const supabase = await createClient();

        // 1. Fetch product security to ensure price is not tampered
        const { data: product } = await supabase
            .from('products')
            .select('*, creators(id)')
            .eq('id', productId)
            .single();

        if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

        // Calculate fees (5% platform fee)
        const amount = Number(product.price);
        const platformFee = amount * 0.05;
        const sellerAmount = amount - platformFee;

        // 2. Create pending order in DB
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .insert({
                seller_id: product.creator_id,
                buyer_email: buyerInfo.email,
                buyer_name: buyerInfo.name,
                buyer_phone: buyerInfo.phone || null,
                shipping_address: buyerInfo.address || null,
                order_amount: amount,
                platform_fee: platformFee,
                seller_amount: sellerAmount,
                payment_status: 'pending'
            })
            .select()
            .single();

        if (orderError) throw new Error(orderError.message);

        // 3. Create Razorpay order
        const options = {
            amount: Math.round(amount * 100), // Razorpay needs smallest currency unit (paise)
            currency: "INR",
            receipt: order.id,
        };

        const razorpayOrder = await razorpay.orders.create(options);

        return NextResponse.json({
            razorpayOrderId: razorpayOrder.id,
            orderId: order.id,
            amount: options.amount
        });

    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
