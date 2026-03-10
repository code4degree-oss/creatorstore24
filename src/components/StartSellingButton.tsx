'use client'

import { createClient } from '@/lib/supabase/client'

export function StartSellingButton() {
    return (
        <button 
            onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: { redirectTo: `${window.location.origin}/auth/callback` }
                })
            }}
            className="w-full sm:w-auto px-8 py-4 bg-gray-900 text-white rounded-full font-bold text-lg hover:bg-gray-800 transition-all hover:shadow-xl hover:-translate-y-1 inline-block"
        >
            Start Selling for Free
        </button>
    )
}
