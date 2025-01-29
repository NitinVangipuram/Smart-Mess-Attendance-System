import React, { useState, useEffect, useRef } from 'react';
import { TextField, Button, Typography, Box, Container, Alert ,ButtonGroup} from '@mui/material';
import axios from 'axios';
import dayjs from 'dayjs';
import Swal from 'sweetalert2';
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;

const Attendance = () => {
    const [rollNo, setRollNo] = useState('');
    const [messtype, setMesstype] = useState('floor1');
    const date = dayjs().format('YYYY-MM-DD');
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

    const getCurrentMealType = () => {
        const currentHour = dayjs().hour();
        if (currentHour >= 7 && currentHour < 11) return 'breakfast';
        if (currentHour >= 12 && currentHour < 15) return 'lunch';
        if (currentHour >= 16 && currentHour < 18) return 'snacks';
        if (currentHour >= 19 && currentHour < 24) return 'dinner';
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
            const { data: student } = await axios.get(`${apiEndpoint}/student/${rollNo}`);

            if (student.messtype !== messtype) {
                Swal.fire({
                    title: 'Warning',
                    text: `Messtype does not match with the registered student. Expected: ${messtype}, Found: ${student.messtype}`,
                    icon: 'warning',
                    color: '#000', // black text color for better contrast
                });
                setRollNo('');
                return;
            }

            const response = await axios.post(`${apiEndpoint}/attendance/${messtype}`, {
                rollNo,
                mealType: currentMealType,
                date
            });

            if (response.status === 200) {
                Swal.fire('Success', `Attendance for ${currentMealType} marked successfully`, 'success');
                setRollNo(''); // Clear roll number after marking attendance
                rollNoRef.current.focus(); // Re-focus on Roll No input
            }
        } catch (error) {
            if (error.response) {
                Swal.fire('Error', error.response.data || 'Error marking attendance', 'error');
                setRollNo('');
            } else {
                Swal.fire('Error', 'Network error or unexpected issue', 'error');
                
            }
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

    const handleFloorChange = (newFloor) => {
        setMesstype(newFloor);
        rollNoRef.current.focus(); // Re-focus the Roll No input field after changing the floor
    };

    return (
        <div style={{background:"#EFF5FF" , minHeight:"100vh"}}>
        <Container style={{paddingTop:"40px"}}>
        <Box>
                <Alert
                    severity={currentMealType ? 'success' : 'error'}
                    sx={{ mb: 2 }}
                    style={{ paddingTop: "20px", paddingBottom: "20px", fontSize: "18px",border:"1px solid" }}
                >
                    Current Meal: {currentMealType ? currentMealType.charAt(0).toUpperCase() + currentMealType.slice(1) : "No meal available"}
                </Alert>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                    <Typography variant="h5">Mark Student</Typography>
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
                />

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
        </div>
    );
};

export default Attendance;
