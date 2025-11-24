'use client'

import { useState } from 'react'
import { updateLocation, logFeeding, changePassword } from '../actions'
import Calendar from './Calendar'
import { useSession } from 'next-auth/react'

export default function Dashboard({ cats, calendarDays, history, selectedDate }: {
    cats: any[],
    calendarDays: string[],
    history: any[],
    selectedDate?: string
}) {
    const [activeTab, setActiveTab] = useState<'today' | 'calendar' | 'login'>(selectedDate ? 'calendar' : 'today')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPasswordModal, setShowPasswordModal] = useState(false)
    const { data: session } = useSession()

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newPassword) return
        await changePassword(newPassword)
        alert('Heslo změněno!')
        setNewPassword('')
    }

    return (
        <div className="container" style={{ paddingBottom: '5rem' }}>
            {/* Navigation Tabs - Fixed Bottom or Top? User asked for tabs. Let's keep top for now but style like tabs */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                marginBottom: '1.5rem',
                background: 'var(--card)',
                borderRadius: 'var(--radius)',
                padding: '0.25rem',
                border: '1px solid var(--border)'
            }}>
                <button
                    onClick={() => setActiveTab('today')}
                    style={{
                        background: activeTab === 'today' ? 'var(--background)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        color: activeTab === 'today' ? 'var(--foreground)' : 'var(--muted-foreground)',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    DNES
                </button>
                <button
                    onClick={() => setActiveTab('calendar')}
                    style={{
                        background: activeTab === 'calendar' ? 'var(--background)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        color: activeTab === 'calendar' ? 'var(--foreground)' : 'var(--muted-foreground)',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    KALENDÁŘ
                </button>
                <button
                    onClick={() => setActiveTab('login')}
                    style={{
                        background: activeTab === 'login' ? 'var(--background)' : 'transparent',
                        border: 'none',
                        borderRadius: 'var(--radius)',
                        color: activeTab === 'login' ? 'var(--foreground)' : 'var(--muted-foreground)',
                        padding: '0.75rem',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }}
                >
                    LOGIN
                </button>
            </div>

            {activeTab === 'today' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    {cats.map((cat) => (
                        <CatCard key={cat.id} cat={cat} />
                    ))}
                </div>
            )}

            {activeTab === 'calendar' && (
                <div className="animate-in">
                    <Calendar activeDays={calendarDays} />

                    {selectedDate && (
                        <div className="card animate-in" style={{ marginTop: '1.5rem' }}>
                            <div className="card-header">
                                <h3>{new Date(selectedDate).toLocaleDateString('cs-CZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h3>
                            </div>
                            <div className="card-content">
                                {history.length === 0 ? (
                                    <p style={{ color: 'var(--muted-foreground)', textAlign: 'center' }}>Žádné záznamy.</p>
                                ) : (
                                    <div style={{ display: 'grid', gap: '0' }}>
                                        {history.map((event, index) => (
                                            <div key={event.id} style={{
                                                padding: '1rem 0',
                                                borderBottom: index < history.length - 1 ? '1px solid var(--border)' : 'none',
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center'
                                            }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '50%',
                                                        background: event.cat.name === 'Mikina' ? '#be185d' : event.cat.name === 'Bublina' ? '#1d4ed8' : '#c2410c',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        color: 'white',
                                                        fontWeight: 'bold',
                                                        fontSize: '0.875rem'
                                                    }}>
                                                        {event.cat.name[0]}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: '600' }}>{event.cat.name}</div>
                                                        <div style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)' }}>
                                                            {event.type === 'LOCATION'
                                                                ? `Přesun: ${event.details.location === 'Home' ? 'Doma' : event.details.location === 'Outside' ? 'Venku' : 'Garáž'}`
                                                                : `Nakrmeno`
                                                            }
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                                                    <div style={{ fontWeight: '600', color: 'var(--foreground)' }}>
                                                        {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                    <div>{event.user.nickname || event.user.username}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'login' && (
                <div className="card animate-in">
                    <div className="card-header">
                        <h3>Můj Profil</h3>
                    </div>
                    <div className="card-content">
                        {/* Show username with label on one line */}
                        <div style={{ marginBottom: '2rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Přihlášen jako: {session?.user?.name}</div>

                        {/* Button to open password change modal */}
                        <button className="btn btn-primary" onClick={() => setShowPasswordModal(true)} style={{ marginBottom: '1rem' }}>
                            Změnit heslo
                        </button>

                        {/* Password change modal */}
                        {showPasswordModal && (
                            <div
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    background: 'rgba(0,0,0,0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1000,
                                }}
                                onClick={() => setShowPasswordModal(false)}
                            >
                                <div
                                    style={{
                                        background: 'var(--card)',
                                        padding: '1.5rem',
                                        borderRadius: 'var(--radius)',
                                        width: '90%',
                                        maxWidth: '400px',
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <h4 style={{ marginBottom: '1rem' }}>Změnit heslo</h4>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            if (newPassword !== confirmPassword) {
                                                alert('Hesla se neshodují');
                                                return;
                                            }
                                            const hasUpper = /[A-Z]/.test(newPassword);
                                            const hasNumber = /[0-9]/.test(newPassword);
                                            if (newPassword.length < 8 || !hasUpper || !hasNumber) {
                                                alert('Heslo musí mít alespoň 8 znaků, jedno velké písmeno a jedno číslo');
                                                return;
                                            }
                                            await changePassword(newPassword);
                                            alert('Heslo změněno!');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setShowPasswordModal(false);
                                        }}
                                    >
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="Nové heslo"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{ marginBottom: '0.5rem' }}
                                            required
                                        />
                                        <input
                                            type="password"
                                            className="input"
                                            placeholder="Nové heslo znovu"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{ marginBottom: '0.5rem' }}
                                            required
                                        />
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                            <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>
                                                Zrušit
                                            </button>
                                            <button type="submit" className="btn btn-primary">
                                                Uložit
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}

                        {/* Sign out */}
                        <button
                            onClick={async () => {
                                const { signOut } = await import('next-auth/react')
                                await signOut({ callbackUrl: '/login' })
                            }}
                            className="btn btn-outline"
                            style={{ width: '100%', borderColor: 'var(--destructive)', color: 'var(--destructive)' }}
                        >
                            Odhlásit se
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}

function CatCard({ cat }: { cat: any }) {
    const locations = ['Home', 'Outside', 'Garage']
    const locationLabels: Record<string, string> = {
        'Home': 'Doma',
        'Outside': 'Venku',
        'Garage': 'Garáž'
    }

    const lastFeeding = cat.events[0]
    const isFed = !!lastFeeding
    const isMale = cat.name === 'Ferda'

    return (
        <div className="card">
            <div className={`cat-image-placeholder cat-${cat.name.toLowerCase()}`}>
                {cat.name[0]}
            </div>

            <div className="card-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <h2>{cat.name}</h2>
                    <span className="badge">
                        {locationLabels[cat.currentLocation] || cat.currentLocation}
                    </span>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Lokace
                    </h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                        {locations.map((loc) => (
                            <button
                                key={loc}
                                onClick={() => updateLocation(cat.id, loc)}
                                className="btn"
                                style={{
                                    background: cat.currentLocation === loc ? 'white' : 'transparent',
                                    color: cat.currentLocation === loc ? 'black' : 'var(--foreground)',
                                    border: '1px solid white',
                                    opacity: cat.currentLocation === loc ? 1 : 0.6
                                }}
                                disabled={cat.currentLocation === loc}
                            >
                                {locationLabels[loc]}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 style={{ fontSize: '0.875rem', color: 'var(--muted-foreground)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Krmení
                    </h3>

                    <button
                        onClick={() => logFeeding(cat.id)}
                        className="btn"
                        style={{
                            background: isFed ? 'rgba(34, 197, 94, 0.2)' : 'var(--primary)',
                            color: isFed ? '#4ade80' : 'var(--primary-foreground)',
                            border: isFed ? '1px solid rgba(34, 197, 94, 0.5)' : 'none'
                        }}
                    >
                        {isFed ? (isMale ? 'Nakrmený' : 'Nakrmená') : 'Nakrmit'}
                    </button>

                    {isFed && (
                        <div style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--muted-foreground)' }}>
                            Nakrmil: {lastFeeding.user.nickname || lastFeeding.user.username}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
