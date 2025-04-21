export const navLinks = [
  {
    title: "Home",
    href: "#header-wrapper",
  },
  {
    title: "About",
    href: "#why-shishyakul-wrapper",
  },
  {
    title: "Services",
    href: "#services-wrapper",
  },
  {
    title: "Teachers",
    href: "#teachers-wrapper",
  },
  {
    title: "Testimonials",
    href: "#testimonial-wrapper",
  },
  {
    title: "FAQ",
    href: "#faq-wrapper",
  },
];

export const dashboardNavLinks = [
  {
    title: "Manage Shishya",
    href: "/dashboard",
  },
  {
    title: "Attendance",
    href: "/dashboard/attendance",
  },
  {
    title: "Test Papers",
    href: "/dashboard/tests",
  },
  {
    title: "Faculty Tests",
    href: "/dashboard/tests/faculty",
    role: "Faculty",
  },
  {
    title: "All Faculty Tests",
    href: "/dashboard/tests/all-faculty",
    role: "Admin",
  },
  {
    title: "Content",
    href: "/dashboard/content",
    restrictFor: ["Faculty"],
  },
  {
    title: "Members",
    href: "/dashboard/members",
    restrictFor: ["Faculty"],
  },
  {
    title: "Birthdays",
    href: "/dashboard/birthdays",
    // restrictFor: ["Admin"],
  },
];
