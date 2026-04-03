
export const OceanTheme = {
    colors: {
        primary: {
            main: '#0ea5e9', // Sky 500
            dark: '#0284c7', // Sky 600
            light: '#e0f2fe', // Sky 100
        },
        secondary: {
            main: '#f59e0b', // Amber 500
            glow: 'rgba(245, 158, 11, 0.5)',
        },
        background: {
            surface: '#F8F9FA',
            deep: '#0f172a', // Slate 900 for deep tools
            glass: 'rgba(255, 255, 255, 0.7)',
            glassDark: 'rgba(15, 23, 42, 0.7)',
        },
        text: {
            main: '#1e293b', // Slate 800
            muted: '#64748b', // Slate 500
            inverted: '#f8fafc', // Slate 50
        }
    },
    gradients: {
        surface: 'bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50', // Dashboard vibe
        deep: 'bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#0f172a]', // Tool vibe (Alchemy/Graph)
        headerLight: 'bg-white/60 backdrop-blur-md border-b border-white/40',
        headerDark: 'bg-[#0f172a]/80 backdrop-blur-md border-b border-white/10',
    },
    shadows: {
        soft: 'shadow-lg shadow-sky-500/10',
        glow: 'drop-shadow-[0_0_8px_rgba(14,165,233,0.6)]',
    }
};
