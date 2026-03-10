'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { Save } from 'lucide-react'

export default function StoreSettings() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [profile, setProfile] = useState<any>(null)

    const supabase = createClient()

    useEffect(() => {
        async function loadProfile() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('creators').select('*').eq('id', user.id).single()
                setProfile(data)
            }
            setLoading(false)
        }
        loadProfile()
    }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const { error } = await supabase
            .from('creators')
            .update({
                username: profile.username,
                store_name: profile.store_name,
                description: profile.description,
            })
            .eq('id', profile.id)

        setSaving(false)
        if (error) alert(error.message)
        else alert('Settings saved successfully!')
    }

    if (loading) return <div>Loading...</div>
    if (!profile) return <div>Please log in to manage your store.</div>

    return (
        <div className="max-w-2xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Store Settings</h1>

            <form onSubmit={handleSave} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Profile URL</label>
                    <div className="flex rounded-md shadow-sm">
                        <span className="inline-flex items-center px-4 rounded-l-md border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">
                            platform.com/@
                        </span>
                        <input
                            type="text"
                            required
                            className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md border border-gray-200 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm outline-none"
                            value={profile.username || ''}
                            onChange={e => setProfile({ ...profile, username: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                        />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Must be unique, letters/numbers/hyphens only.</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Display Name</label>
                    <input
                        type="text"
                        required
                        className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow"
                        value={profile.store_name || ''}
                        onChange={e => setProfile({ ...profile, store_name: e.target.value })}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Store Description (Bio)</label>
                    <textarea
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow resize-none"
                        value={profile.description || ''}
                        onChange={e => setProfile({ ...profile, description: e.target.value })}
                    />
                </div>

                <div className="pt-4 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>
            </form>
        </div>
    )
}
