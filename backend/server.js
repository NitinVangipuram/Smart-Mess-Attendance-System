const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.json());
app.use(cors());

const upload = multer({ dest: 'uploads/' });
// MongoDB connection
mongoose.connect('mongodb+srv://dharhacks:KfYYaWCNDC7ZCqaF@cluster0.kwhiyso.mongodb.net/qrDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true });

// Schema and Model
const daySchema = new mongoose.Schema({
    breakfast: { type: Boolean, default: false },
    lunch: { type: Boolean, default: false },
    snacks: { type: Boolean, default: false },
    dinner: { type: Boolean, default: false },
    date: { type: Date, required: true }
});

const studentSchema = new mongoose.Schema({
    rollNo: { type: String, required: true, unique: true },
    messtype: { type: String, required: true },
    days: [daySchema]
});


const Student = mongoose.model('Student', studentSchema);

const JWT_SECRET = 'mysecretkey';

// User Schema and Model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Seed the admin user if not present
async function seedAdminUser() {
    const existingUser = await User.findOne({ username: 'messiitdh' });
    if (!existingUser) {
        const hashedPassword = await bcrypt.hash('messiitdh', 10);
        const adminUser = new User({ username: 'messiitdh', password: hashedPassword });
        await adminUser.save();
        console.log('Admin user created');
    }
}
seedAdminUser();

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Authentication API
app.post('/authenticate', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(401).json({ error: 'Invalid username or password' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: 'Invalid username or password' });

        const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Protected API example (can be applied to other routes)
app.get('/protected', authenticateJWT, (req, res) => {
    res.json({ message: 'Access granted to protected route' });
});

// Register a student
app.post('/register', async (req, res) => {
    const { rollNo, messtype } = req.body;
    if (!rollNo || !messtype) {
        return res.status(400).send("rollNo and messtype are required");
    }
    
    try {
        const existingStudent = await Student.findOne({ rollNo });
        if (existingStudent) {
            return res.status(409).send("Student already registered");
        }

        const newStudent = new Student({ rollNo, messtype });
        await newStudent.save();
        res.status(201).send("Student registered successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Mark attendance for students with specific messtype
app.post('/attendance/:messtype', async (req, res) => {
    const { messtype } = req.params;
    const { rollNo, mealType, date } = req.body;

    if (!rollNo || !mealType || !date) {
        return res.status(400).send("rollNo, mealType, and date are required");
    }

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
        return res.status(400).send("Invalid mealType");
    }

    try {
        const student = await Student.findOne({ rollNo });
        if (!student) return res.status(404).send("Student not found");

        if (student.messtype !== messtype) {
            return res.status(403).send(`Student messtype does not match the required messtype: ${messtype}`);
        }

        const attendanceDate = new Date(date);
        const existingDay = student.days.find(day => day.date.toDateString() === attendanceDate.toDateString());

        if (existingDay) {
            if (existingDay[mealType]) {
                return res.status(409).send(`Attendance already marked for ${mealType} on this date`);
            }
            existingDay[mealType] = true;
        } else {
            const newDay = { date: attendanceDate, [mealType]: true };
            student.days.push(newDay);
        }

        await student.save();
        res.status(200).send("Attendance marked successfully");
    } catch (error) {
        res.status(500).send(error.message);
    }
});


// Get student by rollNo
app.get('/student/:rollNo', async (req, res) => {
    try {
        const student = await Student.findOne({ rollNo: req.params.rollNo });
        if (!student) return res.status(404).send("Student not found");
        res.json(student);
    } catch (error) {
        res.status(500).send("Error retrieving student");
    }
});


// API to Add Students from Excel/CSV
app.post('/add-students', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const students = data.map(row => ({
            rollNo: row.rollNo,
            messtype: row.messtype,
            days: row.days ? JSON.parse(row.days) : [],
        }));

        await Student.insertMany(students);
        fs.unlinkSync(file.path);  // Remove the file after processing

        res.json({ message: 'Students added successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error adding students', error });
    }
});


// API to Download Students as Excel
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}


app.get('/download-students', async (req, res) => {
    try {
        // Fetch all students from the database
        const students = await Student.find().lean();

        // Prepare data for the Excel sheet
        const worksheetData = students.map(student => ({
            rollNo: student.rollNo,
            messtype: student.messtype,
            days: JSON.stringify(student.days)
        }));

        // Create a new workbook and add the worksheet
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet(worksheetData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

        // Generate the Excel file buffer
        const excelBuffer = xlsx.write(workbook, { bookType: 'xlsx', type: 'buffer' });

        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Length', excelBuffer.length); // Send the length of the file for browsers to expect the data

        // Send the Excel buffer as the response
        res.end(excelBuffer); // Using res.end to send the buffer directly

        console.log('File download initiated successfully.');
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ message: 'Error downloading students', error });
    }
});

// API: GET /api/students/:messtype - Get all students of a specific messtype
app.get('/api/students/:messtype', async (req, res) => {
    const { messtype } = req.params;

    try {
        const students = await Student.find({ messtype }, 'rollNo'); 
        res.json(students.map(student => student.rollNo));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



// Get analytics for a specific date, meal type, and messtype
app.get('/api/analytics/:date/:mealType/:messtype', async (req, res) => {
    const { date, mealType, messtype } = req.params;
    const queryDate = new Date(date);

    if (!['breakfast', 'lunch', 'snacks', 'dinner'].includes(mealType)) {
        return res.status(400).json({ error: "Invalid meal type." });
    }

    try {
        const students = await Student.find({
            messtype,
            [`days.${mealType}`]: true,
            'days.date': queryDate
        });

        res.json({
            date: queryDate,
            mealType,
            messtype,
            count: students.length,
            students: students.map(student => student.rollNo) // Only returning roll numbers
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get student details by roll number
app.get('/api/student/:rollNo', async (req, res) => {
    const { rollNo } = req.params;

    try {
        const student = await Student.findOne({ rollNo });
        if (!student) {
            return res.status(404).json({ error: "Student not found." });
        }
        res.json(student);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Get attendance summary
app.get('/api/attendance/:messtype', async (req, res) => {
    try {
        const { messtype } = req.params;
        const students = await Student.find({messtype});
        const attendanceSummary = {};

        students.forEach(student => {
            student.days.forEach(day => {
                const dateKey = day.date.toISOString().split('T')[0];

                if (!attendanceSummary[dateKey]) {
                    attendanceSummary[dateKey] = { breakfast: 0, lunch: 0, snacks: 0, dinner: 0 };
                }

                if (day.breakfast) attendanceSummary[dateKey].breakfast++;
                if (day.lunch) attendanceSummary[dateKey].lunch++;
                if (day.snacks) attendanceSummary[dateKey].snacks++;
                if (day.dinner) attendanceSummary[dateKey].dinner++;
            });
        });

        res.json(attendanceSummary);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

