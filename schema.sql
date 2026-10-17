DROP TABLE IF EXISTS scheduled_deliveries CASCADE;
DROP TABLE IF EXISTS campaign_assets CASCADE;
DROP TABLE IF EXISTS campaigns CASCADE;
DROP TABLE IF EXISTS theme_pages CASCADE;

-- 1. Verified Creator Nodes (Supply)
CREATE TABLE theme_pages (
    id SERIAL PRIMARY KEY,
    owner_name VARCHAR(100),
    instagram_business_id VARCHAR(100) UNIQUE NOT NULL,
    instagram_handle VARCHAR(100) NOT NULL,
    access_token TEXT NOT NULL,
    niche VARCHAR(50) NOT NULL,
    follower_count INT DEFAULT 0,
    is_payout_eligible BOOLEAN DEFAULT TRUE,
    price_per_reel NUMERIC(10,2) DEFAULT 30.00,
    creator_payout_per_reel NUMERIC(10,2) DEFAULT 10.00,
    upi_id VARCHAR(100),
    is_real BOOLEAN DEFAULT FALSE,
    requires_approval BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Client Campaigns (Demand)
CREATE TABLE campaigns (
    id SERIAL PRIMARY KEY,
    client_email VARCHAR(100) NOT NULL,
    total_assignments INT NOT NULL,
    total_amount NUMERIC(10,2) NOT NULL,
    payment_status VARCHAR(20) DEFAULT 'PAID',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Video Assets
CREATE TABLE campaign_assets (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    reel_number INT NOT NULL,
    title VARCHAR(100),
    video_url TEXT NOT NULL,
    caption TEXT
);

-- 4. Queue with Approval & Escrow States
CREATE TABLE scheduled_deliveries (
    id SERIAL PRIMARY KEY,
    campaign_id INT REFERENCES campaigns(id) ON DELETE CASCADE,
    asset_id INT REFERENCES campaign_assets(id) ON DELETE CASCADE,
    page_id INT REFERENCES theme_pages(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    published_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(30) DEFAULT 'PENDING_APPROVAL', -- PENDING_APPROVAL, LIVE, DECLINED, COMPLETED
    meta_media_id VARCHAR(100),
    retention_deadline TIMESTAMP WITH TIME ZONE,
    payout_amount NUMERIC(10,2) NOT NULL,
    payout_status VARCHAR(30) DEFAULT 'LOCKED_7_DAYS',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Open REST access
ALTER TABLE theme_pages DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns DISABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_deliveries DISABLE ROW LEVEL SECURITY;

-- Insert 5 Accounts (Mahiraj account REAL, baki 4 DEMO)
INSERT INTO theme_pages (owner_name, instagram_business_id, instagram_handle, access_token, niche, follower_count, is_payout_eligible, price_per_reel, creator_payout_per_reel, upi_id, is_real, requires_approval)
VALUES 
('Mahiraj Singh', '17841405848759632', '@mahiraj.khakhri', 'Upload Failed: Meta Container Error: {'error': {'message': 'Error validating access token: Session has expired on Thursday, 15-Oct-26 13:00:00 PDT. The current time is Saturday, 17-Oct-26 01:00:44 PDT.', 'type': 'OAuthException', 'code': 190, 'error_subcode': 463, 'fbtrace_id': 'AjywfQkscUcqxB5m-QLS4Aq'}}', 'Heritage & Travel', 1250, TRUE, 30.00, 10.00, 'mahiraj@upi', TRUE, TRUE),
('Tech Radar', '17841400000000002', '@ai_daily_pulse', 'DEMO_TOKEN', 'Tech & AI', 8400, TRUE, 70.00, 25.00, 'tech@okaxis', FALSE, FALSE),
('Wealth Club', '17841400000000003', '@wealth_mindset_in', 'DEMO_TOKEN', 'Finance & Crypto', 18200, TRUE, 120.00, 50.00, 'wealth@icici', FALSE, FALSE),
('Fitness Hub', '17841400000000004', '@fitness_hustle_club', 'DEMO_TOKEN', 'Fitness & Health', 920, FALSE, 0.00, 0.00, 'fit@paytm', FALSE, FALSE),
('Startup Daily', '17841400000000005', '@startup_chronicles', 'DEMO_TOKEN', 'Startups & Business', 34500, TRUE, 180.00, 80.00, 'startup@upi', FALSE, FALSE);
