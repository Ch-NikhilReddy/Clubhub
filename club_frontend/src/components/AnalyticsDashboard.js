import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Container, Typography, Grid, Paper, Box } from '@mui/material';
import { useAuth } from './AuthContext';

function StatCard({ title, value, subtext }) {
    return (
        <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">{title}</Typography>
            <Typography variant="h3" component="p">{value}</Typography>
            {subtext && <Typography variant="body2" color="text.secondary">{subtext}</Typography>}
        </Paper>
    );
}

function AnalyticsDashboard() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { token } = useAuth();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/analytics/stats`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setStats(response.data);
            } catch (error) {
                console.error("Failed to fetch stats:", error);
            } finally {
                setLoading(false);
            }
        };

        if (token) {
            fetchStats();
        }
    }, [token]);

    if (loading) {
        return <Typography>Loading dashboard...</Typography>;
    }

    if (!stats) {
        return <Typography>Could not load analytics data.</Typography>;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" gutterBottom>
                Analytics Dashboard
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Total Users" value={stats.users.total} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Total Events" value={stats.events.total} />
                </Grid>
                <Grid item xs={12} sm={4}>
                    <StatCard title="Total Teams" value={stats.teams.total} />
                </Grid>
                {stats.events.mostPopular && (
                    <Grid item xs={12}>
                        <Box sx={{ mt: 4, p: 2, bgcolor: 'primary.light', color: 'primary.contrastText', borderRadius: 1 }}>
                            <Typography variant="h6">Most Popular Event</Typography>
                            <Typography>{stats.events.mostPopular.name} with {stats.events.mostPopular.registrations} registrations.</Typography>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
}

export default AnalyticsDashboard;