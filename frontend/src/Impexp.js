import React, { useState } from 'react';
import { Button, Typography, Box, Container, Alert, CircularProgress } from '@mui/material';
import axios from 'axios';
const apiEndpoint = process.env.REACT_APP_API_ENDPOINT;
const Impexp = () => {
  const [isLoading, setIsLoading] = useState(false); // Loading state for import process
  const [error, setError] = useState(null); // Error state
  const [success, setSuccess] = useState(null); // Success state

  const handleImport = async (event) => {
    const file = event.target.files[0]; // Get the selected file

    if (!file) {
      setError('Please select a file to import');
      return;
    }

    const formData = new FormData();
    formData.append('file', file); // Append the selected file to formData

    setIsLoading(true); // Set loading state to true
    setError(null); // Reset error state
    setSuccess(null); // Reset success state

    try {
      const response = await axios.post(`${apiEndpoint}/add-students`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data', // Set the content type for file upload
        },
      });

      setSuccess('File imported successfully!'); // Set the success message
      console.log('Imported data:', response.data.students); // Log the preview data (optional)
    } catch (error) {
      console.error('Error importing students:', error);
      setError('Error importing students. Please try again.');
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const handleExport = () => {
    window.location.href = `${apiEndpoint}/download-students`; // Redirect to download endpoint
  };

  return (
    <div style={{ background: '#EFF5FF', minHeight: '100vh' }}>
      <Container maxWidth="md" style={{ paddingTop: '40px' }}>
        <Box padding="20px" borderRadius="8px" boxShadow={3} bgcolor="#f9f9f9">
          <Typography variant="h4" align="center" gutterBottom>
            Import & Export Students
          </Typography>

          {/* Display error message if any */}
          {error && (
            <Alert severity="error" sx={{ marginBottom: 2 }}>
              {error}
            </Alert>
          )}

          {/* Display success message if any */}
          {success && (
            <Alert severity="success" sx={{ marginBottom: 2 }}>
              {success}
            </Alert>
          )}

          {/* Import and Export Buttons */}
          <Box display="flex" justifyContent="center" gap={2} marginBottom={3}>
            <input
              type="file"
              accept=".xlsx, .xls"
              style={{ display: 'none' }}
              id="file-upload"
              onChange={handleImport} // Handle file selection and import
            />
            <Button
              variant="contained"
              color="primary"
              component="label"
              htmlFor="file-upload"
              sx={{ borderRadius: '6px', width: '150px' }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Import'}
            </Button>

            <Button
              variant="contained"
              color="success"
              onClick={handleExport} // Call the handleExport function when clicked
              sx={{ borderRadius: '6px', width: '150px' }}
            >
              Export
            </Button>
          </Box>

          {/* Centered and Red Note Section */}
          <Box mt={2} textAlign="center">
            <Typography variant="body2" sx={{ fontWeight: 'bold',display:"flex",flexDirection:"column",justifyContent:"center",alignItems:"center"}}>
              <strong style={{color: 'red'}}>Note:</strong> The Excel file should have the following columns:
              <ul style={{ listStyle: 'none', padding: 0,margin:"0px",textAlign:"left" }}>
                <li><strong>rollNo:</strong>  Roll no of  each student.</li>
                <li><strong>messtype:</strong> Should be either "floor1" or "floor2".</li>
                <li><strong>days:</strong> Empty .</li>
              </ul>
            </Typography>
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default Impexp;
