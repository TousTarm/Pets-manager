import webpush from 'web-push'
import { PrismaClient } from '@prisma/client'

// Singleton pattern for Prisma Client
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY && process.env.VAPID_EMAIL) {
    webpush.setVapidDetails(
        process.env.VAPID_EMAIL,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    )
}

export async function sendPushNotification(subscription: any, payload: any) {
    try {
        await webpush.sendNotification(subscription, JSON.stringify(payload))
        return { success: true }
    } catch (error) {
        console.error('Error sending push notification:', error)
        return { success: false, error }
    }
}

export async function checkUnfedCats() {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const cats = await prisma.cat.findMany({
        include: {
            events: {
                where: {
                    type: 'FEEDING',
                    timestamp: {
                        gte: today,
                        lt: tomorrow
                    }
                },
                take: 1
            }
        }
    })

    const unfedCats = cats.filter(cat => cat.events.length === 0)
    return unfedCats
}

export async function isVacationDate(date: Date) {
    const checkDate = new Date(date)
    checkDate.setHours(0, 0, 0, 0)

    const vacation = await prisma.vacationDate.findFirst({
        where: {
            date: checkDate
        }
    })

    return !!vacation
}

export async function shouldSendNotification() {
    // Check if current time is after 18:30
    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const currentTime = hours * 60 + minutes
    const targetTime = 18 * 60 + 30 // 18:30

    if (currentTime < targetTime) {
        return { should: false, reason: 'Too early (before 18:30)' }
    }

    // Check if today is a vacation date
    const isVacation = await isVacationDate(now)
    if (isVacation) {
        return { should: false, reason: 'Vacation mode active' }
    }

    // Check for unfed cats
    const unfedCats = await checkUnfedCats()
    if (unfedCats.length === 0) {
        return { should: false, reason: 'All cats fed' }
    }

    return {
        should: true,
        unfedCats: unfedCats.map(cat => cat.name)
    }
}

export async function sendNotificationToAllUsers(message: string, unfedCats: string[]) {
    const subscriptions = await prisma.notificationSubscription.findMany()

    const payload = {
        title: 'Kočky nejsou nakrmené! 🐱',
        body: message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        data: {
            unfedCats,
            url: '/'
        }
    }

    const results = await Promise.allSettled(
        subscriptions.map((sub: any) => {
            const subscription = {
                endpoint: sub.endpoint,
                keys: JSON.parse(sub.keys)
            }
            return sendPushNotification(subscription, payload)
        })
    )

    const successful = results.filter((r: any) => r.status === 'fulfilled').length
    const failed = results.filter((r: any) => r.status === 'rejected').length

    return { successful, failed, total: subscriptions.length }
}
