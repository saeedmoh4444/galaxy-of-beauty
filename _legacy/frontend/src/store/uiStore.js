import { create } from 'zustand';

/**
 * Client-side UI state store.
 * Non-persisted - for temporary UI state (sidebar, modals, theme).
 */
export const useUIStore = create((set) => ({
  // Sidebar
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  // Language
  language: localStorage.getItem('i18nextLng') || 'ar',
  setLanguage: (lang) => {
    localStorage.setItem('i18nextLng', lang);
    set({ language: lang });
  },

  // Direction (derived from language)
  getDirection: () => {
    const lang = localStorage.getItem('i18nextLng') || 'ar';
    return lang === 'ar' ? 'rtl' : 'ltr';
  },

  // Dark mode
  darkMode: false,
  toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

  // Chatbot (Layla)
  chatbotOpen: false,
  toggleChatbot: () => set((s) => ({ chatbotOpen: !s.chatbotOpen })),
  openChatbot: () => set({ chatbotOpen: true }),
  closeChatbot: () => set({ chatbotOpen: false }),
}));
