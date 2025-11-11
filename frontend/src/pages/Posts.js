import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGuard from '../components/PermissionGuard';
import axios from 'axios';

const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const { user } = useAuth();
  const { can, isAdmin } = usePermissions();

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: ''
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/posts');
      setPosts(response.data.posts);
    } catch (error) {
      setError('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPost(null);
    setFormData({ title: '', content: '', tags: '' });
    setOpenDialog(true);
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      tags: post.tags.join(', ')
    });
    setOpenDialog(true);
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      await axios.delete(`http://localhost:5000/api/posts/${postId}`);
      setSnackbar({ open: true, message: 'Post deleted successfully', severity: 'success' });
      fetchPosts();
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to delete post', severity: 'error' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const postData = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      if (editingPost) {
        await axios.put(`http://localhost:5000/api/posts/${editingPost._id}`, postData);
        setSnackbar({ open: true, message: 'Post updated successfully', severity: 'success' });
      } else {
        await axios.post('http://localhost:5000/api/posts', postData);
        setSnackbar({ open: true, message: 'Post created successfully', severity: 'success' });
      }

      setOpenDialog(false);
      fetchPosts();
    } catch (error) {
      setSnackbar({ open: true, message: 'Operation failed', severity: 'error' });
    }
  };

  const canEditPost = (post) => {
    return isAdmin || post.author._id === user?._id;
  };

  const canDeletePost = (post) => {
    return isAdmin;
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading posts...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Posts
        </Typography>
        
        <PermissionGuard permission="posts:create">
          <Button variant="contained" startIcon={<Add />} onClick={handleCreate}>
            Create Post
          </Button>
        </PermissionGuard>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {posts.map((post) => (
          <Grid item xs={12} md={6} key={post._id}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {post.title}
                </Typography>
                
                <Typography variant="body2" color="text.secondary" paragraph>
                  {post.content.length > 150 
                    ? `${post.content.substring(0, 150)}...` 
                    : post.content
                  }
                </Typography>

                <Box sx={{ mb: 2 }}>
                  {post.tags.map((tag) => (
                    <Chip key={tag} label={tag} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    By {post.author.username} ({post.author.role})
                  </Typography>
                  
                  <Box>
                    <PermissionGuard 
                      permission="posts:update"
                      fallback={
                        canEditPost(post) ? (
                          <IconButton 
                            size="small" 
                            onClick={() => handleEdit(post)}
                            color="primary"
                          >
                            <Edit />
                          </IconButton>
                        ) : null
                      }
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => handleEdit(post)}
                        color="primary"
                      >
                        <Edit />
                      </IconButton>
                    </PermissionGuard>

                    <PermissionGuard 
                      permission="posts:delete"
                      fallback={
                        canDeletePost(post) ? (
                          <IconButton 
                            size="small" 
                            onClick={() => handleDelete(post._id)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        ) : null
                      }
                    >
                      <IconButton 
                        size="small" 
                        onClick={() => handleDelete(post._id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    </PermissionGuard>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingPost ? 'Edit Post' : 'Create New Post'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Title"
              fullWidth
              variant="outlined"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Content"
              fullWidth
              variant="outlined"
              multiline
              rows={4}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Tags (comma separated)"
              fullWidth
              variant="outlined"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="technology, programming, web"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              {editingPost ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Posts;