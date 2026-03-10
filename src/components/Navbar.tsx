'use client'

import { createClient } from '@/lib/supabase/client'
import { User, LogOut, LayoutDashboard, Store } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function Navbar() {
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setUser(session?.user || null)
        }

        fetchUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    const handleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        })
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    return (
        <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16 items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl leading-none">C</span>
                        </div>
                        <span className="font-bold text-xl tracking-tight text-gray-900">Creator Store 24</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-4">
                                <Link
                                    href="/dashboard"
                                    className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Dashboard
                                </Link>
                                <div className="h-6 w-px bg-gray-200"></div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border border-indigo-200">
                                        {user.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-4 h-4 text-indigo-600" />
                                        )}
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                                        title="Log Out"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    href="/onboarding/login"
                                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 transition-colors px-3 py-2"
                                >
                                    Log In
                                </Link>
                                <button
                                    onClick={handleLogin}
                                    className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:shadow-md"
                                >
                                    <Store className="w-4 h-4" />
                                    Start Selling
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
