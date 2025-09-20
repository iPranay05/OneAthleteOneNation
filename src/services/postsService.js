import { supabase } from './supabaseConfig';

export const postsService = {
  // Fetch all posts ordered by creation date (newest first)
  async getAllPosts() {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts:', error);
        throw error;
      }

      // Transform Supabase data to match our app's post format
      const transformedPosts = data.map(post => ({
        id: post.id,
        name: post.author_name,
        author: post.author_name,
        authorRole: post.author_role,
        avatar: post.author_avatar,
        authorAvatar: post.author_avatar,
        text: post.content,
        content: post.content,
        mediaUrl: post.media_url,
        mediaType: post.media_type,
        community: post.community,
        sport: post.sport,
        likes: post.likes,
        comments: post.comments,
        isCoachPost: post.is_coach_post,
        timestamp: post.created_at,
        ts: new Date(post.created_at).getTime(),
        userId: post.user_id,
      }));

      console.log('Fetched posts from Supabase:', transformedPosts.length);
      return transformedPosts;
    } catch (error) {
      console.error('Error in getAllPosts:', error);
      throw error;
    }
  },

  // Create a new post
  async createPost(postData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      const postToInsert = {
        user_id: user.id,
        author_name: postData.author || postData.name,
        author_role: postData.authorRole,
        author_avatar: postData.authorAvatar || postData.avatar,
        content: postData.content || postData.text,
        media_url: postData.mediaUrl,
        media_type: postData.mediaType || 'none',
        community: postData.community,
        sport: postData.sport,
        likes: postData.likes || 0,
        comments: postData.comments || 0,
        is_coach_post: postData.isCoachPost || false,
      };

      console.log('Creating post in Supabase:', postToInsert);

      const { data, error } = await supabase
        .from('posts')
        .insert([postToInsert])
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        throw error;
      }

      // Transform the response to match our app format
      const transformedPost = {
        id: data.id,
        name: data.author_name,
        author: data.author_name,
        authorRole: data.author_role,
        avatar: data.author_avatar,
        authorAvatar: data.author_avatar,
        text: data.content,
        content: data.content,
        mediaUrl: data.media_url,
        mediaType: data.media_type,
        community: data.community,
        sport: data.sport,
        likes: data.likes,
        comments: data.comments,
        isCoachPost: data.is_coach_post,
        timestamp: data.created_at,
        ts: new Date(data.created_at).getTime(),
        userId: data.user_id,
      };

      console.log('Post created successfully:', transformedPost);
      return transformedPost;
    } catch (error) {
      console.error('Error in createPost:', error);
      throw error;
    }
  },

  // Update post likes/comments
  async updatePost(postId, updates) {
    try {
      const { data, error } = await supabase
        .from('posts')
        .update(updates)
        .eq('id', postId)
        .select()
        .single();

      if (error) {
        console.error('Error updating post:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updatePost:', error);
      throw error;
    }
  },

  // Delete a post
  async deletePost(postId) {
    try {
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        throw error;
      }

      console.log('Post deleted successfully:', postId);
      return true;
    } catch (error) {
      console.error('Error in deletePost:', error);
      throw error;
    }
  },

  // Subscribe to real-time post updates
  subscribeToPostUpdates(callback) {
    console.log('Setting up real-time subscription for posts');
    
    const subscription = supabase
      .channel('posts_channel')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          console.log('Real-time post update:', payload);
          callback(payload);
        }
      )
      .subscribe();

    return subscription;
  },

  // Unsubscribe from real-time updates
  unsubscribeFromPostUpdates(subscription) {
    if (subscription) {
      supabase.removeChannel(subscription);
      console.log('Unsubscribed from post updates');
    }
  }
};
