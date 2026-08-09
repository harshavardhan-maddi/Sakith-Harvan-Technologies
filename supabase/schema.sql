-- Sakith Harvan Technologies Supabase Database Schema
-- Copy and run this script in your Supabase Dashboard SQL Editor (https://supabase.com/dashboard/project/zqrnyfjtqalakredbfqr/sql)

-- 1. CONSULTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.consultations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    location TEXT,
    "knownSource" TEXT,
    "mainNeed" TEXT,
    type TEXT,
    "preferredDate" TEXT,
    "preferredTime" TEXT,
    message TEXT,
    "assignedMember" TEXT,
    status TEXT DEFAULT 'New',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 2. REQUIREMENTS TABLE
CREATE TABLE IF NOT EXISTS public.requirements (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization TEXT,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    category TEXT,
    budget TEXT,
    timeframe TEXT,
    scope TEXT,
    status TEXT DEFAULT 'New',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 3. QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS public.quotations (
    id TEXT PRIMARY KEY,
    domain TEXT,
    "clientName" TEXT,
    "clientOrganization" TEXT,
    "clientEmail" TEXT,
    "clientPhone" TEXT,
    "appName" TEXT,
    "projectType" TEXT,
    "rawProjectType" TEXT,
    description TEXT,
    "approxScreens" TEXT,
    "hasLogins" TEXT,
    "loginsCount" TEXT,
    "erpRatePerLogin" TEXT,
    "workshopCandidates" TEXT,
    "workshopDays" TEXT,
    "workshopPricePerCandidate" TEXT,
    "basePrice" NUMERIC,
    "cloudHostingFee" NUMERIC,
    "applyDiscount" TEXT,
    "discountAmount" NUMERIC,
    "discountReason" TEXT,
    "validityDays" TEXT,
    "advancePaymentPercent" TEXT,
    "deliveryTimeline" TEXT,
    "revisionsCount" TEXT,
    "includeSourceCode" TEXT,
    "supportPeriod" TEXT,
    "taxGstPercent" NUMERIC,
    "totalAmount" NUMERIC,
    date TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WORKSHOPS TABLE
CREATE TABLE IF NOT EXISTS public.workshops (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT,
    description TEXT,
    learn TEXT,
    "whoShouldAttend" TEXT,
    "minDays" TEXT,
    mode TEXT,
    "upcomingDates" TEXT,
    seats TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ENABLE ROW LEVEL SECURITY (RLS) & ALLOW ANON ACCESS
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon read/write consultations" ON public.consultations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write requirements" ON public.requirements FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write quotations" ON public.quotations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon read/write workshops" ON public.workshops FOR ALL USING (true) WITH CHECK (true);
