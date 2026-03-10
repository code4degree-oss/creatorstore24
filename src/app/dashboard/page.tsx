import { createClient } from "@/lib/supabase/server"
import { DollarSign, ShoppingBag, TrendingUp } from "lucide-react"

export default async function DashboardOverview() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .eq('seller_id', user?.id)
        .eq('payment_status', 'paid')

    const totalRevenue = orders?.reduce((sum, order) => sum + Number(order.seller_amount), 0) || 0
    const totalSales = orders?.length || 0

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Net Revenue</h3>
                        <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-emerald-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">₹{totalRevenue.toFixed(2)}</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-medium text-gray-500">Total Sales</h3>
                        <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-3xl font-extrabold text-gray-900">{totalSales}</p>
                </div>
            </div>
        </div>
    )
}
