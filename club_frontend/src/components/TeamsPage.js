import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Container, Typography, Box, TextField, Button, List, ListItem,
    ListItemText, Paper, Divider, Avatar, ListItemAvatar
} from '@mui/material';
import { useAuth } from './AuthContext';

function TeamsPage() {
    const [teams, setTeams] = useState([]);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDescription, setNewTeamDescription] = useState('');
    const [teamFile, setTeamFile] = useState(null);
    const { token, isAuthenticated, user, isAdmin } = useAuth();

    const fetchTeams = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/teams`);
            setTeams(response.data);
        } catch (error) {
            console.error('Error fetching teams:', error);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) {
            alert('You must be logged in to create a team.');
            return;
        }
        try {
            const formData = new FormData();
            formData.append('name', newTeamName);
            formData.append('description', newTeamDescription);
            if (teamFile) {
                formData.append('avatar', teamFile);
            }

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            setNewTeamName('');
            setNewTeamDescription('');
            setTeamFile(null);
            setTeams(prevTeams => [...prevTeams, response.data]);
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            alert(`Failed to create team: ${errorMessage}`);
        }
    };

    const handleRequestToJoin = async (teamId) => {
        if (!isAuthenticated) {
            alert('You must be logged in to join a team.');
            return;
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/request-join`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setTeams(prevTeams =>
                prevTeams.map(team => team._id === teamId ? response.data : team)
            );
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : error.message;
            alert(`Failed to request to join team: ${errorMessage}`);
        }
    };

    const handleApproveRequest = async (teamId, userIdToApprove) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/approve-request`, { userIdToApprove }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeams(prevTeams =>
                prevTeams.map(team => team._id === teamId ? response.data : team)
            );
            alert('User approved.');
        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Approval failed';
            alert(errorMessage);
        }
    };

    const handleRejectRequest = async (teamId, userIdToReject) => {
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/reject-request`, { userIdToReject }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTeams(prevTeams =>
                prevTeams.map(team => team._id === teamId ? response.data : team)
            );
            alert('User rejected.');

        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Rejection failed';
            alert(errorMessage);
        }
    };

    const handleTeamPhotoUpload = async (teamId, file) => {
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}/photo`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });

            setTeams(prevTeams => 
                prevTeams.map(team => team._id === teamId ? response.data : team));
            alert('Team photo updated!');

        } catch (error) {
            const errorMessage = error.response ? error.response.data.message : 'Upload failed';
            alert(errorMessage);
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm('Are you sure you want to delete this team? This action cannot be undone.')) {
            try {
                await axios.delete(`${process.env.REACT_APP_API_URL}/api/teams/${teamId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                setTeams(prevTeams => prevTeams.filter(team => team._id !== teamId));
                alert('Team deleted successfully.');
            } catch (error) {
                const errorMessage = error.response ? error.response.data.message : 'Deletion failed';
                alert(errorMessage);
            }
        }
    };


    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>🤝Teams</Typography>

            {isAuthenticated && (
                <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                    <Typography variant="h6">Create a New Team</Typography>
                    <Box component="form" onSubmit={handleCreateTeam} sx={{ mt: 1 }}>
                        <TextField
                            label="Team Name"
                            fullWidth
                            margin="normal"
                            value={newTeamName}
                            onChange={(e) => setNewTeamName(e.target.value)}
                            required
                        />
                        <TextField
                            label="Description"
                            fullWidth
                            margin="normal"
                            value={newTeamDescription}
                            onChange={(e) => setNewTeamDescription(e.target.value)}
                            required
                        />
                        <Button variant="outlined" component="label" sx={{ mt: 2 }}>
                            Upload Team Photo
                            <input
                                type="file"
                                hidden
                                onChange={(e) => setTeamFile(e.target.files[0])}
                            />
                        </Button>
                        {teamFile && <Typography variant="caption" sx={{ ml: 2 }}>{teamFile.name}</Typography>}
                        <Button type="submit" variant="contained" sx={{ mt: 2 }}>Create Team</Button>
                    </Box>
                </Paper>
            )}

            <Typography variant="h5" gutterBottom>Existing Teams</Typography>
            <List>
                {teams.map(team => (
                    <Paper key={team._id} sx={{ mb: 3, p: 1 }}>
                        <ListItem>
                            <ListItemAvatar>
                                <Avatar src={team.avatar} />
                            </ListItemAvatar>
                            <ListItemText
                                primary={team.name}
                                secondary={
                                    <>
                                        <Typography component="span" variant="body2" color="text.primary">
                                            {team.description}
                                        </Typography>
                                        <br />
                                        Leader: {team.leader?.username || 'N/A'} | Members: {team.members.length}
                                    </>
                                }
                            />
                            {isAuthenticated && !team.members.some(member => member._id === user?._id) && (
                                team.pendingRequests.some(req => req._id === user?._id) ? (
                                    <Button variant="outlined" disabled>
                                        Request Sent
                                    </Button>
                                ) : (
                                    <Button
                                        variant="outlined"
                                        onClick={() => handleRequestToJoin(team._id)}
                                    >
                                        Request to Join
                                    </Button>
                                )
                                
                                
                            )}
                            {isAdmin && (
                                <Button
                                    variant="contained"
                                    color="error"
                                    onClick={() => handleDeleteTeam(team._id)}
                                    sx={{ ml: 1 }}
                                >Delete</Button>
                            )}
                        </ListItem>
                        {isAuthenticated && user?._id === team.leader?._id && team.pendingRequests.length > 0 && (
                            <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="subtitle2" gutterBottom>Join Requests</Typography>
                                <List dense>
                                    {team.pendingRequests.map(requestingUser => (
                                        <ListItem key={requestingUser._id} secondaryAction={
                                            <Box>
                                                <Button size="small" color="success" onClick={() => handleApproveRequest(team._id, requestingUser._id)}>Approve</Button>
                                                <Button size="small" color="error" onClick={() => handleRejectRequest(team._id, requestingUser._id)}>Reject</Button>
                                            </Box>
                                        }>
                                            <ListItemText primary={requestingUser.username} />
                                        </ListItem>
                                    ))}
                                </List>
                            </Box>
                        )}
                        {isAuthenticated && user?._id === team.leader?._id && !team.pendingRequests.length && (
                            <Box sx={{ p: 2, borderTop: '1px solid #eee' }}>
                                <Typography variant="caption">Team Leader: Upload Photo</Typography>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleTeamPhotoUpload(team._id, e.target.files[0])}
                                    style={{ display: 'block', marginTop: '8px' }}
                                />
                            </Box>
                        )}
                    </Paper>
                ))}
            </List>
        </Container>
    );
}

export default TeamsPage;