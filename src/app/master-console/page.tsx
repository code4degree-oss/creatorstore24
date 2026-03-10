import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ShieldAlert, DollarSign, Users, Package } from 'lucide-react'
import { AdminSellersList, AdminProductsList } from '@/components/AdminTables'

export default async function MasterConsolePage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    // 1. Strict Security Check
    if (!user || user.email !== process.env.ADMIN_EMAIL) {
        redirect('/') // Boot them back to the homepage silently
    }

    // 2. Fetch Data
    // Get all creators
    const { data: creators } = await supabase
        .from('creators')
        .select('*')
        .order('created_at', { ascending: false })

    // Get all products joined with creator store name
    const { data: products } = await supabase
        .from('products')
        .select('*, creators(store_name)')
        .order('created_at', { ascending: false })

    // Get platform revenue (sum of all platform fees, simplified for MVP as total GMV * 10%)
    // Ideally we'd sum (total_amount - seller_amount) from orders.
    const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, seller_amount')
        .eq('payment_status', 'paid')

    let platformRevenue = 0
    let totalGMV = 0
    if (orders) {
        orders.forEach(o => {
            totalGMV += parseFloat(o.total_amount)
            platformRevenue += (parseFloat(o.total_amount) - parseFloat(o.seller_amount))
        })
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <ShieldAlert className="w-8 h-8 text-indigo-600" />
                            Master Admin Console
                        </h1>
                        <p className="text-gray-500 mt-1">Super Secret Control Center</p>
                    </div>
                    <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-700 font-medium">
                        Return to Dashboard
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white p-6 justify-between flex-col border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center gap-2 text-indigo-600 mb-2">
                            <DollarSign className="w-5 h-5" />
                            <h3 className="font-semibold">Platform Revenue</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₹{platformRevenue.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 justify-between flex-col border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center gap-2 text-green-600 mb-2">
                            <Package className="w-5 h-5" />
                            <h3 className="font-semibold">Total GMV Processed</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">₹{totalGMV.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 justify-between flex-col border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <Users className="w-5 h-5" />
                            <h3 className="font-semibold">Registered Sellers</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{creators?.length || 0}</p>
                    </div>
                    <div className="bg-white p-6 justify-between flex-col border border-gray-100 shadow-sm rounded-2xl">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Package className="w-5 h-5" />
                            <h3 className="font-semibold">Total Products</h3>
                        </div>
                        <p className="text-3xl font-bold text-gray-900">{products?.length || 0}</p>
                    </div>
                </div>

                <div className="space-y-12">
                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Sellers</h2>
                        <AdminSellersList creators={creators || []} />
                    </section>

                    <section>
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Products & Trending</h2>
                        <AdminProductsList products={products || []} />
                    </section>
                </div>
            </div>
        </div>
    )
}
