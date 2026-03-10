'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, Lock, ShieldCheck } from 'lucide-react'
import Script from 'next/script'

export default function CheckoutPage() {
    const router = useRouter()
    const [item, setItem] = useState<{ product: any, creator: any } | null>(null)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    })

    useEffect(() => {
        const saved = sessionStorage.getItem('checkout_item')
        if (saved) {
            setItem(JSON.parse(saved))
        } else {
            router.push('/')
        }
    }, [])

    if (!item) return null

    const { product, creator } = item
    const platformFee = product.price * 0.05
    const total = product.price

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // 1. Create order on server
            const res = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: product.id,
                    buyerInfo: formData
                })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // 2. Open Razorpay Checkout
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: "INR",
                name: creator.store_name,
                description: `Purchase: ${product.name}`,
                image: creator.profile_image_url || "https://example.com/your_logo",
                order_id: data.razorpayOrderId,
                handler: async function (response: any) {
                    // In production, you'd send this to another API route to verify the signature synchronously
                    // For MVP, we rely on the webhook processing it asynchronously, and just redirect the user here.
                    router.push(`/checkout/success?order_id=${data.orderId}`)
                },
                prefill: {
                    name: formData.name,
                    email: formData.email,
                    contact: formData.phone
                },
                theme: {
                    color: "#4f46e5" // indigo-600
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                alert("Payment failed: " + response.error.description);
            });
            rzp.open();

        } catch (err: any) {
            alert(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="min-h-screen bg-gray-50 py-12">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <button
                        onClick={() => router.back()}
                        className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back
                    </button>

                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Left: Form */}
                        <div className="flex-1 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Guest Checkout</h2>

                            <form onSubmit={handlePayment} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                    <input
                                        type="text" required
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                        value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                                        <input
                                            type="email" required
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                        <input
                                            type="tel"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all"
                                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                        />
                                    </div>
                                </div>

                                {product.product_type === 'physical' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Address</label>
                                        <textarea
                                            required rows={3}
                                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all resize-none"
                                            value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        />
                                    </div>
                                )}

                                <button
                                    type="submit" disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                                >
                                    <Lock className="w-5 h-5" />
                                    {loading ? 'Processing...' : `Pay ₹${total}`}
                                </button>
                                <div className="flex items-center justify-center gap-2 text-sm text-gray-400 mt-4">
                                    <ShieldCheck className="w-4 h-4" />
                                    Secured by Razorpay
                                </div>
                            </form>
                        </div>

                        {/* Right: Summary */}
                        <div className="w-full md:w-96">
                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 sticky top-24">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>

                                <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100">
                                    <div className="w-20 h-20 bg-gray-100 rounded-xl flex-shrink-0 overflow-hidden">
                                        {product.images?.[0] && <img src={product.images[0]} className="w-full h-full object-cover" />}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 line-clamp-2">{product.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{creator.store_name}</p>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-medium text-gray-900">₹{product.price}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Platform Fee (5%) <span className="text-xs text-gray-400 block">Included in price</span></span>
                                        <span className="font-medium text-gray-900">₹{platformFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-2xl font-extrabold text-indigo-600">₹{total}</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
