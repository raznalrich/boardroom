-- =====================================================================
-- BoardRoom: seed data (the sample content the site used before Supabase)
-- Run AFTER schema.sql. Safe to run once; re-running will fail on unique slugs.
-- Images point at Unsplash; replace them with R2 uploads from the admin console whenever you like.
-- =====================================================================

-- Leader profiles
insert into public.leader_profiles (slug, name, title, company, region, tenure, quote, image_url) values
  ('tariq-al-mansoor', 'Tariq Al-Mansoor', 'Regional CEO', 'Gulf Investments', 'UAE', 'CEO since 2019', 'Capital follows clarity. Our job is to remove ambiguity.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80'),
  ('sunita-sharma', 'Sunita Sharma', 'Managing Director', 'Apex Logistics India', 'India', 'MD since 2017', 'Resilient supply chains are built in calm seasons.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80'),
  ('faisal-al-rashid', 'Faisal Al-Rashid', 'Chairman', 'Najd Holdings', 'Saudi Arabia', 'Chair since 2015', 'Family governance is the first strategy document.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=500&q=80'),
  ('amelia-grant', 'Amelia Grant', 'Group CFO', 'Meridian Global', 'Global', 'CFO since 2021', 'Great CFOs are translators between ambition and arithmetic.', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=500&q=80'),
  ('dr-hessa-khalifa', 'Dr. Hessa Khalifa', 'Chief Executive', 'Horizon Health', 'UAE', 'CEO since 2020', 'Healthcare is a trust business first, a scale business second.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=500&q=80'),
  ('vikram-nair', 'Vikram Nair', 'Founder & CEO', 'Kerala Ventures', 'India', 'Founder 2012', 'Patience is an underrated competitive advantage.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80'),
  ('noura-al-saud', 'Noura Al-Saud', 'Chief Strategy Officer', 'Tadawul Capital', 'Saudi Arabia', 'CSO since 2022', 'Strategy is choosing what you will not do.', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=500&q=80'),
  ('rahul-menon', 'Rahul Menon', 'Group CEO', 'Menon Industries', 'India', 'CEO since 2018', 'Scale without discipline is just size.', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=500&q=80'),
  ('james-whitfield', 'James Whitfield', 'Executive Chairman', 'Whitfield & Co', 'Global', 'Chair since 2014', 'Boards earn trust one hard conversation at a time.', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=500&q=80'),
  ('mariam-al-farsi', 'Mariam Al-Farsi', 'Chief Operating Officer', 'Emirates Logistics', 'UAE', 'COO since 2020', 'Operations is where strategy meets reality.', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80');

-- Insights
insert into public.insights (category, title, summary, details, author, read_mins, published_on, image_url) values
  ('Economy', 'The Gulf pivot: how sovereign funds are rewriting global capital flows', 'From Riyadh to Abu Dhabi, state-backed investors now allocate more outbound capital than at any point in the last decade.', 'Sovereign wealth funds across the Gulf now manage well over three trillion dollars, and an increasing share is being deployed outside the region. Where earlier cycles favoured passive allocations to listed equities and bonds, today''s capital is flowing into infrastructure, private equity, technology and energy-transition assets.

The shift is reshaping global deal-making. Co-investment structures, long-term anchor stakes and direct partnerships with operating companies have become standard, giving Gulf investors influence that goes well beyond their balance sheets.

For executives, the implication is clear: understanding the priorities of these funds, from domestic diversification mandates to supply-chain security, is now a core part of capital-raising strategy. Boards that engage early and speak the language of long-term partnership are winning the largest cheques.', 'Layla Haddad', 9, '2026-11-10', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80'),
  ('Strategy', 'Why the best boards are shrinking their agendas', 'Directors report that fewer, deeper discussions outperform exhaustive quarterly reviews.', 'A growing number of boards are cutting the length of their agendas by a third or more. Instead of working through every standing item each quarter, they reserve most of the meeting for two or three decisions that genuinely shape the company''s direction.

Directors interviewed for this piece say the change improves the quality of debate. Pre-reads replace presentations, routine approvals move to a consent agenda, and management is asked to frame each topic as a decision rather than an update.

The result is fewer surprises and sharper accountability. Chairs who have adopted the approach report shorter meetings, higher director engagement and a clearer line between oversight and management.', 'Rohan Mehta', 6, '2026-11-09', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80'),
  ('Technology', 'AI in the C-suite: three operating models that actually work', 'A review of 40 regional enterprises reveals the governance structures behind successful rollouts.', 'Enterprises that move beyond AI pilots tend to settle on one of three operating models: a central centre of excellence, a federated model with business-unit teams, or an embedded approach where every function owns its own AI roadmap.

Our review of 40 regional organisations found that no model wins outright. Centralised teams move fastest in regulated industries, where governance is paramount, while federated models work best for diversified groups with distinct customer bases.

What the successful programmes share is executive sponsorship at C-suite level, clear ownership of data quality and a disciplined process for retiring projects that do not deliver measurable value.', 'Sara Al-Qahtani', 8, '2026-11-08', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80'),
  ('Sustainability', 'Green hydrogen economics: the cost curve finally bends', 'Falling electrolyser prices and offtake agreements make 2027 a credible inflection point.', 'The cost of green hydrogen has been the main obstacle to large-scale adoption. That is changing. Electrolyser prices have fallen sharply, renewable power in the Gulf is among the cheapest in the world, and a first wave of long-term offtake agreements has given project developers the revenue certainty lenders require.

Analysts now see 2027 as a credible inflection point, with several export-oriented projects moving from announcement to final investment decision.

Challenges remain in shipping, storage and the pace of demand growth in heavy industry. But for energy companies and their investors, the question has shifted from whether green hydrogen can compete to who will secure the best positions early.', 'Omar Farouk', 7, '2026-11-06', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=800&q=80'),
  ('Finance', 'Private credit comes to the Middle East', 'Regional banks partner with global managers as mid-market borrowers look beyond traditional lending.', 'Private credit is arriving in the Middle East. Regional banks, long the dominant source of corporate lending, are increasingly partnering with global asset managers to serve mid-sized borrowers that need faster, more flexible financing.

These partnerships allow banks to originate loans while sharing risk and capital requirements, and they give borrowers access to structures such as unitranche facilities and bespoke covenants that were previously unavailable locally.

Regulators are watching closely, and transparency standards are rising. For CFOs, the message is that the financing toolkit is widening, and that a relationship with a private credit provider can complement rather than replace traditional bank lines.', 'Anita Desai', 5, '2026-11-05', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80'),
  ('Strategy', 'Succession planning in family conglomerates', 'The next generation brings new expectations on governance, transparency and public listing.', 'Many of the region''s largest businesses remain family-controlled, and the handover to the next generation is the defining governance question of the decade. Younger leaders typically bring higher expectations on transparency, professional management and, in some cases, a public listing.

The most successful transitions begin years in advance. Families establish a clear charter, separate ownership from management, and build independent boards that can arbitrate when interests diverge.

Advisers stress that succession is as much about preparing the business as preparing the individual. Gradual transfer of responsibility, external experience for heirs and open communication across branches of the family all reduce the risk of conflict at the moment of change.', 'Khalid Nasser', 10, '2026-11-03', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80');

-- Events
insert into public.events (title, type, event_date, time_label, city, seats) values
  ('Annual Leadership Summit 2026', 'Summit', '2026-12-02', '09:00 – 18:00', 'Dubai, DIFC', 'Few seats left'),
  ('Chairman’s Private Dinner', 'Dinner', '2026-12-09', '19:30', 'Riyadh', 'Invitation only'),
  ('CFO Outlook 2027 Webinar', 'Webinar', '2026-12-14', '15:00 GST', 'Online', 'Open'),
  ('Keynote: The Next Decade of Trade Corridors', 'Keynote', '2027-01-21', '11:00', 'Mumbai', 'Open'),
  ('Women in the Boardroom Forum', 'Summit', '2027-02-05', '10:00 – 16:00', 'Abu Dhabi', 'Open'),
  ('Family Business Roundtable', 'Dinner', '2027-02-18', '19:00', 'Doha', 'Invitation only');

-- Articles (sector deep dives)
insert into public.articles (title, category, author, summary, read_mins, image_url, status) values
  ('The Next AI Wave in Enterprise Strategy', 'LEADERSHIP', 'Dr. Aris Thorne', '', 5, 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Executive Mindset: Resilience in Volatile Markets', 'LEADERSHIP', 'Neha Kapoor', 'How C-suite leaders navigate macroeconomic shifts through adaptive governance models.', 6, 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Navigating Cross-Border Trade in 2027', 'STRATEGY', 'Marcus Vance', '', 8, 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80', 'published'),
  ('The Era of Circular Manufacturing', 'STRATEGY', 'Leila Al-Harthi', 'Sustainable supply chains move from ESG compliance to core competitive advantage.', 4, 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Generative Models in Sovereign Cloud Infrastructure', 'AI & TECH', 'Rahul Deshmukh', '', 6, 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Autonomous Supply Chains: Realities vs Hyped Claims', 'AI & TECH', 'Sarah Jenkins', 'Evaluating real-world ROI of agentic AI deployments in regional fulfillment hubs.', 7, 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Sovereign Wealth: Investing in Next-Gen Innovation', 'GCC MARKETS', 'Hamdan Al-Rashid', '', 9, 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Riyadh as the New Regional Business Capital', 'GCC MARKETS', 'Omar Al-Ghamdi', 'Multinational regional headquarters expand operations under Vision 2030 initiatives.', 5, 'https://images.unsplash.com/photo-1586724237569-f3d0c1dee8c6?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Private Credit Arrives in the Middle East', 'FINANCE', 'Anita Desai', 'Regional banks partner with global managers as mid-market borrowers look beyond traditional lending.', 6, 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Sukuk Issuance Heads for a Record Year', 'FINANCE', 'Khalid Nasser', '', 5, 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Precision Medicine Goes Mainstream in the Gulf', 'HEALTHCARE', 'Dr. Hessa Khalifa', 'National genomic programmes reshape how hospitals approach diagnosis and treatment.', 7, 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Telemedicine Platforms Scale Across India', 'HEALTHCARE', 'Vikram Nair', '', 4, 'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=600&q=80', 'published'),
  ('The Rise of Corporate Universities', 'EDUCATION', 'Sunita Sharma', 'Large employers build their own academies to close the skills gap faster than traditional degrees.', 6, 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80', 'published'),
  ('EdTech Funding Rebounds with AI Tutors', 'EDUCATION', 'Rohan Mehta', '', 5, 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Dubai Off-Plan Boom: Sustainable or Overheated?', 'REAL ESTATE', 'Layla Haddad', 'Developers race to deliver as foreign buyers drive record transaction volumes.', 8, 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Giga-Projects and the New Saudi Skyline', 'REAL ESTATE', 'Faisal Al-Rashid', '', 6, 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Omnichannel Is Dead; Long Live Unified Commerce', 'RETAIL', 'Mariam Al-Farsi', 'Regional retailers merge stores, apps and marketplaces into a single customer view.', 5, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', 'published'),
  ('Quick Commerce Reshapes Grocery in the GCC', 'RETAIL', 'Tariq Al-Mansoor', '', 4, 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=600&q=80', 'published');
