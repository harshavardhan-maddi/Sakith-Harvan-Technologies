import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zqrnyfjtqalakredbfqr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpxcm55Zmp0cWFsYWtyZWRiZnFyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODYyNTkzMDcsImV4cCI6MjEwMTgzNTMwN30.ONkjo7cIJbRghCrrbw-IPSaNVtey8bZVt19PxeMOR2k';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
    const { data, error } = await supabase
      .from('team_members')
      .upsert([memberObject], { onConflict: 'id' });
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
    const channel = supabase.channel('staff_updates_channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'MEMBER_CREATED',
          payload: memberObject
        });
        setTimeout(() => {
          try { supabase.removeChannel(channel); } catch(e) {}
        }, 1000);
      }
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
    const channel = supabase.channel('staff_updates_channel');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: 'MEMBER_DELETED',
          payload: { id }
        });
        setTimeout(() => {
          try { supabase.removeChannel(channel); } catch(e) {}
        }, 1000);
      }
    });
  } catch (e) {
    console.warn('Broadcast error:', e);
  }
};

export const broadcastStaffUpdate = (event, payload) => {
  try {
    const channelId = `broadcast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const channel = supabase.channel(channelId);
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        channel.send({
          type: 'broadcast',
          event: event,
          payload: payload
        });
        setTimeout(() => {
          try { supabase.removeChannel(channel); } catch(e) {}
        }, 1000);
      }
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


