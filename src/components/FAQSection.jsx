import React, { useState } from 'react';
import { HelpCircle, ChevronDown, Sparkles, MessageSquare, PhoneCall, Calendar, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const FAQSection = ({ onOpenConsultation, onOpenRequirement }) => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      question: "What types of websites and digital solutions does Sakith Harvan Technologies build?",
      answer: "We build bespoke digital products tailored to your exact business model: Enterprise SaaS platforms (ERP, SIS, HRMS, CRM), Custom Websites (Corporate, E-Commerce, Hospital & Healthcare, Educational, Real Estate, Restaurant, Startup landing pages), Mobile Applications (iOS & Android with Flutter and React Native), Agentic AI systems, and cloud infrastructure on Microsoft Azure and AWS."
    },
    {
      question: "How do you deliver projects faster without compromising on software quality?",
      answer: "Our founding leadership (Thoka Sai Krishna and Maddi Harshavardhan) directly architectures each project. We utilize modular, battle-tested modern tech stacks (React, Vite, Node, Tailwind, Azure), zero-bloat codebases, and continuous integration, eliminating agency bureaucracy and delivering production-ready platforms in record time."
    },
    {
      question: "Can you build custom SaaS platforms with recurring payment gateways and multi-tenancy?",
      answer: "Yes, absolutely. We engineer complete multi-tenant cloud SaaS systems featuring secure authentication (OAuth, SSO, JWT), automated subscription billing engines (Stripe, Razorpay), role-based permissions (RBAC), and intuitive executive analytics dashboards."
    },
    {
      question: "What is your typical project timeline from scope to deployment?",
      answer: "Project timelines depend on complexity. Standard high-performance websites and landing pages are typically delivered within 7 to 14 days. Custom web applications and enterprise SaaS platforms take 3 to 6 weeks. We work in transparent agile milestone sprints with continuous live client previews."
    },
    {
      question: "Do you provide ongoing technical support, cloud hosting, and maintenance SLAs?",
      answer: "Yes. Every system we deploy comes with enterprise-grade maintenance agreements. We configure Microsoft Azure or AWS cloud provisioning, automated database replication and backups, SSL/TLS certificates, security hardening, and dedicated 24/7 technical monitoring."
    },
    {
      question: "How does the direct founder consultation session work?",
      answer: "When you book a free 30-minute technical consultation, you speak directly with Thoka Sai Krishna or Maddi Harshavardhan. We review your requirements, analyze feasibility, recommend the optimal architecture and cloud stack, and provide an accurate cost and timeline estimation."
    },
    {
      question: "Do you offer hands-on technology workshops and institutional bootcamps?",
      answer: "Yes. We conduct hands-on technology bootcamps and practical coding labs for universities, engineering colleges, and corporate organizations covering Cloud Azure, Agentic AI, Full-Stack development, and real-world project deployment."
    }
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(prev => (prev === index ? null : index));
  };

  return (
    <section id="faqs" className="py-20 md:py-28 relative bg-slate-50 min-h-[70vh] overflow-hidden">
      {/* Soft Blue Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="container-custom relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center space-y-4 mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold shadow-sm">
            <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
            <span>Frequently Asked Questions</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need <span className="text-gradient">to Know</span>
          </h2>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Clear answers about our engineering process, website development capabilities, enterprise SaaS delivery, and founder consultation.
          </p>
        </div>

        {/* FAQs Accordion */}
        <div className="max-w-3xl mx-auto space-y-3.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={`rounded-2xl transition-all border overflow-hidden ${
                  isOpen
                    ? 'bg-white border-blue-400 shadow-md ring-1 ring-blue-300'
                    : 'bg-white hover:bg-slate-50/80 border-slate-200 shadow-sm'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleFAQ(index)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <span className={`text-base font-bold transition-colors ${
                    isOpen ? 'text-blue-700' : 'text-slate-900'
                  }`}>
                    {faq.question}
                  </span>

                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
                    isOpen ? 'bg-blue-50 text-blue-600 rotate-180' : 'bg-slate-100 text-slate-500'
                  }`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-blue-50/20 animate-in fade-in duration-200">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions Callout Card */}
        <div className="max-w-3xl mx-auto mt-14 p-6 sm:p-8 rounded-3xl bg-white border border-blue-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h4 className="text-lg font-bold text-slate-900 flex items-center justify-center sm:justify-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Have a question not listed here?</span>
            </h4>
            <p className="text-xs text-slate-600">
              Speak directly with our engineering founders to discuss your exact software scope.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onOpenConsultation}
              className="btn-primary text-xs py-2.5 px-5 font-semibold"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Ask Founders</span>
            </button>
            <button
              onClick={() => onOpenRequirement && onOpenRequirement({})}
              className="btn-secondary text-xs py-2.5 px-4 font-semibold"
            >
              <span>Submit Scope</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
