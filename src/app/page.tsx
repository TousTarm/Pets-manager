import { getCats, getCalendarDays, getDayHistory } from './actions'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Dashboard from './components/Dashboard'

export default async function Home({ searchParams }: { searchParams: { date?: string } }) {
    const session = await auth()
    if (!session) redirect('/login')

    const cats = await getCats()
    const calendarDays = await getCalendarDays()

    const selectedDate = (await searchParams).date
    const history = selectedDate ? await getDayHistory(selectedDate) : []

    return (
        <Dashboard
            cats={cats}
            calendarDays={calendarDays}
            history={history}
            selectedDate={selectedDate}
        />
    )
}
