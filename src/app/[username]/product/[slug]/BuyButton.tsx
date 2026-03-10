'use client'

import { ShoppingBag } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BuyButton({ product, creator }: { product: any, creator: any }) {
    const router = useRouter()

    const handleBuy = () => {
        // Save to local storage for guest checkout flow
        // In a real app we'd use a robust Cart context, but for MVP direct buy:
        sessionStorage.setItem('checkout_item', JSON.stringify({
            product,
            creator
        }))

        router.push('/checkout')
    }

    const isOutOfStock = product.product_type === 'physical' && product.stock_quantity !== null && product.stock_quantity <= 0;

    return (
        <button
            onClick={handleBuy}
            disabled={isOutOfStock}
            className={`w-full flex items-center justify-center gap-2 px-8 py-5 rounded-2xl font-bold text-lg transition-all ${isOutOfStock
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-600/20 active:scale-[0.98]'
                }`}
        >
            <ShoppingBag className="w-5 h-5" />
            {isOutOfStock ? 'Out of Stock' : 'Buy Now'}
        </button>
    )
}
