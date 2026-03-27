import { useState, useEffect } from 'hono/jsx'

interface Concept {
  unitId: number;
  conceptName: string;
  definition: string;
  explanation: string;
  example: string;
  source: string;
}

export const Dictionary = () => {
  const [concepts, setConcepts] = useState<Concept[]>([])
  const [searchTerm, setSearchTerm] = useState('')

  // טעינת הנתונים מהתיקייה הציבורית
  useEffect(() => {
    fetch('/memory-sentences-112-concepts.json')
      .then(res => res.json())
      .then(data => {
        // בודק אם הנתונים במבנה הישיר או תחת מפתח concepts
        const list = data.concepts || data;
        setConcepts(list);
      })
      .catch(err => console.error("Error loading concepts:", err));
  }, [])

  // פונקציית הקראה
  const speak = (text: string) => {
    window.speechSynthesis.cancel(); // עצור הקראות קודמות
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'he-IL';
    uttr.rate = 0.9; // קצב מעט איטי יותר לבהירות
    window.speechSynthesis.speak(uttr);
  }

  const filtered = concepts.filter(c => 
    c.conceptName.includes(searchTerm) || 
    c.definition.includes(searchTerm)
  )

  return (
    <div className="dictionary-container">
      <header className="dict-header">
        <h2>מילון 112 המושגים - אזרחות 2026</h2>
        <input 
          type="text" 
          placeholder="חפש מושג (למשל: פסקת ההגבלה)..." 
          onInput={(e: any) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </header>

      <div className="concepts-grid">
        {filtered.map((concept, index) => (
          <article key={index} className="concept-card">
            <div className="card-header">
              <h3>{concept.conceptName}</h3>
              <button onClick={() => speak(`${concept.conceptName}. ${concept.definition}`)} title="הקרא מושג">
                🔊
              </button>
            </div>
            <p><strong>הגדרה:</strong> {concept.definition}</p>
            {concept.explanation && <p><strong>הסבר:</strong> {concept.explanation}</p>}
            <div className="unit-badge">יחידה {concept.unitId}</div>
          </article>
        ))}
      </div>
    </div>
  )
}