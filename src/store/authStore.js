import { create } from 'zustand';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  repoUrl: null,
  owner: null,
  repo: null,
  isAuthenticated: false,

  login: (user, token, repoUrl, owner, repo) => {
    set({
      user,
      token,
      repoUrl,
      owner,
      repo,
      isAuthenticated: true,
    });
  },

  logout: () => {
    set({
      user: null,
      token: null,
      repoUrl: null,
      owner: null,
      repo: null,
      isAuthenticated: false,
    });
  },

  getAuthInfo: () => {
    const state = get();
    return {
      token: state.token,
      owner: state.owner,
      repo: state.repo,
    };
  },
  
}));
