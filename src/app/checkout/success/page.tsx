'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle2, Download, Package } from 'lucide-react'
import Link from 'next/link'

function SuccessContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const orderId = searchParams.get('order_id')
    const [productType, setProductType] = useState<'digital' | 'physical' | null>(null)

    useEffect(() => {
        // In a real app we would call an API with orderId to verify its status and get the secure download link.
        // For MVP, we trust the checkout flow completion and retrieve type from session storage.
        const saved = sessionStorage.getItem('checkout_item')
        if (saved) {
            const { product } = JSON.parse(saved)
            setProductType(product.product_type)
            sessionStorage.removeItem('checkout_item') // Clear cart
        }
    }, [])

    if (!orderId) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4">
                <h1 className="text-2xl font-bold text-gray-900">Invalid Order Session</h1>
                <Link href="/" className="mt-4 text-indigo-600 hover:underline">Return Home</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-lg border border-gray-100 text-center text-gray-900 border-t-8 border-t-emerald-500">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>

                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h1>
                <p className="text-gray-500 mb-8">Your order #{orderId.slice(0, 8).toUpperCase()} has been confirmed.</p>

                {productType === 'digital' ? (
                    <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-2xl mb-8">
                        <h3 className="font-bold text-indigo-900 mb-2">Ready for Download</h3>
                        <p className="text-sm text-indigo-700 mb-4">We've also emailed a backup link to your inbox.</p>
                        <button className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                            <Download className="w-5 h-5" />
                            Download File Now
                        </button>
                    </div>
                ) : (
                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl mb-8">
                        <h3 className="font-bold text-emerald-900 mb-2">Preparing for Shipment</h3>
                        <p className="text-sm text-emerald-700">The creator has been notified and will ship your physical item shortly.</p>
                        <Package className="w-8 h-8 text-emerald-500 mx-auto mt-4" />
                    </div>
                )}

                <Link href="/" className="inline-block text-gray-500 font-medium hover:text-gray-900 transition-colors">
                    Return to Home
                </Link>
            </div>
        </div>
    )
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SuccessContent />
        </Suspense>
    )
}
