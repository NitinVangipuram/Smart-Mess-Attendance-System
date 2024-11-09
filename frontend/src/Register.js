// Register.js
import React, { useState } from 'react';
import { TextField, Button, Typography, Box, Container } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

const Register = () => {
    const [rollNo, setRollNo] = useState('');
    const [messtype, setMesstype] = useState('floor1');
    const [isSubmitting, setIsSubmitting] = useState(false); // New state to track submission status

    const registerStudent = async () => {
        if (isSubmitting) return; // Prevent further submissions if already submitting

        setIsSubmitting(true); // Set submitting state to true

        try {
            await axios.post('http://localhost:8000/register', { rollNo, messtype });
            Swal.fire('Success', 'Student registered successfully', 'success');
            setRollNo(''); // Clear roll number after successful registration
        } catch (error) {
            Swal.fire('Error', 'Error registering student', 'error');
        } finally {
            setIsSubmitting(false); // Reset submitting state
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Prevent default form submission
            registerStudent(); // Call the register function
        }
    };

    return (
        <Container>
            <Box marginTop="20px">
                <Typography variant="h5" sx={{ fontFamily: 'DM Sans' }} style={{ marginBottom: "15px" }}>
                    Register Student
                </Typography>
                
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
                    sx={{ mb: 2 }}
                />

                <Button
                    variant="contained"
                    color="primary"
                    onClick={registerStudent}
                    sx={{ mt: 2, borderRadius: '6px' }}
                    disabled={isSubmitting} // Disable button while submitting
                >
                    Register
                </Button>
            </Box>
        </Container>
    );
};

export default Register;
