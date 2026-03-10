'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Store, Package, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function ExplorePage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''
    
    const supabase = createClient()
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchProducts() {
            setLoading(true)
            
            // Fetch products and join with creators table to get the store URL slug (@username)
            let supabaseQuery = supabase
                .from('products')
                .select('*, creators(store_name, updated_at)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                
            if (query) {
                // ILIKE search on product name
                supabaseQuery = supabaseQuery.ilike('name', `%${query}%`)
            }

            const { data, error } = await supabaseQuery
            
            if (!error && data) {
                setProducts(data)
            }
            setLoading(false)
        }

        fetchProducts()
    }, [query])

    // Top 8 newest/trending
    const trendingProducts = products.slice(0, 8)

    return (
        <div className="min-h-screen bg-gray-50">

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 mb-6">Explore</h1>
                    <form action="/explore" className="relative max-w-2xl">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            name="q"
                            defaultValue={query}
                            className="block w-full pl-12 pr-4 py-4 bg-white border border-gray-200 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent rounded-xl shadow-sm rounded-r-none"
                            placeholder="Find products..."
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 bottom-0 px-6 bg-indigo-600 text-white font-medium rounded-r-xl hover:bg-indigo-700 transition-colors cursor-pointer"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {query && (
                    <p className="text-gray-600 mb-8">Showing results for <span className="font-semibold text-gray-900">"{query}"</span></p>
                )}

                {loading ? (
                    <div className="text-center py-20 text-gray-500">Loading amazing products...</div>
                ) : (
                    <div className="space-y-16">
                        {/* Trending Products Section (Only show if not actively searching) */}
                        {!query && products.length > 0 && (
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Package className="w-6 h-6 text-indigo-600" />
                                    Trending Products
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {trendingProducts.map((product) => {
                                        // Simple slug conversion (or you can use the DB slug)
                                        const creatorSlug = '@' + (product.creators?.store_name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')
                                        return (
                                            <Link key={`trending-${product.id}`} href={`/${creatorSlug}/product/${product.id}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all hover:shadow-md">
                                                <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{product.creators?.store_name || 'Creator'}</p>
                                                <div className="font-semibold text-gray-900">₹{product.price}</div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            </section>
                        )}

                        {/* All Products Section */}
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Store className="w-6 h-6 text-indigo-600" />
                                {query ? 'Search Results' : 'All Products'}
                            </h2>
                            {products.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                    {products.map(product => {
                                        const creatorSlug = '@' + (product.creators?.store_name || '').toLowerCase().replace(/[^a-z0-9]/g, '-')
                                        return (
                                            <Link key={product.id} href={`/${creatorSlug}/product/${product.id}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all hover:shadow-md">
                                                <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                                                    {product.images && product.images[0] ? (
                                                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Package className="w-8 h-8 text-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                                </div>
                                                <p className="text-sm text-gray-500 mb-3">{product.creators?.store_name || 'Creator'}</p>
                                                <div className="font-semibold text-gray-900">₹{product.price}</div>
                                            </Link>
                                        )
                                    })}
                                </div>
                            ) : (
                                <p className="text-gray-500">No products found matching your search.</p>
                            )}
                        </section>
                    </div>
                )}
            </main>
        </div>
    )
}
