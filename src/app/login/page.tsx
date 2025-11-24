'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Clear any error parameters from URL
        if (window.location.search.includes('error')) {
            window.history.replaceState({}, '', '/login')
        }

        const res = await signIn('credentials', {
            username,
            password,
            redirect: false,
        })

        if (res?.error) {
            alert('Chybné přihlášení')
        } else {
            router.push('/')
            router.refresh()
        }
    }

    return (
        <div className="container" style={{ height: '100vh', display: 'flex', alignItems: 'center' }}>
            <div className="card animate-in" style={{ width: '100%' }}>
                <h1 style={{ textAlign: 'center' }}>Kočky Login</h1>
                <form onSubmit={handleSubmit}>
                    <input
                        className="input"
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        className="input"
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button className="btn btn-primary" type="submit">
                        Vstoupit
                    </button>
                </form>
            </div>
        </div>
    )
}
