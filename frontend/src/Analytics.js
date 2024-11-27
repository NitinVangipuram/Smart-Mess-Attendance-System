import React, { useState } from 'react';
import {
  Box, Typography, TextField, Button, CircularProgress, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Card, Select, MenuItem, InputLabel, FormControl,CardContent,TablePagination,Container
} from '@mui/material';
import { CheckCircle, Cancel } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto';
import axios from 'axios';

const AnalyticsPage = () => {
  const [action, setAction] = useState('');
  const [messtype, setMesstype] = useState('');
  const [date, setDate] = useState('');
  const [mealType, setMealType] = useState('');
  const [rollNo, setRollNo] = useState('');
  const [studentsData, setStudentsData] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState({});
  const [studentDetails, setStudentDetails] = useState(null);
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  // Fetch functions
  const handleMesstypeChange = (e) => setMesstype(e.target.value);
  const handleMealTypeChange = (e) => setMealType(e.target.value);

  const fetchStudentsByMesstype = async () => {
    setLoading(true);
    setError(null);
    setStudentsData([]);
    try {
      const response = await axios.get(`http://localhost:8000/api/students/${messtype}`);
      setStudentsData(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    setStudentsData([]);
    setAttendanceSummary({});
    try {
      const response = await axios.get(`http://localhost:8000/api/analytics/${date}/${mealType}/${messtype}`);
      setAnalyticsData(response.data);
      setStudentsData(response.data.students); // Update studentsData with students in analytics
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const fetchAttendanceSummary = async () => {
    setLoading(true);
    setError(null);
    setAttendanceSummary({});
    try {
      const response = await axios.get(`http://localhost:8000/api/attendance/${messtype}`);
      setAttendanceSummary(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const fetchStudentDetails = async (rollNo) => {
    setLoading(true);
    setError(null);
    setStudentDetails(null);
    try {
      const response = await axios.get(`http://localhost:8000/api/student/${rollNo}`);
      setStudentDetails(response.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError(err.message);
    }
  };

  const handleActionChange = (e) => setAction(e.target.value);

  const renderInputs = () => {
    switch (action) {
      case 'students':
        return (
          <>
           <FormControl fullWidth sx={{ marginBottom: '20px' }} required>
      <InputLabel>Messtype</InputLabel>
      <Select
        value={messtype} // The current value for the messtype
        onChange={handleMesstypeChange} // Handler for when selection changes
        label="Messtype" // Attach the label here for proper floating
      >
        <MenuItem value="floor1">Floor 1</MenuItem>
        <MenuItem value="floor2">Floor 2</MenuItem>
      </Select>
    </FormControl>
            <Button variant="contained" onClick={fetchStudentsByMesstype} disabled={loading}>
              Get Students by Messtype
            </Button>
          </>
        );
      case 'analytics':
        return (
          <>
            <FormControl fullWidth sx={{ marginBottom: '20px' }} required>
              <InputLabel>Messtype</InputLabel>
              <Select value={messtype} onChange={handleMesstypeChange}
              label="Messtype"
              >
                <MenuItem value="floor1">Floor 1</MenuItem>
                <MenuItem value="floor2">Floor 2</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              sx={{ marginBottom: '20px' }}
            />
            <FormControl fullWidth sx={{ marginBottom: '20px' }}>
              <InputLabel>Meal Type</InputLabel>
              <Select value={mealType} onChange={handleMealTypeChange}
              label ="Meal Type">
                <MenuItem value="breakfast">Breakfast</MenuItem>
                <MenuItem value="lunch">Lunch</MenuItem>
                <MenuItem value="snacks">Snacks</MenuItem>
                <MenuItem value="dinner">Dinner</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={fetchAnalytics} disabled={loading}>
              Get Analytics
            </Button>
          </>
        );
      case 'attendance':
        return (
          <>
            <FormControl fullWidth sx={{ marginBottom: '20px' }}>
              <InputLabel>Messtype</InputLabel>
              <Select value={messtype} onChange={handleMesstypeChange}
              label ="messtype">
                <MenuItem value="floor1">Floor 1</MenuItem>
                <MenuItem value="floor2">Floor 2</MenuItem>
              </Select>
            </FormControl>
            <Button variant="contained" onClick={fetchAttendanceSummary} disabled={loading}>
              Get Attendance Summary
            </Button>
          </>
        );
      case 'studentDetails':
        return (
          <>
            <TextField
              label="Student Roll No"
              value={rollNo}
              onChange={(e) => setRollNo(e.target.value)}
              fullWidth
              sx={{ marginBottom: '20px' }}
            />
            <Button variant="contained" onClick={() => fetchStudentDetails(rollNo)} disabled={loading}>
              Get Student Details
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  const renderTable = (data, headers) => {
    const paginatedData = data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
      <Box >
        <Typography variant="body1" sx={{ marginBottom: '10px' }}>
          Total Students: {data.length}
        </Typography>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>S.No</TableCell>
                {headers.map((header, index) => (
                  <TableCell key={index}>{header}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1 + page * rowsPerPage}</TableCell> {/* Serial Number */}
                  {Object.values(row).map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={data.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0); // Reset to the first page
          }}
        />
      </Box>
    );
  };
  
  const renderAttendanceChart = () => {
    const labels = Object.keys(attendanceSummary);
    const data = {
      labels,
      datasets: [
        { label: 'Breakfast', data: labels.map((label) => attendanceSummary[label].breakfast || 0), borderColor: 'red' },
        { label: 'Lunch', data: labels.map((label) => attendanceSummary[label].lunch || 0), borderColor: 'blue' },
        { label: 'Snacks', data: labels.map((label) => attendanceSummary[label].snacks || 0), borderColor: 'green' },
        { label: 'Dinner', data: labels.map((label) => attendanceSummary[label].dinner || 0), borderColor: 'purple' },
      ],
    };
    return <Line data={data} style={{maxHeight:"400px"}} />;
  };

  return (
    <div style={{background:"#EFF5FF" , minHeight:"100vh",paddingBottom:"30px"}}>
        <Container style={{paddingTop:"40px"}}>
        <Box>
      <Typography variant="h4" gutterBottom>Analytics Dashboard</Typography>

      <FormControl fullWidth sx={{ marginBottom: '20px' }} required>
      <InputLabel>Select Action</InputLabel>
      <Select value={action} onChange={handleActionChange} label="Select Action">
        <MenuItem value="students">Get Students by Messtype</MenuItem>
        <MenuItem value="analytics">Get Analytics</MenuItem>
        <MenuItem value="attendance">Get Attendance Summary</MenuItem>
        <MenuItem value="studentDetails">Get Student Details by Roll No</MenuItem>
      </Select>
    </FormControl>

      {renderInputs()}

      {loading && (
        <Box sx={{ textAlign: 'center', marginTop: '20px' }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Box sx={{ color: 'red', marginTop: '20px', textAlign: 'center' }}>
          <Typography variant="h6">{error}</Typography>
        </Box>
      )}

      {studentsData.length > 0 && action === 'students' && (
        <Box sx={{ marginTop: '30px' }}>
          <Typography variant="h5" gutterBottom>Students in {messtype}</Typography>
          {renderTable(studentsData.map((rollNo) => ({ RollNo: rollNo })), ['Roll Number'])}
        </Box>
      )}

      {analyticsData && action === 'analytics' && (
        <Box sx={{ marginTop: '30px' }}>
          <Typography variant="h5" gutterBottom>
            Analytics for {analyticsData.messtype} on {new Date(analyticsData.date).toLocaleDateString()}
          </Typography>
          <Typography variant="body1">Meal Type: {analyticsData.mealType}</Typography>
          <Typography variant="body1">Total Count: {analyticsData.count} student(s)</Typography>
          
          {analyticsData.students && analyticsData.students.length > 0 && (
            <Box sx={{ marginTop: '20px' }}>
              <Typography variant="h6">Students:</Typography>
              {renderTable(analyticsData.students.map((rollNo) => ({ RollNo: rollNo })), ['Roll Number'])}
            </Box>
          )}
        </Box>
      )}

      {attendanceSummary && action === 'attendance' && (
        <Box sx={{ marginTop: '30px' }}>
          <Typography variant="h5" gutterBottom>Attendance Summary</Typography>
          {renderAttendanceChart()}
        </Box>
      )}

      {studentDetails && !loading && action === 'studentDetails' && (
  <Box sx={{ marginTop: '30px' }}>
    <Typography variant="h5" gutterBottom>
      Student Details for Roll No: {studentDetails.rollNo}
    </Typography>
    <Card>
      <CardContent>
        <Typography variant="h6">Messtype: {studentDetails.messtype}</Typography>
        <Typography variant="body1" gutterBottom>Attendance:</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Breakfast</TableCell>
                <TableCell>Lunch</TableCell>
                <TableCell>Snacks</TableCell>
                <TableCell>Dinner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {studentDetails.days.map((day, idx) => (
                <TableRow key={idx}>
                <TableCell>{new Date(day.date).toLocaleDateString()}</TableCell>

                  <TableCell>
            {day.breakfast ? (
              <CheckCircle style={{ color: 'green' }} />
            ) : (
              <Cancel style={{ color: 'red' }} />
            )}
          </TableCell>
          <TableCell>
            {day.lunch ? (
              <CheckCircle style={{ color: 'green' }} />
            ) : (
              <Cancel style={{ color: 'red' }} />
            )}
          </TableCell>
          <TableCell>
            {day.snacks ? (
              <CheckCircle style={{ color: 'green' }} />
            ) : (
              <Cancel style={{ color: 'red' }} />
            )}
          </TableCell>
          <TableCell>
            {day.dinner ? (
              <CheckCircle style={{ color: 'green' }} />
            ) : (
              <Cancel style={{ color: 'red' }} />
            )}
          </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  </Box>
)}

    </Box></Container>
    </div>
  );
};

export default AnalyticsPage;
