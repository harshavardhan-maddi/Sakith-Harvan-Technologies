import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, ArrowRight, CheckCircle2, ChevronRight, BookOpen, Compass, 
  Layers, Code, Cpu, Shield, Database, Cloud, Terminal, Check, Star, 
  Calendar, Clock, Award, Users, AlertCircle, HelpCircle, Lock, Eye, 
  EyeOff, Play, RefreshCw, Zap, Lightbulb, MapPin, Target, DollarSign,
  ChevronDown, X, Rocket, Smile, Briefcase, GraduationCap, Laptop, Share2
} from 'lucide-react';
import { 
  getStoredCOCCourses, 
  COC_ENTRY_OPTIONS, 
  getStoredStudentUser, 
  saveStoredStudentUser, 
  clearStoredStudentUser,
  enrollInTrial,
  completeEnrollmentPayment,
  getStoredEnrollments
} from '../../lib/cocStore';
import { AnimatedMascot } from './AnimatedMascot';
import studentImg from '../../assets/confused_engineering_student.jpg';
import { MarqueeAnnouncement } from '../common/MarqueeAnnouncement';

export const CourseOfCareerPage = ({ onOpenRequirement, onOpenConsultation }) => {
  const [courses, setCourses] = useState(() => {
    try {
      return getStoredCOCCourses();
    } catch (e) {
      return [];
    }
  });
  const [studentUser, setStudentUser] = useState(null);
  const [currentEnrollment, setCurrentEnrollment] = useState(null);

  // View States: 'landing' | 'quiz' | 'analyzing' | 'results' | 'trial_dashboard'
  const [viewState, setViewState] = useState('landing');

  // Timers Refs for clean unmounting
  const diagnosticTimerRef = useRef(null);
  const authTimeoutRef = useRef(null);

  // Quiz State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({
    branch: '',
    year: '',
    codingLevel: '',
    passionDomain: '',
    biggestObstacle: '',
    weeklyHours: '',
    projectExperience: '',
    targetTimeline: '',
    learningStyle: '',
    dreamGoal: ''
  });

  // Dynamic Environment Theme based on answers: 'default' | 'aiml' | 'cyber' | 'fsd' | 'devops' | 'dsa' | 'iot'
  const [envTheme, setEnvTheme] = useState('default');

  // 5-Second Analysis Countdown
  const [countdown, setCountdown] = useState(5);
  const [analysisStepText, setAnalysisStepText] = useState('Initializing career diagnostics...');

  // Selected Course for Enrollment
  const [selectedCourseForEnroll, setSelectedCourseForEnroll] = useState(null);

  // Mascot Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signup'); // 'signup' | 'login'
  const [mascotState, setMascotState] = useState('normal'); // 'normal' | 'typing' | 'password' | 'peeking' | 'success'
  const [showPassword, setShowPassword] = useState(false);
  const [authForm, setAuthForm] = useState({
    name: '',
    email: '',
    phone: '',
    college: '',
    branch: 'CSE',
    year: '2nd Year',
    password: ''
  });

  // Trial Dashboard Tab
  const [trialActiveDay, setTrialActiveDay] = useState(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('upi');

  // Mind map active node state
  const [expandedMindNodes, setExpandedMindNodes] = useState({
    core: true,
    skills: true,
    projects: false,
    tools: false,
    internship: false,
    career: false
  });

  useEffect(() => {
    try {
      const loadedCourses = getStoredCOCCourses();
      if (Array.isArray(loadedCourses) && loadedCourses.length > 0) {
        setCourses(loadedCourses);
      }

      const user = getStoredStudentUser();
      if (user) {
        setStudentUser(user);
        const enrollments = getStoredEnrollments();
        if (Array.isArray(enrollments)) {
          const userEnr = enrollments.find(e => e && e.studentEmail && user.email && e.studentEmail.toLowerCase() === user.email.toLowerCase());
          if (userEnr) {
            setCurrentEnrollment(userEnr);
          }
        }
      }
    } catch (e) {
      console.warn('Error during COC initialization:', e);
    }

    return () => {
      if (diagnosticTimerRef.current) {
        clearInterval(diagnosticTimerRef.current);
      }
      if (authTimeoutRef.current) {
        clearTimeout(authTimeoutRef.current);
      }
    };
  }, []);

  // 10 Quiz Questions with dynamic environment triggers
  const QUIZ_QUESTIONS = [
    {
      id: 'branch',
      question: 'What is your current branch / discipline in college?',
      subtitle: 'Course of Career connects any college stream to practical industry roles.',
      options: [
        { label: 'CSE (Computer Science & Engineering)', value: 'CSE', theme: 'fsd' },
        { label: 'AIML (Artificial Intelligence & Machine Learning)', value: 'AIML', theme: 'aiml' },
        { label: 'Data Science / AI&DS', value: 'Data Science', theme: 'aiml' },
        { label: 'Cyber Security', value: 'Cyber Security', theme: 'cyber' },
        { label: 'IOT (Internet of Things)', value: 'IOT', theme: 'iot' },
        { label: 'Other Engineering (ECE, EEE, Mech, Civil)', value: 'Other Engineering', theme: 'devops' },
        { label: 'BCA / B.Sc / MCA / Other Degree', value: 'BCA / Degree', theme: 'dsa' }
      ]
    },
    {
      id: 'year',
      question: 'Which academic year are you currently in?',
      subtitle: 'Choose where you are today — we design your path from here to graduation.',
      options: [
        { label: '1st Year (Just stepped into college)', value: '1st Year' },
        { label: '2nd Year (Exploring domains & core subjects)', value: '2nd Year' },
        { label: '3rd Year (Internship & project priority)', value: '3rd Year' },
        { label: '4th Year (Placement & final year sprint)', value: '4th Year' },
        { label: 'Recently Graduated / Gap Year', value: 'Graduate' }
      ]
    },
    {
      id: 'codingLevel',
      question: 'How comfortable are you with coding right now?',
      subtitle: 'Be 100% honest! We start from absolute scratch if needed.',
      options: [
        { label: 'Absolute Beginner (Never written real code)', value: 'Beginner' },
        { label: 'Know basic syntax of C, Java, or Python', value: 'Syntax Basics' },
        { label: 'Built small college lab assignments', value: 'Lab Level' },
        { label: 'Can write logic, looking for industry-grade systems', value: 'Intermediate' }
      ]
    },
    {
      id: 'passionDomain',
      question: 'Which technology domain excites you the most?',
      subtitle: 'Watch how your learning atmosphere morphs with your choice!',
      options: [
        { label: 'Full Stack Web & Cloud SaaS Apps (MERN/Next.js)', value: 'FSD', theme: 'fsd' },
        { label: 'Artificial Intelligence, Deep Learning & LLMs', value: 'AI&ML', theme: 'aiml' },
        { label: 'Cybersecurity, Ethical Hacking & Defense', value: 'Cyber Security', theme: 'cyber' },
        { label: 'Data Structures, Algorithms & High Package Coding', value: 'DSA', theme: 'dsa' },
        { label: 'Cloud Architecture, DevOps & Docker/K8s', value: 'DevOps', theme: 'devops' },
        { label: '1-Year Complete All-Rounder (Python + DSA + FSD)', value: '1Year Flagship', theme: 'aiml' }
      ]
    },
    {
      id: 'biggestObstacle',
      question: 'What is your biggest fear or obstacle right now?',
      subtitle: 'Course of Career is built specifically to destroy this exact pain point.',
      options: [
        { label: 'Lack of clear roadmap — confused what to study first', value: 'No Roadmap' },
        { label: 'College syllabus is outdated and too theoretical', value: 'Theoretical College' },
        { label: 'Zero real-world projects — my GitHub is empty', value: 'Empty Portfolio' },
        { label: 'Placement anxiety and fear of tech interviews', value: 'Placement Fear' }
      ]
    },
    {
      id: 'weeklyHours',
      question: 'How many hours can you dedicate alongside college each week?',
      subtitle: 'The program is engineered to never clash with your exams or semester schedule.',
      options: [
        { label: '4 to 6 Hours (Comfortable weekend pace)', value: '4-6 Hours' },
        { label: '8 to 10 Hours (Steady, high-momentum progress)', value: '8-10 Hours' },
        { label: '12+ Hours (Intensive career transformation track)', value: '12+ Hours' }
      ]
    },
    {
      id: 'projectExperience',
      question: 'What kind of projects have you built so far?',
      subtitle: 'We focus heavily on Git, GitHub, and production deployments.',
      options: [
        { label: 'None yet / only theoretical submissions', value: 'None' },
        { label: 'Followed a YouTube tutorial clone', value: 'Tutorial Clones' },
        { label: 'Built an independent mini-project for college', value: 'Mini Project' },
        { label: 'Deployed live apps on cloud or Vercel', value: 'Deployed Apps' }
      ]
    },
    {
      id: 'targetTimeline',
      question: 'What is your target timeline to become career-ready?',
      subtitle: 'We calibrate your curriculum pace accordingly.',
      options: [
        { label: 'Urgent: Next 3 to 6 Months (Placements incoming)', value: '3-6 Months' },
        { label: 'Next 1 Year (Steady mastery with college)', value: '1 Year' },
        { label: 'Long-term: Full 2 to 4 Year college career journey', value: 'Full College' }
      ]
    },
    {
      id: 'learningStyle',
      question: 'How do you learn best?',
      subtitle: 'Sakith Harvan combines live clinic reviews with hands-on building.',
      options: [
        { label: 'Project-first: Show me how to build, then explain theory', value: 'Project First' },
        { label: 'Step-by-step masterclasses with mentor code reviews', value: 'Mentor Guided' },
        { label: 'Solving real enterprise problems & live internships', value: 'Internship Driven' }
      ]
    },
    {
      id: 'dreamGoal',
      question: 'What is your ultimate dream career milestone?',
      subtitle: 'Your answers will now construct your complete Career Anatomy & Road Map!',
      options: [
        { label: 'High Package SDE in Top Product / MNC company', value: 'Product SDE' },
        { label: 'Specialized AI Engineer / Machine Learning Scientist', value: 'AI Engineer' },
        { label: 'Cybersecurity Threat Hunter / SOC Analyst', value: 'Cyber Specialist' },
        { label: 'Full Stack SaaS Builder / Startup Tech Founder', value: 'SaaS Founder' }
      ]
    }
  ];

  // Handle Quiz Answer Selection
  const handleAnswerOption = (questionId, option) => {
    const updatedAnswers = { ...quizAnswers, [questionId]: option.value };
    setQuizAnswers(updatedAnswers);

    // Dynamic environment change immediately!
    if (option.theme) {
      setEnvTheme(option.theme);
    }

    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Completed all 10 questions -> Enter 5-second diagnostic countdown!
      startFiveSecondDiagnostic(updatedAnswers);
    }
  };

  const startFiveSecondDiagnostic = (answers) => {
    setViewState('analyzing');
    setCountdown(5);

    const stepMessages = [
      'Scanning your academic profile & coding baseline...',
      'Mapping domain synergy for ' + (answers.branch || 'your branch') + '...',
      'Synthesizing 4-year progression matrix against industry benchmarks...',
      'Generating your custom Road Map & Mind Map...',
      'Finalizing your Career Anatomy Scorecard!'
    ];

    if (diagnosticTimerRef.current) {
      clearInterval(diagnosticTimerRef.current);
    }

    let currentSec = 5;
    diagnosticTimerRef.current = setInterval(() => {
      currentSec -= 1;
      setCountdown(currentSec);
      if (stepMessages[5 - currentSec - 1]) {
        setAnalysisStepText(stepMessages[5 - currentSec - 1]);
      }

      if (currentSec <= 0) {
        clearInterval(diagnosticTimerRef.current);
        setViewState('results');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 1000);
  };

  // Auth & Mascot handling
  const handleStartEnrollment = (course) => {
    setSelectedCourseForEnroll(course);
    if (studentUser) {
      // User is already logged in, enroll directly in 3-day trial
      processTrialEnrollment(course, studentUser);
    } else {
      // Open Mascot Login / Signup Modal
      setIsAuthModalOpen(true);
    }
  };

  const processTrialEnrollment = (course, user) => {
    if (!course || !user) return;
    const enr = enrollInTrial({
      studentName: user.name || 'Student',
      studentEmail: user.email || 'student@sakithharvan.com',
      studentPhone: user.phone || '',
      courseId: course.id || 'coc-track',
      courseTitle: course.title || course.shortTitle || 'Course of Career Program',
      academicYear: user.year || quizAnswers.year || '2nd Year',
      branch: user.branch || quizAnswers.branch || 'CSE',
      college: user.college || 'Engineering College',
      courseFee: Number(course.price) || 6999
    });
    setCurrentEnrollment(enr);
    setIsAuthModalOpen(false);
    setViewState('trial_dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    setMascotState('success');

    if (authTimeoutRef.current) {
      clearTimeout(authTimeoutRef.current);
    }

    authTimeoutRef.current = setTimeout(() => {
      const user = {
        name: authForm.name || (authMode === 'login' ? 'Sakith Student' : 'Student'),
        email: authForm.email,
        phone: authForm.phone,
        college: authForm.college || 'College of Engineering',
        branch: authForm.branch || 'CSE',
        year: authForm.year || '2nd Year'
      };
      saveStoredStudentUser(user);
      setStudentUser(user);

      if (selectedCourseForEnroll) {
        processTrialEnrollment(selectedCourseForEnroll, user);
      } else {
        setIsAuthModalOpen(false);
      }
      setMascotState('normal');
    }, 1200);
  };

  const handlePaymentComplete = () => {
    if (!currentEnrollment) return;
    const updated = completeEnrollmentPayment(currentEnrollment.id, {
      method: paymentMethod,
      timestamp: new Date().toISOString()
    });
    setCurrentEnrollment(updated);
    setPaymentSuccess(true);
  };

  const toggleMindNode = (key) => {
    setExpandedMindNodes(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Environment styling helper
  const getEnvClasses = () => {
    switch (envTheme) {
      case 'aiml':
        return 'bg-gradient-to-br from-slate-950 via-purple-950 to-indigo-950 text-white';
      case 'cyber':
        return 'bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white';
      case 'fsd':
        return 'bg-gradient-to-br from-slate-950 via-blue-950 to-cyan-950 text-white';
      case 'devops':
        return 'bg-gradient-to-br from-slate-950 via-amber-950 to-slate-900 text-white';
      case 'dsa':
        return 'bg-gradient-to-br from-slate-950 via-teal-950 to-blue-950 text-white';
      case 'iot':
        return 'bg-gradient-to-br from-slate-950 via-cyan-950 to-emerald-950 text-white';
      default:
        return 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pt-20">
      {/* Admin Controlled Marquee Slide Announcement */}
      <MarqueeAnnouncement page="coc" />

      {/* ======================================================== */}
      {/* 1. VIEW: LANDING PAGE                                    */}
      {/* ======================================================== */}
      {viewState === 'landing' && (
        <div>
          {/* Hero Section */}
          <section className="pt-16 pb-20 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-blue-950 via-slate-900 to-slate-950 text-white">
            {/* Ambient Glows */}
            <div className="absolute top-10 left-1/3 w-[600px] h-[300px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute top-40 right-10 w-96 h-96 bg-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />

            <div className="container-custom max-w-5xl mx-auto text-center space-y-6 relative z-10">
              {/* Brand Tagline */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/30 text-cyan-300 text-xs font-semibold backdrop-blur-md">
                <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
                <span>Sakith Harvan Technologies • Course of Career</span>
              </div>

              {/* Bold Primary Hook */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight">
                <span className="block text-white">Still confused?</span>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-300">
                  Build your career throughout your course.
                </span>
              </h1>

              {/* Main Problem Solved */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md max-w-3xl mx-auto space-y-3 text-slate-200 text-sm sm:text-base leading-relaxed">
                <p className="font-semibold text-cyan-300 text-base sm:text-lg">
                  “A student joins college, spends 3–4 years studying subjects, but may still not know what skills to learn, what domain to choose, how to gain practical experience, or how to become career-ready.”
                </p>
                <p className="text-xs sm:text-sm text-slate-300">
                  Course of Career connects your academic journey with your career journey. It is not simply a short 3-month course — it is a career-oriented learning journey that runs alongside your college years.
                </p>
              </div>

              {/* The Core Journey Flow Tagline */}
              <div className="pt-2 text-xs sm:text-sm font-mono font-bold tracking-wider text-slate-300 flex flex-wrap items-center justify-center gap-2">
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-200">COLLEGE</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-cyan-200">COURSE OF CAREER</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-indigo-200">SKILLS</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-purple-200">PROJECTS</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-emerald-200">EXPERIENCE</span>
                <ArrowRight className="w-3.5 h-3.5 text-cyan-400" />
                <span className="px-3 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-extrabold">CAREER</span>
              </div>

              {/* ======================================================== */}
              {/* REALISTIC ENGINEERING STUDENT SHOWCASE & 3D HIGHWAY      */}
              {/* ======================================================== */}
              <div className="pt-10 max-w-5xl mx-auto space-y-8">
                {/* Realistic Photographic Student Showcase Card */}
                <div className="relative w-full rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xl">
                  <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
                    {/* Left: Realistic Image of Engineering Student */}
                    <div className="md:col-span-5 relative min-h-[300px] sm:min-h-[340px] overflow-hidden">
                      <img
                        src={studentImg}
                        alt="Indian Engineering Student at his workstation contemplating his career"
                        className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700"
                        onError={(e) => {
                          e.target.src = '/confused_engineering_student.jpg';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/80 via-transparent to-transparent pointer-events-none" />
                      <div className="absolute bottom-4 left-4 px-3.5 py-1.5 rounded-full bg-slate-950/90 backdrop-blur-md border border-white/20 text-[11px] font-mono text-cyan-300 font-bold flex items-center gap-2 shadow-lg">
                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                        <span className="text-white">The Engineering Student Dilemma</span>
                      </div>
                    </div>

                    {/* Right: The Dilemma & The Solution (High Contrast Dark Text on Clean Surface) */}
                    <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-center space-y-4 text-left bg-white text-slate-900">
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-50 border border-cyan-300 text-cyan-900 text-xs font-bold self-start shadow-sm">
                        <Sparkles className="w-3.5 h-3.5 text-cyan-700" />
                        <span>The Reality of College vs Industry</span>
                      </div>

                      <h3 
                        className="text-xl sm:text-2xl font-black text-slate-900 leading-snug tracking-tight"
                        style={{ color: '#0F172A' }}
                      >
                        “Studying 40+ college subjects, but still uncertain how to land a high-package tech career?”
                      </h3>

                      <p 
                        className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium"
                        style={{ color: '#334155' }}
                      >
                        Outdated college textbooks, zero live GitHub SaaS projects, and placement anxiety leave students confused. Course of Career runs alongside your college years, transforming confusion into hands-on mastery.
                      </p>

                      {/* 4 Pillars Progression Grid - Visually Distinct High Contrast Cards */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 text-center text-xs">
                        <div className="p-3 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm">
                          <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">1st Year</div>
                          <div className="font-black text-amber-900 text-xs mt-0.5" style={{ color: '#78350F' }}>Foundations</div>
                          <div className="text-[10px] text-slate-700 font-medium mt-0.5" style={{ color: '#334155' }}>Logic &amp; Syntax</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 shadow-sm">
                          <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">2nd Year</div>
                          <div className="font-black text-blue-900 text-xs mt-0.5" style={{ color: '#1E3A8A' }}>Domain Skills</div>
                          <div className="text-[10px] text-slate-700 font-medium mt-0.5" style={{ color: '#334155' }}>FSD / AI / Cloud</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-purple-50/80 border border-purple-200 shadow-sm">
                          <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">3rd Year</div>
                          <div className="font-black text-purple-900 text-xs mt-0.5" style={{ color: '#581C87' }}>Live Projects</div>
                          <div className="text-[10px] text-slate-700 font-medium mt-0.5" style={{ color: '#334155' }}>SaaS &amp; Internships</div>
                        </div>
                        <div className="p-3 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-sm">
                          <div className="text-[10px] font-mono text-slate-600 uppercase font-bold">4th Year</div>
                          <div className="font-black text-emerald-900 text-xs mt-0.5" style={{ color: '#064E3B' }}>Career Offer</div>
                          <div className="text-[10px] text-slate-700 font-medium mt-0.5" style={{ color: '#334155' }}>Top Placements</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* ======================================================== */}
                {/* HERO BUTTON: "WANT TO GET CLARITY?"                      */}
                {/* ======================================================== */}
                <div className="pt-2 text-center">
                  <button
                    onClick={() => {
                      setViewState('quiz');
                      setCurrentQuestionIndex(0);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="inline-flex items-center gap-3 px-8 sm:px-12 py-4 rounded-full bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-700 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-base sm:text-lg shadow-xl shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 border border-white/30 cursor-pointer animate-pulse"
                  >
                    <Sparkles className="w-5 h-5 text-white" />
                    <span>Want to get clarity?</span>
                    <ArrowRight className="w-5 h-5 text-white" />
                  </button>
                  <p className="text-xs text-slate-200 mt-2 font-medium">
                    Take our interactive 2-minute diagnostic and discover your exact career road map &amp; mind map.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Flexible Entry Options Section */}
          <section className="py-16 px-4 sm:px-6 bg-white border-t border-b border-slate-200">
            <div className="container-custom max-w-5xl mx-auto space-y-8">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Unified Architecture</span>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  One Unified Program • Flexible Entry Across Any College Year
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  These are not ten separate disconnected courses. They are flexible entry and continuation options within ONE Course of Career program.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {COC_ENTRY_OPTIONS.map((opt) => (
                  <div key={opt.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all space-y-1 text-left">
                    <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                      {opt.years}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 pt-1">{opt.label}</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">{opt.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* 4-Year Progression Breakdown */}
          <section className="py-16 px-4 sm:px-6 bg-slate-50">
            <div className="container-custom max-w-5xl mx-auto space-y-10">
              <div className="text-center max-w-3xl mx-auto space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Example Journey</span>
                <h2 className="text-3xl font-extrabold text-slate-900">
                  Turn College Years into Career Preparation
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  Wherever you enter, the overall objective remains the same: More Skills, More Practical Experience, More Confidence, Better Career Readiness.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1st Year */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-sm flex items-center justify-center">
                    1Y
                  </div>
                  <h3 className="text-base font-bold text-slate-900">1st Year</h3>
                  <div className="text-xs font-semibold text-blue-600">
                    Foundation → Programming → Tech Exposure → Explore Interests
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Build fundamental problem-solving intuition, master first language (Python/C++), explore web vs AI, establish Git habits early.
                  </p>
                </div>

                {/* 2nd Year */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 font-extrabold text-sm flex items-center justify-center">
                    2Y
                  </div>
                  <h3 className="text-base font-bold text-slate-900">2nd Year</h3>
                  <div className="text-xs font-semibold text-cyan-700">
                    Skill Development → Domain Exploration → Projects → Experience
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Select primary specialization (FSD, AI/ML, Cyber, DSA), construct independent mini-projects, solve algorithmic challenges.
                  </p>
                </div>

                {/* 3rd Year */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold text-sm flex items-center justify-center">
                    3Y
                  </div>
                  <h3 className="text-base font-bold text-slate-900">3rd Year</h3>
                  <div className="text-xs font-semibold text-indigo-700">
                    Specialisation → Advanced Projects → Internship → Industry
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Engage in live enterprise software projects, transition directly into Sakith Harvan Live Internships, learn cloud deployment and team PR workflows.
                  </p>
                </div>

                {/* 4th Year */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-extrabold text-sm flex items-center justify-center">
                    4Y
                  </div>
                  <h3 className="text-base font-bold text-slate-900">4th Year</h3>
                  <div className="text-xs font-semibold text-emerald-700">
                    Portfolio → Resume → Interview Prep → Placement Readiness
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Polish production portfolio, optimize ATS resumes, conduct FAANG-style mock technical interviews, and secure high-package dream offers.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Not Only for B.Tech Section */}
          <section className="py-14 px-4 sm:px-6 bg-white border-t border-slate-200">
            <div className="container-custom max-w-4xl mx-auto text-center space-y-6">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Inclusive Career Development</span>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Not Only for B.Tech or CSE Students</h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
                Course of Career is a universal career development program designed for:
              </p>
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {[
                  'B.Tech / Engineering Students',
                  'B.Sc Students',
                  'BCA Students',
                  'B.Com & Other Degree Students',
                  'Diploma Students',
                  'Allied Branches (ECE, EEE, Mech, Civil)',
                  'Any Student Seeking Strong Career Direction'
                ].map((item, idx) => (
                  <span key={idx} className="px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </section>

          {/* Courses Catalog & Admin Decided Pricing */}
          <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t border-slate-200">
            <div className="container-custom max-w-6xl mx-auto space-y-10">
              <div className="text-center max-w-3xl mx-auto space-y-3">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Available Programs</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  Course of Career Available Tracks
                </h2>
                <p className="text-xs sm:text-sm text-slate-600">
                  All courses include our <span className="font-bold text-blue-600">3-Day Free Trial</span>. After 3 days, students pay the official fee decided by the Sakith Harvan administration.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="rounded-2xl bg-white border border-slate-200/90 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                  >
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {course.badge || course.category}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>3-Day Free Trial</span>
                        </span>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {course.shortTitle}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">{course.tagline}</p>
                      </div>

                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {course.description}
                      </p>

                      {/* Projects Preview */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-100">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real Projects You Build</span>
                        <ul className="space-y-1 text-xs text-slate-700">
                          {course.projects?.slice(0, 2).map((proj, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                              <span className="line-clamp-1">{proj}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Price and CTA */}
                    <div className="p-5 bg-slate-50 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Admin Decided Fee</span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl font-extrabold text-slate-900">₹{(Number(course?.price) || 0).toLocaleString('en-IN')}</span>
                            {course?.originalPrice && (
                              <span className="text-xs text-slate-400 line-through">₹{(Number(course.originalPrice) || 0).toLocaleString('en-IN')}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                          3-Day Trial: Free
                        </span>
                      </div>

                      <button
                        onClick={() => handleStartEnrollment(course)}
                        className="btn-primary w-full py-2.5 text-xs font-bold justify-center shadow-md shadow-blue-500/20"
                      >
                        <span>Enroll &amp; Start 3-Day Trial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. VIEW: CLARITY QUIZ ASSESSMENT (World of Confusion)    */}
      {/* ======================================================== */}
      {viewState === 'quiz' && (
        <div className={`min-h-screen pt-24 pb-20 px-4 sm:px-6 transition-all duration-700 ${getEnvClasses()}`}>
          <div className="container-custom max-w-3xl mx-auto space-y-8">
            {/* Top Navigation & Progress */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <button
                onClick={() => setViewState('landing')}
                className="text-xs text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Back to Overview</span>
              </button>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-cyan-300">
                  Question {currentQuestionIndex + 1} of {QUIZ_QUESTIONS.length}
                </span>
                <span className="text-xs text-slate-400">({Math.round(((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100)}%)</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 via-cyan-300 to-indigo-400 transition-all duration-300 rounded-full"
                style={{ width: `${((currentQuestionIndex + 1) / QUIZ_QUESTIONS.length) * 100}%` }}
              />
            </div>

            {/* Active Question Box */}
            {(() => {
              const activeQ = QUIZ_QUESTIONS[currentQuestionIndex] || QUIZ_QUESTIONS[0];
              return (
                <div className="p-8 sm:p-10 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-xl shadow-2xl space-y-6 animate-in fade-in duration-300">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                      <Compass className="w-3.5 h-3.5 animate-spin" />
                      <span>Interactive Career Diagnostic</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug">
                      {activeQ.question}
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300">
                      {activeQ.subtitle}
                    </p>
                  </div>

                  {/* Dynamic Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {(activeQ.options || []).map((option, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleAnswerOption(activeQ.id, option)}
                        className="p-4 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-cyan-400/80 text-left transition-all duration-200 transform hover:-translate-y-0.5 flex items-center justify-between group cursor-pointer"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-200">
                          {option.label}
                        </span>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Responsive Atmosphere Helper Note */}
            <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Environment ambiance &amp; gear updates immediately with your chosen answers</span>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 3. VIEW: 5-SECOND DIAGNOSTIC COUNTDOWN                   */}
      {/* ======================================================== */}
      {viewState === 'analyzing' && (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-slate-950 via-blue-950 to-slate-950 text-white">
          <div className="max-w-md w-full text-center space-y-8 animate-in zoom-in duration-300">
            {/* Pulsing Center Scanner Ring */}
            <div className="relative w-36 h-36 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-cyan-400/30 animate-ping" />
              <div className="absolute inset-2 rounded-full border-2 border-blue-500 animate-spin" />
              <div className="w-24 h-24 rounded-full bg-blue-600/30 backdrop-blur-md flex items-center justify-center border border-cyan-300 shadow-2xl shadow-cyan-500/50">
                <span className="text-4xl font-extrabold font-mono text-cyan-300">
                  {countdown}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-extrabold text-white">Synthesizing Your Career Anatomy</h3>
              <p className="text-xs text-cyan-300 font-mono tracking-wide animate-pulse">
                {analysisStepText}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-slate-300 text-left space-y-1.5 font-mono">
              <div className="flex justify-between">
                <span>Discipline:</span>
                <span className="text-cyan-300 font-bold">{quizAnswers.branch || 'Engineering'}</span>
              </div>
              <div className="flex justify-between">
                <span>Entry Year:</span>
                <span className="text-cyan-300 font-bold">{quizAnswers.year || '2nd Year'}</span>
              </div>
              <div className="flex justify-between">
                <span>Selected Domain:</span>
                <span className="text-cyan-300 font-bold">{quizAnswers.passionDomain || 'Full Stack'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. VIEW: TOTAL ANATOMY, ROAD MAP & MIND MAP RESULTS      */}
      {/* ======================================================== */}
      {viewState === 'results' && (
        <div className="pt-24 pb-20 px-4 sm:px-6 bg-slate-50 min-h-screen space-y-12">
          <div className="container-custom max-w-5xl mx-auto space-y-10">
            
            {/* Header Scorecard */}
            <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-2xl relative overflow-hidden space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Career Diagnostics Completed</span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-extrabold">
                    Your Personalized Career Anatomy &amp; Strategy
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                    Based on your background in <span className="text-cyan-300 font-bold">{quizAnswers.branch || 'Engineering'}</span> ({quizAnswers.year || 'College'}), here is your blueprint to turn your remaining college years into career preparation.
                  </p>
                </div>

                {/* Clarity Match Circle */}
                <div className="p-5 rounded-2xl bg-white/10 border border-white/20 text-center shrink-0 backdrop-blur-md">
                  <div className="text-3xl sm:text-4xl font-extrabold text-cyan-300 font-mono">96%</div>
                  <div className="text-[11px] text-slate-200 font-medium mt-0.5">Career Clarity Index</div>
                  <div className="text-[10px] text-emerald-400 font-bold mt-1">High Potential Track</div>
                </div>
              </div>

              {/* Anatomy Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Identified Gap</span>
                  <span className="font-bold text-white">Real Git &amp; Cloud Projects</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Priority Focus</span>
                  <span className="font-bold text-cyan-300">{quizAnswers.passionDomain || 'Full Stack'} Core</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Recommended Pace</span>
                  <span className="font-bold text-white">{quizAnswers.weeklyHours || '6-8 Hours'}/Week</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-slate-400 block text-[10px]">Trial Eligibility</span>
                  <span className="font-bold text-emerald-400">3-Day Free Access Active</span>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PART A: CHRONOLOGICAL ROAD MAP                           */}
            {/* ======================================================== */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Chronological Roadmap</span>
                  <h3 className="text-xl font-bold text-slate-900">Your College-to-Career Mileposts</h3>
                </div>
                <span className="text-xs text-slate-500 font-medium">From {quizAnswers.year || 'Today'} to Graduation</span>
              </div>

              <div className="relative border-l-2 border-blue-200 ml-4 space-y-8 pl-6 sm:pl-8 py-2">
                {/* Milestone 1 */}
                <div className="relative group">
                  <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-blue-600 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-blue-600 uppercase">Phase 1: Foundation &amp; Architecture (Month 1-2)</div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">Programming Fluency &amp; Git Version Control</h4>
                    <p className="text-xs text-slate-600">
                      Solidify core language fundamentals (Python/JS/C++), master data structures, configure developer workstations, and push daily commits to GitHub.
                    </p>
                  </div>
                </div>

                {/* Milestone 2 */}
                <div className="relative group">
                  <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-cyan-600 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-cyan-600 uppercase">Phase 2: Domain Deep-Dive (Month 3-4)</div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">Building Real-World Systems ({quizAnswers.passionDomain || 'FSD'})</h4>
                    <p className="text-xs text-slate-600">
                      Construct full stack applications or train AI models using industry libraries (React, Node, PyTorch, Docker). Build client-facing features rather than toy projects.
                    </p>
                  </div>
                </div>

                {/* Milestone 3 */}
                <div className="relative group">
                  <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-indigo-600 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-indigo-600 uppercase">Phase 3: Live Internship &amp; Exposure (Month 5-6)</div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">Sakith Harvan Live Client Internship</h4>
                    <p className="text-xs text-slate-600">
                      Deploy code to production cloud servers, participate in team sprint reviews, collaborate on enterprise SaaS features, earn an official Industrial Certificate &amp; LOR.
                    </p>
                  </div>
                </div>

                {/* Milestone 4 */}
                <div className="relative group">
                  <div className="absolute -left-[33px] sm:-left-[41px] top-0 w-6 h-6 rounded-full bg-emerald-600 border-4 border-white shadow-md flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-emerald-600 uppercase">Phase 4: Placement Triumph (Pre-Graduation)</div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900">ATS Resume &amp; High-Package Tech Interviews</h4>
                    <p className="text-xs text-slate-600">
                      Mock interview simulations with founders and engineering leaders, portfolio walkthroughs, and guaranteed interview shortlists for dream offers.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PART B: INTERACTIVE CAREER MIND MAP                      */}
            {/* ======================================================== */}
            <div className="p-8 rounded-3xl bg-slate-900 text-white border border-blue-500/30 shadow-2xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Interactive Mind Map</span>
                  <h3 className="text-xl font-bold text-white">Your Career Mind Tree</h3>
                </div>
                <span className="text-xs text-slate-400">Click any branch to expand / collapse nodes</span>
              </div>

              {/* Node Tree UI */}
              <div className="space-y-4 text-xs">
                {/* Central Root Node */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-extrabold text-sm sm:text-base shadow-lg flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-yellow-300" />
                    <span>TARGET CAREER: {quizAnswers.dreamGoal || 'High-Package SDE & Specialist'}</span>
                  </div>
                  <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-white/20">Master Node</span>
                </div>

                {/* Branch 1: Core Technologies */}
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <button
                    onClick={() => toggleMindNode('skills')}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-cyan-300">
                      <Code className="w-4 h-4 text-cyan-400" />
                      <span>Branch 1: Core Technical Foundations</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedMindNodes.skills ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMindNodes.skills && (
                    <div className="p-4 pt-1 border-t border-white/10 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Python / Modern JS</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Linear &amp; Non-Linear DSA</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ REST &amp; Database Design</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Git Branching &amp; PRs</div>
                    </div>
                  )}
                </div>

                {/* Branch 2: Production Projects */}
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <button
                    onClick={() => toggleMindNode('projects')}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-indigo-300">
                      <Laptop className="w-4 h-4 text-indigo-400" />
                      <span>Branch 2: Production Capstone Projects</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedMindNodes.projects ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMindNodes.projects && (
                    <div className="p-4 pt-1 border-t border-white/10 bg-slate-950/60 grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-slate-300">
                      <div className="p-2.5 rounded bg-white/5 border border-white/5">
                        <span className="font-bold text-cyan-200 block">Enterprise SaaS Portal</span>
                        <span>Auth, RBAC, billing webhooks &amp; multi-tenant database</span>
                      </div>
                      <div className="p-2.5 rounded bg-white/5 border border-white/5">
                        <span className="font-bold text-cyan-200 block">AI / RAG Search Engine</span>
                        <span>Vector embeddings, prompt pipelines &amp; live document QA</span>
                      </div>
                      <div className="p-2.5 rounded bg-white/5 border border-white/5">
                        <span className="font-bold text-cyan-200 block">Cloud Deployed System</span>
                        <span>Dockerized containers, automated CI/CD &amp; Prometheus monitor</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Branch 3: Live Internship & LOR */}
                <div className="rounded-xl border border-white/10 bg-white/5 overflow-hidden">
                  <button
                    onClick={() => toggleMindNode('internship')}
                    className="w-full p-3.5 flex items-center justify-between text-left hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 font-bold text-emerald-300">
                      <Award className="w-4 h-4 text-emerald-400" />
                      <span>Branch 3: Sakith Harvan Live Internship</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedMindNodes.internship ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedMindNodes.internship && (
                    <div className="p-4 pt-1 border-t border-white/10 bg-slate-950/60 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-300">
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Real Client Tasks</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Founder Code Review</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Industrial Certificate</div>
                      <div className="p-2 rounded bg-white/5 border border-white/5">✓ Pre-Placement Offer (PPO)</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ======================================================== */}
            {/* PART C: SUGGESTED COURSE OF CAREER TRACKS                */}
            {/* ======================================================== */}
            <div className="space-y-6 pt-4">
              <div className="text-center space-y-2">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Recommended Next Step</span>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  Enrolled Tracks Recommended for Your Profile
                </h3>
                <p className="text-xs text-slate-500">
                  Start your 3-day free trial immediately. After 3 days, pay the official fee decided by the admin.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courses.map(course => (
                  <div
                    key={course.id}
                    className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-500 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {course.category}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                          3-Day Trial Free
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-slate-900">{course.shortTitle}</h4>
                      <p className="text-xs text-slate-600 line-clamp-3">{course.description}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs text-slate-500">Admin Decided Fee:</span>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-extrabold text-slate-900">₹{(Number(course?.price) || 0).toLocaleString('en-IN')}</span>
                          {course?.originalPrice && (
                            <span className="text-xs text-slate-400 line-through">₹{(Number(course.originalPrice) || 0).toLocaleString('en-IN')}</span>
                          )}
                        </div>
                      </div>

                      <button
                        onClick={() => handleStartEnrollment(course)}
                        className="btn-primary w-full py-2.5 text-xs font-bold justify-center shadow-md shadow-blue-500/20"
                      >
                        <span>Start 3-Day Free Trial</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 5. VIEW: STUDENT 3-DAY TRIAL DASHBOARD                   */}
      {/* ======================================================== */}
      {viewState === 'trial_dashboard' && (
        <div className="pt-24 pb-20 px-4 sm:px-6 bg-slate-50 min-h-screen">
          <div className="container-custom max-w-5xl mx-auto space-y-8">
            
            {/* Top Student Header */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Course of Career Student Portal</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold">
                  Welcome, {studentUser?.name || 'Candidate'}!
                </h2>
                <p className="text-xs sm:text-sm text-slate-300">
                  Enrolled Track: <span className="text-cyan-300 font-bold">{currentEnrollment?.courseTitle || 'Career Track'}</span>
                </p>
              </div>

              {/* 3-Day Trial Status Badge / Payment Upgrade */}
              <div className="p-4 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md space-y-2 text-right">
                <div className="flex items-center justify-end gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    currentEnrollment?.status === 'Paid & Enrolled'
                      ? 'bg-emerald-500 text-white'
                      : 'bg-amber-400 text-slate-900 animate-pulse'
                  }`}>
                    {currentEnrollment?.status || 'Active Trial (Day 1 of 3)'}
                  </span>
                </div>
                {currentEnrollment?.status !== 'Paid & Enrolled' ? (
                  <div className="space-y-1">
                    <p className="text-[11px] text-slate-300">Trial concludes in 3 days. Course fee decided by admin:</p>
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-lg font-extrabold text-cyan-300">₹{(Number(currentEnrollment?.courseFee) || 6999).toLocaleString('en-IN')}</span>
                      <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="btn-primary text-xs py-1.5 px-3 font-bold bg-emerald-600 hover:bg-emerald-500"
                      >
                        Upgrade Now
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-emerald-300 font-bold flex items-center gap-1.5 justify-end">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Full Lifetime Membership Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Trial 3-Day Interactive Journey Tracker */}
            <div className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">3-Day Trial Curriculum</span>
                  <h3 className="text-xl font-bold text-slate-900">Experience the Full Sakith Harvan Pedagogy</h3>
                </div>
                <span className="text-xs text-slate-500">Days 1, 2, and 3 are 100% free with no credit card required</span>
              </div>

              {/* Day Tabs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { day: 1, label: 'Day 1: Architecture & Foundations', badge: 'Active & Unlocked' },
                  { day: 2, label: 'Day 2: Live Hands-On Builder Challenge', badge: 'Day 2 Unlock' },
                  { day: 3, label: 'Day 3: Cloud Deployment & Capstone Review', badge: 'Day 3 Unlock' }
                ].map(item => (
                  <button
                    key={item.day}
                    onClick={() => setTrialActiveDay(item.day)}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      trialActiveDay === item.day
                        ? 'bg-blue-50 border-blue-600 text-blue-900 shadow-sm'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold">DAY {item.day}</span>
                      <span className="text-[10px] font-semibold text-blue-600">{item.badge}</span>
                    </div>
                    <div className="text-xs font-semibold">{item.label}</div>
                  </button>
                ))}
              </div>

              {/* Active Day Content Panel */}
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                {trialActiveDay === 1 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-blue-700 uppercase">
                      <Play className="w-4 h-4 text-blue-600 fill-current" />
                      <span>Day 1 Session: Architecture Setup &amp; Core Logic</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Deconstructing Modern Production Engineering
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Welcome to your first day! In this orientation and foundational lab, you learn how enterprise systems structure codebases, setup automated linting and formatting, and build your first clean async data handler.
                    </p>
                    <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs text-slate-700">
                      <div className="font-bold text-slate-900">Today's Deliverable:</div>
                      <ul className="space-y-1 list-disc list-inside">
                        <li>Clone starter repository from Sakith Harvan student GitHub</li>
                        <li>Implement async error handler and input sanitizer</li>
                        <li>Submit your first Pull Request for automated mentor evaluation</li>
                      </ul>
                    </div>
                  </div>
                )}

                {trialActiveDay === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 uppercase">
                      <Code className="w-4 h-4 text-cyan-600" />
                      <span>Day 2 Session: Real-World Feature Implementation</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Building the Microservice &amp; REST Endpoint
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Connect your frontend components to a simulated enterprise backend. Learn proper relational indexing, JWT authorization guards, and responsive Tailwind layouts.
                    </p>
                  </div>
                )}

                {trialActiveDay === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 uppercase">
                      <Rocket className="w-4 h-4 text-emerald-600" />
                      <span>Day 3 Session: Production Containerization &amp; Career Consultation</span>
                    </div>
                    <h4 className="text-lg font-bold text-slate-900">
                      Cloud Launch &amp; Personal Career Plan Finalization
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Containerize your work using Docker and push live on Vercel/AWS. Get direct feedback from Maddi Harshavardhan (CEO) or Thoka Sai Krishna (MD).
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ANIMATED MASCOT LOGIN & SIGNUP                    */}
      {/* ======================================================== */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
            
            {/* Close Button */}
            <button
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* THE ANIMATED MASCOT LOGO */}
            <div className="pt-2">
              <AnimatedMascot 
                state={mascotState} 
                isPeeking={showPassword} 
                size="md" 
              />
            </div>

            {/* Auth Title & Toggle */}
            <div className="text-center space-y-1">
              <h3 className="text-xl font-extrabold text-slate-900">
                {authMode === 'signup' ? 'Create Student Account' : 'Welcome Back Student'}
              </h3>
              <p className="text-xs text-slate-500">
                {authMode === 'signup' ? 'Start your 3-day trial and unlock your career trajectory.' : 'Log in to continue your Course of Career journey.'}
              </p>
            </div>

            {/* Tabs: Sign Up vs Login */}
            <div className="flex p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => { setAuthMode('signup'); setMascotState('normal'); }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                  authMode === 'signup' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setMascotState('normal'); }}
                className={`flex-1 py-2 rounded-lg transition-colors cursor-pointer ${
                  authMode === 'login' ? 'bg-white text-blue-700 shadow-sm font-bold' : 'text-slate-600'
                }`}
              >
                Sign In
              </button>
            </div>

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {authMode === 'signup' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={authForm.name}
                      onFocus={() => setMascotState('typing')}
                      onBlur={() => setMascotState('normal')}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      placeholder="e.g. Rahul Varma"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">College</label>
                      <input
                        type="text"
                        required
                        value={authForm.college}
                        onFocus={() => setMascotState('typing')}
                        onBlur={() => setMascotState('normal')}
                        onChange={(e) => setAuthForm({ ...authForm, college: e.target.value })}
                        placeholder="e.g. JNTUH / CBIT"
                        className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Branch</label>
                      <select
                        value={authForm.branch}
                        onChange={(e) => setAuthForm({ ...authForm, branch: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50"
                      >
                        <option value="CSE">CSE</option>
                        <option value="AIML">AIML</option>
                        <option value="Data Science">Data Science</option>
                        <option value="Cyber Security">Cyber Security</option>
                        <option value="IOT">IOT</option>
                        <option value="ECE/Other">ECE/Other</option>
                        <option value="Degree/BCA">Degree/BCA</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={authForm.email}
                  onFocus={() => setMascotState('typing')}
                  onBlur={() => setMascotState('normal')}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                />
              </div>

              {/* PASSWORD FIELD WITH SPECIAL MASCOT ANIMATION TRIGGER */}
              <div className="relative">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password <span className="text-[10px] text-blue-600 font-normal">(Watch the mascot close eyes!)</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={authForm.password}
                    onFocus={() => setMascotState('password')}
                    onBlur={() => {
                      if (!authForm.password) setMascotState('normal');
                    }}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    placeholder="Enter password..."
                    className="w-full pl-3.5 pr-10 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-600 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password & peek'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="btn-primary w-full py-2.5 text-xs font-bold justify-center shadow-lg shadow-blue-500/25 mt-2"
              >
                {authMode === 'signup' ? 'Start 3-Day Free Trial' : 'Sign In to Portal'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADMIN CONTROLLED PAYMENT CHECKOUT                 */}
      {/* ======================================================== */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Official Program Enrollment</span>
                <h3 className="text-xl font-bold text-slate-900">
                  {currentEnrollment?.courseTitle || 'Course of Career Program'}
                </h3>
              </div>
              <button
                onClick={() => { setIsPaymentModalOpen(false); setPaymentSuccess(false); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!paymentSuccess ? (
              <div className="space-y-4">
                {/* Fee Card */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>Program Tuition (Admin Decided):</span>
                    <span className="font-bold text-slate-900">₹{(Number(currentEnrollment?.courseFee) || 6999).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>3-Day Trial Discount:</span>
                    <span className="text-emerald-700 font-bold">Applied (-100% on Trial)</span>
                  </div>
                  <div className="pt-2 border-t border-blue-200 flex items-baseline justify-between">
                    <span className="text-xs font-bold text-slate-900">Total Payable:</span>
                    <span className="text-2xl font-extrabold text-blue-700 font-mono">
                      ₹{(Number(currentEnrollment?.courseFee) || 6999).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                    {['upi', 'card', 'netbanking'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setPaymentMethod(m)}
                        className={`p-2.5 rounded-xl border text-center uppercase tracking-wider cursor-pointer ${
                          paymentMethod === m ? 'bg-blue-600 text-white font-bold' : 'bg-slate-50 border-slate-200 text-slate-600'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pay Button */}
                <button
                  onClick={handlePaymentComplete}
                  className="btn-primary w-full py-3 text-xs font-bold justify-center shadow-lg shadow-blue-500/30"
                >
                  Pay ₹{(Number(currentEnrollment?.courseFee) || 6999).toLocaleString('en-IN')} &amp; Unlock Lifetime Access
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xl font-bold text-slate-900">Payment Confirmed!</h4>
                  <p className="text-xs text-slate-500">
                    Your 3-day trial has been upgraded to Full Student Membership. Reference: <span className="font-mono text-blue-600 font-bold">{currentEnrollment?.paymentRef}</span>
                  </p>
                </div>
                <button
                  onClick={() => { setIsPaymentModalOpen(false); setPaymentSuccess(false); }}
                  className="btn-primary w-full py-2.5 text-xs font-bold justify-center"
                >
                  Return to Student Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
