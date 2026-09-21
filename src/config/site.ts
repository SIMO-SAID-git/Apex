export const siteConfig = {
  name: "APEX",
  fullName: "Apex Performance Club",
  description:
    "A premium strength, conditioning, and recovery club. Live occupancy, instructor-led classes, and data-driven training in one place.",
  url: "https://apex-club.example.com",
  ogImage: "https://apex-club.example.com/og.jpg",
  nav: [
    { label: "Classes", href: "/classes" },
    { label: "Facilities", href: "/facilities" },
    { label: "Membership", href: "/membership" },
    { label: "Dashboard", href: "/dashboard" },
  ],
  hours: {
    weekday: "05:00 – 23:00",
    weekend: "07:00 – 21:00",
  },
} as const;

export const isMockMode = process.env.NEXT_PUBLIC_USE_MOCK_DATA !== "false";
