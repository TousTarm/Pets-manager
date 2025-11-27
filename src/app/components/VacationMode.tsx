'use client'

import { useState, useEffect } from 'react'
import { getVacationDates, addVacationDate, removeVacationDate } from '../actions'

export default function VacationMode() {
    const [vacationDates, setVacationDates] = useState<any[]>([])
    const [selectedDate, setSelectedDate] = useState('')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadVacationDates()
    }, [])

    const loadVacationDates = async () => {
        try {
            const dates = await getVacationDates()
            setVacationDates(dates)
        } catch (error) {
            console.error('Error loading vacation dates:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleAddDate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedDate) return

        try {
            await addVacationDate(selectedDate)
            setSelectedDate('')
            await loadVacationDates()
        } catch (error) {
            console.error('Error adding vacation date:', error)
            alert('Chyba při přidávání data')
        }
    }

    const handleRemoveDate = async (id: string) => {
        try {
            await removeVacationDate(id)
            await loadVacationDates()
        } catch (error) {
            console.error('Error removing vacation date:', error)
            alert('Chyba při odstraňování data')
        }
    }

    if (loading) {
        return <div>Načítání...</div>
    }

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Dovolená mód
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', marginBottom: '1rem' }}>
                Vypnout notifikace pro vybrané dny
            </p>

            <form onSubmit={handleAddDate} style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="date"
                        className="input"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        style={{ marginBottom: 0, flex: 1 }}
                        required
                    />
                    <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                        Přidat
                    </button>
                </div>
            </form>

            {vacationDates.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {vacationDates.map((vd) => (
                        <div
                            key={vd.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.5rem',
                                background: 'var(--card)',
                                border: '1px solid var(--border)',
                                borderRadius: 'var(--radius)',
                            }}
                        >
                            <span style={{ fontSize: '0.875rem' }}>
                                {new Date(vd.date).toLocaleDateString('cs-CZ', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                            <button
                                onClick={() => handleRemoveDate(vd.id)}
                                className="btn btn-outline"
                                style={{
                                    width: 'auto',
                                    padding: '0.25rem 0.75rem',
                                    fontSize: '0.75rem',
                                    borderColor: 'var(--destructive)',
                                    color: 'var(--destructive)',
                                }}
                            >
                                Odstranit
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {vacationDates.length === 0 && (
                <p style={{ fontSize: '0.75rem', color: 'var(--muted-foreground)', textAlign: 'center', padding: '1rem' }}>
                    Žádné dovolené dny
                </p>
            )}
        </div>
    )
}
