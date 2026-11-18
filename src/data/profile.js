// All portfolio content lives here. Edit this file to update the site.

export const profile = {
  name: 'Acemer Berroya',
  shortName: 'Acemer',
  role: 'Web Developer, Aspiring Cloud Engineer',
  location: 'San Pedro City, Philippines',
  phone: '0930-864-4747',
  phoneHref: 'tel:+639308644747',
  github: 'github.com/acemerberroya',
  githubHref: 'https://github.com/acemerberroya',
  email: 'acemerberroya1705@gmail.com',
  // Opens Gmail's compose window with this address as the recipient.
  gmailCompose:
    'https://mail.google.com/mail/?view=cm&fs=1&to=acemerberroya1705@gmail.com&su=' +
    encodeURIComponent('Portfolio inquiry'),
  // To use a real photo: put it in /public (e.g. /public/profile.jpg) and set
  // photo: '/profile.jpg'. Leave null to show the built-in SVG monogram.
  photo: '/profile.jpg',
};

export const summary = [
  'I study Information Technology at STI College Alabang and have worked as a freelance web developer since 2024. I’m working toward a career as a cloud or network engineer.',
  'For clients I have built responsive websites for a scaling business, online inventory management systems and database-driven applications, and I have tuned sites for performance and security. On the cloud side, I have a working knowledge of the AWS platform and its core services, including S3, EC2, Lambda and RDS.',
];

export const skillGroups = [
  {
    id: 'languages',
    name: 'Languages',
    items: ['JavaScript', 'Python', 'PHP', 'Java', 'C#', 'SQL'],
  },
  {
    id: 'frameworks',
    name: 'Frameworks & Platforms',
    items: ['React', 'Node.js', 'Unity (2D)'],
  },
  {
    id: 'cloud',
    name: 'Cloud & Databases',
    items: ['AWS S3', 'AWS EC2', 'AWS Lambda', 'AWS RDS', 'Supabase', 'MySQL'],
  },
];

// What each AWS service is (general AWS descriptions, shown as context).
export const awsServices = {
  'AWS S3': 'Object storage',
  'AWS EC2': 'Virtual servers',
  'AWS Lambda': 'Serverless functions',
  'AWS RDS': 'Managed relational databases',
};

// Skill groupings from the résumé, built only from the skills listed above.
export const skillLenses = [
  { id: 'all', name: 'All skills', items: null },
  {
    id: 'aws',
    name: 'Core AWS Services & Architecture',
    items: ['AWS S3', 'AWS EC2', 'AWS Lambda', 'AWS RDS'],
  },
  {
    id: 'programming',
    name: 'Programming & Operating Systems',
    items: ['JavaScript', 'Python', 'PHP', 'Java', 'C#', 'SQL'],
  },
];

export const experience = {
  title: 'Freelance Web Developer',
  period: '2024 – Present',
  items: [
    'Developed responsive websites for a scaling business.',
    'Created online inventory management systems.',
    'Implemented database-driven applications.',
    'Optimized website performance and security.',
  ],
};

export const inventoryProject = {
  name: 'Smart Inventory Management System',
  stages: [
    {
      id: 'tracking',
      name: 'Tracking',
      text: 'Automated the inventory tracking process.',
    },
    {
      id: 'accuracy',
      name: 'Accuracy',
      text: 'Reduced manual inventory errors by 40%.',
    },
    {
      id: 'reporting',
      name: 'Reporting',
      text: 'Generated real-time reports and analytics.',
    },
  ],
};

// Projects shown under "More projects". Add `url` for anything that is live.
export const otherProjects = [
  {
    name: 'Ball-lalo',
    description:
      'A restaurant system that tracks and manages inventory, runs a point-of-sale (POS) for the counter, and gives customers an ordering website with an automated chatbot.',
    tagsLabel: 'Includes',
    tags: ['Inventory management', 'POS', 'Online ordering', 'Chatbot'],
    preview: 'restaurant',
  },
  {
    name: 'STI-ALABANG 360',
    url: 'https://sti-360.vercel.app/',
    host: 'sti-360.vercel.app',
    description:
      'Thesis project: an enrollment-to-employment student lifecycle system for STI College Alabang.',
    tagsLabel: 'Built with',
    tags: ['Supabase', 'Vercel'],
    preview: 'lifecycle',
    // Screenshot of the live landing page (public/projects/sti-360.jpg)
    image: '/projects/sti-360.jpg',
    imageAlt: 'STI-ALABANG 360 landing page: One portal for smarter campus management',
  },
];

export const liveProjects = otherProjects.filter((p) => p.url);

export const education = {
  degree: 'Bachelor of Science in Information Technology',
  school: 'STI College Alabang',
  period: '2022 – Present',
};

export const certificates = [
  { year: '2024', title: 'Java Fundamentals' },
  { year: '2025', title: 'Code Fest Tagisan ng Talino' },
];

// ---------------------------------------------------------------------------
// Added for the 3D portfolio. Everything above this line is unchanged from the
// original site (including every AWS entry). Everything below was carried over
// from the collaborator repository (portfolio-main/data/*.json), wording intact.
// The TESDA CSS NC II certificate was removed everywhere, by request.
// ---------------------------------------------------------------------------

// Extra detail for the two projects already listed in `otherProjects`,
// keyed by their `name` (from portfolio-main/data/capstone.json and freelancing.json).
export const projectDetails = {
  'STI-ALABANG 360': {
    title:
      'STI-Alabang 360: A Web-Based Integrated Intelligence System for Student Lifecycle Management and Career Success',
    badge: 'Featured Capstone',
    issuer: 'STI College Alabang',
    date: '2025 – Present',
    role: 'Lead Developer',
    team: '5 developers',
    adviser: 'Manuel Jojo Simon Jr.',
    summary:
      'A campus management portal that connects every department in one dashboard for the full student lifecycle, from admissions to career success.',
    techStack: [
      'React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Edge Functions',
      'Leaflet', 'Recharts', 'Tesseract.js', 'PDF.js',
    ],
    caseStudy: {
      problem:
        'Campus departments each handled their part of the student lifecycle separately. STI-360 brings admissions, guidance, front desk, marketing and student services into one portal.',
      features: [
        { title: 'Architecture & team leadership', description: 'Set the system architecture, database design and coding standards; coordinate tasks, code reviews and version control on GitHub.' },
        { title: 'Role-based dashboards', description: 'Separate dashboards for Superuser, Admin, Front Desk, Guidance, Marketing, Students and exam takers.' },
        { title: 'Online exam portal', description: 'A dedicated login and dashboard for applicants taking the entrance exam.' },
        { title: 'Assessment analysis', description: 'Server-side analysis of assessment results through a Supabase Edge Function.' },
        { title: 'Records archive', description: 'An archive vault for keeping older records out of the active system.' },
      ],
      outcomes: [
        'Led a team of 5 developers from architecture through deployment; live at sti-360.vercel.app.',
        'Brought 4 departments into one portal with 7 role-based dashboards: Superuser, Admin, Front Desk, Guidance, Marketing, Student and Exam Taker.',
      ],
    },
  },
  'Ball-lalo': {
    title: 'Ball-Lalo Smart Inventory and Order Management System with AI Chatbot',
    badge: 'Freelance',
    client: 'Confidential',
    date: '2023 – 2024',
    role: 'Developer (Freelance)',
    summary:
      'A restaurant management system: menu and inventory, orders and billing, table reservations, sales dashboards, and an AI chatbot that answers customers.',
    techStack: [
      'HTML', 'CSS', 'Bootstrap', 'JavaScript (vanilla)', 'jQuery', 'PHP', 'MySQL (MariaDB)',
      'Chart.js', 'FullCalendar', 'OpenAI API (GPT-4o-mini)',
    ],
    caseStudy: {
      problem:
        'The restaurant ran its inventory, orders and reservations on paper. It needed one system for its menu, inventory, point of sale (POS) and table reservations that automates stock tracking, product records and stock-level reports.',
      features: [
        { title: 'Inventory tracking', description: 'Track stock levels and supplies, with automated stock-level reports.' },
        { title: 'Menu management', description: "Add, edit and price the restaurant's menu items." },
        { title: 'Point of sale (POS) & billing', description: "Take orders, update their status as they're served, and generate bills." },
        { title: 'Table reservations', description: 'Customers book from a calendar; taken time slots are blocked and reservations update their status automatically.' },
        { title: 'Sales & customer analytics', description: 'Dashboard charts of sales data and customer activity.' },
        { title: 'Ratings & feedback', description: 'Customers rate their dining experience and leave feedback.' },
        { title: 'Role-based accounts', description: 'Separate admin, staff and customer accounts, each with its own dashboard.' },
        { title: 'AI chatbot assistance', description: "A GPT-4o-mini restaurant assistant that answers customers' questions about reservations, dining and policies." },
      ],
      outcomes: [
        'Replaced paper-based records with one system for stock, sales and orders.',
        'Automated stock-level reports that used to take much longer to prepare by hand.',
        "Added an AI chatbot that answers customers' questions.",
      ],
    },
  },
};

// Projects added from the collaborator repository.
export const addedProjects = [
  {
    name: 'Sassy Strands',
    title: 'Sassy Strands Inventory & Production Tracker',
    badge: 'Live',
    client: 'Sassy Strands',
    date: '2026',
    role: 'Developer (Freelance)',
    url: 'https://sassystrands.vercel.app',
    host: 'sassystrands.vercel.app',
    repoUrl: 'https://github.com/barceeee/sassystrands',
    image: '/projects/cover-sassy-strands.jpg',
    imageAlt: 'Sassy Strands Inventory & Production Tracker',
    description:
      "One web app that replaces the client's Excel workbooks for inventory, client orders and production tracking.",
    tagsLabel: 'Tech stack',
    tags: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'Supabase Auth', 'Edge Functions', 'ExcelJS'],
    caseStudy: {
      problem:
        'The client tracked bundle and closure inventory, available stock and client orders across several Excel workbooks. The goal was a single system for stock, orders and production, with access controlled by role.',
      features: [
        { title: 'Inventory and stock movements', description: 'Stock movements and running balances for bundles and closures, with pricing.' },
        { title: 'Client order monitoring', description: 'Track client orders and their OR numbers in one place.' },
        { title: 'Production stages and QA', description: 'Follow each order through production stages and quality assurance.' },
        { title: 'Spreadsheet import', description: "Imports the client's existing workbooks and flags every row it cannot read cleanly." },
        { title: 'Role-based access', description: 'Owner, Admin, Inventory, Production and QA roles enforced in the database with row-level security.' },
        { title: 'Reports', description: 'Reports built from the live inventory and order data.' },
      ],
      outcomes: [
        "Replaced the client's Excel workbooks with one web app for inventory, client orders, production and QA.",
        'Five staff roles (Owner, Admin, Inventory, Production, QA) each see only what they need, enforced in the database.',
        "Imported the client's existing spreadsheets automatically, flagging every row that needed review.",
      ],
    },
  },
  {
    name: 'CommutePH',
    title: 'CommutePH',
    badge: 'Live',
    date: '2024 – 2025',
    role: 'Developer',
    url: 'https://commute-ph.vercel.app',
    host: 'commute-ph.vercel.app',
    description:
      'Helps commuters find the right terminals for their journey, across buses, trains, jeepneys and bikes.',
    tagsLabel: 'Tech stack',
    tags: ['React', 'Vite', 'Node.js', 'Firebase'],
  },
  {
    name: 'Pagpag: The Hunger Games',
    title: 'Pagpag: The Hunger Games',
    badge: 'Playable',
    role: 'Lead Developer',
    demoUrl: '/demos/pagpag/',
    repoUrl: 'https://github.com/barceeee/PagpagTheHungerGames',
    image: '/projects/cover-pagpag.jpg',
    imageAlt: 'Pagpag: The Hunger Games cover art',
    description:
      'A 2D survival game set in a Filipino slum: survive 365 days, find a stable job and escape. Hardcore mode: one life, no second chances.',
    tagsLabel: 'Tech stack',
    tags: ['C#', 'Unity 6', 'URP 2D', 'Input System', 'uGUI'],
    caseStudy: {
      problem:
        'The pitch, from the game\'s title screen: "No money, no choices. Just survival." Survive 365 days, find a stable job and escape the slums.',
      features: [
        { title: 'Character creation', description: 'Play as Dong or Inday, a husband and wife who each have their own backstory.' },
        { title: 'Two difficulty modes', description: 'Tagalog (Normal) and Bisaya (Hard).' },
        { title: 'Hardcore save', description: 'One persistent run in a single save slot.' },
        { title: 'Playable world map', description: 'A world scene the player explores between locations.' },
        { title: 'Jobs and minigames', description: 'Earn money through labor, service and street minigames at locations around the map.' },
        { title: 'Family management', description: 'Feed the family and send the children to work jobs on their own; their skills and energy decide how well they do.' },
      ],
      outcomes: [
        'Designed and built a complete 2D survival game in Unity 6, from main menu to world map, minigames and family system.',
        'Playable in the browser straight from the portfolio, with no download or install.',
      ],
    },
  },
];

// Top 10 hard skills (portfolio-main/data/skills.json). Order = rank.
// The two skills that only cited the NC II certificate keep their wording; the
// certificate reference was removed, so they list no evidence.
export const hardSkills = [
  { title: 'Full-Stack Web Development', description: 'Building complete web apps: interface, server logic and database.', shownIn: ['STI-360', 'Sassy Strands', 'Ball-Lalo'] },
  { title: 'Database Design & SQL', description: 'Designing schemas, writing migrations and indexing the joins an app relies on.', shownIn: ['Sassy Strands', 'STI-360'] },
  { title: 'Auth & Role-Based Access', description: 'Logins and per-role permissions enforced in the database with row-level security.', shownIn: ['Sassy Strands', 'STI-360'] },
  { title: 'Responsive UI Development', description: 'Interfaces that work on phones and desktops, built with React, Tailwind CSS, Bootstrap and plain CSS.', shownIn: ['STI-360', 'Sassy Strands', 'Ball-Lalo'] },
  { title: 'AI Chatbot Integration', description: "Connecting a business system to OpenAI's GPT-4o-mini so a chatbot answers customers' questions.", shownIn: ['Ball-Lalo'] },
  { title: 'Computer Systems Servicing', description: 'Installing, configuring, maintaining and repairing computer systems.', shownIn: [] },
  { title: 'Network & Server Setup', description: 'Setting up computer networks and servers.', shownIn: [] },
  { title: 'Cloud Deployment', description: 'Shipping apps to Vercel with Supabase as the hosted backend.', shownIn: ['STI-360', 'Sassy Strands', 'CommutePH'] },
  { title: 'Game Development', description: 'A 2D survival game in Unity and C#: game systems, saves, minigames and UI.', shownIn: ['Pagpag: The Hunger Games'] },
  { title: 'Version Control (Git)', description: 'Branches, pull requests and GitHub for every project.', shownIn: ['Sassy Strands', 'Pagpag: The Hunger Games', 'This portfolio'] },
];

export const softSkills = [
  { title: 'Leadership', evidence: 'Lead developer of a 5-person capstone team (STI-360)' },
  { title: 'Client Communication', evidence: "Turned two freelance clients' needs into working systems" },
  { title: 'Teamwork', evidence: 'Code reviews and GitHub workflow across the capstone team' },
  { title: 'Problem Solving', evidence: "Replaced a client's Excel workflow with one app" },
  { title: 'Adaptability', evidence: 'Web, databases, hardware and game development' },
  { title: 'Self-Directed Learning', evidence: 'Picked up React, Supabase and Unity through projects' },
];

// Languages & tools from portfolio-main/data/languages.json that the original
// skill groups above don't already list. Kept separate so the original groups
// (and the AWS skills in them) stay exactly as they were.
export const toolkit = [
  { group: 'Frontend', title: 'HTML', usedIn: ['Ball-Lalo'] },
  { group: 'Frontend', title: 'CSS', usedIn: ['Ball-Lalo'] },
  { group: 'Frontend', title: 'React + Vite', description: 'React for the UI, Vite as the dev server and build tool.', usedIn: ['STI-360', 'Sassy Strands', 'CommutePH'] },
  { group: 'Frontend', title: 'Tailwind CSS', usedIn: ['STI-360'] },
  { group: 'Frontend', title: 'Bootstrap', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'PostgreSQL', usedIn: ['STI-360', 'Sassy Strands'] },
  { group: 'Database', title: 'MySQL (XAMPP)', description: 'Local Apache + MySQL/MariaDB + PHP server stack.', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'phpMyAdmin', description: 'Web tool for managing MySQL databases.', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'Firebase', description: "Google's app backend: database, auth and hosting.", usedIn: ['CommutePH'] },
];

// Every project in display order, merged into one shape for the panels and the globe.
export const allProjects = [
  ...otherProjects.filter((p) => p.url).map((p) => ({ ...p, ...projectDetails[p.name] })),
  ...addedProjects.filter((p) => p.url),
  { name: inventoryProject.name, title: inventoryProject.name, stages: inventoryProject.stages },
  ...otherProjects.filter((p) => !p.url).map((p) => ({ ...p, ...projectDetails[p.name] })),
  ...addedProjects.filter((p) => !p.url),
];
