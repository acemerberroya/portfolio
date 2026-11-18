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
