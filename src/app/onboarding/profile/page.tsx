'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FileText, Building, CreditCard, User, Phone, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ProfileOnboardingPage() {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        storeName: '',
        contactNumber: '',
        aadhar: '',
        bankName: '',
        accountNumber: '',
        ifsc: '',
        pan: ''
    })
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not logged in')

            // Generate a simple username slug from the store name
            const username = formData.storeName.toLowerCase().replace(/[^a-z0-9]/g, '') + '-' + Math.floor(Math.random() * 1000)

            const { error } = await supabase
                .from('creators')
                .upsert({
                    id: user.id,
                    username_slug: username,
                    store_name: formData.storeName,
                    profile_image_url: user.user_metadata?.avatar_url || null,
                    // We'd ideally hash these or store them securely, MVP just saves them
                    aadhar_number: formData.aadhar,
                    bank_name: formData.bankName,
                    account_number: formData.accountNumber,
                    ifsc_code: formData.ifsc,
                    pan_number: formData.pan || null,
                    first_name: formData.firstName,
                    last_name: formData.lastName,
                    contact_number: formData.contactNumber,
                    platform_fee_percent: 5,
                    updated_at: new Date().toISOString(),
                })

            if (error) throw error

            router.push('/dashboard')
        } catch (error: any) {
            alert('Error saving profile: ' + error.message)
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-3xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Complete your profile</h2>
                    <p className="text-gray-500">We need a few details before you can start selling.</p>
                </div>

                <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
                    {/* Personal Details Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 flex items-center gap-2">
                            <User className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Personal Details <span className="text-red-500">*</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    id="firstName"
                                    name="firstName"
                                    type="text"
                                    required
                                    placeholder="John"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    id="lastName"
                                    name="lastName"
                                    type="text"
                                    required
                                    placeholder="Doe"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Store Display Name
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Store className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="storeName"
                                        name="storeName"
                                        type="text"
                                        required
                                        placeholder="My Awesome Store"
                                        value={formData.storeName}
                                        onChange={handleChange}
                                        className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                    />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="contactNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Number
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Phone className="h-4 w-4 text-gray-400" />
                                    </div>
                                    <input
                                        id="contactNumber"
                                        name="contactNumber"
                                        type="tel"
                                        required
                                        placeholder="+91 98765 43210"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        className="block w-full pl-9 pr-3 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Aadhar Details Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Aadhar Details <span className="text-red-500">*</span></h3>
                        </div>
                        <div>
                            <label htmlFor="aadhar" className="block text-sm font-medium text-gray-700 mb-1">
                                Aadhar Number
                            </label>
                            <input
                                id="aadhar"
                                name="aadhar"
                                type="text"
                                required
                                placeholder="1234 5678 9012"
                                value={formData.aadhar}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                            />
                        </div>
                    </div>

                    {/* Bank Details Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 flex items-center gap-2">
                            <Building className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Bank Details <span className="text-red-500">*</span></h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-1">
                                    Bank Name
                                </label>
                                <input
                                    id="bankName"
                                    name="bankName"
                                    type="text"
                                    required
                                    placeholder="e.g. State Bank of India"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                    Account Number
                                </label>
                                <input
                                    id="accountNumber"
                                    name="accountNumber"
                                    type="text"
                                    required
                                    placeholder="Account Number"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                />
                            </div>
                            <div>
                                <label htmlFor="ifsc" className="block text-sm font-medium text-gray-700 mb-1">
                                    IFSC Code
                                </label>
                                <input
                                    id="ifsc"
                                    name="ifsc"
                                    type="text"
                                    required
                                    placeholder="IFSC Code"
                                    value={formData.ifsc}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* PAN Details Section */}
                    <div className="space-y-4">
                        <div className="border-b border-gray-200 pb-2 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-indigo-600" />
                            <h3 className="text-lg font-semibold text-gray-900">PAN Details <span className="text-gray-400 text-sm font-normal ml-2">(Optional)</span></h3>
                        </div>
                        <div>
                            <label htmlFor="pan" className="block text-sm font-medium text-gray-700 mb-1">
                                PAN Number
                            </label>
                            <input
                                id="pan"
                                name="pan"
                                type="text"
                                placeholder="ABCDE1234F"
                                value={formData.pan}
                                onChange={handleChange}
                                className="block w-full px-4 py-3 border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent sm:text-sm"
                            />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={isLoading || !formData.firstName || !formData.lastName || !formData.storeName || !formData.contactNumber || !formData.aadhar || !formData.bankName || !formData.accountNumber || !formData.ifsc}
                            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account & Start Selling'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
