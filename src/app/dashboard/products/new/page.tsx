'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Package, UploadCloud, File, Image as ImageIcon, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewProductPage() {
    const router = useRouter()
    const supabase = createClient()
    
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        productType: 'digital' as 'digital' | 'physical',
    })
    
    const [imageFile, setImageFile] = useState<File | null>(null)
    const [digitalFile, setDigitalFile] = useState<File | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // Upload Image
            let imageUrl = null
            if (imageFile) {
                const imageExt = imageFile.name.split('.').pop()
                const imageFileName = `${user.id}-${Date.now()}.${imageExt}`
                
                const { error: imageError, data: imageData } = await supabase.storage
                    .from('product-images')
                    .upload(imageFileName, imageFile)
                    
                if (imageError) throw new Error('Failed to upload image: ' + imageError.message)
                
                // Get public URL
                const { data: publicUrlData } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(imageFileName)
                    
                imageUrl = publicUrlData.publicUrl
            }

            // Upload Digital File (if digital product)
            let fileUrl = null
            if (formData.productType === 'digital' && digitalFile) {
                const fileExt = digitalFile.name.split('.').pop()
                const digitalFileName = `${user.id}-${Date.now()}.${fileExt}`
                
                const { error: fileError, data: fileData } = await supabase.storage
                    .from('product-files')
                    .upload(digitalFileName, digitalFile)
                    
                if (fileError) throw new Error('Failed to upload digital file: ' + fileError.message)
                
                // Store the internal path, not public URL, since it's private
                fileUrl = fileData.path
            }

            // Create simple slug
            const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Math.floor(Math.random() * 1000)

            // Save to database
            const { error: dbError } = await supabase
                .from('products')
                .insert({
                    creator_id: user.id,
                    name: formData.name,
                    description: formData.description,
                    price: parseFloat(formData.price),
                    product_type: formData.productType,
                    images: imageUrl ? [imageUrl] : [],
                    file_url: fileUrl,
                    slug: slug,
                    is_active: true
                })

            if (dbError) throw new Error('Failed to save product: ' + dbError.message)

            router.push('/dashboard/products')
            router.refresh()

        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/dashboard/products" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-5 h-5 text-gray-600" />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-8 space-y-8">
                    
                    {/* Basic Details */}
                    <div className="space-y-6">
                        <div className="border-b border-gray-100 pb-2">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Package className="w-5 h-5 text-indigo-600" />
                                Product Details
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                                <input
                                    type="text" required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                                    placeholder="e.g. Master React in 30 Days"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    required rows={4}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none resize-none"
                                    placeholder="Describe your product in detail..."
                                    value={formData.description}
                                    onChange={e => setFormData({...formData, description: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                                <input
                                    type="number" required min="0" step="1"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none"
                                    placeholder="999"
                                    value={formData.price}
                                    onChange={e => setFormData({...formData, price: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
                                <select
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-600 outline-none bg-white"
                                    value={formData.productType}
                                    onChange={e => setFormData({...formData, productType: e.target.value as any})}
                                >
                                    <option value="digital">Digital Product (Download)</option>
                                    <option value="physical">Physical Product (Shipping)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Media & Files */}
                    <div className="space-y-6 pt-6">
                        <div className="border-b border-gray-100 pb-2">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <UploadCloud className="w-5 h-5 text-indigo-600" />
                                Media & Files
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Image Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
                                <label className="relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-indigo-400 transition-colors cursor-pointer overflow-hidden bg-gray-50/50">
                                    {imageFile ? (
                                        <div className="absolute inset-0 w-full h-full">
                                            <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                                <span className="text-white font-medium text-sm">Change Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-gray-500">
                                            <ImageIcon className="w-8 h-8 mb-3 text-gray-400" />
                                            <p className="mb-2 text-sm font-semibold">Click to upload image</p>
                                            <p className="text-xs">PNG, JPG or WEBP (Max 5MB)</p>
                                        </div>
                                    )}
                                    <input type="file" className="hidden" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} required />
                                </label>
                            </div>

                            {/* Digital File Upload */}
                            {formData.productType === 'digital' && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Digital File (For Buyers Only)</label>
                                    <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-indigo-200 rounded-2xl hover:bg-indigo-50 hover:border-indigo-400 transition-colors cursor-pointer bg-indigo-50/30">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-indigo-600 text-center px-4">
                                            <File className="w-8 h-8 mb-3 text-indigo-400" />
                                            {digitalFile ? (
                                                <>
                                                    <p className="mb-1 text-sm font-bold text-indigo-700 line-clamp-1">{digitalFile.name}</p>
                                                    <p className="text-xs text-indigo-500">Click to replace file</p>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="mb-2 text-sm font-semibold text-indigo-700">Upload your digital product</p>
                                                    <p className="text-xs text-indigo-500">ZIP, PDF, MP4, etc.</p>
                                                </>
                                            )}
                                        </div>
                                        <input type="file" className="hidden" onChange={e => setDigitalFile(e.target.files?.[0] || null)} required={formData.productType === 'digital'} />
                                    </label>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-indigo-600 text-white font-bold py-4 px-8 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? 'Uploading & Saving...' : 'Publish Product'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    )
}
