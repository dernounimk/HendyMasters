// store/slices/themeSlice.js
export const createThemeSlice = (set, get) => ({
  theme: localStorage.getItem('theme') || 'light',
  
  toggleTheme: () => {
    const newTheme = get().theme === 'light' ? 'dark' : 'light';
    
    set({ theme: newTheme });
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', theme);
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
});