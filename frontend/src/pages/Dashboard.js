import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Card, 
  CardContent,
  Grid,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';

const Dashboard = () => {
  const { user } = useAuth();
  const { can, isAdmin, isEditor, isViewer } = usePermissions();

  const permissions = [
    { label: 'View Users', permission: 'users:read', color: 'primary' },
    { label: 'Create Users', permission: 'users:create', color: 'secondary' },
    { label: 'Update Users', permission: 'users:update', color: 'success' },
    { label: 'Delete Users', permission: 'users:delete', color: 'error' },
    { label: 'View Posts', permission: 'posts:read', color: 'primary' },
    { label: 'Create Posts', permission: 'posts:create', color: 'secondary' },
    { label: 'Update Posts', permission: 'posts:update', color: 'success' },
    { label: 'Delete Posts', permission: 'posts:delete', color: 'error' },
    { label: 'Admin Access', permission: 'admin:access', color: 'warning' }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Grid container spacing={3}>
        {/* User Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                User Information
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">
                  <strong>Username:</strong> {user?.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {user?.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Role:</strong> 
                  <Chip 
                    label={user?.role} 
                    color={
                      isAdmin ? 'error' : 
                      isEditor ? 'warning' : 
                      'success'
                    }
                    sx={{ ml: 1 }}
                  />
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Role Info Card */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Role Capabilities
              </Typography>
              <Typography variant="body2" paragraph>
                {isAdmin && 'As an Admin, you have full access to all features including user management and system administration.'}
                {isEditor && 'As an Editor, you can create and update your own posts, and view all posts.'}
                {isViewer && 'As a Viewer, you can read posts but cannot create, edit, or delete content.'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Permissions Card */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Permissions
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {permissions.map((perm) => (
                  <Chip
                    key={perm.permission}
                    label={perm.label}
                    color={can(perm.permission) ? perm.color : 'default'}
                    variant={can(perm.permission) ? 'filled' : 'outlined'}
                  />
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;