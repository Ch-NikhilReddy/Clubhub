import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { List, ListItem, Button, Typography, Paper, Box, Chip, Modal, TextField, Divider, ImageList, ImageListItem } from '@mui/material';
import { useAuth } from './AuthContext';

function EventList() {
  const [events, setEvents] = useState([]);
  const { token, isAdmin, isAuthenticated, user } = useAuth();

  // State for the completion form
  const [winnerName, setWinnerName] = useState('');
  const [postEventDescription, setPostEventDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [editingEventId, setEditingEventId] = useState(null);


  const [registrants, setRegistrants] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchEvents = async () => {
    try {
      // Assuming your backend is running on port 4000
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []); 

  const handleVote = async (eventId) => {
    try {
      if (!isAuthenticated) {
        alert('You must be logged in to vote.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/vote`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? response.data : event
        )
      );
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error('Error voting:', errorMessage);
      alert(`Voting failed: ${errorMessage}`);
    }
  };

  const handleApprove = async (eventId) => {
    try {
      if (!isAuthenticated) {
        alert('You must be logged in to approve.');
        return;
      }

      const response = await axios.patch(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/approve`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? response.data.event : event
        )
      );
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error('Error approving:', errorMessage);
      alert(`Approval failed: ${errorMessage}`);
    }
  };

  const handleRegister = async (eventId) => {
    try {
      if (!isAuthenticated) {
        alert('You must be logged in to register.');
        return;
      }

      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/register`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? response.data.event : event
        )
      );
      alert('Successfully registered for the event!');
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      console.error('Error registering:', errorMessage);
      alert(`Registration failed: ${errorMessage}`);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/events/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
        alert('Event deleted successfully.');

      } catch (error) {
        const errorMessage = error.response ? error.response.data.message : error.message;
        alert(`Could not delete event: ${errorMessage}`);
      }
    }
  };

  const handleCompleteEventSubmit = async (eventId) => {
    const formData = new FormData();
    formData.append('winnerName', winnerName);
    formData.append('postEventDescription', postEventDescription);
    for (let i = 0; i < photos.length; i++) {
      formData.append('photos', photos[i]);
    }

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/complete`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      setEvents(prevEvents =>
        prevEvents.map(event =>
          event._id === eventId ? response.data : event
        )
      );

      // Reset form
      setEditingEventId(null);
      setWinnerName('');
      setPostEventDescription('');
      setPhotos([]);

      alert('Event details updated!');

    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      alert(`Could not update event: ${errorMessage}`);
    }
  };

  const handleViewRegistrants = async (eventId) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/events/${eventId}/registrants`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRegistrants(response.data);
      setIsModalOpen(true);
    } catch (error) {
      const errorMessage = error.response ? error.response.data.message : error.message;
      alert(`Could not fetch registrants: ${errorMessage}`);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setRegistrants([]);
  };

  const modalStyle = {
    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
    width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 4,
  };

  const now = new Date();
  const upcomingEvents = events.filter(event => new Date(event.date) >= now);
  const completedEvents = events.filter(event => new Date(event.date) < now);

  return (
    <List sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}>
      <Typography variant="h5" gutterBottom>🧠⚙️Event Ideas</Typography>
      {upcomingEvents.map(event => (
        <Paper key={event._id} elevation={2} sx={{ mb: 2, p: 2 }}>
          <ListItem alignItems="flex-start">
            <Box sx={{ width: '100%' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{event.name}</Typography>
                {event.approved ? (
                  <Chip label="Approved" color="success" size="small" />
                ) : (
                  <Chip label="Pending" color="warning" size="small" />
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">{event.description}</Typography>
              <Typography variant="caption" color="text.secondary">Date: {new Date(event.date).toLocaleDateString()}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6">{event.votes}</Typography>
              {!event.approved && (
                <Button variant="outlined" size="small" onClick={() => handleVote(event._id)}>Vote</Button>
              )}
              {isAdmin && !event.approved && (
                <Button variant="contained" color="success" size="small" onClick={() => handleApprove(event._id)}>Approve</Button>
              )}
              {isAdmin && (
                <Button variant="contained" color="error" size="small" onClick={() => handleDeleteEvent(event._id)}>Delete</Button>
              )}
              {isAdmin && event.approved && (
                <Button variant="outlined" color="secondary" size="small" onClick={() => handleViewRegistrants(event._id)}>View Registrants</Button>
              )}
              {isAuthenticated && event.approved && (
                event.registeredUsers.includes(user._id) ? (
                  <Chip label="Registered" color="primary" size="small" />
                ) : (
                  <Button variant="contained" size="small" onClick={() => handleRegister(event._id)}>Register</Button>
                )
              )}
            </Box>
          </ListItem>
        </Paper>
      ))}

      {completedEvents.length > 0 && (
        <>
          <Divider sx={{ my: 4 }}><Chip label="Completed Events" /></Divider>
          {completedEvents.map(event => (
            <Paper key={event._id} elevation={2} sx={{ mb: 2, p: 2 }}>
              <Box sx={{ width: '100%' }}>
                <Typography variant="h6">{event.name}</Typography>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                  Held on: {new Date(event.date).toLocaleDateString()}
                </Typography>

                {event.winnerName && <Typography variant="body1">🏆 Winner: {event.winnerName}</Typography>}
                {event.postEventDescription && <Typography variant="body2" sx={{ mt: 1 }}>{event.postEventDescription}</Typography>}

                {event.photos && event.photos.length > 0 && (
                  <ImageList sx={{ width: '100%', mt: 2 }} cols={3} rowHeight={164}>
                    {event.photos.map((photoUrl, index) => (
                      <ImageListItem key={index}>
                        <img src={photoUrl} alt={`Event ${event.name} photo ${index + 1}`} loading="lazy" />
                      </ImageListItem>
                    ))}
                  </ImageList>
                )}

                {(isAdmin || event.organizers.includes(user?._id)) && (
                  <Box sx={{ mt: 2, borderTop: '1px solid #eee', pt: 2 }}>
                    {editingEventId === event._id ? (
                      <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCompleteEventSubmit(event._id); }}>
                        <Typography variant="subtitle2">Update Event Details</Typography>
                        <TextField label="Winner Name" fullWidth margin="normal" size="small" value={winnerName} onChange={e => setWinnerName(e.target.value)} />
                        <TextField label="Post-Event Description" fullWidth margin="normal" size="small" multiline rows={2} value={postEventDescription} onChange={e => setPostEventDescription(e.target.value)} />
                        <Button variant="outlined" component="label" size="small">
                          Upload Photos
                          <input type="file" hidden multiple accept="image/*" onChange={e => setPhotos(e.target.files)} />
                        </Button>
                        {photos.length > 0 && <Typography variant="caption" sx={{ ml: 1 }}>{photos.length} file(s) selected</Typography>}
                        <Box sx={{ mt: 1 }}>
                          <Button type="submit" variant="contained" size="small">Save</Button>
                          <Button size="small" onClick={() => setEditingEventId(null)} sx={{ ml: 1 }}>Cancel</Button>
                        </Box>
                      </Box>
                    ) : (
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => {
                          setEditingEventId(event._id);
                          setWinnerName(event.winnerName || '');
                          setPostEventDescription(event.postEventDescription || '');
                        }}
                      >
                        Add/Edit Completion Details
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Paper>
          ))}
        </>
      )}

      <Modal
        open={isModalOpen}
        onClose={handleCloseModal}
        aria-labelledby="registrants-modal-title"
      >
        <Box sx={modalStyle}>
          <Typography id="registrants-modal-title" variant="h6" component="h2">
            Registered Users
          </Typography>
          <List>
            {registrants.map(regUser => (
              <ListItem key={regUser._id}>{regUser.username} ({regUser.email})</ListItem>
            ))}
          </List>
        </Box>
      </Modal>
    </List>
  );
}

export default EventList;
