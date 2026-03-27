import { useState } from 'hono/jsx'
import { CivicsQuiz } from './CivicsQuiz'
import { Dictionary } from './Dictionary'
import { Dashboard } from './Dashboard'

export const App = () => {
  const [view, setView] = useState<'quiz' | 'dict' | 'dash'>('quiz')

  return (
    <div className="app-container">
      <nav className="main-nav">
        <button onClick={() => setView('quiz')} className={view === 'quiz' ? 'active' : ''}>תרגול חידון</button>
        <button onClick={() => setView('dict')} className={view === 'dict' ? 'active' : ''}>מילון מושגים</button>
        <button onClick={() => setView('dash')} className={view === 'dash' ? 'active' : ''}>דאשבורד מורה</button>
      </nav>

      <main className="content-area">
        {view === 'quiz' && <CivicsQuiz />}
        {view === 'dict' && <Dictionary />}
        {view === 'dash' && <Dashboard />}
      </main>
    </div>
  )
}