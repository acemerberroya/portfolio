// Euthenics 2 · Requirement 4, Section 6: Company and HTE Evaluation.
// All the text the Euthenics room shows lives here. Edit freely: the panels,
// the hologram's beacons and the orbiting satellites all read from this file.
//
// Scores are my own ratings (1 = weak, 5 = strong) against my goals; they are
// judgements, not published figures. Facts that could not be confirmed are
// marked "unverified".

export const evaluation = {
  title: 'Company and HTE Evaluation',
  course: 'Euthenics 2 · Prefinals · Requirement 4, Section 6',
  intro:
    'Before choosing where to do my work immersion, I compared three Host Training Establishments against the same six criteria. I wasn’t only looking for a place to complete my hours. I wanted the one that moves me furthest toward my goals.',
  goals: [
    'Primary track: cloud engineering and network engineering (I already know the AWS platform).',
    'Growing interest: cybersecurity, sparked by a professor of mine who works in security at Civicom.',
    'Practical needs: a site I can reach from San Pedro City, Laguna, and real hands-on work rather than observation.',
  ],
  verdict: {
    pick: 'accenture',
    runnerUp: 'civicom',
    oneLine: 'Accenture is my first choice. Civicom is a strong second, and the better fit if cybersecurity becomes my main track.',
  },
};

// The six criteria come straight from the Requirement 3 brief. The weights are
// mine: learning, fit and growth matter most for where I want to go.
export const criteria = [
  {
    id: 'profile',
    name: 'Company profile',
    weight: 10,
    question: 'How established and stable is the company, and how big is its IT operation?',
  },
  {
    id: 'industry',
    name: 'Industry fit',
    weight: 20,
    question: 'Does the company’s core business put me in cloud, network or security work every day?',
  },
  {
    id: 'reputation',
    name: 'Reputation',
    weight: 15,
    question: 'What do employees, clients and certifications say about the company?',
  },
  {
    id: 'learning',
    name: 'Learning opportunities',
    weight: 25,
    question: 'What training, certifications, mentoring and hands-on tasks would I get?',
  },
  {
    id: 'access',
    name: 'Accessibility and location',
    weight: 10,
    question: 'How easily can I get there from San Pedro City, and what are the schedules like?',
  },
  {
    id: 'growth',
    name: 'Career growth potential',
    weight: 20,
    question: 'Where could this lead in three to five years in cloud, network or security?',
  },
];

export const companies = [
  {
    id: 'accenture',
    name: 'Accenture',
    legal: 'Accenture Philippines',
    industry: 'IT services and consulting (cloud, infrastructure, security, operations)',
    background:
      'A global professional-services company. Its Philippine operations include an Advanced Technology Centers office at Axis Tower One, Northgate Cyberzone, Filinvest City, Alabang: its first site in southern Metro Manila.',
    location: 'Axis Tower One, Northgate Cyberzone, Filinvest City, Alabang, Muntinlupa',
    learning: [
      'Invests about $1 billion a year in employee learning and development.',
      'Certification support: exam vouchers co-financed or covered through internal initiatives such as Cloud Elevate and Ascend.',
      'Structured study tracks for AWS, Microsoft Azure, Google Cloud, Cisco and Oracle Cloud, plus free access to LearnVantage and external portals with sandbox labs, bootcamps and exam prep.',
      'Multi-cloud exposure (AWS, Azure, GCP) with Terraform, Kubernetes and CI/CD on enterprise-scale migrations.',
      'Hybrid and cloud networking: routing, switching, firewalls, AWS VPC, Azure VNets and SD-WAN, automated with Python, Ansible and Terraform.',
    ],
    access:
      'The Alabang office is close to San Pedro City and was opened so staff from the south could work near home. Job posts also list Quezon City, Mandaluyong and Taguig, so which site an intern would report to is unverified.',
    growth:
      'Structured mentorship from a People Lead, clear promotion tracks, and exposure to enterprise security and disaster-recovery standards.',
    pros: [
      'The strongest cloud and network learning path of the three, with certifications paid for or subsidised.',
      'Daily exposure to the exact tools on my roadmap (AWS, VPC networking, Terraform).',
      'Has an Alabang site near home.',
      'Recommended to me by IT professionals as the best training ground for people starting out.',
    ],
    cons: [
      'Training sponsorship tends to follow client demand, so what I learn may be shaped by the project, not my choice.',
      'At this size an intern can end up with a narrow slice of a large project.',
      'Some employee reviews mention red tape.',
      'Whether Accenture takes OJT interns from my school, and at which site, is unverified.',
    ],
    scores: { profile: 5, industry: 5, reputation: 4, learning: 5, access: 4, growth: 4 },
    notes: {
      profile: 'Global firm; Alabang technology centre',
      industry: 'Cloud and network work is core business',
      reputation: 'Jobstreet 4.1/5 (2.2K ratings); some red-tape complaints',
      learning: 'Funded certs, study tracks, sandbox labs',
      access: 'Alabang site, but posts also list QC, Mandaluyong, Taguig',
      growth: 'People Lead mentoring, promotion tracks; depends on project demand',
    },
  },
  {
    id: 'civicom',
    name: 'Civicom',
    legal: 'Civicom Pacific Corp.',
    industry: 'Technology-enabled business services (U.S. healthcare, market research, AI-assisted data platforms)',
    background:
      'Serves U.S. clients in healthcare, market research and AI-assisted data platforms. It holds ISO/IEC 27001 certification and follows HIPAA and GDPR. It has grown from 12 employees in 2010 to several hundred.',
    location: 'Unioil Center, Acacia Avenue, Ayala Alabang, Muntinlupa',
    learning: [
      'Hands-on work with international compliance frameworks: ISO 27001, HIPAA and GDPR.',
      'Experience in audits, InfoSec controls and client security questionnaires.',
      'Broad infrastructure-security scope, e.g. the Infrastructure & Security Specialist role: patching, endpoint compliance, vulnerability assessments and incident response.',
      'A direct mentor connection: a professor of mine works in security there.',
    ],
    access:
      'In Ayala Alabang, the closest of the three to San Pedro City. Some roles move to work-from-home after onsite training, but many require graveyard or after-hours shifts (for example 9:00 PM–6:00 AM).',
    growth:
      'Some technical roles offer regularization in as little as three months and quarterly performance bonuses, and security leads often report directly to U.S. managers. Mid-to-senior specialists seeking enterprise SIEM/SOAR stacks would likely outgrow it.',
    pros: [
      'The most hands-on security and compliance experience of the three.',
      'Generalist work means I would touch many systems early.',
      'Closest to home, with possible work-from-home after training.',
      'A professor I know works in its security team.',
    ],
    cons: [
      'Less direct cloud and network engineering, which is my main goal.',
      'Employee reviews on Glassdoor and Jobstreet describe outdated tools and tight software spending.',
      'A small security team leaves little room to specialise (e.g. red teaming, cloud-native DevSecOps).',
      'Entry-level pay (about ₱28,000–₱35,000 a month) is below MSSPs, banks and multinationals in BGC and Makati; night shifts are common.',
    ],
    scores: { profile: 3, industry: 3, reputation: 3, learning: 4, access: 4, growth: 3 },
    notes: {
      profile: 'Mid-sized; ISO/IEC 27001 certified',
      industry: 'Security/compliance strong; cloud and network secondary',
      reputation: 'Jobstreet: 74% recommend; reviews cite outdated tools',
      learning: 'Broad hands-on InfoSec and GRC',
      access: 'Nearest site; WFH after training, but night shifts',
      growth: 'Fast regularization; likely to outgrow it',
    },
  },
  {
    id: 'uratex',
    name: 'Uratex',
    legal: 'RGC Group of Companies',
    industry: 'Manufacturing (foam, mattresses, bedding, automotive parts, plastics, textiles)',
    background:
      'A Filipino manufacturing group founded in 1968 that runs 25 factories and 18 showrooms nationwide. IT here supports the manufacturing business rather than being the product.',
    location: 'Km 23 East Service Road, South Superhighway, Cupang, Muntinlupa (other sites in Laguna, Bulacan and Valenzuela)',
    learning: [
      'Open to AI-assisted development: public developer profiles list ChatGPT, Claude, Gemini and OpenCode alongside PHP, Vue.js, MySQL/PostgreSQL and SAP-connected APIs.',
      'The group promotes Microsoft 365 Copilot, Power Automate and intelligent workflows.',
      'Runs a customer-facing AI Furniture Designer that turns sketches into renders; leadership has pushed automation, robotics and software integration since 2017.',
    ],
    access:
      'The Muntinlupa site on the South Superhighway service road is reachable from San Pedro City. Which of the group’s many plants or offices an intern would be assigned to is unverified.',
    growth:
      'Good for application development, ERP integration and automation, but a less direct path to cloud or network engineering roles.',
    pros: [
      'Modern, AI-assisted development culture that matches how I already build.',
      'Real business systems (SAP ERP integrations, automation) at a large, stable company.',
      'A well-known Filipino brand with a long track record.',
    ],
    cons: [
      'Work leans toward app development and ERP, away from cloud and network infrastructure.',
      'No public engineering handbook or AI governance rules, so which AI tools are approved, and how AI-generated code is reviewed, is still an open question.',
      'Intern site assignment is unverified across many locations.',
    ],
    openQuestions: [
      'Which AI tools are approved and which are restricted, given proprietary manufacturing data, SAP ERP integrations and customer records?',
      'How is AI-generated code tested and reviewed, especially on legacy systems and SAP APIs?',
    ],
    scores: { profile: 4, industry: 2, reputation: 4, learning: 3, access: 4, growth: 2 },
    notes: {
      profile: 'Est. 1968; 25 factories, 18 showrooms',
      industry: 'Manufacturing; IT is a support function',
      reputation: 'Household brand; tech reputation less public',
      learning: 'AI-assisted dev, SAP, automation',
      access: 'Muntinlupa site; assignment unverified',
      growth: 'App/ERP path more than cloud/network',
    },
  },
];

// Weighted total on the same 1–5 scale.
export function weightedScore(company) {
  const total = criteria.reduce((sum, c) => sum + c.weight, 0);
  const s = criteria.reduce((sum, c) => sum + company.scores[c.id] * c.weight, 0) / total;
  return Math.round(s * 100) / 100;
}

export const recommendation = {
  choice: 'accenture',
  reasons: [
    'It scores highest on the three criteria I weighted most: learning opportunities, industry fit and career growth.',
    'It is the only one of the three where cloud and network engineering is everyday work, with funded certifications for AWS, Azure and Cisco.',
    'Its Alabang office keeps the commute from San Pedro City manageable, if that is where I am assigned.',
  ],
  tradeoffs:
    'I am choosing Accenture with its trade-offs in view: the training I get may follow client demand, and as an intern I may only see a small part of a large project. I will counter that by asking for cloud or network tasks and using the certification tracks on my own time.',
  runnerUp:
    'Civicom is my second choice. It would give me more hands-on security and compliance work and is the closest to home. If cybersecurity becomes my main track, it narrows the gap, but on my current goals it still trails because its cloud and network exposure is limited.',
  uratex:
    'Uratex is a good company for AI-assisted application development, but its IT work supports manufacturing rather than cloud or network infrastructure, so it fits my goals least. I would still ask its open AI-governance questions if I applied.',
  prepares:
    'Accenture would give me real exposure to multi-cloud environments, hybrid networking and enterprise security standards, plus a path to industry certifications. That is the foundation I need for an entry-level cloud or network engineering role.',
  nextSteps: [
    'Confirm with our OJT coordinator whether Accenture accepts interns from STI College Alabang, and at which site.',
    'Prepare the AWS fundamentals I already have into a short portfolio piece for the application.',
    'Keep Civicom as a backup application and ask my professor about intern openings in its security team.',
  ],
};

export const sources = [
  { label: 'Accenture Philippines', url: 'https://www.accenture.com/ph-en' },
  { label: 'Accenture opens Alabang office (BusinessWorld)', url: 'https://www.bworldonline.com/?p=245191' },
  { label: 'Accenture expands presence with new office in Alabang (Newsbytes.PH)', url: 'https://newsbytes.ph/2019/07/31/accenture-expands-presence-in-ph-with-new-office-in-alabang/' },
  { label: 'Accenture Network Engineer, Alabang site (Kalibrr)', url: 'https://www.kalibrr.com/id-ID/c/a-philippines/jobs/214311/network-engineer-alabang-site' },
  { label: 'Accenture reviews, Muntinlupa (Jobstreet)', url: 'https://ph.jobstreet.com/companies/accenture-168430182370928/reviews/locations/Muntinlupa-City-Metro-Manila' },
  { label: 'Civicom company profile (Jobstreet)', url: 'https://ph.jobstreet.com/companies/civicom-168553040947501' },
  { label: 'Civicom Pacific Corp. (Kalibrr)', url: 'https://www.kalibrr.com/id-ID/c/civicom-pacific-corp/jobs' },
  { label: 'Uratex: Our Story', url: 'https://uratex.com.ph/pages/our-story' },
  { label: 'Multiflex RNC Phil., Inc. (Uratex) office (Kalibrr)', url: 'https://www.kalibrr.id/c/uratex-1/jobs' },
  { label: 'Research notes: Accenture learning and development and job pages, “Living in the Cloud” case study, Cloud First training catalogue, LinkedIn post on the Accenture–AWS training launch, Reddit r/accenture and r/accenture_india' },
  { label: 'Research notes: Civicom careers page, LinkedIn job postings, Glassdoor and Jobstreet reviews, ISO 27001 press release' },
  { label: 'Research notes: Himalayas developer profile, Uratex website, Facebook posts and digitization blog' },
];
