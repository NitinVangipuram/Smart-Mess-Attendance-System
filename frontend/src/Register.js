import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Box, Container,ButtonGroup } from '@mui/material';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
const apiEndpoint = process.env.API_ENDPOINT;
const Register = () => {
    const [rollNo, setRollNo] = useState('');
    const [messtype, setMesstype] = useState('floor1');
    const [isSubmitting, setIsSubmitting] = useState(false); // Track submission state
    const rollNoRef = useRef(null); // Reference for Roll No input

    useEffect(() => {
        rollNoRef.current.focus(); // Set focus to Roll No input when the component loads

        // Prevent focus loss by stopping the blur event when clicking outside
        const preventBlur = (event) => {
            if (!rollNoRef.current.contains(event.target)) {
                event.preventDefault(); // Prevent blur when clicking outside
            }
        };

        document.addEventListener('mousedown', preventBlur); // Listen for click outside
        return () => {
            document.removeEventListener('mousedown', preventBlur); // Cleanup on unmount
        };
    }, []);

    const registerStudent = async () => {
        if (isSubmitting) return; // Prevent further submissions if already submitting

        setIsSubmitting(true); // Set submitting state to true

        try {
            await axios.post(`${apiEndpoint}/register`, { rollNo, messtype });
            Swal.fire('Success', 'Student registered successfully', 'success');
            setRollNo(''); // Clear roll number after successful registration
            rollNoRef.current.focus(); // Re-focus on Roll No input after registration
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

    const handleFloorChange = (newFloor) => {
        setMesstype(newFloor);
        rollNoRef.current.focus(); // Re-focus the Roll No input field after changing the floor
    };

    return (
        <div style={{background:"#EFF5FF" , minHeight:"100vh"}}>
        <Container style={{paddingTop:"40px"}}>
            <Box >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <Typography variant="h5" sx={{ fontFamily: 'DM Sans' }}>
                        Register Student
                    </Typography>
                    {/* Display the current date */}
                    <Typography variant="h6">
                        Date: {dayjs().format('MMMM D, YYYY')}
                    </Typography>
                </div>
                <Box display="flex" justifyContent="center" mb={4} mt ={4}>
            <ButtonGroup
                sx={{
                    borderRadius: '30px',
                    
                    overflow: 'hidden',
                    width:"100%",
                    
                }}
            >
                <Button
                    variant={messtype === 'floor1' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleFloorChange('floor1')}
                    sx={{
                        borderRadius: '30px',
                        width:"100%",
                        textTransform: 'none',
                        padding: '10px 30px',
                        color: messtype === 'floor1' ? 'white' : 'primary.main',
                        backgroundColor: messtype === 'floor1' ? 'primary.main' : 'white',
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                        '&:hover': {
                            backgroundColor: messtype === 'floor1' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    Floor 1
                </Button>
                <Button
                    variant={messtype === 'floor2' ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleFloorChange('floor2')}
                    sx={{
                        borderRadius: '30px',
                        textTransform: 'none',
                        width:"100%",
                        padding: '10px 30px',
                        color: messtype === 'floor2' ? 'white' : 'primary.main',
                        backgroundColor: messtype === 'floor2' ? 'primary.main' : 'white',
                        transition: 'background-color 0.3s ease, color 0.3s ease',
                        '&:hover': {
                            backgroundColor: messtype === 'floor2' ? 'primary.dark' : 'rgba(0, 0, 0, 0.04)',
                        },
                    }}
                >
                    Floor 2
                </Button>
            </ButtonGroup>
        </Box>
                <TextField
                    label="Roll No"
                    fullWidth
                    value={rollNo}
                    onChange={(e) => setRollNo(e.target.value)}
                    onKeyDown={handleKeyDown} // Add key down listener
                    inputRef={rollNoRef} // Set ref to Roll No input
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
        </div>
    );
};

export default Register;
