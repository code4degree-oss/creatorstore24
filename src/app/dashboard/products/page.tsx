'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Plus, Package, FileText, Trash2, Edit } from 'lucide-react'

export default function ProductsPage() {
    const [loading, setLoading] = useState(true)
    const [products, setProducts] = useState<any[]>([])
    const [creatorId, setCreatorId] = useState('')
    const [showAdd, setShowAdd] = useState(false)
    const supabase = createClient()

    // New Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '', slug: '', description: '', price: 0,
        product_type: 'digital', stock_quantity: 0
    })

    useEffect(() => {
        loadProducts()
    }, [])

    async function loadProducts() {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setCreatorId(user.id)
            const { data } = await supabase
                .from('products')
                .select('*')
                .eq('creator_id', user.id)
                .order('created_at', { ascending: false })
            setProducts(data || [])
        }
        setLoading(false)
    }

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault()

        // Auto generate slug if empty
        const slugToUse = newProduct.slug || newProduct.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

        const { error } = await supabase.from('products').insert({
            creator_id: creatorId,
            name: newProduct.name,
            slug: slugToUse,
            description: newProduct.description,
            price: newProduct.price,
            product_type: newProduct.product_type,
            stock_quantity: newProduct.product_type === 'physical' ? newProduct.stock_quantity : null,
            is_active: true
        })

        if (error) {
            alert(error.message)
        } else {
            setShowAdd(false)
            loadProducts()
            setNewProduct({ name: '', slug: '', description: '', price: 0, product_type: 'digital', stock_quantity: 0 })
        }
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
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {showAdd ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showAdd && (
                <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4 mb-8">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Create New Product</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input type="text" required className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600"
                                value={newProduct.name} onChange={e => setNewProduct({ ...newProduct, name: e.target.value })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug (Optional)</label>
                            <input type="text" className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600"
                                value={newProduct.slug} onChange={e => setNewProduct({ ...newProduct, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                            <input type="number" step="0.01" min="0" required className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600"
                                value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                            <select className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600"
                                value={newProduct.product_type} onChange={e => setNewProduct({ ...newProduct, product_type: e.target.value })}>
                                <option value="digital">Digital Download</option>
                                <option value="physical">Physical Item</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                            value={newProduct.description} onChange={e => setNewProduct({ ...newProduct, description: e.target.value })} />
                    </div>

                    {newProduct.product_type === 'physical' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                            <input type="number" min="0" required className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600"
                                value={newProduct.stock_quantity} onChange={e => setNewProduct({ ...newProduct, stock_quantity: parseInt(e.target.value, 10) })} />
                        </div>
                    )}

                    <div className="pt-4 border-t border-gray-100 flex justify-end">
                        <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-gray-800 transition-colors">
                            Save Product
                        </button>
                    </div>
                </form>
            )}

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
                                            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                                                {p.product_type === 'digital' ? <FileText className="w-5 h-5 text-gray-400" /> : <Package className="w-5 h-5 text-gray-400" />}
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
                                        {/* Placeholder for edit functionality */}
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
