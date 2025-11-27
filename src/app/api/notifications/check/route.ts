import { NextRequest, NextResponse } from 'next/server'
import { shouldSendNotification, sendNotificationToAllUsers } from '@/lib/notifications'

export async function GET(request: NextRequest) {
    try {
        // Verify API key
        const apiKey = request.headers.get('x-api-key')
        if (apiKey !== process.env.NOTIFICATION_API_KEY) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Check if we should send notification
        const check = await shouldSendNotification()

        if (!check.should) {
            return NextResponse.json({
                sent: false,
                reason: check.reason
            })
        }

        // Send notifications
        const unfedCats = check.unfedCats || []
        const message = `Tyto kočky ještě nejsou nakrmené: ${unfedCats.join(', ')}`

        const result = await sendNotificationToAllUsers(message, unfedCats)

        return NextResponse.json({
            sent: true,
            unfedCats,
            ...result
        })
    } catch (error) {
        console.error('Error checking/sending notifications:', error)
        return NextResponse.json(
            { error: 'Failed to process notification check' },
            { status: 500 }
        )
    }
}
