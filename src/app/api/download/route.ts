import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const orderId = requestUrl.searchParams.get('orderId')
    
    if (!orderId) {
        return new NextResponse('Order ID is required', { status: 400 })
    }

    try {
        const supabase = await createClient()

        // 1. Fetch the order details
        const { data: order, error: orderError } = await supabase
            .from('orders')
            .select('*, products(*)')
            .eq('id', orderId)
            .single()

        if (orderError || !order) {
            return new NextResponse('Order not found', { status: 404 })
        }

        // 2. Verify payment status
        if (order.payment_status !== 'paid') {
            return new NextResponse('Payment not completed for this order', { status: 403 })
        }

        // 3. Verify it's a digital product
        const product = order.products
        if (!product || product.product_type !== 'digital' || !product.file_url) {
            return new NextResponse('Not a valid digital product', { status: 400 })
        }

        // 4. Generate highly-secure Signed URL (expires in 60 seconds)
        const { data: signedUrlData, error: signError } = await supabase.storage
            .from('product-files')
            .createSignedUrl(product.file_url, 60, {
                download: true, // Forces download instead of displaying in browser
            })

        if (signError || !signedUrlData) {
            console.error('Error signing URL:', signError)
            return new NextResponse('Could not generate download link', { status: 500 })
        }

        // 5. Redirect user to the secure file
        return NextResponse.redirect(signedUrlData.signedUrl)

    } catch (error) {
        console.error('Download error:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
