import { useMemo, useState } from 'react';
import Header from './components/Header.jsx';
import StudentForm from './components/StudentForm.jsx';
import StudentList from './components/StudentList.jsx';
import initialStudents from './data.json';
import './style.css';

export default function App() {
  const [students, setStudents] = useState(initialStudents);
  const [search, setSearch] = useState('');

  const visibleStudents = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return students;
    return students.filter((student) =>
      [student.id, student.name, student.email, student.course]
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [students, search]);

  function addStudent(student) {
    setStudents((current) => [{ ...student, id: `STU${String(Date.now()).slice(-5)}` }, ...current]);
  }

  function deleteStudent(id) {
    setStudents((current) => current.filter((student) => student.id !== id));
  }

  const courses = new Set(students.map((student) => student.course)).size;

  return (
    <main className="app-shell">
      <Header />
      <section className="hero">
        <div>
          <p className="eyebrow">STUDENT SERVICES / OVERVIEW</p>
          <h2>Manage your students.</h2>
          <p>One simple space to organize student records, track courses, and keep your information tidy.</p>
        </div>
        <div className="hero-icon" aria-hidden="true">🎓</div>
      </section>

      <section className="stats" aria-label="Student statistics">
        <div className="stat"><span>Total students</span><strong>{students.length}</strong></div>
        <div className="stat"><span>Courses represented</span><strong>{courses}</strong></div>
        <div className="stat"><span>Search results</span><strong>{visibleStudents.length}</strong></div>
      </section>

      <section className="content-grid">
        <StudentForm onAddStudent={addStudent} />
        <section className="panel">
          <h3 className="panel-heading">Student directory</h3>
          <p className="panel-subtitle">Search and manage your student records.</p>
          <label className="search-box">
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, ID, email, or course..."
              aria-label="Search students"
            />
          </label>
          <StudentList students={visibleStudents} onDelete={deleteStudent} />
        </section>
      </section>
      <p className="footer">Student Management System · Individual Project</p>
    </main>
  );
}
