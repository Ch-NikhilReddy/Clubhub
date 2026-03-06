import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function EventForm() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const navigate = useNavigate();
  const { token } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      if (!token) {
        alert('You must be logged in to create an event.');
        return;
      }

      await axios.post(`${process.env.REACT_APP_API_URL}/api/events`, { name, description, date }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Event idea submitted successfully!');
      navigate('/');
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error('Event creation failed:', errorMessage);
      alert(`Event creation failed: ${errorMessage}`);
    }
  };
  return (
    <Container maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Submit an event proposal
      </Typography>
      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
        <TextField
          label="Event Name"
          variant="outlined"
          fullWidth
          margin="normal"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label="Description"
          variant="outlined"
          placeholder="Enter a brief description of the event"
          fullWidth
          margin="normal"
          required
          multiline
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <TextField
          label="Event Date"
          type="date"
          fullWidth
          margin="normal"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Button variant="contained" color="primary" type="submit" fullWidth sx={{ mt: 2 }}>
          Post Idea
        </Button>
      </Box>
    </Container>
  );
}

export default EventForm;