import React, { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { postsService } from '../services/postsService';

const PostsContext = createContext({
  posts: [],
  addPost: (_post) => {},
  isLoading: false,
  clearPosts: () => {},
});

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [subscription, setSubscription] = useState(null);

  // Load posts from Supabase on app start
  useEffect(() => {
    loadPosts();
    setupRealtimeSubscription();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        postsService.unsubscribeFromPostUpdates(subscription);
      }
    };
  }, []);

  const loadPosts = async () => {
    try {
      console.log('Loading posts from Supabase...');
      const supabasePosts = await postsService.getAllPosts();
      setPosts(supabasePosts);
      console.log('Posts loaded successfully:', supabasePosts.length);
    } catch (error) {
      console.error('Error loading posts from Supabase:', error);
      // Fallback to empty array if Supabase fails
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    try {
      const sub = postsService.subscribeToPostUpdates((payload) => {
        console.log('Real-time update received:', payload);
        
        if (payload.eventType === 'INSERT') {
          // Transform the new post and add it to the beginning of the list
          const newPost = transformSupabasePost(payload.new);
          setPosts(prevPosts => [newPost, ...prevPosts]);
        } else if (payload.eventType === 'UPDATE') {
          // Update existing post
          const updatedPost = transformSupabasePost(payload.new);
          setPosts(prevPosts => 
            prevPosts.map(post => 
              post.id === updatedPost.id ? updatedPost : post
            )
          );
        } else if (payload.eventType === 'DELETE') {
          // Remove deleted post
          setPosts(prevPosts => 
            prevPosts.filter(post => post.id !== payload.old.id)
          );
        }
      });
      
      setSubscription(sub);
    } catch (error) {
      console.error('Error setting up real-time subscription:', error);
    }
  };

  const transformSupabasePost = (supabasePost) => ({
    id: supabasePost.id,
    name: supabasePost.author_name,
    author: supabasePost.author_name,
    authorRole: supabasePost.author_role,
    avatar: supabasePost.author_avatar,
    authorAvatar: supabasePost.author_avatar,
    text: supabasePost.content,
    content: supabasePost.content,
    mediaUrl: supabasePost.media_url,
    mediaType: supabasePost.media_type,
    community: supabasePost.community,
    sport: supabasePost.sport,
    likes: supabasePost.likes,
    comments: supabasePost.comments,
    isCoachPost: supabasePost.is_coach_post,
    timestamp: supabasePost.created_at,
    ts: new Date(supabasePost.created_at).getTime(),
    userId: supabasePost.user_id,
  });

  const addPost = async (post) => {
    try {
      console.log('Creating post in Supabase:', post);
      const createdPost = await postsService.createPost(post);
      
      // The real-time subscription will handle adding the post to the UI
      // But we can also add it optimistically for immediate feedback
      setPosts(prevPosts => [createdPost, ...prevPosts]);
      
      console.log('Post created successfully');
      return createdPost;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  };

  const refreshPosts = async () => {
    setIsLoading(true);
    await loadPosts();
  };

  const clearPosts = async () => {
    try {
      console.log('Clearing posts - this will refresh from Supabase');
      await refreshPosts();
    } catch (error) {
      console.error('Error refreshing posts:', error);
    }
  };

  const value = useMemo(() => ({ 
    posts, 
    addPost, 
    isLoading, 
    clearPosts,
    refreshPosts
  }), [posts, isLoading]);
  
  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  return useContext(PostsContext);
}
