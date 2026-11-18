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
  'I’m an Information Technology student at STI College Alabang, and I’ve been taking on freelance web development work since 2024. My goal is to become a cloud or network engineer.',
  'My client work covers mobile-friendly sites for a growing business, web-based tools for managing inventory and apps backed by a database, plus speed and security improvements to existing sites. On the cloud side, I have a working knowledge of the AWS platform and its core services, including S3, EC2, Lambda and RDS.',
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
    'Built mobile-friendly websites for a growing business.',
    'Delivered web-based systems for managing inventory.',
    'Shipped applications that run on a database backend.',
    'Made client websites faster and more secure.',
  ],
};

export const inventoryProject = {
  name: 'Smart Inventory Management System',
  stages: [
    {
      id: 'tracking',
      name: 'Tracking',
      text: 'Took the manual work out of keeping track of stock.',
    },
    {
      id: 'accuracy',
      name: 'Accuracy',
      text: 'Cut errors from manual stock entry by 40%.',
    },
    {
      id: 'reporting',
      name: 'Reporting',
      text: 'Produces live reports and analytics.',
    },
  ],
};

// Projects shown under "More projects". Add `url` for anything that is live.
export const otherProjects = [
  {
    name: 'Ball-lalo',
    description:
      'A restaurant platform that keeps inventory under control, powers the point-of-sale (POS) at the counter, and lets customers order online with help from an automated chatbot.',
    tagsLabel: 'Includes',
    tags: ['Inventory management', 'POS', 'Online ordering', 'Chatbot'],
    preview: 'restaurant',
  },
  {
    name: 'STI-ALABANG 360',
    url: 'https://sti-360.vercel.app/',
    host: 'sti-360.vercel.app',
    description:
      'Our thesis: a student lifecycle system for STI College Alabang that follows students from enrollment to employment.',
    tagsLabel: 'Built with',
    tags: ['Supabase', 'Vercel'],
    preview: 'lifecycle',
    // Screenshot of the live landing page (public/projects/sti-360.jpg)
    image: '/projects/sti-360.jpg',
    imageAlt: 'Screenshot of the STI-ALABANG 360 landing page',
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
// Added for the 3D portfolio: projects and skills from the shared portfolio-main
// repository, rewritten in new wording (facts unchanged). Above this line, the
// sentences were also reworded, except the AWS entries, which are exactly as
// originally written. The TESDA CSS NC II certificate is not included.
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
    role: 'Developer',
    team: '5 developers',
    adviser: 'Manuel Jojo Simon Jr.',
    summary:
      'One dashboard that links every campus department and follows each student from admission all the way to their career.',
    techStack: [
      'React', 'Vite', 'Tailwind CSS', 'Supabase', 'PostgreSQL', 'Edge Functions',
      'Leaflet', 'Recharts', 'Tesseract.js', 'PDF.js',
    ],
    caseStudy: {
      problem:
        'Every campus office used to manage its own slice of a student’s journey on its own. STI-360 puts admissions, guidance, the front desk, marketing and student services in a single portal.',
      features: [
        { title: 'A dashboard for every role', description: 'Superusers, admins, front desk staff, guidance, marketing, students and exam takers each get their own view.' },
        { title: 'Entrance exam portal', description: 'Applicants sign in to their own dashboard and take the entrance exam online.' },
        { title: 'Assessment insights', description: 'A Supabase Edge Function analyzes assessment results on the server.' },
        { title: 'Archive vault', description: 'Older records move into an archive so the live system stays lean.' },
      ],
      outcomes: [
        'Taken from architecture to deployment by a five-developer team, and now live at sti-360.vercel.app.',
        'Unites 4 departments in one portal with 7 dashboards tailored to each role: Superuser, Admin, Front Desk, Guidance, Marketing, Student and Exam Taker.',
      ],
    },
  },
  'Ball-lalo': {
    title: 'Ball-Lalo Smart Inventory and Order Management System with AI Chatbot',
    badge: 'Freelance',
    client: 'Confidential',
    date: '2023 – 2024',
    role: 'Developer',
    summary:
      'Runs the whole restaurant from one place: menu and stock, orders and bills, table bookings, sales dashboards, and an AI chatbot for customer questions.',
    techStack: [
      'HTML', 'CSS', 'Bootstrap', 'JavaScript (vanilla)', 'jQuery', 'PHP', 'MySQL (MariaDB)',
      'Chart.js', 'FullCalendar', 'OpenAI API (GPT-4o-mini)',
    ],
    caseStudy: {
      problem:
        'Inventory, orders and reservations were all kept on paper. The restaurant wanted one system for its menu, stock, point of sale (POS) and table bookings, with stock tracking, product records and stock reports handled automatically.',
      features: [
        { title: 'Stock tracking', description: 'Watches stock levels and supplies and produces stock reports on its own.' },
        { title: 'Menu editor', description: 'Staff can add dishes, change them and set their prices.' },
        { title: 'POS and billing', description: 'Orders are entered, marked as they reach the table, and turned into bills.' },
        { title: 'Table booking', description: 'Guests reserve through a calendar; booked slots are locked and each reservation’s status updates by itself.' },
        { title: 'Sales and customer insights', description: 'Dashboard charts show sales figures and how customers use the service.' },
        { title: 'Reviews', description: 'Diners can score their visit and leave comments.' },
        { title: 'Accounts by role', description: 'Admins, staff and customers each sign in to a dashboard made for them.' },
        { title: 'AI chatbot', description: 'A GPT-4o-mini assistant answers customer questions about bookings, dining and house rules.' },
      ],
      outcomes: [
        'Moved stock, sales and orders off paper and into one system.',
        'Stock reports that once took a long time to compile by hand are now generated automatically.',
        'Customers can get their questions answered by an AI chatbot.',
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
    role: 'Developer',
    url: 'https://sassystrands.vercel.app',
    host: 'sassystrands.vercel.app',
    repoUrl: 'https://github.com/barceeee/sassystrands',
    image: '/projects/cover-sassy-strands.jpg',
    imageAlt: 'Sassy Strands Inventory & Production Tracker',
    description:
      'A single web app that took over from the client’s Excel files for inventory, orders and production tracking.',
    tagsLabel: 'Tech stack',
    tags: ['React', 'Vite', 'Supabase', 'PostgreSQL', 'Supabase Auth', 'Edge Functions', 'ExcelJS'],
    caseStudy: {
      problem:
        'Bundle and closure inventory, available stock and customer orders were spread across several Excel workbooks. The client needed one system for stock, orders and production, where each role sees only what it should.',
      features: [
        { title: 'Stock movements', description: 'Logs every movement and keeps running balances and prices for bundles and closures.' },
        { title: 'Order tracking', description: 'Client orders and their OR numbers sit together in one place.' },
        { title: 'Production and QA', description: 'Each order is followed through every production step and quality check.' },
        { title: 'Excel import', description: 'Pulls in the client’s existing workbooks and marks any row it can’t read cleanly.' },
        { title: 'Access by role', description: 'Owner, Admin, Inventory, Production and QA permissions are enforced by the database through row-level security.' },
        { title: 'Reports', description: 'Reports are generated straight from live inventory and order data.' },
      ],
      outcomes: [
        'Inventory, orders, production and QA now run in one web app instead of a stack of Excel workbooks.',
        'Each of the five staff roles (Owner, Admin, Inventory, Production, QA) gets only the access it needs, enforced by the database.',
        'Existing spreadsheets were brought in automatically, with any row needing a second look flagged.',
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
      'Points commuters to the right terminals for their trip, whether they ride buses, trains, jeepneys or bikes.',
    tagsLabel: 'Tech stack',
    tags: ['React', 'Vite', 'Node.js', 'Firebase'],
  },
  {
    name: 'Pagpag: The Hunger Games',
    title: 'Pagpag: The Hunger Games',
    badge: 'Playable',
    role: 'Developer',
    demoUrl: '/demos/pagpag/',
    repoUrl: 'https://github.com/barceeee/PagpagTheHungerGames',
    image: '/projects/cover-pagpag.jpg',
    imageAlt: 'Pagpag: The Hunger Games cover art',
    description:
      'A 2D survival game in a Filipino slum where the goal is to last 365 days, land a steady job and get out. Hardcore rules: one life, no retries.',
    tagsLabel: 'Tech stack',
    tags: ['C#', 'Unity 6', 'URP 2D', 'Input System', 'uGUI'],
    caseStudy: {
      problem:
        'The premise: with no money and no options, the player has to survive 365 days, secure a steady job and leave the slums behind.',
      features: [
        { title: 'Pick a character', description: 'Choose Dong or Inday, a married couple with separate backstories.' },
        { title: 'Two difficulties', description: 'Tagalog is the Normal mode; Bisaya is the Hard one.' },
        { title: 'Hardcore saving', description: 'A single save slot holds one ongoing run.' },
        { title: 'Explorable map', description: 'Players roam a world map to travel from place to place.' },
        { title: 'Jobs and minigames', description: 'Money comes from labor, service and street minigames scattered across the map.' },
        { title: 'Family care', description: 'Keep the family fed and send the kids out to work; how well they do depends on their skills and energy.' },
      ],
      outcomes: [
        'A full 2D survival game made in Unity 6, covering the main menu, world map, minigames and family system.',
        'Runs right in the browser from this portfolio, with nothing to download or install.',
      ],
    },
  },
];

// Top 10 hard skills. Order = rank. Slots 6 and 7 are the AWS platform skills,
// worded exactly as the original summary, skill groups and awsServices above.
export const hardSkills = [
  { title: 'Full-Stack Web Development', description: 'End-to-end web apps, from the user interface to the server code and the database.', shownIn: ['STI-360', 'Sassy Strands', 'Ball-Lalo'] },
  { title: 'Database Design & SQL', description: 'Planning schemas, writing migrations and adding indexes for the queries an app depends on.', shownIn: ['Sassy Strands', 'STI-360'] },
  { title: 'Auth & Role-Based Access', description: 'Sign-in flows and role permissions, enforced in the database through row-level security.', shownIn: ['Sassy Strands', 'STI-360'] },
  { title: 'Responsive UI Development', description: 'Layouts that adapt to phones and desktops, made with React, Tailwind CSS, Bootstrap and plain CSS.', shownIn: ['STI-360', 'Sassy Strands', 'Ball-Lalo'] },
  { title: 'AI Chatbot Integration', description: 'Hooking business systems up to OpenAI’s GPT-4o-mini so a chatbot can handle customer questions.', shownIn: ['Ball-Lalo'] },
  { title: 'Core AWS Services & Architecture', description: 'Working knowledge of the AWS platform and its core services, including S3, EC2, Lambda and RDS.', shownIn: [] },
  { title: 'AWS S3, EC2, Lambda & RDS', description: 'Object storage (S3), virtual servers (EC2), serverless functions (Lambda) and managed relational databases (RDS).', shownIn: [] },
  { title: 'Cloud Deployment', description: 'Putting apps live on Vercel, with Supabase as the hosted backend.', shownIn: ['STI-360', 'Sassy Strands', 'CommutePH'] },
  { title: 'Game Development', description: 'Building a 2D survival game with Unity and C#, including its systems, saving, minigames and interface.', shownIn: ['Pagpag: The Hunger Games'] },
  { title: 'Version Control (Git)', description: 'Working with branches and pull requests on GitHub across every project.', shownIn: ['Sassy Strands', 'Pagpag: The Hunger Games', 'This portfolio'] },
];

export const softSkills = [
  { title: 'Client Communication', evidence: 'Took two freelance clients from requirements to working systems' },
  { title: 'Teamwork', evidence: 'Shared code reviews and a GitHub workflow with the capstone team' },
  { title: 'Problem Solving', evidence: 'Swapped a client’s Excel-based process for a single app' },
  { title: 'Adaptability', evidence: 'Moves between web, database, hardware and game work' },
  { title: 'Self-Directed Learning', evidence: 'Learned React, Supabase and Unity by building real projects' },
];

// Languages & tools from portfolio-main/data/languages.json that the original
// skill groups above don't already list. Kept separate so the original groups
// (and the AWS skills in them) stay exactly as they were.
export const toolkit = [
  { group: 'Frontend', title: 'HTML', usedIn: ['Ball-Lalo'] },
  { group: 'Frontend', title: 'CSS', usedIn: ['Ball-Lalo'] },
  { group: 'Frontend', title: 'React + Vite', description: 'React builds the interface; Vite serves and bundles it.', usedIn: ['STI-360', 'Sassy Strands', 'CommutePH'] },
  { group: 'Frontend', title: 'Tailwind CSS', usedIn: ['STI-360'] },
  { group: 'Frontend', title: 'Bootstrap', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'PostgreSQL', usedIn: ['STI-360', 'Sassy Strands'] },
  { group: 'Database', title: 'MySQL (XAMPP)', description: 'A local server bundle of Apache, MySQL/MariaDB and PHP.', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'phpMyAdmin', description: 'A browser-based admin tool for MySQL databases.', usedIn: ['Ball-Lalo'] },
  { group: 'Database', title: 'Firebase', description: 'Google’s backend platform for databases, authentication and hosting.', usedIn: ['CommutePH'] },
];

// Every project in display order, merged into one shape for the panels and the globe.
export const allProjects = [
  ...otherProjects.filter((p) => p.url).map((p) => ({ ...p, ...projectDetails[p.name] })),
  ...addedProjects.filter((p) => p.url),
  { name: inventoryProject.name, title: inventoryProject.name, stages: inventoryProject.stages },
  ...otherProjects.filter((p) => !p.url).map((p) => ({ ...p, ...projectDetails[p.name] })),
  ...addedProjects.filter((p) => !p.url),
];
