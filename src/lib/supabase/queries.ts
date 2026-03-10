import { createClient } from "./server";

export async function getCreatorByUsername(username: string) {
    const supabase = await createClient();
    const { data: creator, error } = await supabase
        .from('creators')
        .select('*')
        .eq('username', username)
        .single();

    if (error) return null;
    return creator;
}

export async function getCreatorProducts(creatorId: string) {
    const supabase = await createClient();
    const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) return [];
    return products;
}

export async function getProductBySlug(creatorId: string, slug: string) {
    const supabase = await createClient();
    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('slug', slug)
        .single();

    if (error) return null;
    return product;
}
