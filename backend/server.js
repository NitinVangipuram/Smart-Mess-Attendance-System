const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');

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
        const workbook = xlsx.readFile(file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet);

        const students = data.map(row => ({
            rollNo: row.rollNo,
            messtype: row.messtype,
            days: row.days ? JSON.parse(row.days) : []
        }));

        await Student.insertMany(students);
        fs.unlinkSync(file.path); // Remove the file after processing

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
        const students = await Student.find().lean();
        const workbook = xlsx.utils.book_new();
        const worksheetData = students.map(student => ({
            rollNo: student.rollNo,
            messtype: student.messtype,
            days: JSON.stringify(student.days)
        }));
        const worksheet = xlsx.utils.json_to_sheet(worksheetData);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Students');

        // Save the file in the 'uploads' folder
        const filePath = path.join(uploadsDir, 'student.xlsx');
        xlsx.writeFile(workbook, filePath);

        console.log('File saved at:', filePath); // Log to confirm the file location

        // Send the file for download without deleting
        res.download(filePath, 'students.xlsx', (err) => {
            if (err) {
                console.error('Error during download:', err);
                res.status(500).send({ message: 'Error downloading file', error: err });
            } else {
                console.log('File download initiated successfully.');
            }
        });
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
        const students = await Student.find();
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

