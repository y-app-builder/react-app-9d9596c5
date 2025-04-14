import React, { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  title: string;
  profilePic: string;
  connections: number;
}

interface Post {
  id: string;
  userId: string;
  author: User;
  content: string;
  timestamp: string;
  likes: number;
  comments: Comment[];
}

interface Comment {
  id: string;
  userId: string;
  author: User;
  content: string;
  timestamp: string;
}

const API_URL = 'https://api.example.com'; // Replace with your actual API URL

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'feed' | 'network' | 'jobs' | 'messages' | 'notifications'>('feed');

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/user/current`);
        if (!response.ok) throw new Error('Failed to fetch user data');
        const userData = await response.json();
        setCurrentUser(userData);
      } catch (err) {
        setError('Failed to load user profile. Please try again later.');
        console.error(err);
      }
    };

    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_URL}/posts`);
        if (!response.ok) throw new Error('Failed to fetch posts');
        const postsData = await response.json();
        setPosts(postsData);
      } catch (err) {
        setError('Failed to load posts. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCurrentUser();
    fetchPosts();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newPostContent,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to create post');
      
      const newPost = await response.json();
      setPosts([newPost, ...posts]);
      setNewPostContent('');
    } catch (err) {
      setError('Failed to create post. Please try again.');
      console.error(err);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: 'POST',
      });

      if (!response.ok) throw new Error('Failed to like post');
      
      setPosts(posts.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      ));
    } catch (err) {
      setError('Failed to like post. Please try again.');
      console.error(err);
    }
  };

  const handleAddComment = async (postId: string, commentContent: string) => {
    if (!commentContent.trim() || !currentUser) return;

    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: commentContent,
          userId: currentUser.id,
        }),
      });

      if (!response.ok) throw new Error('Failed to add comment');
      
      const newComment = await response.json();
      
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] } 
          : post
      ));
    } catch (err) {
      setError('Failed to add comment. Please try again.');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading">Loading LinkedIn...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="linkedin-app">
      <header className="app-header">
        <div className="header-container">
          <div className="logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="34" height="34">
              <path fill="#0A66C2" d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z"></path>
            </svg>
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Search" />
          </div>
          <nav className="main-nav">
            <ul>
              <li className={activeTab === 'feed' ? 'active' : ''} onClick={() => setActiveTab('feed')}>
                <span className="icon">🏠</span>
                <span>Home</span>
              </li>
              <li className={activeTab === 'network' ? 'active' : ''} onClick={() => setActiveTab('network')}>
                <span className="icon">👥</span>
                <span>My Network</span>
              </li>
              <li className={activeTab === 'jobs' ? 'active' : ''} onClick={() => setActiveTab('jobs')}>
                <span className="icon">💼</span>
                <span>Jobs</span>
              </li>
              <li className={activeTab === 'messages' ? 'active' : ''} onClick={() => setActiveTab('messages')}>
                <span className="icon">✉️</span>
                <span>Messaging</span>
              </li>
              <li className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
                <span className="icon">🔔</span>
                <span>Notifications</span>
              </li>
            </ul>
          </nav>
          {currentUser && (
            <div className="user-profile-mini">
              <img src={currentUser.profilePic} alt={currentUser.name} />
              <span>Me ▼</span>
            </div>
          )}
        </div>
      </header>

      <main className="app-content">
        <div className="content-container">
          <aside className="profile-sidebar">
            {currentUser && (
              <div className="profile-card">
                <div className="profile-background"></div>
                <div className="profile-info">
                  <img src={currentUser.profileP