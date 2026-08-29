import React, { useState, useEffect } from 'react';
import {
  Plus, FileText, Download, Trash2, Eye, X, CheckCircle2, Building, User,
  DollarSign, Calculator, Layers, Sparkles, BookOpen, Monitor, ShieldCheck, Printer, ArrowRight, Tag, FileCheck
} from 'lucide-react';
import logoImg from '../assets/logo.png';
import {
  saveQuotationToSupabase,
  deleteQuotationFromSupabase,
  fetchQuotationsFromSupabase
} from '../lib/supabaseClient';

export const SOFTWARE_TYPES = [
  { id: 'erp', name: 'ERP System', defaultPricePerLogin: 85, isErp: true, note: 'Default ₹85/- per login (Customizable)' },
  { id: 'saas', name: 'SaaS Platform', defaultPrice: 25000 },
  { id: 'exam_portal', name: 'Exam Portal', defaultPrice: 5000 },
  { id: 'college_website', name: 'College or School Website', defaultPrice: 8000, isFixed8k: true, note: 'Fixed ₹8,000/-' },
  { id: 'hospital_website', name: 'Medical or Hospital Website', defaultPrice: 12000 },
  { id: 'ecommerce', name: 'E-Commerce Website / App', defaultPrice: 18000 },
  { id: 'ai_bot', name: 'AI Bot', defaultPrice: 9000 },
  { id: 'ai_agent', name: 'AI Agent', isAiAgent: true, note: 'Admin inputs price' },
  { id: 'kirana_app', name: 'Kirana and General Store App', defaultPrice: 10000 },
  { id: 'others', name: 'Others', isOthers: true, note: 'Specify custom app type' }
];

export const getDynamicTermsList = (q) => [
  { id: 1, title: 'Quotation Validity', text: `This quotation is valid for ${q.validityDays || '15'} days from the date of issue unless otherwise specified.` },
  { id: 2, title: 'Project Scope', text: 'The project will be developed strictly according to the features and requirements mentioned in this quotation. Any additional features or changes outside the agreed scope will be treated as a Change Request and may incur additional charges.' },
  { id: 3, title: 'Payment Terms', text: `Development will begin after receipt of the agreed ${q.advancePaymentPercent || '50'}% advance payment. Remaining payments shall be made according to the milestones mentioned in the quotation.` },
  { id: 4, title: 'Payment Delay', text: 'If any payment is delayed beyond the agreed date, the Company reserves the right to temporarily pause development, delivery, deployment, or support until the outstanding amount is cleared.' },
  { id: 5, title: 'Client Responsibilities', text: 'The client must provide required content, information, approvals, credentials, images, documents, and feedback within the agreed timeline. Delays from the client side may affect the project delivery date.' },
  { id: 6, title: 'Revisions', text: `The quotation includes ${q.revisionsCount || '3 revisions'} specifically mentioned in the project scope. Additional revisions or major design changes may be charged separately.` },
  { id: 7, title: 'Delivery Timeline', text: `The estimated delivery timeline is ${q.deliveryTimeline || '3 to 4 Weeks'}, depending on timely approvals, content submission, feedback, and payments from the client. Delays caused by third-party services or client-side dependencies may extend the timeline.` },
  { id: 8, title: 'Third-Party Services', text: 'Domain, hosting, cloud services, APIs, payment gateways, SMS, email services, software licences, and other third-party services are not included unless specifically mentioned in the quotation. Their charges shall be borne by the client.' },
  { id: 9, title: 'Testing & Approval', text: 'The client will be provided an opportunity to review and test the completed project. Any issues related to the agreed scope will be addressed before final delivery.' },
  { id: 10, title: 'Additional Features', text: 'New modules, integrations, platforms, major redesigns, or functionality requested after approval of the scope will require a separate quotation or additional charges.' },
  { id: 11, title: 'Intellectual Property', text: 'Ownership or transfer of the final project/source code will be as specified in this quotation or project agreement. The Company retains ownership of its pre-existing tools, reusable components, frameworks, libraries, and proprietary development resources.' },
  { id: 12, title: 'Source Code', text: q.includeSourceCode === 'Yes' ? 'Source code delivery is INCLUDED in this quotation and will be handed over after all applicable payments are fully settled.' : 'Source code delivery is EXCLUDED unless specifically agreed upon in writing and fully settled.' },
  { id: 13, title: 'Support & Maintenance', text: `Post-delivery support: ${q.supportPeriod || '1 Year Support Included'}. Post-delivery maintenance, hosting, updates, and AMC will be provided according to these terms. New features are not considered part of normal maintenance.` },
  { id: 14, title: 'Cancellation', text: 'If the project is cancelled after development has commenced, payments for completed work, approved milestones, third-party expenses, and other committed costs shall remain payable. Refunds, if any, will be handled according to the agreed project terms.' },
  { id: 15, title: 'Confidentiality', text: 'Both parties agree to keep confidential business, technical, financial, customer, and project information received during the engagement.' },
  { id: 16, title: 'Client Content & Data', text: 'The client is responsible for ensuring that all content, data, images, documents, trademarks, and other materials supplied for the project are legally permitted to be used.' },
  { id: 17, title: 'Final Delivery', text: 'Final deployment, transfer of project files, credentials, or source code, where applicable, will be completed after receipt of all outstanding payments.' },
  { id: 18, title: 'Acceptance', text: 'Approval of this quotation through signature, email, written confirmation, purchase order, or advance payment will be considered acceptance of the quotation and its Terms & Conditions.' }
];

export const QuotationMaker = () => {
  const [quotations, setQuotations] = useState([]);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState(null);

  // Wizard Step Form State
  const [domain, setDomain] = useState(''); // 'Software' or 'Workshop'
  const [formData, setFormData] = useState({
    clientName: '',
    clientOrganization: '',
    clientEmail: '',
    clientPhone: '',

    // Software Specific
    appName: '',
    description: '',
    projectType: 'erp',
    customAppType: '',
    approxScreens: '10',
    hasLogins: 'Yes',
    loginsCount: '100',
    erpRatePerLogin: '85',

    // Workshop Specific
    workshopTopic: '',
    workshopCandidates: '50',
    workshopDays: '3',
    workshopPricePerCandidate: '500',

    // Financials & Discount Module
    basePrice: '8500',
    cloudHostingFee: '0',

    // Discount Question State
    applyDiscount: 'No',
    discountAmount: '0',
    discountReason: '',

    // Terms & Conditions Custom Admin Parameters
    validityDays: '15',
    advancePaymentPercent: '50',
    deliveryTimeline: '3 to 4 Weeks',
    revisionsCount: '3 Revisions',
    includeSourceCode: 'No',
    supportPeriod: '1 Year Technical Support',

    taxGstPercent: '0',
    notes: 'Quotation valid for 15 days from date of issuance. 50% advance payment required on project sign-off.'
  });

  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = () => {
    const stored = JSON.parse(localStorage.getItem('sh_quotations') || '[]');
    if (stored.length === 0) {
      const sampleQuotation = {
        id: 'SHT-QT-2026-1001',
        domain: 'Software',
        clientName: 'Dr. K. Ramanathan',
        clientOrganization: 'Apex Group of Institutions',
        clientEmail: 'k.ramanathan@apexedu.in',
        clientPhone: '+91 9845012345',
        appName: 'CampX Integrated Campus ERP',
        projectType: 'ERP System',
        description: 'Complete student information system, attendance ledger, and fee gateway integration.',
        approxScreens: '18',
        hasLogins: 'Yes',
        loginsCount: '1000',
        erpRatePerLogin: '85',
        basePrice: 85000,
        cloudHostingFee: 5000,
        applyDiscount: 'Yes',
        discountAmount: 2000,
        discountReason: 'Institutional Partner Early-Bird Waiver',
        validityDays: '15',
        advancePaymentPercent: '50',
        deliveryTimeline: '3 to 4 Weeks',
        revisionsCount: '3 Revisions',
        includeSourceCode: 'No',
        supportPeriod: '1 Year Technical Support',
        taxGstPercent: 0,
        totalAmount: 88000,
        date: new Date().toISOString().split('T')[0],
        notes: 'Quotation valid for 15 days from date of issuance. Includes 1-year priority technical support.'
      };
      setQuotations([sampleQuotation]);
      localStorage.setItem('sh_quotations', JSON.stringify([sampleQuotation]));
    } else {
      setQuotations(stored);
    }
  };

  const handleProjectTypeChange = (typeId) => {
    const selectedObj = SOFTWARE_TYPES.find(t => t.id === typeId);
    let calculatedPrice = formData.basePrice;

    if (selectedObj?.isErp) {
      const logins = parseInt(formData.loginsCount || '0', 10);
      const rate = parseFloat(formData.erpRatePerLogin || '85');
      calculatedPrice = (logins * rate).toString();
    } else if (selectedObj?.isFixed8k) {
      calculatedPrice = '8000';
    } else if (selectedObj?.isAiAgent) {
      calculatedPrice = formData.basePrice || '25000';
    } else if (selectedObj?.defaultPrice) {
      calculatedPrice = selectedObj.defaultPrice.toString();
    }

    setFormData({
      ...formData,
      projectType: typeId,
      basePrice: calculatedPrice
    });
  };

  const handleLoginsOrRateChange = (countVal, rateVal) => {
    const logins = parseInt(countVal || '0', 10);
    const rate = parseFloat(rateVal || '0');
    let calculatedPrice = formData.basePrice;
    if (formData.projectType === 'erp') {
      calculatedPrice = (logins * rate).toString();
    }
    setFormData({
      ...formData,
      loginsCount: countVal,
      erpRatePerLogin: rateVal,
      basePrice: calculatedPrice
    });
  };

  const handleWorkshopCandidatesChange = (candidatesVal, pricePerCandidateVal) => {
    const candidates = parseInt(candidatesVal || '0', 10);
    const ppc = parseInt(pricePerCandidateVal || '0', 10);
    const totalWorkshopPrice = (candidates * ppc).toString();
    setFormData({
      ...formData,
      workshopCandidates: candidatesVal,
      workshopPricePerCandidate: pricePerCandidateVal,
      basePrice: totalWorkshopPrice
    });
  };

  const calculateFinalTotal = (data) => {
    const base = parseFloat(data.basePrice || 0);
    const hosting = parseFloat(data.cloudHostingFee || 0);
    const disc = data.applyDiscount === 'Yes' ? parseFloat(data.discountAmount || 0) : 0;
    const subtotal = Math.max(0, base + hosting - disc);
    const gstPct = parseFloat(data.taxGstPercent || 0);
    const taxAmount = (subtotal * gstPct) / 100;
    return Math.round(subtotal + taxAmount);
  };

  const handleOpenWizard = () => {
    setDomain('');
    setFormData({
      clientName: '',
      clientOrganization: '',
      clientEmail: '',
      clientPhone: '',
      appName: '',
      description: '',
      projectType: 'erp',
      customAppType: '',
      approxScreens: '12',
      hasLogins: 'Yes',
      loginsCount: '100',
      erpRatePerLogin: '85',
      workshopTopic: '',
      workshopCandidates: '50',
      workshopDays: '3',
      workshopPricePerCandidate: '500',
      basePrice: '8500',
      cloudHostingFee: '0',
      applyDiscount: 'No',
      discountAmount: '0',
      discountReason: '',
      validityDays: '15',
      advancePaymentPercent: '50',
      deliveryTimeline: '3 to 4 Weeks',
      revisionsCount: '3 Revisions',
      includeSourceCode: 'No',
      supportPeriod: '1 Year Technical Support',
      taxGstPercent: '0',
      notes: 'Quotation valid for 15 days from date of issuance. Development starts after agreed advance payment.'
    });
    setIsWizardOpen(true);
  };

  const handleGenerateQuotation = (e) => {
    e.preventDefault();
    const generatedId = 'SHT-QT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const finalProjectTypeName = domain === 'Software'
      ? (formData.projectType === 'others'
        ? (formData.customAppType || 'Custom Software')
        : (SOFTWARE_TYPES.find(t => t.id === formData.projectType)?.name || 'Custom Software'))
      : `Technology Workshop: ${formData.workshopTopic || 'Campus Bootcamp'}`;

    const totalCalculated = calculateFinalTotal(formData);

    const newQuotation = {
      id: generatedId,
      domain: domain,
      clientName: formData.clientName || 'Valued Client',
      clientOrganization: formData.clientOrganization || 'Organization',
      clientEmail: formData.clientEmail,
      clientPhone: formData.clientPhone,

      appName: domain === 'Software' ? (formData.appName || 'Custom Application') : (formData.workshopTopic || 'Workshop Bootcamp'),
      projectType: finalProjectTypeName,
      rawProjectType: formData.projectType,
      description: formData.description,
      approxScreens: formData.approxScreens,
      hasLogins: formData.hasLogins,
      loginsCount: formData.hasLogins === 'Yes' ? formData.loginsCount : '0',
      erpRatePerLogin: formData.projectType === 'erp' ? formData.erpRatePerLogin : '85',

      workshopCandidates: formData.workshopCandidates,
      workshopDays: formData.workshopDays,
      workshopPricePerCandidate: formData.workshopPricePerCandidate,

      basePrice: parseFloat(formData.basePrice || 0),
      cloudHostingFee: parseFloat(formData.cloudHostingFee || 0),

      applyDiscount: formData.applyDiscount,
      discountAmount: formData.applyDiscount === 'Yes' ? parseFloat(formData.discountAmount || 0) : 0,
      discountReason: formData.applyDiscount === 'Yes' ? formData.discountReason : '',

      validityDays: formData.validityDays || '15',
      advancePaymentPercent: formData.advancePaymentPercent || '50',
      deliveryTimeline: formData.deliveryTimeline || '3 to 4 Weeks',
      revisionsCount: formData.revisionsCount || '3 Revisions',
      includeSourceCode: formData.includeSourceCode || 'No',
      supportPeriod: formData.supportPeriod || '1 Year Technical Support',

      taxGstPercent: parseFloat(formData.taxGstPercent || 0),
      totalAmount: totalCalculated,
      date: new Date().toISOString().split('T')[0],
      notes: formData.notes
    };

    const updatedList = [newQuotation, ...quotations];
    setQuotations(updatedList);
    localStorage.setItem('sh_quotations', JSON.stringify(updatedList));

    // Sync to Supabase cloud database
    saveQuotationToSupabase(newQuotation);

    setIsWizardOpen(false);
    setSelectedPreview(newQuotation);
  };

  const handleDeleteQuotation = (id) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      const updated = quotations.filter(q => q.id !== id);
      setQuotations(updated);
      localStorage.setItem('sh_quotations', JSON.stringify(updated));

      // Sync deletion to Supabase cloud database
      deleteQuotationFromSupabase(id);
    }
  };

  // Print PDF Generator function with dynamic 18 Terms & Conditions
  const handlePrintPDF = (q) => {
    const printWindow = window.open('', '_blank', 'width=950,height=1050');
    if (!printWindow) {
      alert('Please allow popups to generate and download PDF quotation.');
      return;
    }

    const hasDiscount = q.applyDiscount === 'Yes' && parseFloat(q.discountAmount || 0) > 0;
    const dynamicTerms = getDynamicTermsList(q);

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Quotation_${q.id}_Sakith_Harvan_Technologies</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            * { box-sizing: border-box; font-family: 'Plus Jakarta Sans', sans-serif; }
            body { margin: 0; padding: 32px; color: #0f172a; background: #ffffff; }
            
            .header-bar { display: flex; align-items: center; justify-between; border-bottom: 3px solid #dc2626; padding-bottom: 16px; margin-bottom: 24px; }
            .company-info h1 { margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; }
            .company-info p { margin: 2px 0; font-size: 11px; color: #475569; }
            .tagline { color: #dc2626; font-style: italic; font-weight: 600; font-size: 12px; margin-top: 3px; }
            .logo-img { height: 60px; width: auto; object-fit: contain; }
            
            .meta-grid { display: flex; justify-between; margin-bottom: 24px; }
            .box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 14px; width: 48%; border-radius: 8px; }
            .box h3 { margin: 0 0 8px 0; font-size: 12px; text-transform: uppercase; color: #dc2626; font-weight: 700; }
            .box p { margin: 3px 0; font-size: 11px; }
            
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            th { background: #0f172a; color: #ffffff; text-align: left; padding: 10px; font-size: 11px; text-transform: uppercase; }
            td { border-bottom: 1px solid #e2e8f0; padding: 10px; font-size: 11px; }
            tr:nth-child(even) { background: #f8fafc; }
            
            .total-table { width: 340px; margin-left: auto; border-collapse: collapse; }
            .total-table td { padding: 8px 12px; }
            .total-table .grand-total { font-size: 15px; font-weight: 800; color: #dc2626; background: #fef2f2; border-top: 2px solid #dc2626; }
            
            .terms-summary { margin-top: 24px; padding: 12px; background: #f8fafc; border-left: 4px solid #dc2626; border-radius: 4px; font-size: 11px; color: #475569; }
            .footer-sign { margin-top: 36px; display: flex; justify-between; align-items: flex-end; }
            .sign-box { text-align: center; }
            .sign-line { width: 200px; border-top: 1px dashed #94a3b8; margin-top: 30px; padding-top: 6px; font-size: 11px; font-weight: 700; }
            
            /* PAGE 2 STYLING & PAGE BREAK */
            .page-break { page-break-before: always; margin-top: 40px; padding-top: 20px; }
            .tc-title { font-size: 16px; font-weight: 800; color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 6px; margin-bottom: 16px; text-transform: uppercase; }
            .tc-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 9.5px; line-height: 1.35; color: #334155; }
            .tc-item { background: #f8fafc; padding: 8px 10px; border-radius: 6px; border: 1px solid #e2e8f0; }
            .tc-item strong { color: #0f172a; font-weight: 700; }
            
            .note-box { margin-top: 16px; padding: 10px 12px; background: #fef2f2; border: 1px solid #fca5a5; border-radius: 6px; font-size: 10px; color: #991b1b; font-weight: 600; }
            .branding-footer { margin-top: 24px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 14px; }
            .branding-footer h3 { margin: 0; font-size: 14px; font-weight: 800; color: #0f172a; }
            .branding-footer p { margin: 2px 0 0 0; font-size: 11px; color: #dc2626; font-style: italic; font-weight: 600; }

            @media print {
              body { padding: 16px; }
              .page-break { page-break-before: always; }
            }
          </style>
        </head>
        <body>
          <!-- PAGE 1: QUOTATION OVERVIEW & PRICING -->
          <div class="header-bar">
            <div class="company-info">
              <h1>Sakith Harvan Technologies</h1>
              <div class="tagline">"Innovate. Integrate. Elevate."</div>
              <p>Contact: +91 7981847745 | +91 9014340739</p>
              <p>Email: mharshavardhan048@gmail.com | saikrishnathoka2526@gmail.com</p>
              <p>Website: https://sakithharvan.com/</p>
            </div>
            <img src="${logoImg}" class="logo-img" alt="Sakith Harvan Technologies" />
          </div>

          <div class="meta-grid">
            <div class="box">
              <h3>Client Details</h3>
              <p><strong>Client Name:</strong> ${q.clientName}</p>
              <p><strong>Organization:</strong> ${q.clientOrganization}</p>
              <p><strong>Email:</strong> ${q.clientEmail || 'N/A'}</p>
              <p><strong>Phone:</strong> ${q.clientPhone || 'N/A'}</p>
            </div>

            <div class="box">
              <h3>Quotation Meta</h3>
              <p><strong>Quotation Ref #:</strong> ${q.id}</p>
              <p><strong>Date of Issue:</strong> ${q.date}</p>
              <p><strong>Validity:</strong> ${q.validityDays || '15'} Days</p>
              <p><strong>Project Category:</strong> ${q.projectType}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Scope Item / Description</th>
                <th>Specifications &amp; Terms</th>
                <th style="text-align: right;">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <strong>${q.appName}</strong><br/>
                  <span style="color:#64748b; font-size: 10px;">${q.description || 'Full-stack software development & architecture execution'}</span>
                </td>
                <td>
                  ${q.domain === 'Software' ? `
                    • Approx. Screens: ${q.approxScreens || 'N/A'}<br/>
                    • Logins Enabled: ${q.hasLogins === 'Yes' ? `${q.loginsCount} Users (${q.rawProjectType === 'erp' || q.projectType.includes('ERP') ? `Rate: ₹${q.erpRatePerLogin || '85'}/login` : 'Standard'})` : 'No Logins Needed'}<br/>
                    • Delivery Timeline: ${q.deliveryTimeline || '3-4 Weeks'}<br/>
                    • Included Revisions: ${q.revisionsCount || '3 Revisions'}<br/>
                    • Support Period: ${q.supportPeriod || '1 Year Support'}
                  ` : `
                    • Attendees: ${q.workshopCandidates} Candidates<br/>
                    • Duration: ${q.workshopDays} Days Training
                  `}
                </td>
                <td style="text-align: right; font-weight: 700;">₹${q.basePrice.toLocaleString('en-IN')}</td>
              </tr>
              ${q.cloudHostingFee > 0 ? `
                <tr>
                  <td>Cloud Hosting & Deployment Setup</td>
                  <td>Azure / AWS Server Provisioning & SSL Setup</td>
                  <td style="text-align: right;">₹${q.cloudHostingFee.toLocaleString('en-IN')}</td>
                </tr>
              ` : ''}
              ${hasDiscount ? `
                <tr style="color: #16a34a; background-color: #f0fdf4;">
                  <td>
                    <strong>Special Discount Applied</strong><br/>
                    <span style="font-size: 10px; color: #15803d;">${q.discountReason || 'Special Concession Waiver'}</span>
                  </td>
                  <td>Applied Partner Concession</td>
                  <td style="text-align: right; font-weight: 700;">- ₹${parseFloat(q.discountAmount).toLocaleString('en-IN')}</td>
                </tr>
              ` : ''}
            </tbody>
          </table>

          <table class="total-table">
            <tr class="grand-total">
              <td>Total Amount (INR):</td>
              <td style="text-align: right;">₹${q.totalAmount.toLocaleString('en-IN')}</td>
            </tr>
          </table>

          <div class="terms-summary">
            <strong>Key Executive Summary:</strong>
            <p>• Advance Payment: ${q.advancePaymentPercent || '50'}% on sign-off | Delivery Timeline: ${q.deliveryTimeline || '3-4 Weeks'} | Source Code: ${q.includeSourceCode === 'Yes' ? 'Included' : 'Excluded'}</p>
            <p>Please refer to Page 2 for official Terms & Conditions governance.</p>
          </div>

          <div class="footer-sign">
            <div>
              <p style="font-size: 10px; color: #64748b;">Page 1 of 2 • Electronically verified quotation document.</p>
            </div>
            <div class="sign-box">
              <div class="sign-line">Authorized Signatory</div>
              <p style="font-size: 10px; color: #64748b; margin-top:2px;">Sakith Harvan Technologies</p>
            </div>
          </div>

          <!-- PAGE 2: OFFICIAL DYNAMIC TERMS & CONDITIONS -->
          <div class="page-break">
            <div class="header-bar">
              <div class="company-info">
                <h1>Sakith Harvan Technologies</h1>
                <div class="tagline">"Innovate. Integrate. Elevate."</div>
                <p>Official Terms &amp; Conditions Document • Reference #: ${q.id}</p>
              </div>
              <img src="${logoImg}" class="logo-img" alt="Sakith Harvan Technologies" />
            </div>

            <div class="tc-title">Terms &amp; Conditions</div>

            <div class="tc-grid">
              ${dynamicTerms.map(tc => `
                <div class="tc-item">
                  <strong>${tc.id}. ${tc.title}:</strong> ${tc.text}
                </div>
              `).join('')}
            </div>

            <div class="note-box">
              <strong>Note:</strong> Final pricing, scope, timeline, deliverables, support, and payment terms are subject to the details specified in this quotation.
            </div>

            <div class="branding-footer">
              <h3>Sakith Harvan Technologies</h3>
              <p>"Innovate. Integrate. Elevate."</p>
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-red-500/30 glow-blue">
        <div>
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Calculator className="w-5 h-5 text-rose-400" />
            <span>Sakith Harvan Official Quotation Maker Engine</span>
          </h4>
          <p className="text-xs text-slate-300">
            Generate official multi-page quotations with custom pricing rules, discounts, and strict Terms &amp; Conditions on Page 2.
          </p>
        </div>

        <button
          onClick={handleOpenWizard}
          className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 glow-blue shrink-0 font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Quotation</span>
        </button>
      </div>

      {/* Previously Created Quotations Table / Overview */}
      <div className="glass-card p-6 rounded-2xl border border-white/10 space-y-4 bg-slate-900/90">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>Previously Generated Quotations ({quotations.length})</span>
          </h4>
          <span className="text-xs text-slate-400">Stored in executive system records</span>
        </div>

        {quotations.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-sm">
            No quotations created yet. Click <strong>"+ Create New Quotation"</strong> to generate your first quotation.
          </div>
        ) : (
          <div className="space-y-3">
            {quotations.map((q) => (
              <div
                key={q.id}
                className="p-4 rounded-xl bg-slate-950 border border-white/10 hover:border-red-500/40 transition-colors flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded bg-red-950 text-rose-400 border border-red-500/30 text-[10px] font-mono font-bold">
                      {q.id}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">({q.date})</span>
                    {q.applyDiscount === 'Yes' && parseFloat(q.discountAmount || 0) > 0 && (
                      <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center gap-1">
                        <Tag className="w-3 h-3" /> Discounted (-₹{q.discountAmount})
                      </span>
                    )}
                  </div>
                  <h5 className="font-bold text-white text-sm">{q.appName}</h5>
                  <p className="text-xs text-slate-300">
                    Client: <strong className="text-slate-200">{q.clientName}</strong> ({q.clientOrganization}) • <span className="text-cyan-400">{q.projectType}</span>
                  </p>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Total Valuation</div>
                    <div className="text-lg font-extrabold text-emerald-400">₹{q.totalAmount.toLocaleString('en-IN')}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPreview(q)}
                      className="p-2 rounded-lg bg-slate-900 border border-white/10 text-cyan-400 hover:bg-slate-800 text-xs flex items-center gap-1 font-semibold"
                      title="Preview Quotation Document"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Preview</span>
                    </button>

                    <button
                      onClick={() => handlePrintPDF(q)}
                      className="btn-cyan py-1.5 px-3 text-xs flex items-center gap-1.5 font-bold shadow-md shadow-cyan-500/20"
                      title="Download PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => handleDeleteQuotation(q.id)}
                      className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900"
                      title="Delete Quotation"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* STEP-BY-STEP QUOTATION CREATION WIZARD MODAL */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-red-500/40 space-y-6 max-h-[90vh] overflow-y-auto glow-blue">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-red-950 text-rose-400 border border-red-500/30">
                  <Calculator className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white">Create New Official Quotation</h4>
                  <p className="text-xs text-slate-400">Sakith Harvan Technologies Quotation Generator</p>
                </div>
              </div>

              <button onClick={() => setIsWizardOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* STEP 1: CHOOSE WORKSHOP OR SOFTWARE */}
            {!domain ? (
              <div className="space-y-4 py-4 text-center">
                <h5 className="text-base font-bold text-white">Select Quotation Category</h5>
                <p className="text-xs text-slate-300">Choose whether this quotation is for a Software Project or a Technology Workshop.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setDomain('Software');
                      handleProjectTypeChange('erp');
                    }}
                    className="p-6 rounded-2xl bg-slate-900 border border-white/10 hover:border-red-500 hover:bg-slate-800/80 transition-all text-center space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-500/30 text-rose-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-white text-base">Software Project</div>
                    <p className="text-xs text-slate-400">ERP Systems, SaaS, Portals, Websites, AI Agents &amp; Mobile Apps</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDomain('Workshop');
                      setFormData({ ...formData, basePrice: '25000' });
                    }}
                    className="p-6 rounded-2xl bg-slate-900 border border-white/10 hover:border-cyan-500 hover:bg-slate-800/80 transition-all text-center space-y-3 group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div className="font-bold text-white text-base">Technology Workshop</div>
                    <p className="text-xs text-slate-400">Hands-on College Bootcamps, Institutional Training &amp; Corporate Sessions</p>
                  </button>
                </div>
              </div>
            ) : (
              /* STEP 2: FORM INPUTS FOR SELECTED DOMAIN */
              <form onSubmit={handleGenerateQuotation} className="space-y-5 text-xs">
                {/* Domain Header Badge */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-semibold">Selected Category:</span>
                    <span className="px-2.5 py-0.5 rounded bg-red-950 text-rose-400 font-bold font-mono uppercase">
                      {domain}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setDomain('')}
                    className="text-xs text-cyan-400 hover:underline font-semibold"
                  >
                    Change Category
                  </button>
                </div>

                {/* CLIENT DETAILS */}
                <div className="space-y-3 p-4 rounded-xl bg-slate-900/90 border border-white/10">
                  <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">Client Information</h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Client Contact Person Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Organization / College Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.clientOrganization}
                        onChange={(e) => setFormData({ ...formData, clientOrganization: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Client Email Address</label>
                      <input
                        type="email"
                        value={formData.clientEmail}
                        onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Client Mobile / Phone</label>
                      <input
                        type="tel"
                        value={formData.clientPhone}
                        onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* SOFTWARE SPECIFIC INPUTS */}
                {domain === 'Software' && (
                  <div className="space-y-4 p-4 rounded-xl bg-slate-900/90 border border-white/10">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">Software Scope &amp; Type</h5>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">App / Website Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.appName}
                          onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Project Type *</label>
                        <select
                          value={formData.projectType}
                          onChange={(e) => handleProjectTypeChange(e.target.value)}
                          className="form-input text-xs bg-slate-950 font-medium text-cyan-300"
                        >
                          {SOFTWARE_TYPES.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.name} {t.note ? `(${t.note})` : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* IF OTHERS SELECTED */}
                    {formData.projectType === 'others' && (
                      <div>
                        <label className="block font-semibold text-rose-400 mb-1">Specify Custom App Type *</label>
                        <input
                          type="text"
                          required
                          value={formData.customAppType}
                          onChange={(e) => setFormData({ ...formData, customAppType: e.target.value })}
                          className="form-input text-xs border-rose-500/50"
                        />
                      </div>
                    )}

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Client Needs Description *</label>
                      <textarea
                        rows="2"
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="form-input text-xs font-sans"
                      />
                    </div>

                    {/* SCREENS & LOGINS QUESTION */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-white/10">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Approximate Screens Count *</label>
                        <input
                          type="number"
                          required
                          min="1"
                          value={formData.approxScreens}
                          onChange={(e) => setFormData({ ...formData, approxScreens: e.target.value })}
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Has Logins or Not? *</label>
                        <div className="flex items-center gap-4 pt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                            <input
                              type="radio"
                              name="hasLogins"
                              value="Yes"
                              checked={formData.hasLogins === 'Yes'}
                              onChange={(e) => setFormData({ ...formData, hasLogins: e.target.value })}
                            />
                            <span>Yes (Needs Logins)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                            <input
                              type="radio"
                              name="hasLogins"
                              value="No"
                              checked={formData.hasLogins === 'No'}
                              onChange={(e) => setFormData({ ...formData, hasLogins: e.target.value })}
                            />
                            <span>No Logins Needed</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* IF HAS LOGINS YES */}
                    {formData.hasLogins === 'Yes' && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-blue-500/30 space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block font-semibold text-blue-400 mb-1">
                              How many logins needed? *
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              value={formData.loginsCount}
                              onChange={(e) => handleLoginsOrRateChange(e.target.value, formData.erpRatePerLogin)}
                              className="form-input text-xs"
                            />
                          </div>

                          {formData.projectType === 'erp' && (
                            <div>
                              <label className="block font-semibold text-cyan-400 mb-1">
                                Price Rate per Login (₹) *
                              </label>
                              <input
                                type="number"
                                required
                                min="1"
                                value={formData.erpRatePerLogin}
                                onChange={(e) => handleLoginsOrRateChange(formData.loginsCount, e.target.value)}
                                className="form-input text-xs font-mono font-bold text-cyan-300"
                              />
                            </div>
                          )}
                        </div>
                        {formData.projectType === 'erp' && (
                          <p className="text-[11px] text-slate-400">
                            Calculation: <strong className="text-cyan-300">{formData.loginsCount} logins</strong> × <strong className="text-cyan-300">₹{formData.erpRatePerLogin}/login</strong> = <strong className="text-emerald-400">₹{parseInt(formData.loginsCount || 0) * parseFloat(formData.erpRatePerLogin || 0)}</strong>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* WORKSHOP SPECIFIC INPUTS */}
                {domain === 'Workshop' && (
                  <div className="space-y-4 p-4 rounded-xl bg-slate-900/90 border border-white/10">
                    <h5 className="font-bold text-white text-xs uppercase tracking-wider text-slate-300">Workshop Parameters</h5>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Workshop Topic / Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.workshopTopic}
                        onChange={(e) => setFormData({ ...formData, workshopTopic: e.target.value })}
                        className="form-input text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Candidates Attending *</label>
                        <input
                          type="number"
                          required
                          value={formData.workshopCandidates}
                          onChange={(e) => handleWorkshopCandidatesChange(e.target.value, formData.workshopPricePerCandidate)}
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Duration (Days) *</label>
                        <input
                          type="text"
                          required
                          value={formData.workshopDays}
                          onChange={(e) => setFormData({ ...formData, workshopDays: e.target.value })}
                          className="form-input text-xs"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-300 mb-1">Price / Candidate (₹)</label>
                        <input
                          type="number"
                          required
                          value={formData.workshopPricePerCandidate}
                          onChange={(e) => handleWorkshopCandidatesChange(formData.workshopCandidates, e.target.value)}
                          className="form-input text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TERMS & DELIVERY PARAMETERS SECTION */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-900/90 border border-blue-500/30">
                  <h5 className="font-bold text-cyan-400 text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Terms &amp; Delivery Parameters (Customizes Page 2 Terms &amp; Conditions)</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Quotation Validity (Days) *</label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.validityDays}
                        onChange={(e) => setFormData({ ...formData, validityDays: e.target.value })}
                        placeholder="e.g. 15"
                        className="form-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Advance Payment (%) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        max="100"
                        value={formData.advancePaymentPercent}
                        onChange={(e) => setFormData({ ...formData, advancePaymentPercent: e.target.value })}
                        placeholder="e.g. 50"
                        className="form-input text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Delivery Timeline *</label>
                      <input
                        type="text"
                        required
                        value={formData.deliveryTimeline}
                        onChange={(e) => setFormData({ ...formData, deliveryTimeline: e.target.value })}
                        placeholder="e.g. 3 to 4 Weeks"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Included Revisions *</label>
                      <input
                        type="text"
                        required
                        value={formData.revisionsCount}
                        onChange={(e) => setFormData({ ...formData, revisionsCount: e.target.value })}
                        placeholder="e.g. 3 Revisions"
                        className="form-input text-xs"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Include Source Code? *</label>
                      <select
                        value={formData.includeSourceCode}
                        onChange={(e) => setFormData({ ...formData, includeSourceCode: e.target.value })}
                        className="form-input text-xs bg-slate-950 text-cyan-300 font-medium"
                      >
                        <option value="No">No (Retained by Company)</option>
                        <option value="Yes">Yes (Source Code Handed Over)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Support &amp; Maintenance *</label>
                      <input
                        type="text"
                        required
                        value={formData.supportPeriod}
                        onChange={(e) => setFormData({ ...formData, supportPeriod: e.target.value })}
                        placeholder="e.g. 1 Year Technical Support"
                        className="form-input text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* FINANCIALS & PRICING INPUTS */}
                <div className="space-y-4 p-4 rounded-xl bg-slate-900/90 border border-red-500/30">
                  <h5 className="font-bold text-rose-400 text-xs uppercase tracking-wider flex items-center justify-between">
                    <span>Financials &amp; Price Breakdown</span>
                    {formData.projectType === 'erp' && <span className="text-[10px] font-mono text-cyan-400">Logins ({formData.loginsCount}) × ₹{formData.erpRatePerLogin}</span>}
                    {formData.projectType === 'college_website' && <span className="text-[10px] font-mono text-cyan-400">Fixed ₹8,000/-</span>}
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Base Price (₹) *</label>
                      <input
                        type="number"
                        required
                        value={formData.basePrice}
                        onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                        className="form-input text-xs font-mono font-bold text-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-300 mb-1">Cloud / Server Fee (₹)</label>
                      <input
                        type="number"
                        value={formData.cloudHostingFee}
                        onChange={(e) => setFormData({ ...formData, cloudHostingFee: e.target.value })}
                        className="form-input text-xs font-mono"
                      />
                    </div>
                  </div>

                  {/* DISCOUNT QUESTION MODULE */}
                  <div className="p-3.5 rounded-xl bg-slate-950 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-emerald-400 flex items-center gap-1.5">
                        <Tag className="w-4 h-4" />
                        <span>Apply any discount? *</span>
                      </label>

                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-1.5 cursor-pointer text-slate-200 font-semibold">
                          <input
                            type="radio"
                            name="applyDiscount"
                            value="No"
                            checked={formData.applyDiscount === 'No'}
                            onChange={(e) => setFormData({ ...formData, applyDiscount: e.target.value, discountAmount: '0', discountReason: '' })}
                          />
                          <span>No (No Discount)</span>
                        </label>

                        <label className="flex items-center gap-1.5 cursor-pointer text-emerald-400 font-bold">
                          <input
                            type="radio"
                            name="applyDiscount"
                            value="Yes"
                            checked={formData.applyDiscount === 'Yes'}
                            onChange={(e) => setFormData({ ...formData, applyDiscount: e.target.value })}
                          />
                          <span>Yes (Apply Discount)</span>
                        </label>
                      </div>
                    </div>

                    {/* IF DISCOUNT IS YES */}
                    {formData.applyDiscount === 'Yes' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-500/20">
                        <div>
                          <label className="block font-semibold text-emerald-400 mb-1">Discount Amount (₹) *</label>
                          <input
                            type="number"
                            required
                            min="1"
                            value={formData.discountAmount}
                            onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                            placeholder="e.g. 2000"
                            className="form-input text-xs font-mono font-bold text-emerald-400 border-emerald-500/50"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-emerald-400 mb-1">Discount Details / Reason *</label>
                          <input
                            type="text"
                            required
                            value={formData.discountReason}
                            onChange={(e) => setFormData({ ...formData, discountReason: e.target.value })}
                            placeholder="e.g. Institutional Early-Bird Concession"
                            className="form-input text-xs border-emerald-500/50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-white/10 flex items-center justify-between text-sm">
                    <span className="text-slate-300 font-semibold">Final Total Valuation:</span>
                    <span className="text-xl font-extrabold text-emerald-400">
                      ₹{calculateFinalTotal(formData).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* TERMS & SUBMIT */}
                <div className="pt-2 flex justify-end gap-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setIsWizardOpen(false)}
                    className="btn-secondary py-2.5 px-4 text-xs"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary py-2.5 px-6 text-xs font-bold glow-blue flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Generate &amp; Preview Quotation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* DOCUMENT LIVE PREVIEW MODAL (2-PAGE LAYOUT PREVIEW) */}
      {selectedPreview && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-4xl w-full p-6 sm:p-8 rounded-3xl border border-red-500/50 space-y-6 max-h-[94vh] overflow-y-auto bg-slate-900">
            {/* Modal Top Bar */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-950 text-rose-400 text-xs font-mono font-bold">
                  {selectedPreview.id}
                </span>
                <span className="text-xs text-slate-400">2-Page Official Quotation &amp; T&amp;C Document Preview</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePrintPDF(selectedPreview)}
                  className="btn-cyan py-2 px-4 text-xs font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/30"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF (2 Pages)</span>
                </button>

                <button
                  onClick={() => setSelectedPreview(null)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* DOCUMENT PREVIEW CONTAINER (PAGE 1 & PAGE 2) */}
            <div className="space-y-8">
              {/* PAGE 1 PREVIEW */}
              <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl space-y-6 text-xs shadow-2xl relative">
                <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-[10px] text-slate-500 font-bold">
                  PAGE 1 OF 2 — SCOPE &amp; PRICING
                </div>

                {/* Document Header */}
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                      Sakith Harvan Technologies
                    </h2>
                    <p className="text-xs font-semibold text-rose-600 italic">"Innovate. Integrate. Elevate."</p>
                    <p className="text-[11px] text-slate-500 mt-1">
                      Contact: +91 7981847745 | +91 9014340739<br />
                      Email: mharshavardhan048@gmail.com | saikrishnathoka2526@gmail.com<br />
                      Web: https://sakithharvan.com/
                    </p>
                  </div>
                  <img src={logoImg} alt="Sakith Harvan Logo" className="h-16 w-auto object-contain" />
                </div>

                {/* Meta Columns */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-rose-600 text-[11px] uppercase">Client Information</h4>
                    <p><strong>Name:</strong> {selectedPreview.clientName}</p>
                    <p><strong>Organization:</strong> {selectedPreview.clientOrganization}</p>
                    <p><strong>Contact:</strong> {selectedPreview.clientEmail || selectedPreview.clientPhone || 'N/A'}</p>
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <h4 className="font-bold text-rose-600 text-[11px] uppercase">Quotation Details</h4>
                    <p><strong>Reference #:</strong> {selectedPreview.id}</p>
                    <p><strong>Date of Issue:</strong> {selectedPreview.date}</p>
                    <p><strong>Quotation Validity:</strong> {selectedPreview.validityDays || '15'} Days</p>
                    <p><strong>Project Category:</strong> {selectedPreview.projectType}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-[11px] uppercase">
                        <th className="p-3">Scope Item / Description</th>
                        <th className="p-3">Specifications &amp; Terms</th>
                        <th className="p-3 text-right">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      <tr>
                        <td className="p-3">
                          <strong className="text-slate-900">{selectedPreview.appName}</strong>
                          <p className="text-[11px] text-slate-500">{selectedPreview.description}</p>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600">
                          {selectedPreview.domain === 'Software' ? (
                            <>
                              • Approx. Screens: {selectedPreview.approxScreens || 'N/A'}<br />
                              • Logins Enabled: {selectedPreview.hasLogins === 'Yes' ? `${selectedPreview.loginsCount} Users (${selectedPreview.rawProjectType === 'erp' || selectedPreview.projectType.includes('ERP') ? `Rate: ₹${selectedPreview.erpRatePerLogin || '85'}/login` : 'Standard'})` : 'No Logins Needed'}<br />
                              • Delivery Timeline: {selectedPreview.deliveryTimeline || '3-4 Weeks'}<br />
                              • Included Revisions: {selectedPreview.revisionsCount || '3 Revisions'}<br />
                              • Support Period: {selectedPreview.supportPeriod || '1 Year Support'}
                            </>
                          ) : (
                            <>
                              • Attendees: {selectedPreview.workshopCandidates} Candidates<br />
                              • Duration: {selectedPreview.workshopDays} Days
                            </>
                          )}
                        </td>
                        <td className="p-3 text-right font-bold text-slate-900">
                          ₹{selectedPreview.basePrice.toLocaleString('en-IN')}
                        </td>
                      </tr>

                      {selectedPreview.cloudHostingFee > 0 && (
                        <tr>
                          <td className="p-3">Cloud Server Provisioning &amp; SSL</td>
                          <td className="p-3 text-[11px] text-slate-600">Azure / AWS Deployment setup</td>
                          <td className="p-3 text-right font-bold">₹{selectedPreview.cloudHostingFee.toLocaleString('en-IN')}</td>
                        </tr>
                      )}

                      {selectedPreview.applyDiscount === 'Yes' && parseFloat(selectedPreview.discountAmount || 0) > 0 && (
                        <tr className="bg-emerald-50 text-emerald-700 font-semibold">
                          <td className="p-3">
                            Special Discount Applied
                            <p className="text-[11px] text-emerald-600 font-normal mt-0.5">
                              Details: {selectedPreview.discountReason || 'Special Concession Waiver'}
                            </p>
                          </td>
                          <td className="p-3 text-[11px]">Applied Partner Concession</td>
                          <td className="p-3 text-right font-bold text-emerald-600">- ₹{parseFloat(selectedPreview.discountAmount).toLocaleString('en-IN')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Total Calculation */}
                <div className="flex justify-end">
                  <div className="w-64 p-3 bg-rose-50 border-t-2 border-red-600 rounded-lg flex items-center justify-between">
                    <span className="font-bold text-slate-900">Total Amount:</span>
                    <span className="text-lg font-extrabold text-rose-600">₹{selectedPreview.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Footer Signatures */}
                <div className="flex justify-between items-end pt-6 text-[11px] border-t border-slate-200">
                  <span className="text-slate-400">Page 1 of 2 • Advance Payment: {selectedPreview.advancePaymentPercent || '50'}% | Source Code: {selectedPreview.includeSourceCode === 'Yes' ? 'Included' : 'Excluded'}</span>
                  <div className="text-center">
                    <div className="w-44 border-t border-slate-400 pt-1 font-bold text-slate-800">
                      Authorized Signatory
                    </div>
                    <span className="text-slate-500 text-[10px]">Sakith Harvan Technologies</span>
                  </div>
                </div>
              </div>

              {/* PAGE 2 PREVIEW: OFFICIAL DYNAMIC TERMS & CONDITIONS */}
              <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-2xl space-y-5 text-xs shadow-2xl relative border-t-4 border-red-600">
                <div className="absolute top-3 right-4 px-2.5 py-0.5 rounded bg-red-50 border border-red-200 font-mono text-[10px] text-rose-600 font-bold">
                  PAGE 2 OF 2 — TERMS &amp; CONDITIONS
                </div>

                {/* Page 2 Header */}
                <div className="flex items-center justify-between border-b-2 border-red-600 pb-4">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                      Sakith Harvan Technologies
                    </h2>
                    <p className="text-xs font-semibold text-rose-600 italic">"Innovate. Integrate. Elevate."</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Official Terms &amp; Conditions • Quotation Reference #: {selectedPreview.id}</p>
                  </div>
                  <img src={logoImg} alt="Sakith Harvan Logo" className="h-12 w-auto object-contain" />
                </div>

                <h3 className="text-sm font-extrabold text-rose-600 uppercase tracking-wider border-b border-slate-200 pb-2">
                  Terms &amp; Conditions
                </h3>

                {/* 18 Dynamic Terms & Conditions List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[10.5px] leading-relaxed">
                  {getDynamicTermsList(selectedPreview).map((tc) => (
                    <div key={tc.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <strong className="text-slate-900 block font-bold text-[11px]">
                        {tc.id}. {tc.title}
                      </strong>
                      <p className="text-slate-600">{tc.text}</p>
                    </div>
                  ))}
                </div>

                {/* Note Box */}
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 font-semibold text-[11px]">
                  <strong>Note:</strong> Final pricing, scope, timeline, deliverables, support, and payment terms are subject to the details specified in this quotation.
                </div>

                {/* Page 2 Footer Branding */}
                <div className="text-center pt-4 border-t border-slate-200 space-y-0.5">
                  <h4 className="text-sm font-extrabold text-slate-900">Sakith Harvan Technologies</h4>
                  <p className="text-xs font-semibold text-rose-600 italic">Innovate. Integrate. Elevate.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
