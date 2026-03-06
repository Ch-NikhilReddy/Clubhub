import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Button, Box } from '@mui/material';
import EventList from './components/EventList';
import RegistrationForm from './components/RegistrationForm';
import LoginForm from './components/LoginForm';
import EventForm from './components/EventForm';
import TeamsPage from './components/TeamsPage'; 
import AnalyticsDashboard from './components/AnalyticsDashboard'; 
import ProfilePage from './components/ProfilePage';
import { useAuth } from './components/AuthContext';
import logo from './logo.png';

function App() {
  const { isAuthenticated, isAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    
  };

  return (
    <Router>
      <Container sx={{ mb: 4 , }}>
        <AppBar 
          position="static" 
          sx={{ 
            borderRadius: '8px', 
            bgcolor: '#8a1717ff',
            boxShadow: 3,
            mb:4
          }}
        >
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              <Link to="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                <Box component="img" sx={{ height: 40, mr: 1, borderRadius: '50%'}} alt="logo" src={logo} />
                <Typography variant="h6" component="span">
                  ClubHub
                </Typography>
              </Link>
            </Typography>
            {isAuthenticated ? (
              <>
                {isAdmin && <Button color="inherit" component={Link} to="/dashboard">Dashboard</Button>}
                <Button color="inherit" component={Link} to="/profile">Profile</Button>
                <Button color="inherit" component={Link} to="/teams">Teams</Button>
                <Button color="inherit" component={Link} to="/create-event">Create Event</Button>
                <Button color="inherit" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Button color="inherit" component={Link} to="/login">Login</Button>
                <Button color="inherit" component={Link} to="/register">Register</Button>
              </>
            )}
          </Toolbar>
        </AppBar>
        <Routes>
          <Route path="/" element={<EventList />} />
          <Route path="/register" element={<RegistrationForm />} />
          <Route path="/login" element={<LoginForm />} />
          <Route path="/create-event" element={isAuthenticated ? <EventForm /> : <Navigate to="/login" />} />
          <Route path="/teams" element={<TeamsPage />} />
          <Route path="/dashboard" element={isAdmin ? <AnalyticsDashboard /> : <Navigate to="/" />} />
          <Route path="/profile" element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;