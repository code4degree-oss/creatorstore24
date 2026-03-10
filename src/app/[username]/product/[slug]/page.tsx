import { getCreatorByUsername, getProductBySlug } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, FileText, Package, ShieldCheck, Download, Truck } from "lucide-react";
import BuyButton from "./BuyButton";

export default async function ProductPage({
    params,
}: {
    params: Promise<{ username: string; slug: string }>;
}) {
    const resolvedParams = await params;
    const username = resolvedParams.username.replace('%40', ''); // handle /@username

    const creator = await getCreatorByUsername(username);
    if (!creator) notFound();

    const product = await getProductBySlug(creator.id, resolvedParams.slug);
    if (!product) notFound();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                <Link
                    href={`/@${creator.username}`}
                    className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to {creator.store_name}
                </Link>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        {/* Left: Image */}
                        <div className="bg-gray-100 aspect-square relative border-b md:border-b-0 md:border-r border-gray-100">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-indigo-50/50">
                                    {product.product_type === 'digital' ? (
                                        <FileText className="w-24 h-24 text-indigo-200" />
                                    ) : (
                                        <Package className="w-24 h-24 text-indigo-200" />
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right: Details */}
                        <div className="p-8 md:p-12 flex flex-col">
                            <div className="flex items-center gap-2 mb-6">
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-700 uppercase tracking-wider gap-1.5">
                                    {product.product_type === 'digital' ? <Download className="w-3.5 h-3.5" /> : <Truck className="w-3.5 h-3.5" />}
                                    {product.product_type} Product
                                </span>
                                {product.stock_quantity !== null && (
                                    <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 tracking-wider">
                                        {product.stock_quantity > 0 ? `${product.stock_quantity} in stock` : 'Out of stock'}
                                    </span>
                                )}
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-3 mb-8 pb-8 border-b border-gray-100">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border border-gray-200">
                                    {creator.profile_image_url ? (
                                        <img src={creator.profile_image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="text-sm font-bold text-gray-500">{creator.store_name.charAt(0)}</span>
                                    )}
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 font-medium">Created by</p>
                                    <Link href={`/@${creator.username}`} className="text-base font-bold text-gray-900 flex items-center gap-1 hover:text-indigo-600">
                                        {creator.store_name}
                                        <CheckCircle2 className="w-4 h-4 text-blue-500" />
                                    </Link>
                                </div>
                            </div>

                            <div className="flex items-end gap-4 mb-8">
                                <span className="text-5xl font-extrabold text-gray-900 tracking-tighter">
                                    ₹{product.price}
                                </span>
                            </div>

                            <BuyButton product={product} creator={creator} />

                            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500 bg-gray-50 py-3 rounded-xl border border-gray-100">
                                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                <span>Secure payment processing via Razorpay.</span>
                            </div>

                            {product.description && (
                                <div className="mt-12">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4">About this product</h3>
                                    <div className="prose prose-indigo text-gray-600">
                                        <p className="whitespace-pre-wrap leading-relaxed">{product.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
