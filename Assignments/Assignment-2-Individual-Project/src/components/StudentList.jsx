export default function StudentList({ students, onDelete }) {
  if (students.length === 0) {
    return <div className="empty-state">No students found. Try another search or add a student.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Student</th>
            <th>Course</th>
            <th>Year</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td>
                <div className="student-name">
                  <span className="avatar">{student.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>
                  <span>
                    <span style={{ display: 'block' }}>{student.name}</span>
                    <span style={{ display: 'block', color: '#8992a4', fontSize: 10, fontWeight: 400 }}>{student.email}</span>
                    <span style={{ display: 'block', color: '#a0a8b7', fontSize: 10 }}>{student.id}</span>
                  </span>
                </div>
              </td>
              <td><span className="course-tag">{student.course}</span></td>
              <td>{student.year}</td>
              <td><button className="delete-btn" onClick={() => onDelete(student.id)} aria-label={`Delete ${student.name}`}>Delete</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
