// Default Data for Sakith Harvan Technologies

export const COMPANY_DETAILS = {
  name: "Sakith Harvan Technologies",
  tagline: "Innovate. Integrate. Elevate.",
  established: "July 2026",
  origin: "Narasaraopeta Engineering College (NEC)",
  positioning: "Sakith Harvan Technologies is a digital technology company providing enterprise SaaS products, custom software, websites, mobile applications, AI solutions, automation, UI/UX design, cloud and deployment services, technology workshops, bootcamps, and custom digital transformation solutions.",
  mission: "To build practical, reliable and scalable digital solutions that solve real-world problems.",
  vision: "To become a trusted technology partner for businesses and institutions through innovation, quality and long-term collaboration.",
  trustStatement: "From Idea to Deployment — We Build, Integrate and Support.",
  founders: [
    {
      id: "mh",
      name: "Maddi Harshavardhan",
      role: "Co-Founder & Technical Lead",
      phone: "+91 7981847745",
      phoneClean: "917981847745",
      email: "mharshavardhan048@gmail.com",
      portfolio: "https://maddiharshavardhan-portfolio.netlify.app",
      avatarBg: "from-blue-600 to-cyan-500",
      bio: "Leads technical architecture, AI solutions engineering, and system design."
    },
    {
      id: "sk",
      name: "Thoka Sai Krishna",
      role: "Co-Founder & Solutions Architect",
      phone: "+91 9014340739",
      phoneClean: "919014340739",
      email: "saikrishnathoka2526@gmail.com",
      avatarBg: "from-indigo-600 to-blue-500",
      bio: "Specializes in enterprise software delivery, full-stack systems, and client integrations."
    }
  ]
};

export const SERVICES_DATA = [
  {
    id: "saas",
    title: "Enterprise SaaS Solutions",
    subtitle: "Scalable, multi-tenant & specialized enterprise platforms",
    badge: "Core Enterprise Focus",
    description: "End-to-end cloud platforms designed to streamline business operations, workforce productivity, institutional management, and customer lifecycles.",
    items: [
      "ERP Systems",
      "CRM Solutions",
      "HRMS (Human Resource Management Systems)",
      "Student Information Systems (SIS)",
      "Learning Management Systems (LMS)",
      "Faculty Management Systems",
      "Attendance Management Systems",
      "Examination Management Systems",
      "Fee Management Systems",
      "Inventory Management Systems",
      "Asset Management Systems",
      "Hospital Management Systems",
      "Hotel Management Systems",
      "Business Management Platforms",
      "Workflow Automation Systems",
      "Multi-Tenant SaaS Platforms",
      "Subscription-Based Platforms",
      "Custom Enterprise Software"
    ]
  },
  {
    id: "web",
    title: "Custom Website Development",
    subtitle: "Bespoke, high-performance web applications & portals",
    badge: "If You Can Imagine It, We Can Build It",
    marketingStatement: "We can build any type of website based on your business model and requirements. If you can imagine it, we can build it.",
    description: "Ultra-fast, responsive, secure and search-engine optimized websites engineered to convert visitors into loyal clients and users.",
    items: [
      "Corporate Websites",
      "Business Websites",
      "Startup Websites",
      "Educational Websites",
      "School & College Websites",
      "E-Commerce Websites",
      "Marketplace Platforms",
      "Portfolio Websites",
      "Personal Branding Websites",
      "Healthcare Websites",
      "Hospital Websites",
      "Real Estate Websites",
      "Hotel & Hospitality Websites",
      "Restaurant Websites",
      "NGO Websites",
      "News & Media Portals",
      "Membership Websites",
      "Event Websites",
      "Booking & Reservation Websites",
      "Job Portals",
      "Consultancy Websites",
      "Custom Web Applications",
      "Landing Pages",
      "Progressive Web Applications (PWAs)"
    ]
  },
  {
    id: "mobile",
    title: "Mobile Application Development",
    subtitle: "Native performance & sleek UI across iOS and Android",
    badge: "Cross-Platform Mobility",
    description: "Custom mobile experiences engineered with native speed, real-time push notifications, offline capability, and intuitive UX.",
    items: [
      "Android Applications",
      "iOS Applications",
      "Cross-Platform Applications",
      "Enterprise Mobile Applications",
      "Educational Applications",
      "Business Applications",
      "Customer Applications",
      "Internal Employee Applications"
    ]
  },
  {
    id: "ai",
    title: "AI & Intelligent Automation",
    subtitle: "Agentic workflows, GenAI, RAG & voice intelligence",
    badge: "Next-Gen AI Engineering",
    description: "Transform operations with intelligent agents, automated document workflows, voice assistants, and custom RAG knowledge systems.",
    items: [
      "AI Chatbots",
      "AI Voice Agents",
      "Agentic AI Solutions",
      "Business Automation",
      "Document Processing",
      "Customer Support Automation",
      "AI Recommendation Systems",
      "Knowledge Assistants",
      "Workflow Automation",
      "RAG Applications",
      "Custom AI Solutions"
    ]
  },
  {
    id: "uiux",
    title: "UI/UX Design",
    subtitle: "User-centered design systems & interactive prototypes",
    badge: "High-End Aesthetics",
    description: "Frictionless, beautiful visual design and seamless user journeys crafted for modern web apps, dashboards, and enterprise platforms.",
    items: [
      "User Research",
      "Wireframing",
      "Prototyping",
      "Website UI Design",
      "Mobile App UI Design",
      "Dashboard Design",
      "Admin Panel Design",
      "Enterprise Software UI",
      "Design Systems",
      "Usability-focused Design"
    ]
  },
  {
    id: "cloud",
    title: "Cloud & Deployment",
    subtitle: "High-availability cloud infrastructure & 24/7 reliability",
    badge: "DevOps & Infrastructure",
    description: "Secure deployment pipelines, cloud provisioning (Azure/AWS), database optimization, monitoring, and automated disaster recovery.",
    items: [
      "Cloud Deployment",
      "Server Configuration",
      "Database Management",
      "Application Deployment",
      "Security Implementation",
      "Performance Optimization",
      "Backup & Disaster Recovery",
      "Maintenance",
      "Software Updates",
      "Infrastructure Support"
    ]
  }
];

export const INITIAL_PRODUCTS = [
  {
    id: "prod-1",
    name: "CampX — Digital Campus Ecosystem",
    category: "Campus ERP & Education",
    shortDescription: "Unified cloud ERP platform connecting student lifecycle, faculty workflows, attendance, fees, and examination operations.",
    problem: "Educational institutions struggle with fragmented software systems, manual paper attendance, delayed fee reconciliations, and inefficient faculty workload tracking.",
    keyFeatures: [
      "Real-time Automated Student Attendance & SMS Notifications",
      "Faculty Workload & Timetable Scheduling Engine",
      "Integrated Online Fee Payment Gateway & Ledger",
      "Student Information System (SIS) & Parent Portal",
      "Examination Result Generation & Transcript Management"
    ],
    targetUsers: "Colleges, Universities, Autonomous Institutions, School Groups",
    benefits: "Reduces administrative workload by 70%, eliminates paper logs, and gives management real-time analytical dashboards.",
    tag: "Enterprise SaaS",
    status: "Active"
  },
  {
    id: "prod-2",
    name: "FacultyTracker Pro",
    category: "Faculty & Workforce Management",
    shortDescription: "Specialized academic workforce scheduling, lesson plan tracker, research output logger, and performance analytics system.",
    problem: "Department heads lack visibility into ongoing class progress, syllabus completion rates, and faculty research achievements.",
    keyFeatures: [
      "Dynamic Class & Lab Schedule Allocator",
      "Daily Syllabus Tracker & Digital Logbook",
      "Research Paper & Patent Portfolio Management",
      "Automated Monthly Performance & Feedback Summaries"
    ],
    targetUsers: "Engineering Colleges, Degree Institutions, University Departments",
    benefits: "Ensures 100% curriculum compliance and simplifies NAAC/NIRF accreditation documentation.",
    tag: "Academic Management",
    status: "Active"
  },
  {
    id: "prod-3",
    name: "AttendEase Smart Attendance",
    category: "Attendance Management",
    shortDescription: "Multi-modal attendance tracker supporting biometric integration, mobile geolocation, QR check-ins, and biometric verification.",
    problem: "Proxy attendance, slow manual roll calls, and delayed attendance reporting to parents and department heads.",
    keyFeatures: [
      "Instant Mobile QR & Geofence Check-Ins",
      "Parent WhatsApp / SMS Absence Alerts",
      "Biometric Hardware Integration APIs",
      "Condonation & Shortage Warning Calculation"
    ],
    targetUsers: "Institutions, Corporate Offices, Manufacturing Units",
    benefits: "Saves 15 minutes per lecture session and maintains audit-ready attendance records.",
    tag: "Biometric & Mobile",
    status: "Active"
  },
  {
    id: "prod-4",
    name: "BizFlow Automation Platform",
    category: "Workflow Automation",
    shortDescription: "Visual low-code workflow orchestration engine designed to automate multi-departmental business processes.",
    problem: "Manual email approvals, disconnected SaaS tools, and slow document processing delay business execution.",
    keyFeatures: [
      "Custom Visual Trigger & Action Builder",
      "Document AI & Invoice Data Extraction",
      "Multi-level Approval Routing",
      "Third-party API & ERP Webhook Connectors"
    ],
    targetUsers: "SMBs, Enterprises, Logistics Companies, Financial Services",
    benefits: "Accelerates turnaround times from days to minutes while eliminating human entry errors.",
    tag: "AI & Automation",
    status: "Active"
  }
];

export const INITIAL_WORKSHOPS = [
  {
    id: "ws-1",
    title: "Cloud Azure Enterprise Architecture",
    category: "Cloud Azure",
    description: "Deep dive into enterprise cloud computing on Microsoft Azure, resource group architecture, virtual networks, deployment pipelines, and compliance.",
    learn: "Azure Resource Manager, Virtual Networks, Azure App Service, Key Vaults, Storage Accounts, and CI/CD deployment pipelines.",
    whoShouldAttend: "CS/IT Students, Cloud Engineers, DevOps Enthusiasts, Faculty Members",
    minDays: "3 Days",
    mode: "Offline / Hybrid / Hands-on",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-2",
    title: "Artificial Intelligence Foundations & Neural Networks",
    category: "AI",
    description: "Core artificial intelligence fundamentals, machine learning algorithms, deep learning neural networks, and model optimization.",
    learn: "Machine Learning Math, Neural Network Architectures, Loss Functions, Model Evaluation, and PyTorch / TensorFlow.",
    whoShouldAttend: "CS/IT Students, ML Aspirants, AI Researchers",
    minDays: "3 Days",
    mode: "Hands-on Practical",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-3",
    title: "Claude Architecture & LLM Engineering",
    category: "Claude Architecture",
    description: "Master architecting production applications with Anthropic's Claude models, advanced prompt engineering, custom system prompts, and API integration.",
    learn: "Claude 3.5 Sonnet APIs, System Prompts, Structured JSON Outputs, Function Calling, and Context Window Management.",
    whoShouldAttend: "Developers, AI Enthusiasts, Final Year Project Students",
    minDays: "2 Days",
    mode: "Hands-on Practical",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-4",
    title: "Git and GitHub Production Version Control",
    category: "Git and GitHub",
    description: "Master industry-standard version control, advanced branching models, pull request reviews, and GitHub Actions CI/CD workflows.",
    learn: "Git Internals, Rebase vs Merge, Merge Conflict Resolution, Pull Request Best Practices, and GitHub Actions.",
    whoShouldAttend: "1st & 2nd Year Engineering Students, Beginners, Junior Developers",
    minDays: "1 Day",
    mode: "Hands-on Workshop",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-5",
    title: "Agentic AI & Autonomous Agent Systems",
    category: "Agentic AI",
    description: "Architect multi-agent autonomous workflows, reasoning frameworks, tool execution loops, and long-term memory orchestration.",
    learn: "LangGraph, Autogen, Tool Calling, Agent State Machines, Memory Vector Stores, and Autonomous Task Breakdown.",
    whoShouldAttend: "Advanced Developers, AI Researchers, Innovation Teams",
    minDays: "3 Days",
    mode: "Advanced Bootcamp",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-6",
    title: "Python for Data Science (NumPy, Pandas)",
    category: "Python (NumPy, Pandas)",
    description: "High-performance scientific computing using NumPy multidimensional arrays and structured data manipulation with Pandas.",
    learn: "NumPy Vectorization, Pandas DataFrames, Data Cleaning, GroupBy Aggregations, Exploratory Analysis, and File I/O.",
    whoShouldAttend: "Data Science Aspirants, Engineering Students, Faculty",
    minDays: "2 Days",
    mode: "Practical Coding",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-7",
    title: "AI Voice Agent Building with Pipecat Framework",
    category: "AI Voice Agent Building",
    description: "Build real-time conversational voice agents, low-latency audio streaming pipelines, and WebRTC streaming using the Pipecat framework.",
    learn: "Speech-to-Text (STT), LLM Inference, Text-to-Speech (TTS), WebRTC Audio Transport, and Low-Latency Tuning.",
    whoShouldAttend: "AI Developers, Product Architects, Capstone Project Teams",
    minDays: "3 Days",
    mode: "Advanced Lab",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-8",
    title: "Generative AI & RAG Application Development",
    category: "Generative AI",
    description: "End-to-end Generative AI principles, vector databases, RAG (Retrieval-Augmented Generation), and embedding pipelines.",
    learn: "Embeddings, Vector DBs (Chroma/Pinecone), RAG Chunking Strategies, Hallucination Prevention, and LLM Orchestration.",
    whoShouldAttend: "Software Developers, Machine Learning Engineers, Students",
    minDays: "2 Days",
    mode: "Hands-on Lab",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-9",
    title: "Vibe Coding & AI-Assisted Rapid Development",
    category: "Vibe Coding",
    description: "Learn flow-state programming, AI pair programming, prompt-driven prototyping, and 10x developer productivity strategies.",
    learn: "AI Code Generators, System Prompting for Developers, Architecture Specs to Code, Refactoring & Test Generation.",
    whoShouldAttend: "Students, Developers, Startup Founders",
    minDays: "1 Day",
    mode: "Interactive Sprint",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-10",
    title: "N8N Workflow Automation & Low-Code Pipelines",
    category: "N8N Workflow Automation",
    description: "Node-based workflow automation, complex API integrations, custom webhook listeners, and self-hosted automation server setup.",
    learn: "N8N Node Architecture, Webhooks, API Authentication, Error Handling Loops, and Self-Hosted Cloud Deployment.",
    whoShouldAttend: "Automation Consultants, System Integrators, IT Professionals",
    minDays: "2 Days",
    mode: "Practical Automation",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-11",
    title: "Java Full Stack Enterprise Engineering",
    category: "Java Full Stack",
    description: "Core Java, OOP principles, Spring Boot microservices REST APIs, JPA/Hibernate ORM, and modern React frontend integration.",
    learn: "Core Java, Spring Boot, REST APIs, Security, Hibernate/JPA, Database Integration, and Microservice Architecture.",
    whoShouldAttend: "Job Seekers, CS/IT Students, Corporate Trainees",
    minDays: "5 Days",
    mode: "Comprehensive Bootcamp",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-12",
    title: "MERN Stack Application Development",
    category: "MERN Stack",
    description: "Full-stack JavaScript development utilizing MongoDB database, Express.js backend, React components, and Node.js runtime environment.",
    learn: "MongoDB Schema Design, Express REST Routing, React State & Hooks, JWT Authentication, and Cloud Hosting.",
    whoShouldAttend: "Web Developers, CS/IT Undergraduates, Software Trainees",
    minDays: "5 Days",
    mode: "Comprehensive Bootcamp",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-13",
    title: "Modern Web Development & Responsive UI",
    category: "Web Development",
    description: "Semantic HTML5, CSS Grid/Flexbox layouts, asynchronous JavaScript (ES6+), DOM manipulation, and responsive UX design.",
    learn: "CSS Grid/Flexbox, Async/Await APIs, Responsive Layout Patterns, Web Performance & Accessibility.",
    whoShouldAttend: "Beginners, Non-CS Engineers, Front-End Aspirants",
    minDays: "3 Days",
    mode: "Foundation Bootcamp",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  },
  {
    id: "ws-14",
    title: "UI/UX Designing Systems & High-Fidelity Figma",
    category: "UI/UX Designing",
    description: "User-centered design principles, wireframing, interactive prototyping, Figma design systems, component libraries, and usability testing.",
    learn: "User Persona Creation, Wireframing, Figma Auto Layout, Prototyping Interactions, and Design System Components.",
    whoShouldAttend: "Designers, Product Managers, UI Developers, Students",
    minDays: "2 Days",
    mode: "Design Studio Lab",
    upcomingDates: "Available for Custom Institutional Scheduling",
    seats: "Custom Slot Capacity"
  }
];

export const VALUE_PILLARS = [
  {
    title: "Custom-Built Solutions",
    description: "No generic templates or rigid off-the-shelf limits. We architect every system precisely to match your organizational workflow."
  },
  {
    title: "Business-Focused Development",
    description: "We don't just write code; we design products aligned with revenue generation, operational efficiency, and scalable growth."
  },
  {
    title: "Scalable Architecture",
    description: "Built on high-throughput microservices, robust cloud databases, and clean modular codebases that grow with your user base."
  },
  {
    title: "Modern User Experience",
    description: "Frictionless, beautiful UI designs engineered for high engagement, intuitive navigation, and zero learning curve."
  },
  {
    title: "Security-Focused Development",
    description: "Strict data privacy, encrypted credentials, secure API endpoints, role-based access control, and compliance readiness."
  },
  {
    title: "End-to-End Delivery",
    description: "We handle requirement analysis, UX design, full-stack engineering, cloud deployment, and post-launch maintenance under one roof."
  },
  {
    title: "Transparent Communication",
    description: "Direct founder access with regular progress updates, interactive staging previews, and clear project milestones."
  },
  {
    title: "Long-Term Technical Support",
    description: "We remain your ongoing technology partner, offering maintenance SLAs, infrastructure updates, and feature enhancements."
  },
  {
    title: "Flexible Engagement Models",
    description: "Customized project pricing, milestone-based contracts, or dedicated technology team arrangements."
  },
  {
    title: "Continuous Innovation",
    description: "Integrating the latest breakthroughs in Agentic AI, Cloud infrastructure, and modern web standards into your products."
  }
];

export const INDUSTRIES_LIST = [
  { name: "Education", desc: "Colleges, Universities, Schools, EdTech & Academic Portals" },
  { name: "Healthcare", desc: "Hospitals, Clinics, Diagnostic Labs & Telehealth Platforms" },
  { name: "Retail & E-Commerce", desc: "D2C Stores, Marketplaces & Digital Inventory Systems" },
  { name: "Hospitality & Tourism", desc: "Hotels, Resorts, Booking Engine & Guest Portals" },
  { name: "Real Estate", desc: "Property Portals, CRM & Agent Management Systems" },
  { name: "Manufacturing", desc: "Resource Planning, Inventory Logs & Automation Workflows" },
  { name: "Finance & Fintech", desc: "Payment Gateways, Ledger SaaS & Financial Dashboards" },
  { name: "Professional Services", desc: "Consultancies, Law Firms, Agencies & Client Portals" },
  { name: "Startups", desc: "MVPs, SaaS Platforms, Mobile Apps & Rapid Prototypes" },
  { name: "Small & Medium Businesses", desc: "Digital Transformation, Web Portals & Custom Apps" },
  { name: "Enterprises", desc: "ERP Engineering, System Integrations & Custom Software" },
  { name: "Government & Organizations", desc: "Public Portals, Citizen Engagement & Custom Databases" }
];

export const WORKFLOW_STEPS = [
  { step: "01", title: "Understand", desc: "In-depth requirement discovery, business goal mapping, and technical feasibility analysis." },
  { step: "02", title: "Plan", desc: "Scope definition, feature breakdown, database architecture design, and milestone roadmap." },
  { step: "03", title: "Design", desc: "Crafting wireframes, high-fidelity UI mockups, interactive prototypes, and design tokens." },
  { step: "04", title: "Build", desc: "Agile full-stack engineering, API construction, database modeling, and AI integration." },
  { step: "05", title: "Test", desc: "Rigorous quality assurance, load testing, security auditing, and cross-device validation." },
  { step: "06", title: "Deploy", desc: "Production launch, cloud server provisioning, SSL setup, and domain DNS routing." },
  { step: "07", title: "Support", desc: "Continuous monitoring, security patches, feature upgrades, and technical SLA support." }
];

export const INITIAL_LEADS = [
  {
    id: "LEAD-1001",
    name: "Dr. K. Ramanathan",
    organization: "Apex Group of Institutions",
    email: "k.ramanathan@apexedu.in",
    phone: "+91 9845012345",
    requirementType: "Campus ERP & SIS Portal",
    details: "Looking for an integrated student information system and faculty tracker for 3 campus branches.",
    timeline: "1–3 months",
    preferredMethod: "Video Meeting",
    status: "Requirement Discussed",
    assignedMember: "Maddi Harshavardhan",
    createdAt: "2026-08-05"
  },
  {
    id: "LEAD-1002",
    name: "Sandeep Varma",
    organization: "NexGen Logistics",
    email: "sandeep@nexgenlogistics.com",
    phone: "+91 9701122334",
    requirementType: "Workflow Automation & AI",
    details: "Need an automated document processing AI solution for invoice data extraction.",
    timeline: "Within 1 month",
    preferredMethod: "In-person Meeting",
    status: "Proposal Sent",
    assignedMember: "Thoka Sai Krishna",
    createdAt: "2026-08-06"
  }
];

export const INITIAL_CONSULTATIONS = [
  {
    id: "CNS-2001",
    clientName: "Priya Sharma",
    organization: "HealthCare Plus",
    email: "priya@healthcareplus.org",
    phone: "+91 9123456789",
    type: "ERP / Enterprise Software",
    date: "2026-08-12",
    timeSlot: "11:00 AM",
    duration: "45 mins",
    method: "Online",
    assignedMember: "Maddi Harshavardhan",
    status: "Scheduled",
    summary: "Discussion regarding hospital management system requirements."
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: "REG-3001",
    type: "Individual",
    participantName: "B. Venkatesh",
    email: "venkatesh.b@gmail.com",
    phone: "+91 9988776655",
    institution: "NEC Engineering College",
    role: "3rd Year Student",
    workshopTitle: "Agentic AI & Autonomous Agent Systems",
    preferredDate: "2026-08-20",
    mode: "Offline",
    participantsCount: 1,
    createdAt: "2026-08-07"
  }
];

export const INITIAL_TEAM_MEMBERS = [
  {
    id: "CEO-01",
    name: "Maddi Harshavardhan",
    role: "Co-Founder & CEO / Technical Lead",
    type: "Founder & CEO",
    email: "mharshavardhan048@gmail.com",
    phone: "+91 7981847745",
    joinedDate: "2026-07-01",
    status: "Active",
    isExecutive: true
  },
  {
    id: "FOUNDER-02",
    name: "Thoka Sai Krishna",
    role: "Co-Founder & Solutions Architect",
    type: "Founder & Executive",
    email: "saikrishnathoka2526@gmail.com",
    phone: "+91 9014340739",
    joinedDate: "2026-07-01",
    status: "Active",
    isExecutive: true
  },
  {
    id: "EMP-101",
    name: "K. Ramesh Kumar",
    role: "Senior Full Stack Engineer",
    type: "Employee",
    email: "ramesh.kumar@sakithharvan.com",
    phone: "+91 9848022334",
    joinedDate: "2026-07-15",
    status: "Active"
  },
  {
    id: "EMP-102",
    name: "Ananya Sharma",
    role: "Lead UI/UX & Frontend Architect",
    type: "Employee",
    email: "ananya.s@sakithharvan.com",
    phone: "+91 9848033445",
    joinedDate: "2026-07-20",
    status: "Active"
  },
  {
    id: "INT-201",
    name: "V. Sai Teja",
    role: "AI/ML Solutions Intern",
    type: "Intern",
    email: "saiteja.intern@sakithharvan.com",
    phone: "+91 9100234567",
    joinedDate: "2026-08-01",
    status: "Active"
  },
  {
    id: "INT-202",
    name: "P. Meghana",
    role: "Web & SaaS Development Intern",
    type: "Intern",
    email: "meghana.p@sakithharvan.com",
    phone: "+91 9100345678",
    joinedDate: "2026-08-05",
    status: "Active"
  }
];

export const INITIAL_ASSIGNED_TASKS = [
  {
    id: "TSK-5001",
    memberId: "EMP-101",
    memberName: "K. Ramesh Kumar",
    memberRole: "Senior Full Stack Engineer",
    memberType: "Employee",
    title: "Campus ERP Fee Management Module & Payment Gateway Integration",
    description: "Develop the complete fee payment microservice with Razorpay integration and instant receipt PDF generation for college ERP.",
    assignedDate: "2026-08-15",
    dueDate: "2026-08-30",
    priority: "High",
    status: "In Progress",
    progress: 75,
    completedWorkNotes: "Implemented database migrations, webhook handlers, and backend endpoints. Currently testing end-to-end receipt generation in staging.",
    completedDate: "",
    deliverableUrl: "https://github.com/sakith-harvan/erp-fee-service"
  },
  {
    id: "TSK-5002",
    memberId: "EMP-102",
    memberName: "Ananya Sharma",
    memberRole: "Lead UI/UX & Frontend Architect",
    memberType: "Employee",
    title: "SaaS Mobile App Responsive UI Audit & Dark Mode System",
    description: "Refactor student attendance and timetable dashboards for ultra-smooth responsiveness and WCAG AA color accessibility.",
    assignedDate: "2026-08-18",
    dueDate: "2026-08-25",
    priority: "Medium",
    status: "Completed",
    progress: 100,
    completedWorkNotes: "Completed full Figma tokens conversion and React Tailwind theme switchers. Deployed to preview branch and passed review.",
    completedDate: "2026-08-24",
    deliverableUrl: "https://figma.com/file/sakith-harvan-design-system"
  },
  {
    id: "TSK-5003",
    memberId: "INT-201",
    memberName: "V. Sai Teja",
    memberRole: "AI/ML Solutions Intern",
    memberType: "Intern",
    title: "Agentic AI Workshop Lab Scripts & LLM Pipeline Notebooks",
    description: "Prepare and verify Google Gemini API starter scripts and LangChain autonomous agent demonstrations for upcoming college workshops.",
    assignedDate: "2026-08-20",
    dueDate: "2026-09-02",
    priority: "High",
    status: "In Progress",
    progress: 60,
    completedWorkNotes: "Completed 3 out of 5 Jupyter notebooks with API key setup and memory tools. Working on RAG vector store notebook.",
    completedDate: "",
    deliverableUrl: "https://colab.research.google.com/sakith-harvan-ai-lab"
  },
  {
    id: "TSK-5004",
    memberId: "INT-202",
    memberName: "P. Meghana",
    memberRole: "Web & SaaS Development Intern",
    memberType: "Intern",
    title: "Client Requirement Inquiry Validation & Email Template Formatter",
    description: "Build clean HTML email response templates for instant auto-acknowledgment when clients book consultations.",
    assignedDate: "2026-08-22",
    dueDate: "2026-08-29",
    priority: "Medium",
    status: "In Progress",
    progress: 40,
    completedWorkNotes: "Created 2 responsive templates in HTML/CSS with brand logo and typography. Testing email client compatibility across Outlook and Gmail.",
    completedDate: "",
    deliverableUrl: ""
  }
];

