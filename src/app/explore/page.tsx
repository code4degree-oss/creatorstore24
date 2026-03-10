'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Store, Package, Search } from 'lucide-react'

// Mock Data for UI Testing
const mockCreators = [
    { id: 1, name: 'Alice Design', handle: '@alice', avatar: 'A' },
    { id: 2, name: 'Bob Codes', handle: '@bob', avatar: 'B' },
]

const mockProducts = [
    { id: 101, name: 'UI Kit Pro', price: 49, creator: '@alice' },
    { id: 102, name: 'Next.js Boilerplate', price: 99, creator: '@bob' },
    { id: 103, name: 'Figma Templates', price: 29, creator: '@alice' },
]

export default function ExplorePage() {
    const searchParams = useSearchParams()
    const query = searchParams.get('q') || ''

    const filteredCreators = mockCreators.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.handle.toLowerCase().includes(query.toLowerCase())
    )

    const filteredProducts = mockProducts.filter(p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.creator.toLowerCase().includes(query.toLowerCase())
    )

    // For mock purposes, just take the first 8 for trending (2 rows of 4)
    const trendingProducts = [...mockProducts, ...mockProducts, ...mockProducts].slice(0, 8)

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
                            placeholder="Find creators, products..."
                        />
                        <button
                            type="submit"
                            className="absolute right-0 top-0 bottom-0 px-6 bg-indigo-600 text-white font-medium rounded-r-xl hover:bg-indigo-700 transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>

                {query && (
                    <p className="text-gray-600 mb-8">Showing results for <span className="font-semibold text-gray-900">"{query}"</span></p>
                )}

                <div className="space-y-16">
                    {/* Trending Products Section (Only show if not actively searching) */}
                    {!query && (
                        <section>
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Package className="w-6 h-6 text-indigo-600" />
                                Trending Products
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {trendingProducts.map((product, idx) => (
                                    <Link key={`trending-${product.id}-${idx}`} href={`/${product.creator}/product/${product.id}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all hover:shadow-md">
                                        <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">{product.creator}</p>
                                        <div className="font-semibold text-gray-900">${product.price}</div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* All Products Section */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Store className="w-6 h-6 text-indigo-600" />
                            {query ? 'Search Results' : 'All Products'}
                        </h2>
                        {filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {filteredProducts.map(product => (
                                    <Link key={product.id} href={`/${product.creator}/product/${product.id}`} className="block bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:border-indigo-300 transition-all hover:shadow-md">
                                        <div className="aspect-video bg-gray-100 rounded-xl mb-4 flex items-center justify-center">
                                            <Package className="w-8 h-8 text-gray-300" />
                                        </div>
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="font-bold text-gray-900 line-clamp-1">{product.name}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-3">{product.creator}</p>
                                        <div className="font-semibold text-gray-900">${product.price}</div>
                                    </Link>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No products found matching your search.</p>
                        )}
                    </section>
                </div>
            </main>
        </div>
    )
}
