'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Calendar({ activeDays }: { activeDays: string[] }) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const router = useRouter()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const daysInMonth = lastDay.getDate()
    const startingDay = firstDay.getDay() // 0 = Sunday

    const monthNames = [
        'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen',
        'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec'
    ]

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const days = []
    // Fill empty slots
    for (let i = 0; i < (startingDay === 0 ? 6 : startingDay - 1); i++) {
        days.push(null)
    }
    // Fill days
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i))
    }

    // Get today's date in local timezone
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`

    return (
        <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                <button onClick={prevMonth} className="btn btn-outline" style={{ width: 'auto', padding: '0.5rem' }}>
                    ←
                </button>
                <h3 style={{ margin: 0 }}>{monthNames[month]} {year}</h3>
                <button onClick={nextMonth} className="btn btn-outline" style={{ width: 'auto', padding: '0.5rem' }}>
                    →
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', padding: '1rem', textAlign: 'center' }}>
                {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
                    <div key={d} style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', paddingBottom: '0.5rem' }}>{d}</div>
                ))}

                {days.map((date, i) => {
                    if (!date) return <div key={`empty-${i}`} />

                    // Use local date string for comparison
                    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    const isActive = activeDays.includes(dateStr)
                    const isToday = dateStr === todayStr

                    // Compare dates at midnight local time
                    const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    const isFuture = dateMidnight > todayMidnight

                    // Hardcoded start date: 24.11.2025
                    const startDate = new Date('2025-11-24')
                    startDate.setHours(0, 0, 0, 0)
                    const isPreStart = date < startDate

                    let background = 'transparent'
                    let color = 'var(--foreground)'
                    let opacity = 1
                    let pointerEvents: React.CSSProperties['pointerEvents'] = 'auto'

                    if (isActive) {
                        background = 'var(--primary)'
                        color = 'var(--primary-foreground)'
                    } else if (isPreStart) {
                        color = 'var(--destructive)'
                        opacity = 0.5
                        pointerEvents = 'none'
                    } else if (isFuture) {
                        color = 'var(--muted-foreground)'
                        opacity = 0.5
                        pointerEvents = 'none'
                    }

                    return (
                        <Link
                            key={dateStr}
                            href={`/?date=${dateStr}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '40px',
                                borderRadius: '50%',
                                background,
                                color,
                                border: isToday ? '1px solid var(--primary)' : 'none',
                                textDecoration: 'none',
                                fontSize: '0.875rem',
                                opacity,
                                pointerEvents
                            }}
                        >
                            {date.getDate()}
                        </Link>
                    )
                })}
            </div>
        </div>
    )
}
