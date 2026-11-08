// Course of Career (COC) Store & State Management
// By Sakith Harvan Technologies - "From Your College Journey to a Brighter Career"
// Runs alongside college with flexible year progression, admin pricing, and 3-day trial access.

export const INITIAL_COC_COURSES = [
  {
    id: 'coc-fsd',
    code: 'FSD',
    title: 'Full Stack Web & Cloud Development (MERN + Next.js)',
    shortTitle: 'Full Stack Development (FSD)',
    category: 'Web & Cloud',
    badge: 'High Industry Demand',
    tagline: 'Build Production-Grade SaaS, Real-Time Dashboards & Microservices',
    duration: '6 Months (Flexible with College)',
    hoursPerWeek: '6-8 Hours',
    rating: '4.9/5 (180+ Reviews)',
    price: 6999,
    originalPrice: 15999,
    trialDays: 3,
    description: 'A complete end-to-end industry course engineered to take college students from zero web fundamentals to deploying scalable, secure, and production-ready enterprise SaaS web apps.',
    targetRoles: ['Full Stack Developer', 'Frontend Engineer', 'Backend API Specialist', 'MERN Stack Developer'],
    yearRelevance: {
      '1st Year': 'Build core programming foundations in JavaScript, modern HTML5/CSS3, responsive UI design.',
      '2nd Year': 'Master React 18, Node.js REST APIs, database modeling in PostgreSQL & MongoDB.',
      '3rd Year': 'Next.js App Router, Microservices, JWT/OAuth, real-world live project architecture.',
      '4th Year': 'Portfolio development, production cloud deployment, system design, mock interviews.'
    },
    modules: [
      { module: 'Module 1', title: 'Modern JavaScript & Frontend Mastery', topics: 'ES6+, Asynchronous JS, Promises, DOM, TailwindCSS, Responsive Mobile-First Design' },
      { module: 'Module 2', title: 'React 18 & Component Engineering', topics: 'Hooks, Custom Hooks, State Management, API integration, Performance Optimization' },
      { module: 'Module 3', title: 'Backend APIs with Node.js & Express', topics: 'REST Architecture, Middleware, Error Handling, Authentication, Rate Limiting' },
      { module: 'Module 4', title: 'Databases: PostgreSQL & MongoDB', topics: 'Schema Design, Normalization, Query Optimization, Prisma ORM, Mongoose, Transactions' },
      { module: 'Module 5', title: 'Full Stack SaaS & Next.js Architecture', topics: 'Next.js 14+, SSR, SSG, Server Actions, Stripe/Razorpay Webhooks, Security (CORS, CSRF)' },
      { module: 'Module 6', title: 'Cloud Deployment, CI/CD & Capstone', topics: 'Docker Containers, Vercel/AWS Hosting, CI/CD Pipelines, Live Production Launch' }
    ],
    projects: [
      'Multi-Tenant School/College Management SaaS Platform',
      'Real-Time Collaborative Code Editor with WebSockets',
      'E-Commerce Marketplace with Secure Payment Gateway & Order Tracking'
    ],
    tools: ['React', 'Next.js', 'Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'TailwindCSS', 'Docker', 'Git/GitHub'],
    trialLessons: [
      { day: 1, title: 'Day 1: Full Stack Architecture & Modern JS Engine', duration: '45 mins', type: 'Interactive Video & Code Lab', preview: 'Understand the request-response cycle, V8 engine internals, and build your first clean async API consumer.' },
      { day: 2, title: 'Day 2: React Component Hierarchy & State Patterns', duration: '55 mins', type: 'Hands-on Builder Challenge', preview: 'Construct a reusable component system with TailwindCSS and connect to a mock REST server.' },
      { day: 3, title: 'Day 3: Backend API Scaffold & Database Schema Blueprint', duration: '60 mins', type: 'Live Project Milestone', preview: 'Design your own enterprise relational schema and write production-grade Express endpoints.' }
    ]
  },
  {
    id: 'coc-aiml',
    code: 'AI&ML',
    title: 'Artificial Intelligence & Machine Learning Specialization',
    shortTitle: 'AI & Machine Learning (AI&ML)',
    category: 'Artificial Intelligence',
    badge: 'Next-Gen Focus',
    tagline: 'From Python & Neural Networks to Generative AI & Enterprise LLMs',
    duration: '6 Months (Flexible alongside College)',
    hoursPerWeek: '6-8 Hours',
    rating: '4.95/5 (210+ Reviews)',
    price: 8999,
    originalPrice: 19999,
    trialDays: 3,
    description: 'Transform from a college student learning theory to an AI practitioner who trains neural nets, builds computer vision pipelines, and builds real-world GenAI/RAG applications.',
    targetRoles: ['AI/ML Engineer', 'Data Scientist', 'LLM Application Developer', 'Computer Vision Specialist'],
    yearRelevance: {
      '1st Year': 'Python programming, NumPy, scientific computing, basic mathematics of data.',
      '2nd Year': 'Scikit-Learn, data visualization, exploratory data analysis, predictive statistical models.',
      '3rd Year': 'Deep Learning with PyTorch, CNNs, NLP, Transfer Learning, Hugging Face ecosystem.',
      '4th Year': 'GenAI, LangChain, RAG architecture, LLM fine-tuning, AI capstone, tech interviews.'
    },
    modules: [
      { module: 'Module 1', title: 'Applied Python & Data Engineering', topics: 'Advanced Python, NumPy matrix algebra, Pandas data manipulation, data wrangling' },
      { module: 'Module 2', title: 'Classical Machine Learning Algorithms', topics: 'Supervised & Unsupervised Learning, Regression, Random Forests, XGBoost, Model Metrics' },
      { module: 'Module 3', title: 'Deep Learning with PyTorch', topics: 'Tensors, Autograd, Multi-Layer Perceptrons, Loss functions, Optimizers (Adam, SGD)' },
      { module: 'Module 4', title: 'Computer Vision & Natural Language', topics: 'Convolutional Neural Nets, Transfer Learning (ResNet), Tokenization, Word Embeddings, Transformers' },
      { module: 'Module 5', title: 'Generative AI, LLMs & RAG Systems', topics: 'OpenAI/Claude APIs, Hugging Face, LangChain, Vector Databases (Pinecone/Chroma), RAG Pipelines' },
      { module: 'Module 6', title: 'Production AI Deployment & MLOps', topics: 'FastAPI model serving, Dockerizing AI apps, AWS/GCP inference endpoints, monitoring drift' }
    ],
    projects: [
      'Enterprise Document Intelligence RAG Engine (Query PDFs, Contracts & Reports)',
      'Automated Medical Image Diagnostics Classifier with PyTorch',
      'Real-Time Customer Sentiment & Churn Prediction System'
    ],
    tools: ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'FastAPI', 'Hugging Face', 'Docker', 'Pandas', 'NumPy'],
    trialLessons: [
      { day: 1, title: 'Day 1: Mathematical Foundations & Data Vectors', duration: '50 mins', type: 'Interactive Notebook', preview: 'Explore multidimensional tensors and matrix multiplication visually.' },
      { day: 2, title: 'Day 2: Training Your First Predictive Neural Network', duration: '60 mins', type: 'Code Clinic', preview: 'Build and train a 3-layer neural network with PyTorch from scratch.' },
      { day: 3, title: 'Day 3: Building a Simple Generative AI & RAG Agent', duration: '65 mins', type: 'Live Project Demo', preview: 'Feed custom data to an LLM using vector embeddings and prompt engineering.' }
    ]
  },
  {
    id: 'coc-cyber',
    code: 'CYBER',
    title: 'Cybersecurity, Ethical Hacking & SOC Defense',
    shortTitle: 'Cyber Security',
    category: 'Information Security',
    badge: 'Critical Defense',
    tagline: 'Master Ethical Hacking, Vulnerability Assessment & Enterprise Defense',
    duration: '5 Months (Runs Alongside College)',
    hoursPerWeek: '6 Hours',
    rating: '4.88/5 (140+ Reviews)',
    price: 7999,
    originalPrice: 17999,
    trialDays: 3,
    description: 'Gain practical offensive and defensive security skills. Learn how hackers breach applications, conduct penetration testing, remediate vulnerabilities, and defend enterprise systems.',
    targetRoles: ['Cyber Security Analyst', 'Penetration Tester (Ethical Hacker)', 'SOC Analyst', 'Security Engineer'],
    yearRelevance: {
      '1st Year': 'Computer networks, Linux command mastery, protocols (TCP/IP, DNS, HTTP/S).',
      '2nd Year': 'Web security fundamentals, OWASP Top 10 vulnerabilities, cryptography basics.',
      '3rd Year': 'Network penetration testing, Burp Suite, privilege escalation, Metasploit labs.',
      '4th Year': 'SOC monitoring, SIEM log analysis, digital forensics, security compliance, certifications.'
    },
    modules: [
      { module: 'Module 1', title: 'Network Architecture & Linux Hardening', topics: 'Subnetting, Port scanning, Packet analysis with Wireshark, Bash security automation' },
      { module: 'Module 2', title: 'Web Application Security & OWASP Top 10', topics: 'SQL Injection, Cross-Site Scripting (XSS), IDOR, CSRF, Authentication bypass' },
      { module: 'Module 3', title: 'Penetration Testing & Exploit Frameworks', topics: 'Vulnerability assessment with Nessus/OpenVAS, Metasploit, Nmap, Burp Suite Pro' },
      { module: 'Module 4', title: 'Defensive Security & SOC Operations', topics: 'SIEM platforms (Splunk/Wazuh), Log correlation, Incident response, Threat hunting' },
      { module: 'Module 5', title: 'Cloud Security & Compliance Frameworks', topics: 'AWS/Azure IAM security, Container security, Zero Trust architecture, ISO 27001' }
    ],
    projects: [
      'Comprehensive Penetration Testing Audit on a Simulated Banking Portal',
      'Automated Vulnerability Scanner & Notification Bot in Python',
      'Enterprise SOC Incident Response Playbook & Threat Triage Simulation'
    ],
    tools: ['Kali Linux', 'Burp Suite', 'Wireshark', 'Metasploit', 'Nmap', 'Splunk', 'Python', 'OWASP ZAP'],
    trialLessons: [
      { day: 1, title: 'Day 1: Hacker Mindset & Network Packet Reconnaissance', duration: '45 mins', type: 'Hands-on Lab', preview: 'Sniff and dissect live network packets using Wireshark.' },
      { day: 2, title: 'Day 2: Dissecting OWASP Vulnerabilities (SQLi & XSS)', duration: '55 mins', type: 'Interactive Exploit Lab', preview: 'Understand how malicious payloads inject into insecure web inputs and fix them.' },
      { day: 3, title: 'Day 3: Setting Up a Defended Security Perimeter', duration: '50 mins', type: 'Blue Team Workshop', preview: 'Configure firewall rules and intrusion detection alerts to block live attacks.' }
    ]
  },
  {
    id: 'coc-dsa',
    code: 'DSA',
    title: 'Data Structures, Algorithms & Competitive Programming (DSA)',
    shortTitle: 'DSA Masterclass',
    category: 'Core Computer Science',
    badge: 'Interview Essential',
    tagline: 'Crack Top Tier Product Companies (FAANG & High-Growth Startups)',
    duration: '4 Months (Intensive & College-Friendly)',
    hoursPerWeek: '6-8 Hours',
    rating: '4.92/5 (320+ Reviews)',
    price: 4999,
    originalPrice: 12999,
    trialDays: 3,
    description: 'Transform your problem-solving intuition. Solve 300+ hand-picked LeetCode problems across all major patterns with expert mentors in Java, C++, or Python.',
    targetRoles: ['Software Development Engineer (SDE I)', 'Backend Systems Engineer', 'Competitive Programmer'],
    yearRelevance: {
      '1st Year': 'Solidify programming logic, time/space complexity (Big-O), recursion basics.',
      '2nd Year': 'Arrays, Strings, HashMaps, Two Pointers, Stacks, Queues, Linked Lists.',
      '3rd Year': 'Trees, BST, Heaps, Graphs, Dijkstra, Dynamic Programming (1D & 2D).',
      '4th Year': 'Company-specific interview patterns, timed mock contests, system design primers.'
    },
    modules: [
      { module: 'Module 1', title: 'Time & Space Complexity & Foundations', topics: 'Asymptotic notation, recursion tree methods, bit manipulation, math for coding' },
      { module: 'Module 2', title: 'Linear Structures & Algorithmic Patterns', topics: 'Sliding window, two pointers, prefix sums, fast & slow pointers, monotonic stacks' },
      { module: 'Module 3', title: 'Trees, Heaps & Graph Traversal', topics: 'Binary trees, LCA, Trie, BFS/DFS, topological sorting, union-find (disjoint sets)' },
      { module: 'Module 4', title: 'Dynamic Programming Mastery', topics: 'Knapsack 0/1 & Unbounded, Longest Common Subsequence, DP on Grids, Bitmask DP' },
      { module: 'Module 5', title: 'Mock Technical Interview Simulations', topics: 'FAANG-style live interviews, behavioral questions, clean code presentation under pressure' }
    ],
    projects: [
      'High-Performance In-Memory Search Engine with Custom Trie & Inverted Index',
      'Visual Algorithm Simulator for Graph Pathfinding (Dijkstra, A*)',
      'Automated LeetCode Solution Optimizer & Complexity Benchmarker'
    ],
    tools: ['Java', 'C++', 'Python', 'LeetCode', 'GitHub', 'Visual Studio Code'],
    trialLessons: [
      { day: 1, title: 'Day 1: Demystifying Big-O & Two-Pointer Patterns', duration: '45 mins', type: 'Live Code Along', preview: 'Solve classic interview questions with optimal O(1) space complexity.' },
      { day: 2, title: 'Day 2: The Monotonic Stack Secret Trick', duration: '50 mins', type: 'Pattern Breakdown', preview: 'Unlock the secret behind Next Greater Element and Histogram problems.' },
      { day: 3, title: 'Day 3: Tree Traversals & Recursive State Intuition', duration: '55 mins', type: 'Hands-on Challenge', preview: 'Master Depth-First Search without memorizing recursive code.' }
    ]
  },
  {
    id: 'coc-devops',
    code: 'DEVOPS',
    title: 'Cloud Engineering, DevOps & Site Reliability (SRE)',
    shortTitle: 'DevOps & Cloud Engineering',
    category: 'Cloud Infrastructure',
    badge: 'Enterprise Architecture',
    tagline: 'Automate Deployments, Master Docker, Kubernetes & Multi-Cloud Systems',
    duration: '5 Months (Parallel with College)',
    hoursPerWeek: '6 Hours',
    rating: '4.89/5 (130+ Reviews)',
    price: 6999,
    originalPrice: 16999,
    trialDays: 3,
    description: 'Bridge software engineering and production infrastructure. Learn Linux, Docker containerization, Kubernetes orchestration, CI/CD with GitHub Actions, and Terraform on AWS/GCP.',
    targetRoles: ['DevOps Engineer', 'Cloud Architect', 'Site Reliability Engineer (SRE)', 'Platform Engineer'],
    yearRelevance: {
      '1st Year': 'Linux terminal mastery, Bash scripting, Git & GitHub team workflows.',
      '2nd Year': 'Docker containers, multi-stage builds, cloud computing primitives (compute, storage).',
      '3rd Year': 'Kubernetes clusters, CI/CD automated build & test pipelines, AWS architecture.',
      '4th Year': 'Infrastructure as Code (Terraform), Prometheus monitoring, production high availability.'
    },
    modules: [
      { module: 'Module 1', title: 'Linux Administration & Automation', topics: 'System architecture, process management, networking configs, Bash shell scripting' },
      { module: 'Module 2', title: 'Containerization with Docker', topics: 'Container internals, Dockerfiles, volume mounts, multi-container docker-compose setups' },
      { module: 'Module 3', title: 'Kubernetes Container Orchestration', topics: 'Pods, ReplicaSets, Deployments, Services, ConfigMaps, Secrets, Ingress controllers' },
      { module: 'Module 4', title: 'CI/CD Pipelines & Automation', topics: 'GitHub Actions, automated testing, container registry push, zero-downtime deployment' },
      { module: 'Module 5', title: 'Infrastructure as Code & Observability', topics: 'Terraform cloud provisioning, Prometheus metrics, Grafana dashboards, alerting' }
    ],
    projects: [
      'Self-Healing Kubernetes Microservices Deployment on Cloud with Ingress',
      'Zero-Downtime Automated CI/CD Pipeline with Blue/Green Deployments',
      'Enterprise Observability Stack with Prometheus, Grafana & Slack Alerts'
    ],
    tools: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'GitHub Actions', 'Prometheus', 'Grafana', 'Linux'],
    trialLessons: [
      { day: 1, title: 'Day 1: Linux CLI Power Tools & Bash Automation', duration: '40 mins', type: 'Terminal Lab', preview: 'Write robust Bash scripts to automate server setups and health checks.' },
      { day: 2, title: 'Day 2: Containerizing Your First Web Application', duration: '50 mins', type: 'Docker Lab', preview: 'Package a full stack application into a lightweight multi-stage Docker image.' },
      { day: 3, title: 'Day 3: Building a GitHub Actions CI/CD Pipeline', duration: '55 mins', type: 'Live Cloud Demo', preview: 'Trigger an automated build, test, and container deployment on every git push.' }
    ]
  },
  {
    id: 'coc-1year-flagship',
    code: '1YEAR-FLAGSHIP',
    title: '1-Year Comprehensive COC Flagship Program (Python + DSA + FSD + Internship)',
    shortTitle: '1-Year Flagship Career Program',
    category: 'Flagship Career Program',
    badge: 'All-In-One Ultimate Career Track',
    tagline: 'The Ultimate Career Transformation: From College Fresher to Industry-Ready Software Engineer',
    duration: '12 Months (Comprehensive 4 Quarters)',
    hoursPerWeek: '8-10 Hours (Balanced with College)',
    rating: '4.98/5 (450+ Reviews)',
    price: 14999,
    originalPrice: 34999,
    trialDays: 3,
    description: 'Our most acclaimed and comprehensive program covering: Python Foundations + Data Structures & Algorithms + Full Stack Web & Cloud Development (FSD) + A Guaranteed 3-Month Sakith Harvan Live Internship + Career Portfolio & Placement Launch.',
    targetRoles: ['Full Stack SDE', 'Software Development Engineer (SDE)', 'Cloud Developer', 'AI-Enabled Software Specialist'],
    yearRelevance: {
      '1st Year': 'Puts you 3 years ahead of your peers. Builds rock-solid programming + problem-solving base.',
      '2nd Year': 'Perfect timing! Balances coursework with high-value projects and industry coding.',
      '3rd Year': 'Accelerates you right into top internships, campus placements and high-package dream offers.',
      '4th Year': 'Final sprint transformation: complete portfolio, live internship certificate, interview cracking.'
    },
    modules: [
      { module: 'Quarter 1', title: 'Python Programming & Problem Solving', topics: 'Object-Oriented Programming, clean code principles, algorithmic thinking, data manipulation' },
      { module: 'Quarter 2', title: 'Data Structures & Algorithms (DSA)', topics: 'Arrays, Strings, Stacks, Queues, Trees, Graphs, DP, 200+ interview coding patterns' },
      { module: 'Quarter 3', title: 'Full Stack Development (MERN & Next.js)', topics: 'React, Node.js, Express, PostgreSQL/MongoDB, Next.js, Cloud APIs, SaaS development' },
      { module: 'Quarter 4', title: '3-Month Real Internship & Placement Sprint', topics: 'Real client software development, Git team PR reviews, ATS resume building, mock interviews' }
    ],
    projects: [
      'Production-Grade Enterprise SaaS Portal with Billing, Auth & Analytics',
      'Algorithmic Trading & Analytics Engine in Python',
      'Real-Time Live Collaboration Platform with WebSockets & Cloud Storage',
      'Client-Facing Capstone Project during Sakith Harvan Live Internship'
    ],
    tools: ['Python', 'Java/C++', 'React', 'Next.js', 'Node.js', 'PostgreSQL', 'Docker', 'AWS', 'Git/GitHub'],
    trialLessons: [
      { day: 1, title: 'Day 1: Career Roadmap Diagnostics & Python Architecture', duration: '50 mins', type: 'Welcome Orientation & Code Lab', preview: 'Map your 1-year transformation timeline and write clean object-oriented Python.' },
      { day: 2, title: 'Day 2: Algorithmic Logic & Data Structures in Action', duration: '60 mins', type: 'Coding Masterclass', preview: 'Solve real interview questions and learn how top tech engineers think.' },
      { day: 3, title: 'Day 3: Building & Previewing a Live Full Stack Component', duration: '60 mins', type: 'Full Stack Lab', preview: 'Connect a React UI to a live backend API and see your code run live.' }
    ]
  }
];

// College year entry options as highlighted in user prompt
export const COC_ENTRY_OPTIONS = [
  { id: '1st-only', label: '1st Year Only', years: '1st Year', description: 'Foundation, Programming, Tech Exposure & Interest Exploration' },
  { id: '1st-2nd', label: '1st → 2nd Year', years: '1st to 2nd Year', description: 'Foundations to Skill Development & Mini Projects' },
  { id: '2nd-only', label: '2nd Year Only', years: '2nd Year', description: 'Skill Development, Domain Exploration & Practical Projects' },
  { id: '2nd-3rd', label: '2nd → 3rd Year', years: '2nd to 3rd Year', description: 'Deep Domain Specialization, Industry Projects & Internship Bridge' },
  { id: '3rd-only', label: '3rd Year Only', years: '3rd Year', description: 'Specialisation, Advanced Projects, Live Internship & Exposure' },
  { id: '1st-3rd', label: '1st → 3rd Year', years: '1st to 3rd Year', description: 'Comprehensive 3-Year Evolution from Beginner to Project Lead' },
  { id: '1st-4th', label: '1st → 4th Year', years: 'Complete 4 Years', description: 'The Full College-to-Career Transformation: Guaranteed Excellence' },
  { id: '2nd-4th', label: '2nd → 4th Year', years: '2nd to 4th Year', description: 'Tri-Year Acceleration: Skills, Projects, Internship & Placement Ready' },
  { id: '3rd-4th', label: '3rd → 4th Year', years: '3rd to 4th Year', description: 'Intensive Placement & Career Sprint: Portfolio, Live Internship, Offers' },
  { id: '4th-only', label: '4th Year Only', years: '4th Year Only', description: 'Targeted Fast-Track: Portfolio, Resume, Mock Interviews & Placement Readiness' }
];

// Helper to get stored courses (with admin modified prices)
export const getStoredCOCCourses = () => {
  try {
    const raw = localStorage.getItem('sh_coc_courses');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Deep-merge with INITIAL_COC_COURSES to guarantee all schema properties exist
        return INITIAL_COC_COURSES.map(initial => {
          const stored = parsed.find(p => p && (p.id === initial.id || p.code === initial.code));
          if (!stored) return initial;
          return {
            ...initial,
            ...stored,
            price: typeof stored.price === 'number' && !isNaN(stored.price) ? stored.price : (Number(stored.price) || initial.price),
            originalPrice: stored.originalPrice ? (Number(stored.originalPrice) || initial.originalPrice) : initial.originalPrice,
            projects: Array.isArray(stored.projects) && stored.projects.length > 0 ? stored.projects : initial.projects,
            modules: Array.isArray(stored.modules) && stored.modules.length > 0 ? stored.modules : initial.modules,
            trialLessons: Array.isArray(stored.trialLessons) && stored.trialLessons.length > 0 ? stored.trialLessons : initial.trialLessons
          };
        });
      }
    }
  } catch (e) {
    console.warn('Error reading stored COC courses:', e);
  }
  return INITIAL_COC_COURSES;
};

// Helper to save courses
export const saveStoredCOCCourses = (courses) => {
  try {
    localStorage.setItem('sh_coc_courses', JSON.stringify(courses));
  } catch (e) {
    console.warn('Error saving COC courses:', e);
  }
};

// Admin helper to update course price or details
export const updateCOCCoursePrice = (courseId, newPrice, newOriginalPrice) => {
  const courses = getStoredCOCCourses();
  const updated = courses.map(course => {
    if (course.id === courseId) {
      return {
        ...course,
        price: Number(newPrice),
        originalPrice: newOriginalPrice ? Number(newOriginalPrice) : course.originalPrice
      };
    }
    return course;
  });
  saveStoredCOCCourses(updated);
  return updated;
};

// Admin helper to update course content
export const updateCOCCourseDetails = (courseId, updatedFields) => {
  const courses = getStoredCOCCourses();
  const updated = courses.map(course => {
    if (course.id === courseId) {
      return { ...course, ...updatedFields };
    }
    return course;
  });
  saveStoredCOCCourses(updated);
  return updated;
};

// Get current student user session
export const getStoredStudentUser = () => {
  try {
    const raw = localStorage.getItem('sh_coc_student_user');
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Error reading student user:', e);
  }
  return null;
};

// Save student user session
export const saveStoredStudentUser = (user) => {
  try {
    localStorage.setItem('sh_coc_student_user', JSON.stringify(user));
  } catch (e) {
    console.warn('Error saving student user:', e);
  }
};

// Clear student session (logout)
export const clearStoredStudentUser = () => {
  try {
    localStorage.removeItem('sh_coc_student_user');
  } catch (e) {
    console.warn('Error clearing student user:', e);
  }
};

// Enrollments Store (Trial & Paid)
export const INITIAL_ENROLLMENTS = [
  {
    id: 'ENR-COC-2026-101',
    studentName: 'Sneha Reddy',
    studentEmail: 'sneha.reddy@gmail.com',
    studentPhone: '+91 9988776655',
    courseId: 'coc-fsd',
    courseTitle: 'Full Stack Web & Cloud Development (MERN + Next.js)',
    academicYear: '2nd Year',
    branch: 'CSE',
    college: 'Chaitanya Bharathi Institute of Technology (CBIT)',
    status: 'Active Trial', // 'Active Trial' | 'Paid & Enrolled' | 'Trial Expired'
    trialStartDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    trialExpiresDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    amountPaid: 0,
    courseFee: 6999
  },
  {
    id: 'ENR-COC-2026-102',
    studentName: 'Karthik Sai',
    studentEmail: 'karthik.sai@gmail.com',
    studentPhone: '+91 9849123456',
    courseId: 'coc-1year-flagship',
    courseTitle: '1-Year Comprehensive COC Flagship Program',
    academicYear: '3rd Year',
    branch: 'AIML',
    college: 'VNR Vignana Jyothi Institute of Engineering & Technology',
    status: 'Paid & Enrolled',
    trialStartDate: '2026-10-20T10:00:00Z',
    trialExpiresDate: '2026-10-23T10:00:00Z',
    amountPaid: 14999,
    courseFee: 14999,
    paidAt: '2026-10-22T14:20:00Z',
    paymentRef: 'PAY-SHT-2026-9918'
  }
];

export const getStoredEnrollments = () => {
  try {
    const raw = localStorage.getItem('sh_coc_enrollments');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading enrollments:', e);
  }
  return INITIAL_ENROLLMENTS;
};

export const saveStoredEnrollments = (list) => {
  try {
    localStorage.setItem('sh_coc_enrollments', JSON.stringify(list));
  } catch (e) {
    console.warn('Error saving enrollments:', e);
  }
};

export const enrollInTrial = (enrollmentData) => {
  const current = getStoredEnrollments();
  const trialDays = 3;
  const startDate = new Date();
  const expiresDate = new Date();
  expiresDate.setDate(startDate.getDate() + trialDays);

  const newEnrollment = {
    id: `ENR-COC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    status: 'Active Trial',
    trialStartDate: startDate.toISOString(),
    trialExpiresDate: expiresDate.toISOString(),
    amountPaid: 0,
    ...enrollmentData
  };

  const updated = [newEnrollment, ...current];
  saveStoredEnrollments(updated);
  return newEnrollment;
};

export const completeEnrollmentPayment = (enrollmentId, paymentDetails) => {
  const current = getStoredEnrollments();
  const updated = current.map(item => {
    if (item.id === enrollmentId) {
      return {
        ...item,
        status: 'Paid & Enrolled',
        amountPaid: item.courseFee,
        paidAt: new Date().toISOString(),
        paymentRef: `PAY-SHT-${Date.now().toString(36).toUpperCase()}`,
        paymentDetails
      };
    }
    return item;
  });
  saveStoredEnrollments(updated);
  return updated.find(i => i.id === enrollmentId);
};
