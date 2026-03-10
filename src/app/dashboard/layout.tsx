import { Home, Package, ShoppingBag, Settings, Wallet } from "lucide-react"
import Link from "next/link"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-[calc(100vh-64px)] bg-gray-50 flex-col md:flex-row">
            <aside className="w-full md:w-64 bg-white border-r border-gray-100 flex-shrink-0">
                <nav className="p-4 space-y-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-900 bg-gray-50">
                        <Home className="w-5 h-5 text-gray-500" />
                        Overview
                    </Link>
                    <Link href="/dashboard/products" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                        <Package className="w-5 h-5 text-gray-500" />
                        Products
                    </Link>
                    <Link href="/dashboard/orders" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                        <ShoppingBag className="w-5 h-5 text-gray-500" />
                        Orders
                    </Link>
                    <Link href="/dashboard/revenue" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                        <Wallet className="w-5 h-5 text-gray-500" />
                        Revenue
                    </Link>
                    <Link href="/dashboard/store" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-50">
                        <Settings className="w-5 h-5 text-gray-500" />
                        Store Settings
                    </Link>
                </nav>
            </aside>
            <main className="flex-1 overflow-y-auto p-8">
                {children}
            </main>
        </div>
    )
}
