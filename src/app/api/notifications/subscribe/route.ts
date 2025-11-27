import { NextRequest, NextResponse } from 'next/server'
import { saveNotificationSubscription } from '@/app/actions'

export async function POST(request: NextRequest) {
    try {
        const subscription = await request.json()

        await saveNotificationSubscription(subscription)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error saving subscription:', error)
        return NextResponse.json(
            { success: false, error: 'Failed to save subscription' },
            { status: 500 }
        )
    }
}
