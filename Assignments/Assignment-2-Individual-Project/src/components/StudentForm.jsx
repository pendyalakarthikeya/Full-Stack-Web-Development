import { useState } from 'react';

const emptyForm = { name: '', email: '', course: 'Computer Science', year: '1st Year' };

export default function StudentForm({ onAddStudent }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
    setError('');
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError('Please enter both a name and an email address.');
      return;
    }
    onAddStudent({
      name: form.name.trim(),
      email: form.email.trim(),
      course: form.course,
      year: form.year,
    });
    setForm(emptyForm);
    setError('');
  }

  return (
    <section className="panel">
      <h3 className="panel-heading">Add a student</h3>
      <p className="panel-subtitle">Enter details to create a new record.</p>
      <form onSubmit={submit}>
        <label className="field">
          <span>Full name *</span>
          <input name="name" value={form.name} onChange={update} placeholder="e.g. Ananya Sharma" required />
        </label>
        <label className="field">
          <span>Email address *</span>
          <input name="email" type="email" value={form.email} onChange={update} placeholder="student@example.com" required />
        </label>
        <label className="field">
          <span>Course</span>
          <select name="course" value={form.course} onChange={update}>
            <option>Computer Science</option>
            <option>Artificial Intelligence</option>
            <option>Information Technology</option>
            <option>Electronics</option>
            <option>Business Administration</option>
          </select>
        </label>
        <label className="field">
          <span>Academic year</span>
          <select name="year" value={form.year} onChange={update}>
            <option>1st Year</option>
            <option>2nd Year</option>
            <option>3rd Year</option>
            <option>4th Year</option>
          </select>
        </label>
        {error && <p role="alert" style={{ color: '#e11d48', fontSize: 12 }}>{error}</p>}
        <button className="primary-btn" type="submit">+ Add student</button>
      </form>
    </section>
  );
}
