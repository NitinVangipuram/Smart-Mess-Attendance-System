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
    try {
        const newStudent = new Student({ rollNo, messtype });
        await newStudent.save();
        res.status(201).send("Student registered successfully");
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Mark attendance for a student
app.post('/attendance', async (req, res) => {
    const { rollNo, mealType, date } = req.body;
    try {
        const student = await Student.findOne({ rollNo });
        if (!student) return res.status(404).send("Student not found");

        const attendanceDate = new Date(date);
        const existingDay = student.days.find(day => day.date.toDateString() === attendanceDate.toDateString());

        if (existingDay) {
            existingDay[mealType] = true;
        } else {
            const newDay = { date: attendanceDate, [mealType]: true };
            student.days.push(newDay);
        }

        await student.save();
        res.status(200).send("Attendance marked successfully");
    } catch (error) {
        res.status(400).send(error.message);
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

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

