'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { IndianRupee, TrendingUp, ShoppingBag, ArrowUpRight } from 'lucide-react'

export default function RevenuePage() {
    const [loading, setLoading] = useState(true)
    const [transactions, setTransactions] = useState<any[]>([])
    const [stats, setStats] = useState({ totalEarnings: 0, totalSales: 0 })
    const supabase = createClient()

    useEffect(() => {
        loadRevenueData()
    }, [])

    async function loadRevenueData() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('orders')
                .select('*, products(name)')
                .eq('seller_id', user.id)
                .eq('payment_status', 'paid')
                .order('created_at', { ascending: false })
            
            if (data) {
                setTransactions(data)
                
                const totalEarnings = data.reduce((sum, order) => sum + order.seller_amount, 0)
                const totalSales = data.length
                
                setStats({ totalEarnings, totalSales })
            }
        }
        setLoading(false)
    }

    if (loading) return <div className="p-8">Loading Revenue Data...</div>

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Revenue</h1>
                <p className="text-gray-600 mt-1">Track your earnings and recent transactions.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                        <IndianRupee className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                        <h3 className="text-3xl font-extrabold text-gray-900">₹{stats.totalEarnings.toFixed(2)}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Sales</p>
                        <h3 className="text-3xl font-extrabold text-gray-900">{stats.totalSales} Orders</h3>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-indigo-600" />
                        Recent Transactions
                    </h2>
                </div>

                {transactions.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No transactions found. Share your store link to get sales!</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {transactions.map(t => (
                                <tr key={t.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(t.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                        {t.products?.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {t.buyer_name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-gray-900 flex items-center justify-end gap-1">
                                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                        ₹{t.seller_amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}
