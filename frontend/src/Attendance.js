// Attendance.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container, Alert } from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';

const Attendance = () => {
    const [rollNo, setRollNo] = useState('');
    const [messtype, setMesstype] = useState('floor1');
    const date = dayjs().format('YYYY-MM-DD');
    const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state

    const getCurrentMealType = () => {
        const currentHour = dayjs().hour();
        if (currentHour >= 7 && currentHour < 10) return 'breakfast';
        if (currentHour >= 12 && currentHour < 14) return 'lunch';
        if (currentHour >= 14 && currentHour < 18) return 'snacks';
        if (currentHour >= 19 && currentHour < 21) return 'dinner';
        return ''; // No meal type currently available
    };
    
    const currentMealType = getCurrentMealType();

    const markAttendance = async () => {
        if (isSubmitting) return; // Prevent further submissions if already submitting

        if (!currentMealType) {
            Swal.fire('Error', 'No meal is currently being served at this time', 'error');
            return;
        }

        setIsSubmitting(true); // Set submitting state to true

        try {
            const { data: student } = await axios.get(`http://localhost:8000/student/${rollNo}`);
            if (student.messtype !== messtype) {
                Swal.fire('Error', 'Messtype does not match with the registered student', 'error');
                return;
            }

            await axios.post('http://localhost:8000/attendance', { rollNo, mealType: currentMealType, date });
            Swal.fire('Success', `Attendance for ${currentMealType} marked successfully`, 'success');
            setRollNo(''); // Clear roll number after marking attendance
        } catch (error) {
            Swal.fire('Error', 'Error marking attendance or student not found', 'error');
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            markAttendance(); // Call the mark attendance function
        }
    };

    return (
        <Container>
            <Box marginTop="20px">
                <Typography variant="h5">Mark Student</Typography>
                
                {/* Display the current date */}
                <Typography variant="h6" sx={{ mt: 2 }}>
                    Date: {dayjs().format('MMMM D, YYYY')}
                </Typography>

                <Box display="flex" justifyContent="space-around" mb={2}>
                    <Button
                        variant={messtype === 'floor1' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setMesstype('floor1')}
                        sx={{ borderRadius: '6px' }}
                    >
                        Floor 1
                    </Button>
                    <Button
                        variant={messtype === 'floor2' ? 'contained' : 'outlined'}
                        color="primary"
                        onClick={() => setMesstype('floor2')}
                        sx={{ borderRadius: '6px' }}
                    >
                        Floor 2
                    </Button>
                </Box>
                <TextField
                    label="Roll No"
                    fullWidth
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    onKeyDown={handleKeyDown} // Add key down listener
                />

                {/* Display the current meal type with alert coloring */}
                <Alert 
                    severity={currentMealType ? 'success' : 'error'} 
                    sx={{ mt: 2 }}
                >
                    Current Meal: {currentMealType ? currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1) : "No meal available"}
                </Alert>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={markAttendance}
                    sx={{ mt: 2, borderRadius: '6px' }}
                    disabled={isSubmitting} // Disable button while submitting
                >
                    Mark Student
                </Button>
            </Box>
        </Container>
    );
};

export default Attendance;
