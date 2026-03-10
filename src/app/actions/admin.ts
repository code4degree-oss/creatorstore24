'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleCreatorBlacklist(creatorId: string, currentStatus: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Security check: Must be admin
    if (user?.email !== process.env.ADMIN_EMAIL) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('creators')
        .update({ is_blacklisted: !currentStatus })
        .eq('id', creatorId)

    if (error) throw error
    revalidatePath('/master-console')
    revalidatePath('/explore')
}

export async function toggleProductTrending(productId: string, currentStatus: boolean) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    // Security check: Must be admin
    if (user?.email !== process.env.ADMIN_EMAIL) {
        throw new Error("Unauthorized")
    }

    const { error } = await supabase
        .from('products')
        .update({ is_trending: !currentStatus })
        .eq('id', productId)

    if (error) throw error
    revalidatePath('/master-console')
    revalidatePath('/explore')
}
