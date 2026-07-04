export const designTokens = {
  colors: {
    brand: {
      primary: "#1A2B4B",
      primaryLight: "#2A4070",
      primaryDark: "#0F1A2E",
      accent: "#3B5998",
      highlight: "#E8EDF5",
    },
    surface: {
      background: "#F5F6F8",
      card: "#FFFFFF",
      muted: "#EEF0F4",
      border: "#E2E5EB",
      input: "#F0F2F5",
    },
    text: {
      primary: "#1A2B4B",
      secondary: "#5A6478",
      muted: "#8B95A8",
      inverse: "#FFFFFF",
    },
    chart: {
      navy: "#1A2B4B",
      blue: "#3B5998",
      teal: "#0EA5E9",
      green: "#10B981",
      amber: "#F59E0B",
      red: "#EF4444",
    },
    status: {
      pending: { bg: "#FEF3C7", text: "#92400E", border: "#FCD34D" },
      approved: { bg: "#D1FAE5", text: "#065F46", border: "#6EE7B7" },
      rejected: { bg: "#FEE2E2", text: "#991B1B", border: "#FCA5A5" },
      accepted: { bg: "#DBEAFE", text: "#1E40AF", border: "#93C5FD" },
      declined: { bg: "#F3F4F6", text: "#374151", border: "#D1D5DB" },
    },
  },
} as const;
