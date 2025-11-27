'use server'

import { PrismaClient } from '@prisma/client'
import { auth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

// Singleton pattern for Prisma Client to prevent multiple instances in development
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function getCats() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

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
                orderBy: { timestamp: 'desc' },
                take: 1,
                include: {
                    user: { select: { username: true, nickname: true } }
                }
            }
        }
    })

    // Enforce order: Mikina, Bublina, Ferda
    const order = ['Mikina', 'Bublina', 'Ferda']
    return cats.sort((a: { name: string }, b: { name: string }) => order.indexOf(a.name) - order.indexOf(b.name))
}

export async function updateLocation(catId: string, location: string) {
    const session = await auth()
    if (!session || !session.user?.id) throw new Error('Unauthorized')

    await prisma.cat.update({
        where: { id: catId },
        data: { currentLocation: location }
    })

    await prisma.event.create({
        data: {
            type: 'LOCATION',
            catId,
            userId: session.user.id,
            details: JSON.stringify({ location })
        }
    })

    revalidatePath('/')
}

export async function logFeeding(catId: string) {
    try {
        const session = await auth()
        if (!session || !session.user?.id) throw new Error('Unauthorized')

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Check if already fed today
        const existingEvent = await prisma.event.findFirst({
            where: {
                catId,
                type: 'FEEDING',
                timestamp: {
                    gte: today,
                    lt: tomorrow
                }
            }
        })

        if (existingEvent) {
            // Undo feeding (delete event)
            await prisma.event.delete({
                where: { id: existingEvent.id }
            })
        } else {
            // Log feeding
            await prisma.event.create({
                data: {
                    type: 'FEEDING',
                    catId,
                    userId: session.user.id,
                    details: JSON.stringify({ foodType: 'Jídlo' })
                }
            })
        }

        revalidatePath('/')
    } catch (error) {
        console.error('Error in logFeeding:', error)
        throw error
    }
}

export async function changePassword(password: string) {
    const session = await auth()
    if (!session || !session.user?.id) throw new Error('Unauthorized')

    const passwordHash = await bcrypt.hash(password, 10)

    await prisma.user.update({
        where: { id: session.user.id },
        data: { passwordHash }
    })

    return { success: true }
}

export async function getCalendarDays() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const events = await prisma.event.findMany({
        select: { timestamp: true },
        orderBy: { timestamp: 'desc' }
    })

    const days = new Set<string>()
    events.forEach((event: { timestamp: Date }) => {
        days.add(event.timestamp.toISOString().split('T')[0])
    })

    return Array.from(days)
}

export async function getDayHistory(date: string) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const start = new Date(date)
    start.setHours(0, 0, 0, 0)

    const end = new Date(date)
    end.setHours(23, 59, 59, 999)

    const events = await prisma.event.findMany({
        where: {
            timestamp: {
                gte: start,
                lte: end
            }
        },
        orderBy: { timestamp: 'desc' },
        include: {
            cat: true,
            user: {
                select: { username: true, nickname: true }
            }
        }
    })

    return events.map((event: any) => ({
        ...event,
        details: event.details ? JSON.parse(event.details) : {}
    }))
}

// Vacation Mode Actions
export async function getVacationDates() {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const dates = await prisma.vacationDate.findMany({
        orderBy: { date: 'asc' }
    })

    return dates
}

export async function addVacationDate(dateString: string) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)

    await prisma.vacationDate.create({
        data: { date }
    })

    revalidatePath('/')
}

export async function removeVacationDate(id: string) {
    const session = await auth()
    if (!session) throw new Error('Unauthorized')

    await prisma.vacationDate.delete({
        where: { id }
    })

    revalidatePath('/')
}

// Notification Subscription Actions
export async function saveNotificationSubscription(subscription: any) {
    const session = await auth()
    if (!session || !session.user?.id) throw new Error('Unauthorized')

    await prisma.notificationSubscription.upsert({
        where: { endpoint: subscription.endpoint },
        update: {
            keys: JSON.stringify(subscription.keys)
        },
        create: {
            userId: session.user.id,
            endpoint: subscription.endpoint,
            keys: JSON.stringify(subscription.keys)
        }
    })

    return { success: true }
}

export async function getNotificationSubscription() {
    const session = await auth()
    if (!session || !session.user?.id) throw new Error('Unauthorized')

    const subscription = await prisma.notificationSubscription.findFirst({
        where: { userId: session.user.id }
    })

    if (!subscription) return null

    return {
        endpoint: subscription.endpoint,
        keys: JSON.parse(subscription.keys)
    }
}
