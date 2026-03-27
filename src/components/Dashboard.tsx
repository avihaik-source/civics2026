import { useState, useEffect } from 'hono/jsx'

interface ProgressRecord {
  id: number;
  student_id: string;
  unit_id: string;
  score: number;
  timestamp: number;
}

export const Dashboard = () => {
  const [records, setRecords] = useState<ProgressRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // משיכת נתונים מה-API של השרת שלנו
    fetch('/api/dashboard')
      .then(res => res.json())
      .then(data => {
        setRecords(data)
        setLoading(false)
      })
      .catch(err => {
        console.error("Dashboard error:", err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="dashboard-container">
      <header className="dash-header">
        <h2>לוח בקרה למורה - מעקב התקדמות</h2>
        <button onClick={() => window.location.reload()} className="refresh-btn">עדכן נתונים ↻</button>
      </header>

      {loading ? (
        <p>טוען נתונים ממסד הנתונים...</p>
      ) : (
        <div className="table-wrapper">
          <table className="dash-table">
            <thead>
              <tr>
                <th>מזהה תלמיד</th>
                <th>יחידת לימוד</th>
                <th>ציון אחרון</th>
                <th>זמן ביצוע</th>
              </tr>
            </thead>
            <tbody>
              {records.length === 0 ? (
                <tr><td colSpan={4}>אין עדיין נתונים לשליפה.</td></tr>
              ) : (
                records.map(record => (
                  <tr key={record.id}>
                    <td>{record.student_id}</td>
                    <td>יחידה {record.unit_id}</td>
                    <td className={record.score >= 80 ? 'high-score' : 'low-score'}>
                      {record.score}%
                    </td>
                    <td>{new Date(record.timestamp).toLocaleString('he-IL')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}