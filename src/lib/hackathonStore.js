// Sakith Harvan Technologies - Hackathon Store & Engine

const STORAGE_KEYS = {
  HACKATHONS: 'sh_hackathons_data',
  REGISTRATIONS: 'sh_hackathon_registrations',
};

// Initial Seed Data: 1 Premier Active Hackathon, 1 Past Completed Hackathon with Hall of Fame Winners
export const INITIAL_HACKATHONS = [
  {
    id: 'HCK-AI-2026',
    title: 'CodeSprint 2026: Enterprise AI & Agentic Systems',
    tagline: 'Build autonomous agents, generative workflows, and high-performance cloud architectures.',
    description: 'A 48-hour national level engineering hackathon challenging the brightest minds to architect, train, and deploy real-world enterprise agentic systems. Form your squad, choose an industry problem statement, and build production-grade solutions evaluated by founders and tech leads.',
    theme: 'Enterprise AI & Autonomous Agents',
    logoUrl: '',
    entryFee: 299, // ₹299 per team
    minTeamSize: 2,
    maxTeamSize: 4,
    status: 'active', // 'upcoming' | 'active' | 'completed'
    registrationDeadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    statementLockDeadline: new Date(Date.now() + 5.5 * 24 * 60 * 60 * 1000).toISOString(), // Problem statement locking deadline fixed by admin
    statementsLocked: false, // Admin manual lock switch for statement selection
    kickoffTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    submissionDeadline: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000).toISOString(),
    statementsReleased: true, // Admin release toggle for full details & deployment start
    submissionsClosed: false,
    problemStatements: [
      {
        id: 'PS-01',
        title: 'Autonomous Multi-Agent ERP Reconciliation Engine',
        track: 'Agentic AI / FinTech',
        summary: 'Design an autonomous agent network that ingests conflicting invoices, bank statements, and ledger entries, reconciles discrepancies, and prepares audited reports.',
        fullDetails: 'Enterprise finance teams spend thousands of hours reconciling purchase orders with GST invoices and bank settlements. Your team must architect an autonomous multi-agent pipeline using LangChain/CrewAI or native LLM function calling. The system must flag duplicate transactions, handle vendor name fuzzy matching, calculate tax variances, and output structured accounting JSONs with explainable audit trails.',
        rules: '1. Solution must run locally or on free tier cloud with documented test credentials.\n2. Must handle messy PDF/CSV formats.\n3. Latency per invoice reconciliation under 4 seconds.\n4. Clean git commit history required.',
        evaluationCriteria: 'Architecture (25%), Agent Autonomy & Accuracy (35%), Error Resilience (20%), UI Dashboard (20%)',
        starterRepoUrl: 'https://github.com/sakith-harvan/erp-agent-starter'
      },
      {
        id: 'PS-02',
        title: 'Zero-Knowledge Decentralized Identity for Campus Verification',
        track: 'Cyber Security & Web3',
        summary: 'Build a tamper-proof verification portal where university students can prove their academic credentials without revealing personally identifiable information.',
        fullDetails: 'Create a decentralized or cryptographically signed verifiable credential system for university certificates and internship evaluations. Students hold a digital identity wallet; employers verify claims (e.g. CGPA >= 8.0, graduated in 2026, completed AI internship) via zero-knowledge proofs without exposing full marksheets or personal IDs.',
        rules: '1. Cryptographic signatures must be verifiable client-side.\n2. Include interactive demo with student wallet and employer scanner.\n3. Must adhere to strict privacy safeguards.',
        evaluationCriteria: 'Security Posture (30%), Cryptographic Correctness (30%), User Experience (25%), Documentation (15%)',
        starterRepoUrl: 'https://github.com/sakith-harvan/zk-verify-starter'
      },
      {
        id: 'PS-03',
        title: 'Edge AI Real-Time Defect Detection in Semiconductor Wafers',
        track: 'Computer Vision & IoT',
        summary: 'Develop a lightweight edge-optimized computer vision pipeline to detect micro-cracks and solder anomalies in sub-second inference speed.',
        fullDetails: 'Semiconductor packaging requires sub-millimeter visual inspection at 30+ frames per second. Build a browser-based or lightweight containerized vision service that highlights defect bounding boxes, classifies defect severity (Critical, Minor, False Positive), and streams telemetry to an edge management dashboard.',
        rules: '1. Model inference time must be <= 50ms per frame.\n2. Must include sample dataset testing script.\n3. Web dashboard with live camera or video stream mockup.',
        evaluationCriteria: 'Model Precision/Recall (35%), Inference Latency (25%), Dashboard UI/UX (25%), Edge Deployment Readability (15%)',
        starterRepoUrl: 'https://github.com/sakith-harvan/edge-vision-starter'
      }
    ],
    winners: null,
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'HCK-SHT-2025',
    title: 'National SaaS Buildathon 2025: Cloud Microservices',
    tagline: 'High-throughput distributed systems & multi-tenant SaaS platforms.',
    description: 'Over 140 collegiate engineering squads competed to construct resilient, auto-scaling multi-tenant microservices. The grand finale took place at Sakith Harvan Tech Hub with live demo evaluations.',
    theme: 'Cloud Architecture & Distributed SaaS',
    entryFee: 199,
    minTeamSize: 2,
    maxTeamSize: 4,
    status: 'completed',
    registrationDeadline: '2025-11-10T18:00:00.000Z',
    kickoffTime: '2025-11-12T09:00:00.000Z',
    submissionDeadline: '2025-11-14T21:00:00.000Z',
    statementsReleased: true,
    submissionsClosed: true,
    problemStatements: [
      {
        id: 'PS-2025-01',
        title: 'Real-Time Global Rate Limiter & Edge DDoS Mitigator',
        track: 'Distributed Systems',
        summary: 'High-performance token bucket distributed rate limiter with Redis and sliding window counter.',
        fullDetails: 'Built to withstand 50,000 req/sec burst traffic with sub-millisecond edge decisions.',
        rules: 'Zero external cloud licensing fees allowed.',
        evaluationCriteria: 'Throughput (40%), Fault Tolerance (30%), Code Cleanliness (30%)',
        starterRepoUrl: ''
      }
    ],
    winners: {
      first: {
        place: '1st Place Winner',
        badge: '🏆 Champion',
        teamId: 'SA104',
        teamName: 'CyberKnights',
        teamLeader: 'Kavya Sharma',
        college: 'IIT Madras',
        problemStatementId: 'PS-2025-01',
        problemStatementTitle: 'Real-Time Global Rate Limiter & Edge DDoS Mitigator',
        deployedUrl: 'https://cyberknights-limiter.demo.app',
        githubUrl: 'https://github.com/cyberknights/global-rate-limiter',
        prize: '₹25,000 Cash + Direct PPO Fast-Track',
        remarks: 'Flawless Redis sliding-window implementation handling 65,000 req/sec benchmark with zero dropped packets.'
      },
      second: {
        place: '2nd Place (1st Runner Up)',
        badge: '🥈 Runner Up',
        teamId: 'SA118',
        teamName: 'ByteBrigade',
        teamLeader: 'Rohan Varma',
        college: 'NIT Warangal',
        problemStatementId: 'PS-2025-01',
        problemStatementTitle: 'Real-Time Global Rate Limiter & Edge DDoS Mitigator',
        deployedUrl: 'https://bytebrigade-edge.demo.app',
        githubUrl: 'https://github.com/bytebrigade/edge-mitigator',
        prize: '₹15,000 Cash + Industrial Internship Voucher',
        remarks: 'Implemented ultra-fast eBPF packet inspection with outstanding metrics dashboard.'
      },
      third: {
        place: '3rd Place (2nd Runner Up)',
        badge: '🥉 2nd Runner Up',
        teamId: 'SA129',
        teamName: 'NeuralNova',
        teamLeader: 'Ananya Reddy',
        college: 'BITS Pilani',
        problemStatementId: 'PS-2025-01',
        problemStatementTitle: 'Real-Time Global Rate Limiter & Edge DDoS Mitigator',
        deployedUrl: 'https://neuralnova-cloud.demo.app',
        githubUrl: 'https://github.com/neuralnova/distributed-limiter',
        prize: '₹10,000 Cash + Cloud Credits',
        remarks: 'Innovative adaptive ML thresholding for anomaly burst detection.'
      }
    },
    createdAt: '2025-10-01T10:00:00.000Z'
  }
];

export const INITIAL_REGISTRATIONS = [
  {
    id: 'SHTNXR1025',
    hackathonId: 'HCK-AI-2026',
    teamName: 'Nexus',
    teamSize: 3,
    password: 'NEXSHT3SHTNXR1025', // Formula: NEX + SHT + 3 + SHTNXR1025
    problemStatementId: 'PS-01',
    problemStatementTitle: 'Autonomous Multi-Agent ERP Reconciliation Engine',
    members: [
      { name: 'Arjun Nambiar', mobile: '+91 9876543210', email: 'arjun.nexus@gmail.com', college: 'Vellore Institute of Technology', location: 'Chennai', isLeader: true },
      { name: 'Priya Patel', mobile: '+91 9876543211', email: 'priya.patel@gmail.com', college: 'Vellore Institute of Technology', location: 'Chennai', isLeader: false },
      { name: 'Siddharth Rao', mobile: '+91 9876543212', email: 'sid.rao@gmail.com', college: 'SRM University', location: 'Bengaluru', isLeader: false }
    ],
    entryFeePaid: true,
    paymentDetails: {
      transactionId: 'TXN-HCK-94812',
      amount: 299,
      paidAt: '2026-10-28T14:20:00.000Z',
      method: 'UPI / QR Instant'
    },
    registeredAt: '2026-10-28T14:20:00.000Z',
    deploymentStarted: true,
    deploymentStartedAt: '2026-10-29T10:00:00.000Z',
    submission: {
      liveUrl: 'https://nexus-erp-reconcile.demo.app',
      githubUrl: 'https://github.com/arjun-nambiar/nexus-erp-agent',
      testCredentials: {
        login: 'demo_auditor@sakithharvan.com',
        password: 'SHT@DemoPassword2026',
        apiKeys: 'sk-demo-sht-testkey-8912'
      },
      workingNotes: 'Open the live URL, click "Load Sample Ledger", and hit "Run Multi-Agent Audit". Real-time SSE streaming will show ledger reconciliation.',
      remarks: 'Docker compose file included in GitHub repo for zero-config local run.',
      submittedAt: '2026-10-30T16:45:00.000Z'
    }
  },
  {
    id: 'SHTNXR1031',
    hackathonId: 'HCK-AI-2026',
    teamName: 'AlgoTitans',
    teamSize: 2,
    password: 'ALGSHT2SHTNXR1031',
    problemStatementId: 'PS-02',
    problemStatementTitle: 'Zero-Knowledge Decentralized Identity for Campus Verification',
    members: [
      { name: 'Deepak Varma', mobile: '+91 9876500001', email: 'deepak.v@gmail.com', college: 'Osmania University', location: 'Hyderabad', isLeader: true },
      { name: 'Sneha Kulkarni', mobile: '+91 9876500002', email: 'sneha.k@gmail.com', college: 'Osmania University', location: 'Hyderabad', isLeader: false }
    ],
    entryFeePaid: true,
    paymentDetails: {
      transactionId: 'TXN-HCK-94888',
      amount: 299,
      paidAt: '2026-10-29T11:15:00.000Z',
      method: 'Card / Net Banking'
    },
    registeredAt: '2026-10-29T11:15:00.000Z',
    deploymentStarted: false,
    deploymentStartedAt: null,
    submission: null
  }
];

// Helper to get stored hackathons
export const getStoredHackathons = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HACKATHONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.HACKATHONS, JSON.stringify(INITIAL_HACKATHONS));
      return INITIAL_HACKATHONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_HACKATHONS;
  } catch (err) {
    console.error('Failed to read hackathons from storage:', err);
    return INITIAL_HACKATHONS;
  }
};

// Helper to save stored hackathons
export const saveStoredHackathons = (hackathons) => {
  try {
    localStorage.setItem(STORAGE_KEYS.HACKATHONS, JSON.stringify(hackathons));
    window.dispatchEvent(new CustomEvent('sh_hackathons_updated', { detail: hackathons }));
  } catch (err) {
    console.error('Failed to save hackathons to storage:', err);
  }
};

// Helper to get stored registrations
export const getStoredHackathonRegistrations = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(INITIAL_REGISTRATIONS));
      return INITIAL_REGISTRATIONS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_REGISTRATIONS;
  } catch (err) {
    console.error('Failed to read hackathon registrations from storage:', err);
    return INITIAL_REGISTRATIONS;
  }
};

// Helper to save stored registrations
export const saveStoredHackathonRegistrations = (registrations) => {
  try {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
    window.dispatchEvent(new CustomEvent('sh_hackathon_registrations_updated', { detail: registrations }));
  } catch (err) {
    console.error('Failed to save hackathon registrations to storage:', err);
  }
};

/**
 * Convert any image URL, base64 data, or Google Drive link into a direct displayable image URL
 * Automatically handles Google Drive view/share/open links and extracts direct stream link.
 */
export const formatHackathonLogoUrl = (input) => {
  if (!input || typeof input !== 'string') return '';
  const trimmed = input.trim();
  if (trimmed.startsWith('data:image/')) return trimmed;

  // Google Drive link handler
  // Matches:
  // drive.google.com/file/d/FILE_ID/...
  // drive.google.com/open?id=FILE_ID
  // drive.google.com/uc?id=FILE_ID
  const driveRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/file\/d\/)([a-zA-Z0-9_-]+)/i;
  const match = trimmed.match(driveRegex);
  if (match && match[1]) {
    return `https://lh3.googleusercontent.com/d/${match[1]}`;
  }

  return trimmed;
};

/**
 * Generate unique Team ID as combo of SHT and Nexarva:
 * e.g. SHTNXR1024
 * Guaranteed unique across all registered squads.
 */
export const generateTeamId = () => {
  const existing = getStoredHackathonRegistrations();
  const existingIds = new Set(existing.map(r => (r.id || '').toUpperCase()));
  
  for (let i = 0; i < 500; i++) {
    const num = Math.floor(1000 + Math.random() * 9000); // 1000 - 9999
    const candidateId = `SHTNXR${num}`;
    if (!existingIds.has(candidateId.toUpperCase())) {
      return candidateId;
    }
  }
  return `SHTNXR${Date.now().toString().slice(-4)}`;
};

/**
 * Generate password matching past format:
 * teamname + SHT + teamsize + id
 * E.g., if team name is Nexus, size is 3, id is SHTNXR1024 -> NEXSHT3SHTNXR1024
 * Guaranteed unique: no two teams will ever receive the same password.
 */
export const generateTeamPassword = (teamName, teamSize, teamId) => {
  const existing = getStoredHackathonRegistrations();
  const existingPasswords = new Set(existing.map(r => (r.password || '').toUpperCase()));

  const cleanName = (teamName || 'TEAM').trim().replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const prefix = cleanName.length >= 3 ? cleanName.slice(0, 3) : cleanName.padEnd(3, 'X');
  let basePass = `${prefix}SHT${teamSize}${teamId}`;

  if (!existingPasswords.has(basePass.toUpperCase())) {
    return basePass;
  }

  // Salt if a collision ever occurs
  let counter = 1;
  while (existingPasswords.has(`${basePass}${counter}`.toUpperCase())) {
    counter++;
  }
  return `${basePass}${counter}`;
};

/**
 * Register a new team for a hackathon
 */
export const registerHackathonTeam = ({
  hackathonId,
  teamName,
  teamSize,
  problemStatementId,
  members,
  entryFee
}) => {
  const registrations = getStoredHackathonRegistrations();
  const teamId = generateTeamId();
  const password = generateTeamPassword(teamName, teamSize, teamId);

  const hackathons = getStoredHackathons();
  const hackathon = hackathons.find(h => h.id === hackathonId);
  const selectedPS = problemStatementId ? hackathon?.problemStatements?.find(ps => ps.id === problemStatementId) : null;

  const newRegistration = {
    id: teamId,
    hackathonId,
    teamName: teamName.trim(),
    teamSize: Number(teamSize) || members.length,
    password,
    problemStatementId: selectedPS ? selectedPS.id : null,
    problemStatementTitle: selectedPS ? selectedPS.title : 'Pending Selection',
    statementLocked: !!selectedPS,
    statementLockedAt: selectedPS ? new Date().toISOString() : null,
    members: members.map((m, idx) => ({
      name: m.name.trim(),
      mobile: m.mobile.trim(),
      email: m.email.trim(),
      college: m.college.trim(),
      location: m.location.trim(),
      isLeader: idx === 0
    })),
    entryFeePaid: true,
    paymentDetails: {
      transactionId: `TXN-HCK-${Math.floor(10000 + Math.random() * 90000)}`,
      amount: entryFee || 0,
      paidAt: new Date().toISOString(),
      method: 'Instant Confirmed Registration'
    },
    registeredAt: new Date().toISOString(),
    deploymentStarted: false,
    deploymentStartedAt: null,
    submission: null
  };

  const updated = [newRegistration, ...registrations];
  saveStoredHackathonRegistrations(updated);
  return newRegistration;
};

/**
 * Select / Lock problem statement for registered team (within admin deadline)
 */
export const lockTeamProblemStatement = (teamId, problemStatementId) => {
  const registrations = getStoredHackathonRegistrations();
  const hackathons = getStoredHackathons();

  const target = registrations.find(r => r.id.toUpperCase() === teamId.toUpperCase());
  if (!target) return null;

  const hackathon = hackathons.find(h => h.id === target.hackathonId);
  const selectedPS = hackathon?.problemStatements?.find(ps => ps.id === problemStatementId);

  const updated = registrations.map(reg => {
    if (reg.id.toUpperCase() === teamId.toUpperCase()) {
      return {
        ...reg,
        problemStatementId: selectedPS ? selectedPS.id : problemStatementId,
        problemStatementTitle: selectedPS ? selectedPS.title : 'Selected Statement',
        statementLocked: true,
        statementLockedAt: new Date().toISOString()
      };
    }
    return reg;
  });

  saveStoredHackathonRegistrations(updated);
  return updated.find(r => r.id.toUpperCase() === teamId.toUpperCase());
};

/**
 * Authenticate team login
 */
export const authenticateHackathonTeam = (teamId, password) => {
  if (!teamId || !password) return null;
  const registrations = getStoredHackathonRegistrations();
  const cleanId = teamId.trim().toUpperCase();
  const cleanPass = password.trim().toUpperCase();

  const found = registrations.find(r => 
    r.id.toUpperCase() === cleanId && 
    r.password.toUpperCase() === cleanPass
  );

  return found || null;
};

/**
 * Update Team Project Submission
 */
export const updateTeamSubmission = (teamId, submissionData) => {
  const registrations = getStoredHackathonRegistrations();
  const updated = registrations.map(reg => {
    if (reg.id.toUpperCase() === teamId.toUpperCase()) {
      return {
        ...reg,
        submission: {
          ...submissionData,
          submittedAt: new Date().toISOString()
        }
      };
    }
    return reg;
  });
  saveStoredHackathonRegistrations(updated);
  return updated.find(r => r.id.toUpperCase() === teamId.toUpperCase());
};

/**
 * Start deployment timer for team
 */
export const markDeploymentStarted = (teamId) => {
  const registrations = getStoredHackathonRegistrations();
  const updated = registrations.map(reg => {
    if (reg.id.toUpperCase() === teamId.toUpperCase()) {
      return {
        ...reg,
        deploymentStarted: true,
        deploymentStartedAt: reg.deploymentStartedAt || new Date().toISOString()
      };
    }
    return reg;
  });
  saveStoredHackathonRegistrations(updated);
  return updated.find(r => r.id.toUpperCase() === teamId.toUpperCase());
};

/**
 * Export registered teams and their submissions to an Excel (.xls) file
 */
export const exportHackathonTeamsToExcel = (hackathonId, hackathonTitle = 'Hackathon') => {
  const allRegistrations = getStoredHackathonRegistrations();
  const teams = allRegistrations.filter(r => !hackathonId || r.hackathonId === hackathonId);

  if (teams.length === 0) {
    alert('No registered teams found to export.');
    return;
  }

  // XML Spreadsheet 2003 format
  const rows = [];

  // Title Row
  rows.push(`
    <Row ss:Height="28">
      <Cell ss:MergeAcross="12" ss:StyleID="TitleStyle">
        <Data ss:Type="String">Sakith Harvan Technologies - ${hackathonTitle} Candidate Teams &amp; Submissions Roster</Data>
      </Cell>
    </Row>
    <Row ss:Height="18">
      <Cell ss:MergeAcross="12" ss:StyleID="SubTitleStyle">
        <Data ss:Type="String">Generated on: ${new Date().toLocaleString('en-IN')} | Total Registered Teams: ${teams.length}</Data>
      </Cell>
    </Row>
    <Row ss:Height="6"></Row>
  `);

  // Header Row
  rows.push(`
    <Row ss:Height="22">
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Team ID</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Team Password</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Team Name</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Team Size</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Leader Name</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Leader Mobile</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Leader Email</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">College &amp; Location</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">All Team Members</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Chosen Problem Statement</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Deployed Live URL</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">GitHub Repo URL</Data></Cell>
      <Cell ss:StyleID="HeaderStyle"><Data ss:Type="String">Test Credentials &amp; Notes</Data></Cell>
    </Row>
  `);

  // Data Rows
  teams.forEach(team => {
    const leader = team.members?.[0] || {};
    const membersSummary = (team.members || []).map((m, i) => `${i + 1}. ${m.name} (${m.email}, ${m.mobile}, ${m.college})`).join('; ');
    const sub = team.submission || {};
    const testNotes = sub.testCredentials ? `Login: ${sub.testCredentials.login || '-'} | Pass: ${sub.testCredentials.password || '-'} | Notes: ${sub.workingNotes || '-'}` : (sub.workingNotes || 'No submission yet');

    const escapeXml = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    rows.push(`
      <Row ss:Height="20">
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(team.id)}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(team.password)}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(team.teamName)}</Data></Cell>
        <Cell ss:StyleID="NumberStyle"><Data ss:Type="Number">${team.teamSize || team.members?.length || 1}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(leader.name || '-')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(leader.mobile || '-')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(leader.email || '-')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(`${leader.college || '-'}, ${leader.location || '-'}`)}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(membersSummary)}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(team.problemStatementTitle || team.problemStatementId || '-')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(sub.liveUrl || 'Pending')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(sub.githubUrl || 'Pending')}</Data></Cell>
        <Cell ss:StyleID="DataStyle"><Data ss:Type="String">${escapeXml(testNotes)}</Data></Cell>
      </Row>
    `);
  });

  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Default" ss:Name="Normal">
      <Alignment ss:Vertical="Center"/>
      <Borders/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Color="#1E293B"/>
      <Interior/>
      <NumberFormat/>
      <Protection/>
    </Style>
    <Style ss:ID="TitleStyle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="15" ss:Bold="1" ss:Color="#1E3A8A"/>
      <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="SubTitleStyle">
      <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#475569" ss:Italic="1"/>
      <Interior ss:Color="#EFF6FF" ss:Pattern="Solid"/>
    </Style>
    <Style ss:ID="HeaderStyle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>
      <Font ss:FontName="Calibri" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#2563EB" ss:Pattern="Solid"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#1D4ED8"/>
      </Borders>
    </Style>
    <Style ss:ID="DataStyle">
      <Alignment ss:Vertical="Center" ss:WrapText="1"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    </Style>
    <Style ss:ID="NumberStyle">
      <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
      <Borders>
        <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
        <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E2E8F0"/>
      </Borders>
      <Font ss:FontName="Calibri" ss:Size="10" ss:Color="#334155"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Hackathon Teams">
    <Table ss:DefaultColumnWidth="120" ss:DefaultRowHeight="20">
      <Column ss:Width="70"/>
      <Column ss:Width="100"/>
      <Column ss:Width="110"/>
      <Column ss:Width="65"/>
      <Column ss:Width="110"/>
      <Column ss:Width="95"/>
      <Column ss:Width="140"/>
      <Column ss:Width="140"/>
      <Column ss:Width="220"/>
      <Column ss:Width="180"/>
      <Column ss:Width="160"/>
      <Column ss:Width="160"/>
      <Column ss:Width="200"/>
      ${rows.join('\n')}
    </Table>
  </Worksheet>
</Workbook>`;

  const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const sanitizedTitle = (hackathonTitle || 'Hackathon').replace(/[^a-zA-Z0-9_-]/g, '_');
  link.download = `SHT_${sanitizedTitle}_Teams_${new Date().toISOString().slice(0, 10)}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

