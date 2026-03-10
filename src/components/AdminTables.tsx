'use client'

import { useState } from 'react'
import { Ban, ShieldCheck, TrendingUp, Minus } from 'lucide-react'
import { toggleCreatorBlacklist, toggleProductTrending } from '@/app/actions/admin'

export function AdminSellersList({ creators }: { creators: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleToggle = async (id: string, current: boolean) => {
        setLoadingId(id)
        try {
            await toggleCreatorBlacklist(id, current)
        } catch (e) {
            console.error(e)
            alert("Error updating creator")
        }
        setLoadingId(null)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Store Name</th>
                            <th className="px-6 py-4 font-medium">Owner Name</th>
                            <th className="px-6 py-4 font-medium">Status</th>
                            <th className="px-6 py-4 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {creators.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900">{c.store_name}</td>
                                <td className="px-6 py-4 text-gray-600">{c.first_name} {c.last_name}</td>
                                <td className="px-6 py-4">
                                    {c.is_blacklisted ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                                            <Ban className="w-3 h-3" /> Blacklisted
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                            <ShieldCheck className="w-3 h-3" /> Active
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggle(c.id, c.is_blacklisted)}
                                        disabled={loadingId === c.id}
                                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            c.is_blacklisted 
                                                ? 'bg-gray-100 text-gray-700 hover:bg-gray-200' 
                                                : 'bg-red-50 text-red-600 hover:bg-red-100'
                                        } disabled:opacity-50`}
                                    >
                                        {loadingId === c.id ? 'Updating...' : c.is_blacklisted ? 'Restore Access' : 'Blacklist Store'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export function AdminProductsList({ products }: { products: any[] }) {
    const [loadingId, setLoadingId] = useState<string | null>(null)

    const handleToggle = async (id: string, current: boolean) => {
        setLoadingId(id)
        try {
            await toggleProductTrending(id, current)
        } catch (e) {
            console.error(e)
            alert("Error updating product")
        }
        setLoadingId(null)
    }

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 font-medium">Product</th>
                            <th className="px-6 py-4 font-medium">Store</th>
                            <th className="px-6 py-4 font-medium">Type</th>
                            <th className="px-6 py-4 font-medium text-right">Trending Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((p) => (
                            <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4 font-semibold text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 text-gray-600">{p.creators?.store_name}</td>
                                <td className="px-6 py-4 text-gray-600 capitalize">{p.product_type}</td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleToggle(p.id, p.is_trending)}
                                        disabled={loadingId === p.id}
                                        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                            p.is_trending 
                                                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                        } disabled:opacity-50`}
                                    >
                                        {loadingId === p.id ? 'Updating...' : p.is_trending ? (
                                            <><Minus className="w-4 h-4" /> Remove Trending</>
                                        ) : (
                                            <><TrendingUp className="w-4 h-4" /> Mark Trending</>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
