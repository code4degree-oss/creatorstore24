'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function OrdersPage() {
    const [loading, setLoading] = useState(true)
    const [orders, setOrders] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        loadOrders()
    }, [])

    async function loadOrders() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('orders')
                .select('*, products(name, product_type)')
                .eq('seller_id', user.id)
                .order('created_at', { ascending: false })
            setOrders(data || [])
        }
        setLoading(false)
    }

    const handleUpdateDelivery = async (orderId: string, status: string) => {
        try {
            const res = await fetch('/api/seller/update-delivery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderId, status })
            })
            
            if (!res.ok) throw new Error('Failed to update status')
            
            // Refetch to see changes
            loadOrders()
            alert('Order status updated!')
        } catch (error: any) {
            alert(error.message)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Orders & Sales</h1>

            {orders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">No orders yet. Keep sharing your store link!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map(o => (
                                <tr key={o.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {o.id.slice(0, 8).toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {o.products?.name}
                                        <span className="block text-xs text-gray-500">({o.products?.product_type})</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {o.buyer_name}
                                        <span className="block text-xs text-gray-500">{o.buyer_email}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(o.created_at).toLocaleDateString()}
                                        <span className="block text-xs text-gray-400">{new Date(o.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${o.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                            {o.payment_status}
                                        </span>
                                        {o.products?.product_type === 'physical' && o.payment_status === 'paid' && (
                                            <span className="ml-2 px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                {o.delivery_status}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                                        ₹{o.seller_amount}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {o.products?.product_type === 'physical' && o.payment_status === 'paid' && o.delivery_status !== 'delivered' && (
                                            <select
                                                className="text-sm border border-gray-200 rounded p-1 outline-none"
                                                value={o.delivery_status}
                                                onChange={(e) => handleUpdateDelivery(o.id, e.target.value)}
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                            </select>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
