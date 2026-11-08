// Store and data management for Sakith Harvan Technologies Internships
// Persistent in localStorage with fallback, connected to Supabase PostgreSQL database
import {
  fetchInternshipsFromSupabase,
  saveInternshipToSupabase,
  deleteInternshipFromSupabase,
  fetchDomainsFromSupabase,
  saveDomainToSupabase,
  deleteDomainFromSupabase,
  fetchInternshipApplicationsFromSupabase,
  saveInternshipApplicationToSupabase,
  updateInternshipApplicationStatusInSupabase
} from './supabaseClient';

export const INITIAL_INTERNSHIPS = [];

export const INITIAL_APPLICATIONS = [];

// Seed IDs from initial data — bust cache if localStorage still has them
const LEGACY_SEED_IDS = ['int-ai-ml-01', 'int-fsd-02', 'int-cyber-03', 'int-devops-04', 'int-dsa-05', 'int-uiux-06'];

// Helper to retrieve internships
export const getStoredInternships = () => {
  try {
    const raw = localStorage.getItem('sh_internships_list');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // If all stored items are from the old seed data, clear and return empty
        const allAreSeed = parsed.every(item => LEGACY_SEED_IDS.includes(item.id));
        if (allAreSeed) {
          localStorage.removeItem('sh_internships_list');
          return [];
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stored internships:', e);
  }
  return INITIAL_INTERNSHIPS;
};

// Helper to save internships
export const saveStoredInternships = (list) => {
  try {
    localStorage.setItem('sh_internships_list', JSON.stringify(list));
  } catch (e) {
    console.warn('Error saving internships:', e);
  }
};

// Helper to add a new internship
export const addInternship = async (internshipData) => {
  const current = getStoredInternships();
  const newId = `int-${Date.now().toString(36)}`;
  const item = {
    id: newId,
    status: 'Open',
    badge: 'New Opening',
    ...internshipData
  };
  const updated = [item, ...current];
  saveStoredInternships(updated);

  // Sync domain locally
  if (item.domain) {
    const currentDomains = getStoredDomains();
    if (!currentDomains.includes(item.domain)) {
      saveStoredDomains([...currentDomains, item.domain]);
    }
  }

  // Cloud sync to Supabase database
  try {
    await saveInternshipToSupabase(item);
  } catch (err) {
    console.warn('Supabase add internship error:', err);
  }

  window.dispatchEvent(new Event('sh_internships_updated'));
  return item;
};

// Helper to update an existing internship
export const updateInternship = async (id, updatedData) => {
  const current = getStoredInternships();
  let updatedItem = null;
  const updated = current.map(item => {
    if (item.id === id) {
      updatedItem = { ...item, ...updatedData };
      return updatedItem;
    }
    return item;
  });
  saveStoredInternships(updated);

  // Cloud sync to Supabase database
  if (updatedItem) {
    try {
      await saveInternshipToSupabase(updatedItem);
    } catch (err) {
      console.warn('Supabase update internship error:', err);
    }
  }

  window.dispatchEvent(new Event('sh_internships_updated'));
  return updated;
};

// Helper to delete an internship - Deletes from Supabase and deletes domain if no remaining postings exist
export const deleteInternship = async (id) => {
  const current = getStoredInternships();
  const targetItem = current.find(item => item.id === id);
  const updated = current.filter(item => item.id !== id);
  saveStoredInternships(updated);

  if (targetItem) {
    const domain = targetItem.domain;
    const remainingInDomain = updated.filter(item => item.domain === domain);

    // If no other postings remain in this domain, delete the domain locally too!
    if (remainingInDomain.length === 0 && domain) {
      deleteStoredDomain(domain);
    }

    // Cloud sync: delete internship from Supabase; if domain now has 0 postings, deletes domain from Supabase too
    try {
      await deleteInternshipFromSupabase(id, remainingInDomain.length === 0 ? domain : null);
    } catch (err) {
      console.warn('Supabase delete internship error:', err);
    }
  }

  window.dispatchEvent(new Event('sh_internships_updated'));
  return updated;
};

// Helper to delete an entire domain and all its associated internships from Supabase and local store
export const deleteDomain = async (domainName) => {
  if (!domainName) return;
  // 1. Delete from local internships and domains
  const current = getStoredInternships();
  const updated = current.filter(item => item.domain !== domainName);
  saveStoredInternships(updated);
  deleteStoredDomain(domainName);

  // 2. Cloud sync to Supabase database
  try {
    await deleteDomainFromSupabase(domainName);
  } catch (err) {
    console.warn('Supabase delete domain error:', err);
  }

  window.dispatchEvent(new Event('sh_internships_updated'));
  return updated;
};

// Helper to get stored domains list
export const getStoredDomains = () => {
  try {
    const raw = localStorage.getItem('sh_internship_domains');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading stored domains:', e);
  }
  // Dynamically derive from active internships
  const current = getStoredInternships();
  const derived = Array.from(new Set(current.map(i => i.domain).filter(Boolean)));
  return derived.length > 0 ? derived : [
    'AI & Machine Learning',
    'Full Stack Development',
    'Cyber Security',
    'DevOps & Cloud',
    'Data Structures & Algorithms',
    'UI/UX Design'
  ];
};

export const saveStoredDomains = (domains) => {
  try {
    localStorage.setItem('sh_internship_domains', JSON.stringify(domains));
  } catch (e) {
    console.warn('Error saving stored domains:', e);
  }
};

export const deleteStoredDomain = (domainName) => {
  const currentDomains = getStoredDomains();
  const updated = currentDomains.filter(d => d !== domainName);
  saveStoredDomains(updated);
  return updated;
};

// Sync internships from Supabase database into local cache
export const syncInternshipsFromSupabase = async () => {
  try {
    const cloudData = await fetchInternshipsFromSupabase();
    if (cloudData && Array.isArray(cloudData)) {
      saveStoredInternships(cloudData);
      const domains = Array.from(new Set(cloudData.map(i => i.domain).filter(Boolean)));
      saveStoredDomains(domains);
      window.dispatchEvent(new Event('sh_internships_updated'));
      return cloudData;
    }
  } catch (err) {
    console.warn('Sync internships from Supabase error:', err);
  }
  return getStoredInternships();
};

// Sync domains from Supabase database
export const syncDomainsFromSupabase = async () => {
  try {
    const cloudDomains = await fetchDomainsFromSupabase();
    if (cloudDomains && Array.isArray(cloudDomains)) {
      saveStoredDomains(cloudDomains);
      return cloudDomains;
    }
  } catch (err) {
    console.warn('Sync domains from Supabase error:', err);
  }
  return getStoredDomains();
};

// Sync applications from Supabase database
export const syncApplicationsFromSupabase = async () => {
  try {
    const cloudApps = await fetchInternshipApplicationsFromSupabase();
    if (cloudApps && Array.isArray(cloudApps)) {
      saveStoredApplications(cloudApps);
      window.dispatchEvent(new Event('sh_applications_updated'));
      return cloudApps;
    }
  } catch (err) {
    console.warn('Sync applications from Supabase error:', err);
  }
  return getStoredApplications();
};

// Helper to get candidate applications
export const getStoredApplications = () => {
  try {
    const raw = localStorage.getItem('sh_internship_applications');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Error reading applications:', e);
  }
  return INITIAL_APPLICATIONS;
};

// Helper to save candidate applications
export const saveStoredApplications = (list) => {
  try {
    localStorage.setItem('sh_internship_applications', JSON.stringify(list));
  } catch (e) {
    console.warn('Error saving applications:', e);
  }
};

// Helper to submit a new candidate application
export const submitApplication = (appData) => {
  const current = getStoredApplications();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const newApp = {
    id: `SHT-INT-${new Date().getFullYear()}-${randomSuffix}`,
    submittedAt: new Date().toISOString(),
    status: 'Under Review',
    ...appData
  };
  const updated = [newApp, ...current];
  saveStoredApplications(updated);

  // Cloud sync to Supabase database
  saveInternshipApplicationToSupabase(newApp).catch(err => {
    console.warn('Supabase save application error:', err);
  });

  window.dispatchEvent(new Event('sh_applications_updated'));
  return newApp;
};

// Helper to update an application status
export const updateApplicationStatus = (id, newStatus, notes = '') => {
  const current = getStoredApplications();
  const updated = current.map(app => {
    if (app.id === id) {
      return { 
        ...app, 
        status: newStatus,
        notes: notes || app.notes,
        lastUpdated: new Date().toISOString() 
      };
    }
    return app;
  });
  saveStoredApplications(updated);

  // Cloud sync to Supabase database
  updateInternshipApplicationStatusInSupabase(id, newStatus).catch(err => {
    console.warn('Supabase update application status error:', err);
  });

  window.dispatchEvent(new Event('sh_applications_updated'));
  return updated;
};

// =========================================================================
// 1. ONE-CLICK EXCEL SPREADSHEET EXPORT FOR CANDIDATES
// =========================================================================
export const exportCandidatesToExcel = (applications) => {
  if (!applications || applications.length === 0) {
    return false;
  }

  const sanitizeXml = (str) => {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  const columns = [
    { title: 'Application ID', key: 'id', width: 140 },
    { title: 'Submission Date', key: 'submittedAt', width: 160 },
    { title: 'Role Applied', key: 'internshipTitle', width: 220 },
    { title: 'Candidate Name', key: 'candidateName', width: 160 },
    { title: 'Email Address', key: 'email', width: 200 },
    { title: 'Phone Number', key: 'phone', width: 130 },
    { title: 'College / Institute', key: 'college', width: 230 },
    { title: 'Branch', key: 'branch', width: 110 },
    { title: 'Academic Year', key: 'year', width: 100 },
    { title: 'Degree', key: 'degree', width: 100 },
    { title: 'Key Technical Skills', key: 'skills', width: 220 },
    { title: 'Portfolio / GitHub Link', key: 'portfolioUrl', width: 200 },
    { title: 'Resume Link', key: 'resumeUrl', width: 220 },
    { title: 'Why Join Statement', key: 'whyJoin', width: 280 },
    { title: 'Preferred Timeline', key: 'preferredTimeline', width: 170 },
    { title: 'Review Status', key: 'status', width: 130 },
    { title: 'Admin Review Remarks', key: 'notes', width: 200 }
  ];

  // Microsoft Excel SpreadsheetML XML format
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += ' xmlns:o="urn:schemas-microsoft-com:office:office"\n';
  xml += ' xmlns:x="urn:schemas-microsoft-com:office:excel"\n';
  xml += ' xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += ' xmlns:html="http://www.w3.org/TR/REC-html40">\n';
  xml += ' <Styles>\n';
  xml += '  <Style ss:ID="Default" ss:Name="Normal">\n';
  xml += '   <Alignment ss:Vertical="Center"/>\n';
  xml += '   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1e293b"/>\n';
  xml += '  </Style>\n';
  xml += '  <Style ss:ID="Header">\n';
  xml += '   <Alignment ss:Horizontal="Center" ss:Vertical="Center" ss:WrapText="1"/>\n';
  xml += '   <Borders>\n';
  xml += '    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#0f172a"/>\n';
  xml += '   </Borders>\n';
  xml += '   <Font ss:FontName="Segoe UI" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>\n';
  xml += '   <Interior ss:Color="#1e3a8a" ss:Pattern="Solid"/>\n';
  xml += '  </Style>\n';
  xml += '  <Style ss:ID="RowEven">\n';
  xml += '   <Alignment ss:Vertical="Center" ss:WrapText="1"/>\n';
  xml += '   <Interior ss:Color="#F8FAFC" ss:Pattern="Solid"/>\n';
  xml += '  </Style>\n';
  xml += '  <Style ss:ID="RowOdd">\n';
  xml += '   <Alignment ss:Vertical="Center" ss:WrapText="1"/>\n';
  xml += '   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>\n';
  xml += '  </Style>\n';
  xml += ' </Styles>\n';
  xml += ' <Worksheet ss:Name="Internship Candidates">\n';
  xml += '  <Table ss:DefaultRowHeight="24">\n';

  columns.forEach(col => {
    xml += `   <Column ss:Width="${col.width}"/>\n`;
  });

  // Header Row
  xml += '   <Row ss:Height="30">\n';
  columns.forEach(col => {
    xml += `    <Cell ss:StyleID="Header"><Data ss:Type="String">${sanitizeXml(col.title)}</Data></Cell>\n`;
  });
  xml += '   </Row>\n';

  // Data Rows
  applications.forEach((app, idx) => {
    const styleId = idx % 2 === 0 ? 'RowOdd' : 'RowEven';
    xml += `   <Row ss:Height="24">\n`;
    columns.forEach(col => {
      let val = app[col.key] || '';
      if (col.key === 'submittedAt' && val) {
        try {
          val = new Date(val).toLocaleString('en-IN');
        } catch (e) {
          // keep original
        }
      }
      xml += `    <Cell ss:StyleID="${styleId}"><Data ss:Type="String">${sanitizeXml(val)}</Data></Cell>\n`;
    });
    xml += `   </Row>\n`;
  });

  xml += '  </Table>\n';
  xml += ' </Worksheet>\n';
  xml += '</Workbook>';

  const blob = new Blob([xml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SHT_Internship_Candidates_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
};

// =========================================================================
// 2. ADMIN MARQUEE SLIDE SETTINGS & STORE
// =========================================================================
export const DEFAULT_MARQUEE_SETTINGS = {
  enabled: true,
  text: 'Sakith Harvan Technologies: Internship & Course of Career applications for the upcoming batch are active! Limited seats available per domain. Submit your application early for priority evaluation.',
  speed: 30, // seconds for one complete cycle
  showOnInternships: true,
  showOnCOC: true
};

export const getStoredMarqueeSettings = () => {
  try {
    const raw = localStorage.getItem('sh_marquee_announcement');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_MARQUEE_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading marquee settings:', e);
  }
  return DEFAULT_MARQUEE_SETTINGS;
};

export const saveStoredMarqueeSettings = (settings) => {
  try {
    localStorage.setItem('sh_marquee_announcement', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('sh_marquee_updated', { detail: settings }));
  } catch (e) {
    console.warn('Error saving marquee settings:', e);
  }
};

// =========================================================================
// 3. INTERNSHIP TIMELINE & DEADLINE CONTROL
// =========================================================================
export const DEFAULT_TIMELINE_SETTINGS = {
  enabled: true,
  deadline: '2026-11-30T23:59:59',
  isManuallyClosed: false,
  closedMessage: 'Applications are closed and wait for next batch.'
};

export const getStoredTimelineSettings = () => {
  try {
    const raw = localStorage.getItem('sh_internship_timeline');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_TIMELINE_SETTINGS, ...parsed };
      }
    }
  } catch (e) {
    console.warn('Error reading timeline settings:', e);
  }
  return DEFAULT_TIMELINE_SETTINGS;
};

export const saveStoredTimelineSettings = (settings) => {
  try {
    localStorage.setItem('sh_internship_timeline', JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent('sh_internship_timeline_updated', { detail: settings }));
  } catch (e) {
    console.warn('Error saving timeline settings:', e);
  }
};

export const isApplicationDeadlineCrossed = () => {
  const settings = getStoredTimelineSettings();
  if (settings.isManuallyClosed) return true;
  if (!settings.enabled) return false;
  if (!settings.deadline) return false;
  const deadlineTime = new Date(settings.deadline).getTime();
  if (isNaN(deadlineTime)) return false;
  return Date.now() > deadlineTime;
};
