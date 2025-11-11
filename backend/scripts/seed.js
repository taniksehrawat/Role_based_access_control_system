require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Post = require('../models/Post');
const { ROLES } = require('../config/roles');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mern-rbac');
    console.log('Connected to database');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    console.log('Cleared existing data');

    // Create users
    const users = await User.create([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: 'admin123',
        role: ROLES.ADMIN
      },
      {
        username: 'editor1',
        email: 'editor1@example.com',
        password: 'editor123',
        role: ROLES.EDITOR
      },
      {
        username: 'editor2',
        email: 'editor2@example.com',
        password: 'editor123',
        role: ROLES.EDITOR
      },
      {
        username: 'viewer1',
        email: 'viewer1@example.com',
        password: 'viewer123',
        role: ROLES.VIEWER
      },
      {
        username: 'viewer2',
        email: 'viewer2@example.com',
        password: 'viewer123',
        role: ROLES.VIEWER
      }
    ]);

    console.log('Created users:', users.map(u => ({ username: u.username, role: u.role })));

    // Create posts
    const posts = await Post.create([
      {
        title: 'Welcome to Our Platform',
        content: 'This is the first post on our platform. Welcome everyone!',
        author: users[0]._id, // admin
        tags: ['welcome', 'introduction']
      },
      {
        title: 'Getting Started Guide',
        content: 'Here is a comprehensive guide to get started with our platform...',
        author: users[1]._id, // editor1
        tags: ['guide', 'tutorial']
      },
      {
        title: 'Advanced Features',
        content: 'Learn about the advanced features available in our platform...',
        author: users[2]._id, // editor2
        tags: ['advanced', 'features']
      },
      {
        title: 'Community Guidelines',
        content: 'Please read our community guidelines before posting...',
        author: users[0]._id, // admin
        tags: ['guidelines', 'community']
      }
    ]);

    console.log(`Created ${posts.length} posts`);

    console.log('Seed data created successfully!');
    console.log('\nTest Credentials:');
    console.log('Admin - email: admin@example.com, password: admin123');
    console.log('Editor - email: editor1@example.com, password: editor123');
    console.log('Viewer - email: viewer1@example.com, password: viewer123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedData();