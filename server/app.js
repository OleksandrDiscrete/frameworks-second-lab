const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = [];
let courses = [
    { id: 1, title: "Основи JavaScript", duration: "4 тижні", level: "Початківець", enrollments: 0, reviews: [] },
    { id: 2, title: "Просунутий React", duration: "6 тижнів", level: "Середній", enrollments: 0, reviews: [] },
    { id: 3, title: "Node.js для серверів", duration: "5 тижнів", level: "Просунутий", enrollments: 0, reviews: [] }
];
let teachers = [
    { id: 1, name: "Олександр Петренко", expertise: "JavaScript / Node.js", bio: "10 років досвіду в розробці." },
    { id: 2, name: "Марія Сидоренко", expertise: "React / UX Design", bio: "Ведучий дизайнер у великій IT компанії." }
];


app.post('/api/register', (req, res) => {
    const { username, password } = req.body;

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Користувач з таким логіном вже існує" });
    }

    const newUser = { id: Date.now(), username, password, enrolledCourses: [] };
    users.push(newUser);

    res.json({ message: "Реєстрація успішна", user: { id: newUser.id, username: newUser.username, enrolledCourses: newUser.enrolledCourses } });
});

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ message: "Вхід успішний", user: { id: user.id, username: user.username, enrolledCourses: user.enrolledCourses } });
    } else {
        res.status(401).json({ message: "Невірний логін або пароль" });
    }
});


app.get('/api/courses', (req, res) => {
    res.json(courses);
});

app.post('/api/courses/:id/enroll', (req, res) => {
    const courseId = parseInt(req.params.id);
    const userId = req.body.userId; 

    const course = courses.find(c => c.id === courseId);
    const user = users.find(u => u.id === userId);

    if (!course || !user) {
        return res.status(404).json({ message: "Курс або користувача не знайдено" });
    }

    if (user.enrolledCourses.includes(courseId)) {
        return res.status(400).json({ message: "Ви вже записані на цей курс!" });
    }

    user.enrolledCourses.push(courseId);
    course.enrollments += 1;

    res.json({ 
        message: "Успішно записано", 
        course: course, 
        user: { id: user.id, username: user.username, enrolledCourses: user.enrolledCourses } 
    });
});

app.post('/api/courses/:id/reviews', (req, res) => {
    const courseId = parseInt(req.params.id);
    const { text, rating, username } = req.body;
    
    const course = courses.find(c => c.id === courseId);
    if (course) {
        course.reviews.push({ id: Date.now(), username, text, rating: Number(rating) });
        res.json({ message: "Відгук додано", course });
    } else {
        res.status(404).json({ message: "Курс не знайдено" });
    }
});
app.get('/api/teachers', (req, res) => {
    res.json(teachers);
});

app.listen(3000, () => {
    console.log("Server started on port 3000. Авторизація підключена.");
});
