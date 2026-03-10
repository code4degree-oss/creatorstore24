'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Plus, Package, FileText, Trash2, Edit } from 'lucide-react'
import Link from 'next/link'

export default function ProductsPage() {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<any[]>([])
    const supabase = createClient()

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false })
            setProducts(data || [])
        }
        setLoading(false)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return
        await supabase.from('products').delete().eq('id', id)
        loadProducts()
    }

    if (loading) return <div>Loading...</div>

    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Products</h1>
                <Link
                    href="/dashboard/products/new"
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add Product
                </Link>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <p className="text-gray-500">You haven't created any products yet.</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3 overflow-hidden">
                                                {p.images && p.images[0] ? (
                                                    <img src={p.images[0]} alt="" className="w-full h-full object-cover" />
                                                ) : p.product_type === 'digital' ? <FileText className="w-5 h-5 text-gray-400" /> : <Package className="w-5 h-5 text-gray-400" />}
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">{p.name}</div>
                                                <div className="text-sm text-gray-500">/{p.slug}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${p.product_type === 'digital' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                            {p.product_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        ₹{p.price}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:text-red-900 mr-4">
                                            <Trash2 className="w-4 h-4 inline" />
                                        </button>
                                        <button className="text-indigo-600 hover:text-indigo-900">
                                            <Edit className="w-4 h-4 inline" />
                                        </button>
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
