import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Container, Typography, Box, Button, Avatar, Grid, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import { useAuth } from './AuthContext';

function ProfilePage() {
    const { user, token, login } = useAuth();
    const [file, setFile] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (!token) return;
            try {
                setLoading(true);
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/profile/me`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfileData(response.data);
            } catch (error) {
                console.error("Failed to fetch profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [token]);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleChooseFileClick = () => {
        fileInputRef.current.click();
    };

    const handleUpload = async () => {
        if (!file) {
            alert('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/users/profile/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            login(response.data.user, token);
            alert('Profile photo updated!');
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Upload failed';
            alert(errorMessage);
        }
    };

    if (loading) {
        return <Typography>Loading profile...</Typography>;
    }

    if (!user || !profileData) {
        return <Typography>Please log in to view your profile.</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>My Profile</Typography>
            <Grid container spacing={4}>
                {/* Profile Info and Upload */}
                <Grid item xs={12} md={4}>
                    <Paper elevation={3} sx={{ p: 2, textAlign: 'center' }}>
                        <Avatar
                            src={user.avatar}
                            sx={{ width: 150, height: 150, margin: 'auto' }}
                        />
                        <Typography variant="h5" sx={{ mt: 2 }}>{user.username}</Typography>
                        <Typography color="text.secondary">{user.email}</Typography>

                        <Box sx={{ mt: 3 }}>
                            <Typography variant="body2">Update Photo:</Typography>
                            {/* Hidden file input */}
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                style={{ display: 'none' }}
                                ref={fileInputRef}
                            />
                            {/* Visible button to trigger file input */}
                            <Button variant="outlined" onClick={handleChooseFileClick} sx={{ mt: 1 }}>
                                Choose Photo
                            </Button>
                            {file && <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>{file.name}</Typography>}
                            <Button
                                variant="contained"
                                onClick={handleUpload}
                                disabled={!file}
                                sx={{ mt: 1, ml: 1 }}
                            >
                                Upload
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                {/* Teams and Events */}
                <Grid item xs={12} md={8}>
                    <Paper elevation={3} sx={{ p: 2, mb: 3 }}>
                        <Typography variant="h6" gutterBottom>🤝My Teams</Typography>
                        <List>
                            {profileData.userProfile.teams.length > 0 ? profileData.userProfile.teams.map((team, index) => (
                                <React.Fragment key={team._id}>
                                    <ListItem>
                                        <ListItemText primary={team.name} secondary={team.description} />
                                    </ListItem>
                                    {index < profileData.userProfile.teams.length - 1 && <Divider />}
                                </React.Fragment>
                            )) : (
                                <ListItem><ListItemText primary="You have not joined any teams yet." /></ListItem>
                            )}
                        </List>
                    </Paper>

                    <Paper elevation={3} sx={{ p: 2 }}>
                        <Typography variant="h6" gutterBottom>My Registered Events</Typography>
                        <List>
                            {profileData.registeredEvents.length > 0 ? profileData.registeredEvents.map((event, index) => (
                                <React.Fragment key={event._id}>
                                    <ListItem>
                                        <ListItemText primary={event.name} secondary={`Date: ${new Date(event.date).toLocaleDateString()}`} />
                                    </ListItem>
                                    {index < profileData.registeredEvents.length - 1 && <Divider />}
                                </React.Fragment>
                            )) : (
                                <ListItem><ListItemText primary="You have not registered for any events yet." /></ListItem>
                            )}
                        </List>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}

export default ProfilePage;