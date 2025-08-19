import React, { createContext, useContext, useMemo, useState } from 'react';

const PostsContext = createContext({
  posts: [],
  addPost: (_post) => {},
});

export function PostsProvider({ children }) {
  const [posts, setPosts] = useState([
    {
      id: 'seed-1',
      name: 'Alex Runner',
      sport: 'Track & Field',
      avatar: require('../../assets/icon.png'),
      text: 'Morning sprints felt great! New PR on 200m. 🔥',
      mediaUrl: '',
      mediaType: 'none',
      ts: Date.now() - 1000 * 60 * 60,
    },
    {
      id: 'seed-2',
      name: 'Alex Runner',
      sport: 'Track & Field',
      avatar: require('../../assets/icon.png'),
      text: 'Gym session done. Core is burning! 💪',
      mediaUrl: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200',
      mediaType: 'image',
      ts: Date.now() - 1000 * 60 * 20,
    },
  ]);

  const addPost = (post) => {
    const prepared = { ...post };
    if (!prepared.id) prepared.id = String(Date.now());
    if (!prepared.ts) prepared.ts = Date.now();
    setPosts((prev) => [prepared, ...prev]);
  };

  const value = useMemo(() => ({ posts, addPost }), [posts]);
  return <PostsContext.Provider value={value}>{children}</PostsContext.Provider>;
}

export function usePosts() {
  return useContext(PostsContext);
}
