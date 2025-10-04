import { addDays, subDays, setHours, setMinutes } from "date-fns";
import type { Event, EventCategory } from "~/types/events";

// Helper function to create event dates
const createEventDate = (daysOffset: number, hour: number, minute = 0): string => {
  const baseDate = daysOffset >= 0 ? addDays(new Date(), daysOffset) : subDays(new Date(), Math.abs(daysOffset));
  return setMinutes(setHours(baseDate, hour), minute).toISOString();
};

// Sample event images (placeholder URLs)
const eventImages = [
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=400&h=250&fit=crop&crop=center", 
  "https://images.unsplash.com/photo-1551818255-e6e10975bc17?w=400&h=250&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=400&h=250&fit=crop&crop=center",
  "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&h=250&fit=crop&crop=center",
];

export const dummyEvents: Event[] = [
  // Past Events (3-5 events)
  {
    id: "past-1",
    title: "React Conf 2024",
    subtitle: "The official React conference for developers",
    date: createEventDate(-7, 9, 0),
    location: "Las Vegas, NV",
    category: "Conference",
    image: eventImages[0],
    description: "Join the React team and community for two days of talks, networking, and learning about the latest in React development.",
    attendeeCount: 1200,
    price: { amount: 450, currency: "USD" },
    tags: ["React", "Frontend", "JavaScript"]
  },
  {
    id: "past-2", 
    title: "Design Systems Workshop",
    subtitle: "Building scalable design systems",
    date: createEventDate(-5, 14, 30),
    location: "San Francisco, CA",
    category: "Workshop",
    image: eventImages[1],
    description: "Learn to create and maintain design systems that scale across large organizations.",
    attendeeCount: 45,
    price: { amount: 299, currency: "USD" },
    tags: ["Design", "Systems", "UI/UX"]
  },
  {
    id: "past-3",
    title: "Startup Networking Mixer",
    subtitle: "Connect with fellow entrepreneurs",
    date: createEventDate(-3, 18, 0),
    location: "Austin, TX",
    category: "Networking",
    image: eventImages[2],
    description: "An evening of networking with startup founders, investors, and industry professionals.",
    attendeeCount: 150,
    tags: ["Startup", "Networking", "Business"]
  },
  {
    id: "past-4",
    title: "AI & Machine Learning Meetup",
    subtitle: "Latest trends in artificial intelligence",
    date: createEventDate(-2, 19, 0),
    location: "Seattle, WA",
    category: "Meetup",
    image: eventImages[3],
    description: "Discussion on the latest developments in AI and ML with industry experts.",
    attendeeCount: 85,
    tags: ["AI", "Machine Learning", "Technology"]
  },

  // Today's Events (2-3 events)
  {
    id: "today-1",
    title: "TypeScript Deep Dive",
    subtitle: "Advanced TypeScript patterns and techniques",
    date: createEventDate(0, 10, 0),
    location: "Online",
    category: "Webinar",
    image: eventImages[4],
    description: "Master advanced TypeScript features including conditional types, mapped types, and more.",
    attendeeCount: 320,
    price: { amount: 49, currency: "USD" },
    tags: ["TypeScript", "JavaScript", "Programming"]
  },
  {
    id: "today-2",
    title: "UX Research Panel",
    subtitle: "User research in the modern era",
    date: createEventDate(0, 15, 30),
    location: "New York, NY",
    category: "Conference",
    image: eventImages[0],
    description: "Panel discussion with leading UX researchers on best practices and emerging trends.",
    attendeeCount: 200,
    price: { amount: 75, currency: "USD" },
    tags: ["UX", "Research", "Design"]
  },
  {
    id: "today-3",
    title: "Tech Happy Hour",
    subtitle: "Casual networking for tech professionals",
    date: createEventDate(0, 17, 0),
    location: "Portland, OR",
    category: "Social",
    image: eventImages[1],
    description: "Relaxed evening networking event for tech professionals in the Portland area.",
    attendeeCount: 75,
    tags: ["Networking", "Social", "Tech"]
  },

  // Tomorrow's Events (2-3 events)
  {
    id: "tomorrow-1",
    title: "Next.js Masterclass",
    subtitle: "Building production-ready apps with Next.js",
    date: createEventDate(1, 9, 0),
    location: "Online",
    category: "Workshop",
    image: eventImages[2],
    description: "Comprehensive workshop covering Next.js 15, App Router, Server Components, and deployment strategies.",
    attendeeCount: 180,
    price: { amount: 199, currency: "USD" },
    tags: ["Next.js", "React", "Full-stack"]
  },
  {
    id: "tomorrow-2",
    title: "Product Management Summit",
    subtitle: "Strategic product leadership in 2024",
    date: createEventDate(1, 13, 0),
    location: "Chicago, IL",
    category: "Conference",
    image: eventImages[3],
    description: "Summit for product managers featuring talks on strategy, roadmapping, and team leadership.",
    attendeeCount: 350,
    price: { amount: 125, currency: "USD" },
    tags: ["Product", "Management", "Strategy"]
  },
  {
    id: "tomorrow-3",
    title: "GraphQL Meetup",
    subtitle: "Advanced GraphQL patterns",
    date: createEventDate(1, 18, 30),
    location: "Denver, CO",
    category: "Meetup",
    image: eventImages[4],
    description: "Monthly meetup focused on GraphQL best practices and real-world implementations.",
    attendeeCount: 65,
    tags: ["GraphQL", "API", "Backend"]
  },

  // Future Events (8-10 events)
  {
    id: "future-1",
    title: "Web Performance Workshop",
    subtitle: "Optimizing modern web applications",
    date: createEventDate(3, 10, 0),
    location: "Boston, MA",
    category: "Workshop",
    image: eventImages[0],
    description: "Hands-on workshop covering Core Web Vitals, performance monitoring, and optimization techniques.",
    attendeeCount: 40,
    price: { amount: 349, currency: "USD" },
    tags: ["Performance", "Web", "Optimization"]
  },
  {
    id: "future-2",
    title: "Blockchain Developer Conference",
    subtitle: "Building the decentralized future",
    date: createEventDate(5, 9, 30),
    location: "Miami, FL",
    category: "Conference",
    image: eventImages[1],
    description: "Three-day conference covering smart contracts, DeFi, NFTs, and Web3 development.",
    attendeeCount: 800,
    price: { amount: 599, currency: "USD" },
    tags: ["Blockchain", "Web3", "Cryptocurrency"]
  },
  {
    id: "future-3",
    title: "Cybersecurity Webinar",
    subtitle: "Protecting modern applications",
    date: createEventDate(7, 14, 0),
    location: "Online",
    category: "Webinar",
    image: eventImages[2],
    description: "Learn about the latest cybersecurity threats and how to protect your applications.",
    attendeeCount: 450,
    price: { amount: 29, currency: "USD" },
    tags: ["Security", "Cybersecurity", "DevOps"]
  },
  {
    id: "future-4",
    title: "Women in Tech Networking",
    subtitle: "Empowering women in technology",
    date: createEventDate(10, 18, 0),
    location: "San Diego, CA",
    category: "Networking",
    image: eventImages[3],
    description: "Networking event to connect and empower women working in technology fields.",
    attendeeCount: 120,
    tags: ["Women in Tech", "Networking", "Community"]
  },
  {
    id: "future-5",
    title: "Mobile App Development Workshop",
    subtitle: "React Native and Flutter comparison",
    date: createEventDate(12, 11, 0),
    location: "Phoenix, AZ",
    category: "Workshop",
    image: eventImages[4],
    description: "Compare React Native and Flutter for cross-platform mobile development.",
    attendeeCount: 60,
    price: { amount: 275, currency: "USD" },
    tags: ["Mobile", "React Native", "Flutter"]
  },
  {
    id: "future-6",
    title: "Cloud Architecture Meetup",
    subtitle: "Scalable cloud solutions",
    date: createEventDate(14, 19, 0),
    location: "Online",
    category: "Meetup",
    image: eventImages[0],
    description: "Monthly meetup discussing cloud architecture patterns and best practices.",
    attendeeCount: 95,
    tags: ["Cloud", "Architecture", "AWS"]
  },
  {
    id: "future-7",
    title: "DevOps Conference 2024",
    subtitle: "Streamlining development operations",
    date: createEventDate(18, 8, 30),
    location: "Atlanta, GA",
    category: "Conference",
    image: eventImages[1],
    description: "Two-day conference covering CI/CD, containerization, monitoring, and automation.",
    attendeeCount: 650,
    price: { amount: 425, currency: "USD" },
    tags: ["DevOps", "CI/CD", "Automation"]
  },
  {
    id: "future-8",
    title: "Data Science Workshop",
    subtitle: "Machine learning with Python",
    date: createEventDate(21, 13, 30),
    location: "Minneapolis, MN",
    category: "Workshop",
    image: eventImages[2],
    description: "Hands-on workshop covering data analysis, visualization, and machine learning with Python.",
    attendeeCount: 55,
    price: { amount: 299, currency: "USD" },
    tags: ["Data Science", "Python", "Machine Learning"]
  },
  {
    id: "future-9",
    title: "Freelancer Social Hour",
    subtitle: "Connecting independent professionals",
    date: createEventDate(25, 17, 30),
    location: "Nashville, TN",
    category: "Social",
    image: eventImages[3],
    description: "Social gathering for freelancers and independent contractors in the tech industry.",
    attendeeCount: 80,
    tags: ["Freelancing", "Social", "Independent"]
  },
  {
    id: "future-10",
    title: "Open Source Contribution Workshop",
    subtitle: "Contributing to open source projects",
    date: createEventDate(28, 10, 30),
    location: "Online",
    category: "Workshop",
    image: eventImages[4],
    description: "Learn how to find, contribute to, and maintain open source projects effectively.",
    attendeeCount: 140,
    tags: ["Open Source", "Git", "Community"]
  }
];

// Helper function to get all unique categories from events
export const getAllCategories = (): EventCategory[] => {
  const categories = dummyEvents.map(event => event.category);
  return Array.from(new Set(categories));
};

// Helper function to get events by category
export const getEventsByCategory = (category: EventCategory | "all"): Event[] => {
  if (category === "all") {
    return dummyEvents;
  }
  return dummyEvents.filter(event => event.category === category);
};

export default dummyEvents;