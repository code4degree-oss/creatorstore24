import { getCreatorByUsername, getCreatorProducts } from "@/lib/supabase/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { FileText, Package, CheckCircle2 } from "lucide-react";

export default async function CreatorStorePage({
    params,
}: {
    params: Promise<{ username: string }>;
}) {
    const resolvedParams = await params;
    const username = resolvedParams.username.replace('%40', ''); // handle /@username

    const creator = await getCreatorByUsername(username);

    if (!creator) {
        notFound();
    }

    const products = await getCreatorProducts(creator.id);

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header/Cover */}
            <div className="h-48 md:h-64 bg-gradient-to-r from-indigo-500 to-purple-600"></div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Profile Info */}
                <div className="relative -mt-16 md:-mt-24 mb-12 flex flex-col items-center md:items-start md:flex-row gap-6">
                    <div className="w-32 h-32 md:w-48 md:h-48 bg-white rounded-full p-1.5 shadow-xl flex-shrink-0">
                        {creator.profile_image_url ? (
                            <img
                                src={creator.profile_image_url}
                                alt={creator.store_name}
                                className="w-full h-full object-cover rounded-full"
                            />
                        ) : (
                            <div className="w-full h-full bg-indigo-100 rounded-full flex items-center justify-center">
                                <span className="text-4xl text-indigo-600 font-bold">{creator.store_name.charAt(0)}</span>
                            </div>
                        )}
                    </div>

                    <div className="pt-2 md:pt-28 text-center md:text-left flex-1">
                        <h1 className="text-3xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                            {creator.store_name}
                            <CheckCircle2 className="w-6 h-6 text-blue-500" />
                        </h1>
                        <p className="text-lg text-gray-500 font-medium mt-1">@{creator.username}</p>
                        {creator.description && (
                            <p className="mt-4 text-gray-700 max-w-2xl leading-relaxed">{creator.description}</p>
                        )}
                    </div>
                </div>

                {/* Products Grid */}
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Products</h2>

                    {products.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center shadow-sm">
                            <p className="text-gray-500 font-medium">This creator hasn't published any products yet.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            {products.map((product) => (
                                <Link
                                    href={`/@${creator.username}/product/${product.slug}`}
                                    key={product.id}
                                    className="group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                                >
                                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                                        {product.images?.[0] ? (
                                            <img
                                                src={product.images[0]}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-indigo-50">
                                                {product.product_type === 'digital' ? (
                                                    <FileText className="w-12 h-12 text-indigo-200" />
                                                ) : (
                                                    <Package className="w-12 h-12 text-indigo-200" />
                                                )}
                                            </div>
                                        )}
                                        <div className="absolute top-3 left-3">
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-white/90 backdrop-blur-sm text-gray-900 shadow-sm capitalize gap-1">
                                                {product.product_type === 'digital' ? <FileText className="w-3 h-3" /> : <Package className="w-3 h-3" />}
                                                {product.product_type}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-5 flex flex-col flex-1">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                                            {product.name}
                                        </h3>
                                        <div className="mt-auto pt-4 flex items-center justify-between border-t border-gray-50">
                                            <span className="text-2xl font-extrabold text-gray-900">
                                                ₹{product.price}
                                            </span>
                                            <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">View Details</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
