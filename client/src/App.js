import React, { useState, useEffect } from 'react';

function AuthForm({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    fetch(`http://localhost:3000${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(res => res.json().then(data => ({ status: res.status, body: data })))
    .then(({ status, body }) => {
      if (status === 200) {
        localStorage.setItem('user', JSON.stringify(body.user));
        onAuth(body.user);
      } else {
        setError(body.message);
      }
    });
  };

  return (
    <div style={{ maxWidth: '300px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
      <h2 style={{ textAlign: 'center' }}>{isLogin ? "Вхід" : "Реєстрація"}</h2>
      {error && <p style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Логін" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '8px' }} />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required style={{ padding: '8px' }} />
        <button type="submit" style={{ padding: '10px', backgroundColor: '#3498db', color: '#fff', border: 'none', cursor: 'pointer' }}>
          {isLogin ? "Увійти" : "Зареєструватися"}
        </button>
      </form>
      <p style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px', cursor: 'pointer', color: '#3498db' }} onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Немає акаунта? Створити" : "Вже є акаунт? Увійти"}
      </p>
    </div>
  );
}

function TeacherCard({ teacher }) {
  return (
    <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', width: '280px', backgroundColor: '#fff', textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <div style={{ fontSize: '40px' }}>👤</div>
      <h3 style={{ color: '#2c3e50' }}>{teacher.name}</h3>
      <p style={{ color: '#3498db', fontWeight: 'bold' }}>{teacher.expertise}</p>
      <p style={{ fontSize: '14px', color: '#7f8c8d' }}>{teacher.bio}</p>
    </div>
  );
}

function CourseCard({ course, currentUser, onCourseUpdate, onUserUpdate }) {
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);

  const isEnrolled = currentUser.enrolledCourses.includes(course.id);

  const handleEnroll = () => {
    fetch(`http://localhost:3000/api/courses/${course.id}/enroll`, { 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.id })
    })
      .then(res => res.json())
      .then(data => {
        if (data.course && data.user) {
          onCourseUpdate(data.course);
          onUserUpdate(data.user);
          localStorage.setItem('user', JSON.stringify(data.user)); 
        } else { alert(data.message); }
      });
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    fetch(`http://localhost:3000/api/courses/${course.id}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: reviewText, rating: Number(rating), username: currentUser.username })
    })
      .then(res => res.json())
      .then(data => {
        onCourseUpdate(data.course); 
        setReviewText("");
      });
  };

  const avgRating = course.reviews.length > 0 
    ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
    : "0.0";

  return (
    <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', width: '300px', backgroundColor: '#fff', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
      <h3 style={{ color: '#2c3e50', marginTop: 0 }}>{course.title}</h3>
      <p>⭐ Середня оцінка: <strong>{avgRating}</strong></p>
      <button onClick={handleEnroll} disabled={isEnrolled} style={{ padding: '10px', width: '100%', cursor: isEnrolled ? 'default' : 'pointer', backgroundColor: isEnrolled ? '#bdc3c7' : '#2ecc71', color: 'white', border: 'none', borderRadius: '4px' }}>
        {isEnrolled ? "✓ Ви записані" : "Записатися"}
      </button>

      <div style={{ marginTop: '15px', background: '#f9f9f9', padding: '10px', borderRadius: '6px' }}>
        
        {isEnrolled ? (
          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <input type="text" placeholder="Відгук..." value={reviewText} onChange={e => setReviewText(e.target.value)} required style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }} />
            <select value={rating} onChange={e => setRating(e.target.value)} style={{ padding: '6px', border: '1px solid #ccc', borderRadius: '4px' }}>
               {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} зірок</option>)}
            </select>
            <button type="submit" style={{ padding: '8px', backgroundColor: '#3498db', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Оцінити</button>
          </form>
        ) : (
          <p style={{ fontSize: '12px', color: '#e67e22', textAlign: 'center', marginTop: '5px', fontWeight: 'bold' }}>
            Запишіться на курс, щоб залишити відгук.
          </p>
        )}

        <div style={{ maxHeight: '100px', overflowY: 'auto', marginTop: '10px', fontSize: '12px' }}>
          {course.reviews.map(r => <p key={r.id} style={{ margin: '4px 0' }}><strong>{r.username}</strong> ({r.rating}): {r.text}</p>)}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]); 
  const [view, setView] = useState('catalog');

  useEffect(() => {
    fetch('http://localhost:3000/api/courses').then(res => res.json()).then(setCourses);
    fetch('http://localhost:3000/api/teachers').then(res => res.json()).then(setTeachers);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setCurrentUser(null);
  };

  if (!currentUser) return <AuthForm onAuth={setCurrentUser} />;

  const updateCourse = (upd) => setCourses(courses.map(c => c.id === upd.id ? upd : c));

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <nav style={{ backgroundColor: '#2c3e50', padding: '15px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <button onClick={() => setView('catalog')} style={{ marginRight: '10px', padding: '8px', cursor: 'pointer', fontWeight: view === 'catalog' ? 'bold' : 'normal' }}>Каталог</button>
          <button onClick={() => setView('cabinet')} style={{ marginRight: '10px', padding: '8px', cursor: 'pointer', fontWeight: view === 'cabinet' ? 'bold' : 'normal' }}>Мій Кабінет</button>
          <button onClick={() => setView('teachers')} style={{ padding: '8px', cursor: 'pointer', fontWeight: view === 'teachers' ? 'bold' : 'normal' }}>Викладачі</button>
        </div>
        <div>
          <span style={{ marginRight: '15px' }}>Привіт, <strong>{currentUser.username}</strong></span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Вийти</button>
        </div>
      </nav>
      
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', padding: '20px', justifyContent: 'center' }}>
        {view === 'catalog' && courses.map(c => <CourseCard key={c.id} course={c} currentUser={currentUser} onCourseUpdate={updateCourse} onUserUpdate={setCurrentUser} />)}
        {view === 'cabinet' && courses.filter(c => currentUser.enrolledCourses.includes(c.id)).map(c => <CourseCard key={c.id} course={c} currentUser={currentUser} onCourseUpdate={updateCourse} onUserUpdate={setCurrentUser} />)}
        {view === 'teachers' && teachers.map(t => <TeacherCard key={t.id} teacher={t} />)}
      </div>
    </div>
  );
}

export default App;