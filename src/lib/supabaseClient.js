import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zqrnyfjtqalakredbfqr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxcm55Zmp0cWFsYWtyZWRiZnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTkzMDcsImV4cCI6MjEwMTgzNTMwN30.ONkjo7cIJbRghCrrbw-IPSaNVtey8bZVt19PxeMOR2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const staffUpdatesChannel = supabase.channel('staff_updates_channel');

/* =================================================================== */
/* SUPABASE CONSULTATIONS HELPERS                                      */
/* =================================================================== */
export const saveConsultationToSupabase = async (bookingObject) => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .insert([bookingObject]);
    if (error) {
      console.warn('Supabase consultations insert warning:', error.message);
    } else {
      console.log('Successfully synced consultation to Supabase:', data);
    }
  } catch (err) {
    console.warn('Supabase consultation connection error:', err);
  }
};

export const fetchConsultationsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('consultations')
      .select('*')
      .order('timestamp', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch consultations error:', err);
  }
  return null;
};

export const updateConsultationStatusInSupabase = async (id, status) => {
  try {
    const { error } = await supabase
      .from('consultations')
      .update({ status })
      .eq('id', id);
    if (error) console.warn('Supabase update status error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

export const deleteConsultationFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('consultations')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete consultation error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE REQUIREMENTS HELPERS                                       */
/* =================================================================== */
export const saveRequirementToSupabase = async (requirementObject) => {
  try {
    const { data, error } = await supabase
      .from('requirements')
      .insert([requirementObject]);
    if (error) {
      console.warn('Supabase requirements insert warning:', error.message);
    } else {
      console.log('Successfully synced requirement to Supabase:', data);
    }
  } catch (err) {
    console.warn('Supabase requirement connection error:', err);
  }
};

export const fetchRequirementsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('requirements')
      .select('*')
      .order('timestamp', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch requirements error:', err);
  }
  return null;
};

export const updateRequirementStatusInSupabase = async (id, status) => {
  try {
    const { error } = await supabase
      .from('requirements')
      .update({ status })
      .eq('id', id);
    if (error) console.warn('Supabase update status error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

export const deleteRequirementFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('requirements')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete requirement error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE QUOTATIONS HELPERS                                         */
/* =================================================================== */
export const saveQuotationToSupabase = async (quotationObject) => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .insert([quotationObject]);
    if (error) {
      console.warn('Supabase quotations insert warning:', error.message);
    } else {
      console.log('Successfully synced quotation to Supabase:', data);
    }
  } catch (err) {
    console.warn('Supabase quotation connection error:', err);
  }
};

export const fetchQuotationsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('quotations')
      .select('*')
      .order('date', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch quotations error:', err);
  }
  return null;
};

export const deleteQuotationFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete quotation error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE WORKSHOPS HELPERS                                          */
/* =================================================================== */
export const saveWorkshopToSupabase = async (workshopObject) => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .upsert([workshopObject], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase workshops upsert warning:', error.message);
    } else {
      console.log('Successfully synced workshop to Supabase:', data);
    }
  } catch (err) {
    console.warn('Supabase workshop connection error:', err);
  }
};

export const fetchWorkshopsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('workshops')
      .select('*');
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch workshops error:', err);
  }
  return null;
};

export const deleteWorkshopFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('workshops')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete workshop error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE TEAM MEMBERS HELPERS (Employees & Interns)                 */
/* =================================================================== */
export const saveTeamMemberToSupabase = async (memberObject) => {
  try {
    // Only pass the columns that exist in the Supabase schema to prevent 400 Bad Request errors
    const sanitizedMember = {
      id: memberObject.id,
      name: memberObject.name,
      role: memberObject.role,
      type: memberObject.type,
      email: memberObject.email,
      phone: memberObject.phone,
      joinedDate: memberObject.joinedDate,
      status: memberObject.status || 'Active'
    };

    const { data, error } = await supabase
      .from('team_members')
      .upsert([sanitizedMember], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase team_members upsert warning:', error.message);
    } else {
      console.log('Successfully synced team member to Supabase:', data);
    }
  } catch (err) {
    console.warn('Supabase team_members connection error:', err);
  }

  // Broadcast to all connected devices instantly
  try {
    staffUpdatesChannel.send({
      type: 'broadcast',
      event: 'MEMBER_CREATED',
      payload: memberObject
    });
  } catch (e) {
    console.warn('Broadcast error:', e);
  }
};

export const fetchTeamMembersFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch team_members error:', err);
  }
  return null;
};

export const deleteTeamMemberFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete team member error:', error.message);

    // Also delete associated tasks from Supabase
    await supabase
      .from('assigned_tasks')
      .delete()
      .eq('memberId', id);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }

  // Broadcast deletion to all connected devices instantly
  try {
    staffUpdatesChannel.send({
      type: 'broadcast',
      event: 'MEMBER_DELETED',
      payload: { id }
    });
  } catch (e) {
    console.warn('Broadcast error:', e);
  }
};

export const broadcastStaffUpdate = (event, payload) => {
  try {
    staffUpdatesChannel.send({
      type: 'broadcast',
      event: event,
      payload: payload
    });
  } catch (e) {
    console.warn('Broadcast error:', e);
  }
};

/* =================================================================== */
/* SUPABASE ASSIGNED TASKS HELPERS (Work Assignment & Progress)       */
/* =================================================================== */
export const saveTaskToSupabase = async (taskObject) => {
  try {
    const { data, error } = await supabase
      .from('assigned_tasks')
      .upsert([taskObject], { onConflict: 'id' });
    if (error) {
      console.warn('Supabase assigned_tasks upsert warning:', error.message);
    } else {
      console.log('Successfully synced task to Supabase:', data);
    }
    return data && data.length > 0 ? data[0] : null;
  } catch (err) {
    console.warn('Supabase assigned_tasks connection error:', err);
    return null;
  }
};

export const fetchTasksFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('assigned_tasks')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) {
      return data;
    }
  } catch (err) {
    console.warn('Supabase fetch assigned_tasks error:', err);
  }
  return null;
};

export const updateTaskInSupabase = async (id, updateFields) => {
  try {
    const { error } = await supabase
      .from('assigned_tasks')
      .update(updateFields)
      .eq('id', id);
    if (error) console.warn('Supabase update task error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

export const deleteTaskFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('assigned_tasks')
      .delete()
      .eq('id', id);
    if (error) {
      console.warn('Supabase delete task error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Supabase connection error:', err);
    return false;
  }
};

export const updateTeamMemberInSupabase = async (id, updateFields) => {
  try {
    const { error } = await supabase
      .from('team_members')
      .update(updateFields)
      .eq('id', id);
    if (error) console.warn('Supabase update team member warning:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE BATCHES HELPERS (Intern Cohorts & Batches)                */
/* =================================================================== */
export const saveBatchToSupabase = async (batchObject) => {
  try {
    const { data, error } = await supabase
      .from('intern_batches')
      .upsert([batchObject], { onConflict: 'id' });
    if (error) console.warn('Supabase intern_batches upsert warning:', error.message);
    else console.log('Successfully synced batch to Supabase:', data);
  } catch (err) {
    console.warn('Supabase intern_batches connection error:', err);
  }
};

export const fetchBatchesFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('intern_batches')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('Supabase fetch intern_batches error:', err);
  }
  return null;
};

export const deleteBatchFromSupabase = async (id) => {
  try {
    const { error } = await supabase
      .from('intern_batches')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete batch error:', error.message);
  } catch (err) {
    console.warn('Supabase connection error:', err);
  }
};

/* =================================================================== */
/* SUPABASE ASSESSMENTS HELPERS (Quizzes, Benchmarks, Rubrics)        */
/* =================================================================== */
export const saveAssessmentToSupabase = async (assessmentObject) => {
  try {
    const { data, error } = await supabase
      .from('intern_assessments')
      .upsert([assessmentObject], { onConflict: 'id' });
    if (error) console.warn('Supabase assessments upsert warning:', error.message);
  } catch (err) {
    console.warn('Supabase assessments error:', err);
  }
};

export const fetchAssessmentsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('intern_assessments')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('Supabase fetch assessments error:', err);
  }
  return null;
};

/* =================================================================== */
/* SUPABASE SUBMISSIONS HELPERS (Deliverables & Code PRs)             */
/* =================================================================== */
export const saveSubmissionToSupabase = async (subObject) => {
  try {
    const { data, error } = await supabase
      .from('intern_submissions')
      .upsert([subObject], { onConflict: 'id' });
    if (error) console.warn('Supabase submissions upsert warning:', error.message);
  } catch (err) {
    console.warn('Supabase submissions error:', err);
  }
};

export const fetchSubmissionsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('intern_submissions')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data && data.length > 0) return data;
  } catch (err) {
    console.warn('Supabase fetch submissions error:', err);
  }
  return null;
};

// Global subscription for real-time team member broadcasts
staffUpdatesChannel
  .on('broadcast', { event: 'MEMBER_CREATED' }, async () => {
    const dbMembers = await fetchTeamMembersFromSupabase();
    if (dbMembers) {
      localStorage.setItem('sh_team_members', JSON.stringify(dbMembers));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  })
  .on('broadcast', { event: 'MEMBER_DELETED' }, async () => {
    const dbMembers = await fetchTeamMembersFromSupabase();
    if (dbMembers) {
      localStorage.setItem('sh_team_members', JSON.stringify(dbMembers));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  })
  .on('broadcast', { event: 'MEMBER_UPDATED' }, async () => {
    const dbMembers = await fetchTeamMembersFromSupabase();
    if (dbMembers) {
      localStorage.setItem('sh_team_members', JSON.stringify(dbMembers));
      window.dispatchEvent(new Event('sh_team_updated'));
    }
  })
  .subscribe();

/* =================================================================== */
/* SUPABASE INTERNSHIPS, DOMAINS & APPLICATIONS HELPERS                */
/* =================================================================== */

export const fetchInternshipsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('internships')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      return data.map(row => ({
        id: row.id,
        title: row.title,
        domain: row.domain,
        timeline: row.timeline,
        durationWeeks: row.duration_weeks || row.durationWeeks || 12,
        mode: row.mode || 'Hybrid / Remote',
        openings: row.openings || 5,
        stipend: row.stipend || '',
        badge: row.badge || '',
        status: row.status || 'Open',
        department: row.department || '',
        overview: row.overview || '',
        timelineDetails: row.timeline_details || row.timelineDetails || [],
        prerequisites: row.prerequisites || [],
        deliverables: row.deliverables || [],
        tools: row.tools || []
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch internships error:', err);
  }
  return null;
};

export const saveInternshipToSupabase = async (item) => {
  try {
    const payload = {
      id: item.id,
      title: item.title,
      domain: item.domain,
      timeline: item.timeline,
      duration_weeks: Number(item.durationWeeks) || 12,
      mode: item.mode || 'Hybrid / Remote',
      openings: Number(item.openings) || 5,
      stipend: item.stipend || '',
      badge: item.badge || 'New Opening',
      status: item.status || 'Open',
      department: item.department || '',
      overview: item.overview || '',
      timeline_details: item.timelineDetails || [],
      prerequisites: item.prerequisites || [],
      deliverables: item.deliverables || [],
      tools: item.tools || [],
      updated_at: new Date().toISOString()
    };
    const { data, error } = await supabase
      .from('internships')
      .upsert([payload], { onConflict: 'id' });
    if (error) console.warn('Supabase save internship error:', error.message);

    if (item.domain) {
      await saveDomainToSupabase(item.domain);
    }
    return data;
  } catch (err) {
    console.warn('Supabase save internship connection error:', err);
  }
  return null;
};

export const deleteInternshipFromSupabase = async (id, domain = null) => {
  try {
    const { error } = await supabase
      .from('internships')
      .delete()
      .eq('id', id);
    if (error) console.warn('Supabase delete internship error:', error.message);

    // If domain was supplied, check if any remaining internships in Supabase use that domain
    if (domain) {
      const { data: remaining } = await supabase
        .from('internships')
        .select('id')
        .eq('domain', domain);
      
      // If no other internships belong to this domain, delete the domain from Supabase too!
      if (!remaining || remaining.length === 0) {
        await deleteDomainFromSupabase(domain);
      }
    }
    return true;
  } catch (err) {
    console.warn('Supabase delete internship connection error:', err);
  }
  return false;
};

export const fetchDomainsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('internship_domains')
      .select('name')
      .order('name', { ascending: true });
    if (!error && Array.isArray(data)) {
      return data.map(d => d.name);
    }
  } catch (err) {
    console.warn('Supabase fetch domains error:', err);
  }
  return null;
};

export const saveDomainToSupabase = async (name) => {
  if (!name || !name.trim()) return;
  try {
    await supabase
      .from('internship_domains')
      .upsert([{ name: name.trim() }], { onConflict: 'name' });
  } catch (err) {
    console.warn('Supabase save domain error:', err);
  }
};

export const deleteDomainFromSupabase = async (name) => {
  if (!name) return;
  try {
    // 1. Delete domain row from Supabase
    await supabase
      .from('internship_domains')
      .delete()
      .eq('name', name);

    // 2. Also delete all internships that belonged to that domain
    await supabase
      .from('internships')
      .delete()
      .eq('domain', name);
  } catch (err) {
    console.warn('Supabase delete domain error:', err);
  }
};

export const fetchInternshipApplicationsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('internship_applications')
      .select('*')
      .order('submitted_at', { ascending: false });
    if (!error && Array.isArray(data)) {
      return data.map(row => ({
        id: row.id,
        internshipId: row.internship_id || row.internshipId,
        internshipTitle: row.internship_title || row.internshipTitle,
        candidateName: row.candidate_name || row.candidateName,
        email: row.email,
        phone: row.phone,
        college: row.college,
        branch: row.branch,
        year: row.year,
        degree: row.degree,
        skills: row.skills,
        portfolioUrl: row.portfolio_url || row.portfolioUrl,
        resumeUrl: row.resume_url || row.resumeUrl,
        whyJoin: row.why_join || row.whyJoin,
        preferredTimeline: row.preferred_timeline || row.preferredTimeline,
        status: row.status,
        submittedAt: row.submitted_at || row.submittedAt,
        notes: row.notes
      }));
    }
  } catch (err) {
    console.warn('Supabase fetch applications error:', err);
  }
  return null;
};

export const saveInternshipApplicationToSupabase = async (app) => {
  try {
    const payload = {
      id: app.id,
      internship_id: app.internshipId,
      internship_title: app.internshipTitle,
      candidate_name: app.candidateName,
      email: app.email,
      phone: app.phone,
      college: app.college,
      branch: app.branch,
      year: app.year,
      degree: app.degree,
      skills: app.skills,
      portfolio_url: app.portfolioUrl,
      resume_url: app.resumeUrl,
      why_join: app.whyJoin,
      preferred_timeline: app.preferredTimeline,
      status: app.status || 'Under Review',
      submitted_at: app.submittedAt || new Date().toISOString(),
      notes: app.notes || ''
    };
    await supabase
      .from('internship_applications')
      .upsert([payload], { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save application error:', err);
  }
};

export const updateInternshipApplicationStatusInSupabase = async (id, status) => {
  try {
    await supabase
      .from('internship_applications')
      .update({ status })
      .eq('id', id);
  } catch (err) {
    console.warn('Supabase update application error:', err);
  }
};

/* =================================================================== */
/* SUPABASE HACKATHONS HELPERS                                         */
/* =================================================================== */
export const fetchHackathonsFromSupabase = async () => {
  try {
    const { data, error } = await supabase
      .from('hackathons')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return null;

    return data.map((row) => {
      if (row.raw_data && typeof row.raw_data === 'object') {
        return {
          ...row.raw_data,
          id: row.id,
          title: row.title || row.raw_data.title,
          status: row.status || row.raw_data.status,
          logoUrl: row.logo_url || row.raw_data.logoUrl || '',
          problemStatements: row.problem_statements || row.raw_data.problemStatements || [],
          winners: row.winners || row.raw_data.winners || null
        };
      }
      return {
        id: row.id,
        title: row.title,
        tagline: row.tagline || '',
        description: row.description || '',
        theme: row.theme || '',
        logoUrl: row.logo_url || '',
        entryFee: Number(row.entry_fee) || 0,
        minTeamSize: row.min_team_size || 2,
        maxTeamSize: row.max_team_size || 4,
        status: row.status || 'active',
        registrationDeadline: row.registration_deadline,
        statementLockDeadline: row.statement_lock_deadline,
        statementsLocked: Boolean(row.statements_locked),
        kickoffTime: row.kickoff_time,
        submissionDeadline: row.submission_deadline,
        statementsReleased: Boolean(row.statements_released),
        submissionsClosed: Boolean(row.submissions_closed),
        problemStatements: Array.isArray(row.problem_statements) ? row.problem_statements : [],
        winners: row.winners || null,
        createdAt: row.created_at
      };
    });
  } catch (err) {
    console.warn('Supabase fetch hackathons error:', err);
    return null;
  }
};

export const saveHackathonToSupabase = async (item) => {
  try {
    const payload = {
      id: item.id,
      title: item.title,
      tagline: item.tagline || '',
      description: item.description || '',
      theme: item.theme || '',
      logo_url: item.logoUrl || '',
      entry_fee: Number(item.entryFee) || 0,
      min_team_size: item.minTeamSize || 2,
      max_team_size: item.maxTeamSize || 4,
      status: item.status || 'active',
      registration_deadline: item.registrationDeadline ? new Date(item.registrationDeadline).toISOString() : null,
      statement_lock_deadline: item.statementLockDeadline ? new Date(item.statementLockDeadline).toISOString() : null,
      statements_locked: Boolean(item.statementsLocked),
      kickoff_time: item.kickoffTime ? new Date(item.kickoffTime).toISOString() : null,
      submission_deadline: item.submissionDeadline ? new Date(item.submissionDeadline).toISOString() : null,
      statements_released: Boolean(item.statementsReleased),
      submissions_closed: Boolean(item.submissionsClosed),
      problem_statements: Array.isArray(item.problemStatements) ? item.problemStatements : [],
      winners: item.winners || null,
      raw_data: item,
      updated_at: new Date().toISOString()
    };
    await supabase.from('hackathons').upsert([payload], { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save hackathon error:', err);
  }
};

export const deleteHackathonFromSupabase = async (id) => {
  try {
    await supabase.from('hackathons').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete hackathon error:', err);
  }
};

/* =================================================================== */
/* SUPABASE HACKATHON REGISTRATIONS HELPERS                            */
/* =================================================================== */
export const fetchHackathonRegistrationsFromSupabase = async (hackathonId = null) => {
  try {
    let query = supabase.from('hackathon_registrations').select('*').order('registered_at', { ascending: false });
    if (hackathonId) {
      query = query.eq('hackathon_id', hackathonId);
    }
    const { data, error } = await query;
    if (error) throw error;
    if (!data) return null;

    return data.map((row) => {
      if (row.raw_data && typeof row.raw_data === 'object') {
        return {
          ...row.raw_data,
          id: row.id,
          hackathonId: row.hackathon_id || row.raw_data.hackathonId,
          teamName: row.team_name || row.raw_data.teamName,
          selectedStatementId: row.selected_statement_id || row.raw_data.selectedStatementId,
          statementLocked: Boolean(row.statement_locked),
          paymentStatus: row.payment_status || row.raw_data.paymentStatus,
          password: row.password || row.raw_data.password,
          submission: row.submission || row.raw_data.submission,
          deploymentStarted: Boolean(row.deployment_started)
        };
      }
      return {
        id: row.id,
        hackathonId: row.hackathon_id,
        teamName: row.team_name,
        teamSize: row.team_size || 2,
        members: Array.isArray(row.members) ? row.members : [],
        selectedStatementId: row.selected_statement_id || null,
        statementLocked: Boolean(row.statement_locked),
        statementLockedAt: row.statement_locked_at,
        paymentStatus: row.payment_status || 'Completed',
        paymentRef: row.payment_ref,
        amountPaid: Number(row.amount_paid) || 0,
        password: row.password,
        submission: row.submission || null,
        submittedAt: row.submitted_at,
        deploymentStarted: Boolean(row.deployment_started),
        deploymentStartedAt: row.deployment_started_at,
        registeredAt: row.registered_at
      };
    });
  } catch (err) {
    console.warn('Supabase fetch hackathon registrations error:', err);
    return null;
  }
};

export const saveHackathonRegistrationToSupabase = async (reg) => {
  try {
    const payload = {
      id: reg.id,
      hackathon_id: reg.hackathonId,
      team_name: reg.teamName,
      team_size: reg.teamSize || 2,
      members: Array.isArray(reg.members) ? reg.members : [],
      selected_statement_id: reg.selectedStatementId || null,
      statement_locked: Boolean(reg.statementLocked),
      statement_locked_at: reg.statementLockedAt ? new Date(reg.statementLockedAt).toISOString() : null,
      payment_status: reg.paymentStatus || 'Completed',
      payment_ref: reg.paymentRef || '',
      amount_paid: Number(reg.amountPaid) || 0,
      password: reg.password || '',
      submission: reg.submission || null,
      submitted_at: reg.submittedAt ? new Date(reg.submittedAt).toISOString() : null,
      deployment_started: Boolean(reg.deploymentStarted),
      deployment_started_at: reg.deploymentStartedAt ? new Date(reg.deploymentStartedAt).toISOString() : null,
      registered_at: reg.registeredAt ? new Date(reg.registeredAt).toISOString() : new Date().toISOString(),
      raw_data: reg,
      updated_at: new Date().toISOString()
    };
    await supabase.from('hackathon_registrations').upsert([payload], { onConflict: 'id' });
  } catch (err) {
    console.warn('Supabase save hackathon registration error:', err);
  }
};

export const deleteHackathonRegistrationFromSupabase = async (id) => {
  try {
    await supabase.from('hackathon_registrations').delete().eq('id', id);
  } catch (err) {
    console.warn('Supabase delete hackathon registration error:', err);
  }
};

