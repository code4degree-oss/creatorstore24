import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        
        if (!error) {
            const { data: { user } } = await supabase.auth.getUser()
            
            if (user) {
                // Check if user already exists in creators table with mandatory details
                const { data: creator } = await supabase
                    .from('creators')
                    .select('id, store_name')
                    .eq('id', user.id)
                    .single()
                    
                if (creator && creator.store_name) {
                    return NextResponse.redirect(`${requestUrl.origin}/dashboard`)
                }
            }
        }
    }

    // URL to redirect to if profile is incomplete or new user
    return NextResponse.redirect(`${requestUrl.origin}/onboarding/profile`)
}
