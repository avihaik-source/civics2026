import React, { useState, useEffect } from 'react';

interface StudentRecord {
  id: string;
  name: string;
  progress: number;
  lastActive: string;
}

export const Dashboard: React.FC = () => {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // משיכת נתונים משרת ה-Worker שלנו
    fetch('/api/teacher/students')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setStudents(data.students);
        } else {
          console.error("שגיאה בטעינת הנתונים:", data.error);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Dashboard error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <header className="dash-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h2 style={{ color: 'var(--gov-blue)' }}>לוח בקרה למורה - מעקב התקדמות</h2>
        <button onClick={() => window.location.reload()} className="btn-primary">עדכן נתונים ↻</button>
      </header>

      {loading ? (
        <p className="text-center font-bold text-lg">טוען נתונים ממסד הנתונים...</p>
      ) : (
        <div className="table-wrapper bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-right border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="p-4 font-bold text-slate-700">מזהה תלמיד</th>
                <th className="p-4 font-bold text-slate-700">שם התלמיד</th>
                <th className="p-4 font-bold text-slate-700">התקדמות</th>
                <th className="p-4 font-bold text-slate-700">פעילות אחרונה</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={4} className="p-4 text-center text-slate-500">אין עדיין נתונים לשליפה.</td></tr>
              ) : (
                students.map(student => (
                  <tr key={student.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="p-4">{student.id}</td>
                    <td className="p-4 font-semibold text-slate-800">{student.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${student.progress >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} 
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="font-bold text-sm text-slate-600">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 text-sm">
                      {new Date(student.lastActive).toLocaleDateString('he-IL')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};