import type { Project } from '../types';
import { PUBLIC_URL } from '../utils/getBaseUrl';
import { ARKANOID_CODE } from './arkanoidCode';
import { YOLOV8_CODE } from './yolov8Code';
import { MOVIE_RECS_CODE } from './movieRecsCode';

const ARKANOID_SNIPPET = ARKANOID_CODE;
const YOLOV8_SNIPPET = YOLOV8_CODE;
const MOVIE_RECS_SNIPPET = MOVIE_RECS_CODE;

export const projects: Project[] = [
  {
    id: 9,
    slug: "etsconnect",
    title: "ETSConnect",
    category: "Business Design / B2B Platform",
    timeline: "Business Design Course, 2026",
    description: "The bottleneck wasn't the fleet, it was winning contracts. So we built a B2B procurement marketplace.",
    tags: ["Business Design", "Market Research", "Stakeholder Mapping", "Service Strategy", "Business Modelling"],
    color: "bg-[#F3EFFF]",
    accentColor: "text-[#8B5CF6]",
    hoverColor: "group-hover:text-[#7C3AED]",
    badge: "bg-[#EDE6FF] text-[#5B21B6]",
    content: {
      heroImage: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Hero.svg`,
      thumbnailImage: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Thumbnail.svg`,
      role: "Business Designer",
      team: ["Sharvani", "Hrishika", "Vasuman"],
      sections: [
        {
          title: "Overview",
          content: "India's employee transport sector moves millions of people to work every day, and almost none of that work is won through anything resembling a system. Corporates find providers by asking peers. Providers find work by already knowing someone.\n\nWe came into it through a Pune-based corporate mobility operator, Vagabond Translink, who asked us how to grow. Two field visits in, it was clear the company had already solved its operational problems and was stuck on a market-structure one — so that is what the project became about."
        },
        {
          title: "The Market",
          content: "Before questioning the brief we needed to know whether the ceiling was the company or the category. India's employee transportation services market sits around $10B and is compounding at 8.2% — faster than the global average — with corporate car rental and shared mobility growing alongside it.\n\nThe number that reframed the project was penetration. India runs roughly 546 employees per corporate mobility vehicle. China is at 372, the USA at 36, Europe at 10. The demand isn't missing; the connective tissue is.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Market.svg`,
              caption: "India's corporate mobility segment is growing faster than global markets across every sub-category we sized."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Penetration.svg`,
              caption: "546 employees per vehicle against Europe's 10 — the headroom is structural, not seasonal."
            }
          ]
        },
        {
          title: "How We Researched It",
          content: "The research was deliberately multi-method, because the gap we suspected was between what people say happens in procurement and what actually happens. Two on-site field visits with the operator's CEO and CTO gave us the supply-side view; seven conversations across the corporate side — procurement, admin, transport management — gave us the buyer's; a survey let us check whether what we were hearing generalised.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Research.svg`,
              caption: "Observation, stakeholder interviews, process mapping, and validation loops back to the people we'd interviewed."
            }
          ]
        },
        {
          title: "The Ecosystem",
          content: "Mapping the stakeholders made the shape of the problem visible. An ETS operator sits at the centre of a chain it only partly controls: it contracts with corporate clients, but the vehicles belong to fleet vendors and the service quality depends on drivers it doesn't employ. Around that sit procurement teams, the employees who actually ride, competitors, financiers, and a regulatory layer.\n\nEvery pain point we found later traces back to a relationship in this map that has no formal channel running through it.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Stakeholders.svg`,
              caption: "Primary, secondary, and tertiary layers of the corporate mobility ecosystem."
            }
          ]
        },
        {
          title: "Ground Realities",
          content: "These are the constraints that showed up on the ground rather than in the brief — the things that quietly decide who wins work in this industry.",
          listItems: [
            "Financial barriers — corporates pay on 45-day cycles, so vendor selection quietly favours whoever can float payroll and fuel that long, regardless of capability.",
            "Fragmented market — there is no standardised way to discover, compare, or onboard a provider anywhere in the industry.",
            "Mission-critical service — a delay or a safety incident hits the client's own operations, so the buying decision is really a risk decision.",
            "Limited tech application — technology runs routing and tracking well, and touches procurement or vendor discovery not at all.",
            "Unstable driver layer — long hours, fatigue, high churn, and inconsistent professionalism make service quality variable no matter how good the operator is."
          ]
        },
        {
          title: "Key Findings",
          content: "Synthesising the interviews produced six findings. Each one is a place where the system behaves differently from how it describes itself.",
          listItems: [
            "Reliability-driven decisions — 95–97% on-time SLAs and safety requirements shift the buying decision away from cost and towards risk mitigation.",
            "Informally gated access — the RFP process is genuinely structured, but only vendors already known to the buyer are invited into it.",
            "A split system — trust is built informally before entry, then enforced formally after selection.",
            "Visibility, not capability — competition is constrained by exposure; qualified vendors are excluded simply because nobody has heard of them.",
            "Price, not discovery — procurement optimises price discovery (L1/L2) within a fixed pool, rather than searching for a better-fitting vendor.",
            "Control, not connection — technology is deployed as a control layer over execution, never as a discovery layer between demand and supply."
          ]
        },
        {
          title: "The Real Challenge",
          content: "Stated plainly, the client's problem was not operations. It was contracts — acquiring and securing more of them, through a channel that doesn't scale.\n\nWhat made this worth designing for is that the pain is symmetrical. Vendors can't be found; corporates can't find anyone new. Both sides described the same missing thing from opposite ends, and neither could build it alone.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-System-Inefficiency.svg`,
              caption: "The same structural gap, articulated independently by vendors and by corporate procurement teams."
            }
          ]
        },
        {
          title: "The Direction Shift",
          content: "This was the decision the project turned on.\n\nThe obvious move was to stay inside the brief and optimise a single operator — tighten coordination, improve driver management, sharpen the feedback loops. We rejected it. Operations were already standardised, procurement systems on the client side were rigid and closed to us, and the realistic ceiling on that work was incremental.\n\nSo we moved up a level, from company to ecosystem. If the bottleneck is that qualified vendors and willing corporates cannot see each other, then the intervention isn't a better fleet process — it's the missing marketplace. That reframing also changed who the client is: solving it for the industry solves it for the client, but not only for the client.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Direction-Shift.svg`,
              caption: "Rejecting the company-level brief in favour of ecosystem-level enablement."
            }
          ]
        },
        {
          title: "Prioritising the Opportunity",
          content: "We generated a wide set of options — EV fleets as an ESG offering, commute personalisation, event transport, hospitality expansion, referral networks — and plotted them against business value and customer value. Most of the operational ideas clustered as incremental. A centralised procurement platform was the one intervention sitting high on both axes, and the only one that addressed the contract bottleneck directly.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Priority-Matrix.svg`,
              caption: "Business value vs customer value — the platform concept was the clear Big Win quadrant candidate."
            }
          ]
        },
        {
          title: "ETSConnect",
          content: "ETSConnect formalises the informal. It is a B2B digital procurement marketplace connecting verified corporates with verified employee-transport providers, so both sides can discover each other, bid, verify compliance, and finalise contracts in one place — matched across India by proximity and requirement.\n\nBoth sides are verified before they get access. Corporates are checked for legitimacy and genuine contract intent, so providers aren't bidding into noise. Providers are checked on fleet, compliance documents, and operational track record, so corporates are never exposed to unverified operators.",
          listItems: [
            "Save time — a structured digital RFQ replaces weeks of phone calls and email chains; procurement completes in days, not months.",
            "Reduce risk — verified providers, tracked compliance documents, and auditable bid records remove hidden procurement risk.",
            "Control costs — transparent, side-by-side bid comparison prevents over-pricing and produces data-backed contract values.",
            "Safer commutes — only compliance-verified providers participate, raising the baseline safety standard on every contracted route."
          ]
        },
        {
          title: "What the Platform Does",
          content: "The product is organised around the four stages of the procurement lifecycle we mapped during research — the same four stages that are currently handled by phone calls, spreadsheets, and personal relationships.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Pillars.svg`,
              caption: "Vendor discovery, bid comparison, compliance management, and contract finalisation on one platform."
            }
          ]
        },
        {
          title: "The Business Case",
          content: "The revenue model is deliberately two-sided and low-friction on the demand side, because the platform is only valuable to corporates once enough verified supply is listed — so supply is what we charge for.",
          listItems: [
            "₹5,000 per month, per ETS provider listing — covering verified listing, bid access, and the compliance dashboard.",
            "2.5% one-time fee on estimated contract value, calculated from the kilometre estimate submitted during bidding.",
            "Target customer: companies of 500+ employees with recurring daily employee transport across multiple routes and shifts.",
            "Cost structure: platform development and maintenance, cloud infrastructure, two-sided acquisition, and the legal and verification operations that make the trust layer real."
          ]
        },
        {
          title: "Impact at Scale",
          content: "The reason this is worth building rather than just proposing is that its value compounds. Employee transport demand recurs daily, so every additional participant makes the network more useful to everyone already on it.",
          listItems: [
            "Reduced operational risk — structured discovery, standardised bidding, and verified compliance remove corporates' exposure to unverified operators and informal arrangements.",
            "Expanded market access — providers receive qualified inbound demand beyond their existing networks, reducing dependence on referrals.",
            "Network defensibility — daily, consistent demand means the platform gets more valuable to both sides as it grows, and harder to replicate.",
            "Critical ecosystem infrastructure — at scale it becomes the operating layer for corporate mobility procurement in India, not merely a tool."
          ]
        },
        {
          title: "Validation",
          content: "We took the concept back to a senior transport manager at HCL — someone who sits on the buying side of exactly this process. His reaction was that the transparency is the point: today he has to ask peers whether a vendor is any good, and a biased recommendation is indistinguishable from an honest one.\n\nHis pushback was equally useful, and both notes changed how we framed the concept:",
          listItems: [
            "Don't over-restrict access — gating the platform too tightly would recreate the closed network we set out to open.",
            "Show limited pricing benchmarks, but stop short of full transparency that would disadvantage providers in their own negotiations.",
            "Let employees rate provider profiles, so service quality becomes visible rather than anecdotal.",
            "Expect trust-building and process complexity — not technology — to be the real adoption barriers."
          ]
        },
        {
          title: "Reflection",
          content: "The most useful thing I did on this project was argue for not answering the question we were asked. The client wanted help running its fleet better, and we could have delivered a competent set of operational improvements that changed very little. Sitting with the research long enough to see that the bottleneck was structural — that the market itself had no way for supply and demand to find each other — was uncomfortable, because it meant telling a client their brief was aimed at the wrong level.\n\nIt also taught me that business design has a research burden that visual work doesn't. Every claim here had to survive a conversation with someone who does this for a living, and the validation session was where the concept actually earned its shape."
        }
      ]
    }
  },
  {
    id: 8,
    slug: "hr-genie",
    title: "HR Genie",
    category: "Agentic AI / Enterprise UX",
    timeline: "Summer Internship (SIP-2), 2026",
    description: "Conversational agents replacing Bajaj Finance's form-based HR workflows — part of a roadmap for 800+ agents.",
    tags: ["Microsoft Copilot Studio", "Power Fx", "Power Automate", "Adaptive Cards", "Azure"],
    color: "bg-[#EAF0FF]",
    accentColor: "text-[#4B74E7]",
    hoverColor: "group-hover:text-[#1D4ED8]",
    badge: "bg-[#DCE7FF] text-[#1E3A8A]",
    content: {
      heroImage: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Hero.svg`,
      thumbnailImage: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Thumbnail.svg`,
      role: "Design & Development Intern, Agentic AI Unit — reporting through the VP, AI Unit, to the COO/CTO office",
      sections: [
        {
          title: "Overview",
          content: "I spent this internship as a designer and builder on Bajaj Finance's Agentic AI team, shipping conversational agents that replace manual HR workflows for a workforce of thousands. The unit's mandate is company-wide: an initiative internally called FINAI / Employee Blu, aiming to deploy 800+ autonomous agents across business functions. My job was to design and build the HR-facing agents inside that system — collectively branded HR Genie.",
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Scale.svg`,
              caption: "HR Genie's agents sit inside Bajaj Finance's 800+ agent FINAI / Employee Blu roadmap."
            }
          ]
        },
        {
          title: "The Problem",
          content: "Bajaj Finance's HR operations ran on CHROMA, a form-based HRMS — every leave request, reimbursement claim, or document lookup meant navigating multi-step forms, manual validation, and email follow-ups. Simple, repetitive tasks were consuming real time for a workforce of thousands. The Agentic AI Unit's mandate was to replace these form-based flows with conversational agents employees could just talk to."
        },
        {
          title: "Apply Leave",
          content: "A conversational flow letting employees check leave balances and submit requests — Privilege Leave, Sick Leave, Casual Leave, Loss of Pay, Maternity, and Vacation Leave — each with its own eligibility rules and validation logic. Connected live to the CHROMA HRMS via API, with balance checks and error handling built directly into the conversation rather than a form.",
          listItems: [
            "Live balance lookups per leave type via the CHROMA API",
            "Type-specific eligibility rules and validation, handled conversationally",
            "Error handling surfaced in-chat instead of a rejected form submission"
          ],
          imageLayout: "row",
          imageHeight: "md:h-[36rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Chat-Mockup.svg`,
              caption: "Apply Leave — a Figma recreation of the conversation flow (no internal CHROMA data shown)."
            }
          ]
        },
        {
          title: "Creche Reimbursement",
          content: "An agent that reads submitted invoices using OCR, validates them against city-tier-based reimbursement caps, checks child age eligibility, and processes the claim — turning a manual document-review process into a same-session conversational one.",
          listItems: [
            "OCR extraction straight from the uploaded invoice — no manual data entry",
            "City-tier reimbursement caps and child-age eligibility validated automatically",
            "Claim resolved in the same chat session it was opened in"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Creche-Flow.svg`,
              caption: "Before vs after — a multi-day manual review becomes a same-session conversation."
            }
          ]
        },
        {
          title: "Local Conveyance Claim",
          content: "Matches claims against a vendor master list, calculates reimbursement based on transport mode, and was the first topic I built natively on Copilot Studio's newer no-code architecture.",
          listItems: [
            "Claims cross-checked against a vendor master list",
            "Reimbursement calculated in Power Fx based on transport mode and distance",
            "First topic built end-to-end on Copilot Studio's Gen 2 architecture"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Conveyance-Architecture.svg`,
              caption: "Input → validation → calculation → output — built as the template for future topics."
            }
          ]
        },
        {
          title: "The Turning Point: Leading a Platform Migration",
          content: "Partway through the internship, I identified a structural problem: the agents were being built on Copilot Studio's older, node-based Gen 1 architecture — powerful, but harder to scale and maintain as the number of agents grew. I evaluated Copilot Studio's newer Gen 2 architecture, a no-code, skill-based approach, built a proof-of-concept, and made the case to leadership that migrating would pay off in maintainability and speed for the 800+ agent roadmap ahead. The recommendation was adopted. I went on to lead the full migration of 17 topics from Gen 1 to Gen 2, and built the Local Conveyance Claim agent natively on the new architecture as a template for future builds. This was the shift in the internship from executing what I was asked to build to shaping how the team builds going forward — from builder to decision-influencer.",
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Gen1-vs-Gen2.svg`,
              caption: "The Gen 1 vs Gen 2 comparison I used to make the case for migration — 17 topics migrated as a result."
            }
          ]
        },
        {
          title: "Skills in Practice",
          content: "This internship pulled together design, engineering, and stakeholder skills across a real enterprise system rather than a single discipline.",
          listItems: [
            "Conversational flow & interaction design — mapping multi-step business logic into natural, low-friction dialogue",
            "Technical implementation — Power Fx formulas, YAML topic logic, Adaptive Card JSON for rich in-chat UI",
            "Systems thinking — architecture evaluation, migration planning, cross-topic consistency",
            "API integration — live connections to enterprise HRMS and document storage systems",
            "Stakeholder communication — presenting a technical recommendation (Gen 1 → Gen 2) to leadership and getting buy-in"
          ]
        },
        {
          title: "Reflection",
          content: "Designing for a system where the interface is a conversation, not a screen, changed how I think about validation and trust — every rule a form usually enforces silently now has to be said out loud, clearly, in the moment it matters. Leading the Gen 1 to Gen 2 migration also taught me that the most valuable design work isn't always the next feature — sometimes it's stepping back and questioning the foundation everyone else is building on."
        }
      ]
    }
  },
  {
    id: 0,
    slug: "classflow",
    title: "ClassFlow",
    category: "AI Agent",
    timeline: "Ongoing",
    description: "AI course scheduling for professors — describe your semester in plain language, get a calendar.",
    tags: ["React 19", "Vite 7", "Tailwind CSS", "Firebase", "Gemini 2.5 Flash", "Google Calendar API"],
    color: "bg-[#F2F1FF]",
    accentColor: "text-[#746DD5]",
    hoverColor: "group-hover:text-[#4239C4]",
    badge: "bg-[#E3E0FF] text-[#2F2895]",
    content: {
      heroImage: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Home.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Thumbnail.webp`,
      role: "Creator & Lead Developer",
      sections: [
        {
          title: "Overview",
          content: "ClassFlow is a full-stack AI scheduling assistant built specifically for professors. Instead of manually building 45+ calendar events at the start of every semester, professors simply describe their course in a chat — topics, meeting days, times, and dates — and ClassFlow generates the entire semester schedule automatically. It is a complete, end-to-end product built and iterated on as a solo project.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Landing.webp`,
              caption: "ClassFlow landing page — V2.0, AI-powered"
            }
          ]
        },
        {
          title: "The Problem",
          content: "At the start of every semester, professors face the same invisible labour: planning an entire course calendar by hand. For a typical 15-week course meeting three times a week, that is 45+ events to create — topics mapped to weeks, recurring sessions set up, assignment deadlines tracked, all entered into a calendar one by one. It is repetitive, error-prone, and burns hours that professors don't have."
        },
        {
          title: "The Solution",
          content: "ClassFlow removes that burden entirely. A professor describes their course once in a natural language chat — topics by week, meeting days and times, semester dates — and Gemini generates the full semester schedule instantly. The result is a structured, visual, editable calendar ready to export to Google Calendar or download as a .ics file.",
          imageLayout: "stack",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Import-Chatbot.webp`,
              caption: "Import Data screen: AI chatbot (left), live Parsed Plan with schedule pattern and events (centre), Assignment tracker (right)"
            }
          ]
        },
        {
          title: "How It Works",
          content: "The entire app is built around a three-step flow: describe, review, export.",
          listItems: [
            "Describe — the professor types their course details into the AI chatbot: topics by week, meeting days and times, semester start and end dates.",
            "Parse — Gemini 2.5 Flash extracts a recurring schedule pattern, maps topics to specific class sessions, and populates a live Parsed Plan panel in real time.",
            "Review — the professor switches to View Schedule and sees the full semester across three views: month grid, hourly week grid, or searchable event list.",
            "Refine — events can be edited directly on the calendar, or adjusted via follow-up chat ('Move the midterm to March 20', 'Add office hours every Thursday at 2pm').",
            "Export — one-click push to Google Calendar via OAuth with a live progress bar, or download as a standards-compliant .ics file for Outlook, Apple Calendar, or any client.",
            "Persist — authenticated users have all courses and schedules auto-saved to Firestore across sessions."
          ]
        },
        {
          title: "Calendar Views",
          content: "Once a schedule is generated, professors can explore it in three different views — each designed for a different purpose.",
          imageLayout: "grid",
          imageHeight: "auto",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Calendar-March.webp`,
              caption: "Month grid — full semester at a glance. Assignment deadlines appear as colour-coded markers (DUE: Midterm Essay visible on March 1)."
            },
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Week-View.webp`,
              caption: "Hourly week grid — shows exact session times (10:00–11:00am), today's date highlighted, and Mon/Wed/Fri pattern clearly visible."
            }
          ]
        },
        {
          title: "Event List View",
          content: "The searchable list view gives professors a chronological breakdown of every event across all their courses — with date, time, topic, and course label all visible at once. Useful for reviewing the full semester quickly or finding specific sessions.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-List-View.webp`,
              caption: "List view — every session listed chronologically with date, time, topic, and course tag. Fully searchable."
            }
          ]
        },
        {
          title: "AI Chatbot Architecture",
          content: "The chatbot is the core of ClassFlow — not a wrapper around a chat UI, but a structured AI pipeline that turns natural language into calendar data. Every message sent to Gemini 2.5 Flash includes the full current schedule state, a persistent chat memory object, the last 12 conversation turns, and date/time hints pre-extracted via regex.",
          imageLayout: 'row',
          imageHeight: 'h-[15rem] sm:h-[22rem]',
          imageCrop: true,
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Chatbot-Only.webp`,
              caption: "The AI chatbot panel — natural language input drives the full schedule generation pipeline"
            }
          ],
          listItems: [
            "Response types: answer (info only), clarify (asking for missing info), or update (modify the schedule).",
            "Supports replace, append, remove, and targeted update operations on individual events.",
            "Returns a recurringConfig object (days[], startDate, endDate, startTime, endTime) that drives the schedule generation engine.",
            "Maintains a chatMemory object across turns — topics, times, recurring config — so professors never have to repeat context.",
            "Handles API overload with exponential backoff retry: 500ms → 1000ms → 1800ms before surfacing an error.",
            "Pending updates shown in-chat as a 'Review & Apply' card with Apply, Discard, and Replace options before any state change."
          ]
        },
        {
          title: "Schedule Generation Engine",
          content: "Once the AI extracts a recurring config from the chat, a custom scheduling engine maps topics to class sessions deterministically — no AI involvement at this step, so the output is always predictable and correct.",
          listItems: [
            "generateRecurringDates() iterates across the full date range, filters to the configured weekdays, and assigns week numbers to each session.",
            "Topics tagged by week (e.g. week: 3) are distributed evenly across that week's available class slots.",
            "If a week has more topics than sessions, extras are appended to the notes field of existing events rather than dropped.",
            "If sessions outnumber topics, slots are created as blank placeholders the professor can fill manually.",
            "Assignment deadlines are injected as special marker events: Given (blue), Check-in (amber), Due (orange) — visible on the calendar alongside regular sessions."
          ]
        },
        {
          title: "Key Features",
          content: "Every feature in ClassFlow was built around a real professor workflow — not what looks impressive in a demo.",
          listItems: [
            "AI chatbot as the only input method — no file uploads, no forms, just conversation.",
            "Multi-course support — each course gets its own colour, isolated state, and appears in a shared calendar view.",
            "Three calendar views: month grid, hourly week grid (7am–10pm), and searchable event list.",
            "Conflict detection — flags overlapping sessions across courses with a badge count and highlighted rows in list view.",
            "Undo stack — per-course snapshots (last 10 actions) for safe experimentation and mistake recovery.",
            "Assignment tracker — professors add Given, Check-in, and Due dates per assignment; these inject as colour-coded marker events in the calendar.",
            "Google Calendar export — OAuth 2.0 flow with batched API calls and a real-time progress bar showing export status.",
            ".ics download — custom VEVENT serialisation, importable into any calendar client.",
            "Guest mode — full scheduling functionality without login; login with Firebase to save across sessions."
          ]
        },
        {
          title: "Tech Stack",
          content: "Built entirely as a solo project over multiple iterations.",
          listItems: [
            "React 19 + Vite 7 — component-based frontend with fast HMR development",
            "Tailwind CSS + Lucide React — utility-first styling with consistent iconography",
            "Google Gemini 2.5 Flash — AI model handling both the chatbot responses and schedule parsing",
            "Firebase Auth + Firestore — Google sign-in and per-user cloud persistence",
            "Google Calendar API — OAuth 2.0 token flow with batched event creation requests",
            "Custom ICS serialisation — VEVENT generation without any third-party calendar library"
          ]
        },
        {
          title: "What I Learned",
          content: "ClassFlow taught me what it actually means to build an AI-powered product — not just call an API and display a response, but architect a system where AI output is structured, validated, and applied to real state. The hardest problem was not making the AI generate a schedule. It was making it feel trustworthy: handling edge cases, surfacing pending changes before applying them, keeping memory across turns, and recovering gracefully when the model returns unexpected output. A professor is trusting this tool with their entire semester. That shaped every design and engineering decision."
        }
      ]
    }
  },
  {
    id: 1,
    slug: "wepick",
    title: "WePick",
    category: "UI/UX App Design",
    timeline: "Completed",
    description: "WePick is a social shopping app where friends can share products, vote, and shop together in real time. By turning feedback into collaboration, it cuts decision fatigue and makes online shopping more confident, interactive, and fun.",
    tags: ["UX Research", "Design System", "App Design"],
    color: "bg-sky-50",
    accentColor: "text-sky-600",
    hoverColor: "group-hover:text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    content: {
      heroImage: `${PUBLIC_URL}/images/WePick/WePick-Hero.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/WePick/wepick-thumbnail.webp`,
      role: "UI/UX Designer",
      team: ["Dhruv Tolani", "Yash Khanna"],
      sections: [
        {
          title: "The Process",
          content: "The project timeline spanned several weeks, moving through distinct phases: Research > Problem Statement > Insights > Ideation > MVP Definition > Prototyping > Final App.",
          listItems: ["Defined User Problem", "Gathered User Insights", "Ideation", "Storyboarding", "Visual Identity", "Prototyping"]
        },
        {
          title: "The User Problem",
          content: "When shopping online with a group, sharing product links across multiple apps quickly becomes exhausting. What feels easy when shopping alone turns chaotic in group chats, where opinions are scattered, responses get lost, and people are left unsure of what the group actually wants—making it hard to decide and move forward."
        },
        {
          title: "Research & Insights",
          content: "Our quantitative research validated the hypothesis that the target demographic views shopping as an inherently social activity, creating a clear demand for structured collaboration tools.",
          listItems: [
            "81.5% of respondents were aged 18–24, validating this age group as the primary target audience.",
            "48.1% regularly seek others' opinions before making a purchase, highlighting that shopping decisions are inherently social.",
            "68.4% showed strong interest in real-time acceptance or rejection, reinforcing demand for faster collaboration."
          ]
        },
        {
          title: "Storyboarding",
          content: "To visualize the solution, we created comparative storyboards. The first illustrates the friction of the current method, while the second demonstrates the seamless flow using WePick.",
          images: [
            {
              src: `${PUBLIC_URL}/images/WePick/storyboard-without-app.webp`,
              caption: "Without the App: The chaos of fragmented communication."
            },
            {
              src: `${PUBLIC_URL}/images/WePick/storyboard-with-app.webp`,
              caption: "With the App: Streamlined collaboration and voting."
            }
          ]
        },
        {
          title: "Collaborative Overview",
          content: "Goal: Enable faster, clearer purchase decisions by bringing social feedback and product discovery into one shared shopping experience.\n\nWe designed distinct modes to cater to different social contexts:\n\n\u00A0\u00A0\u00A0\u00A0• WE Mode: Real-time group shopping with shared browsing and decisions.\n\u00A0\u00A0\u00A0\u00A0• ME Mode: Personalized recommendations for solo shopping.\n\u00A0\u00A0\u00A0\u00A0• THEM Mode: Guided shopping for gifting or needs-based purchasing.",
          listItems: [
            "Shared Cart: A single space to collect opinions and compare options, eliminating scattered chats.",
            "AI Feedback Summary: Condenses group reactions into clear accept/reject insights.",
            "Outcome: Less chaos. Clear consensus. Faster checkouts."
          ]
        },
        {
          title: "User Task Flows",
          content: "",
          images: [
            {
              src: `${PUBLIC_URL}/images/WePick/Onboarding.webp`,
              caption: "User Onboarding"
            },
            {
              src: `${PUBLIC_URL}/images/WePick/Shared-Cart.webp`,
              caption: "Adding Items to Shared Cart"
            },
            {
              src: `${PUBLIC_URL}/images/WePick/Giving-Feedback.webp`,
              caption: "Giving Feedback to Other Users"
            },
            {
              src: `${PUBLIC_URL}/images/WePick/Viewing-Feedback.webp`,
              caption: "Viewing Feedback"
            }
          ]
        },
        {
          title: "Visual Identity & Moodboard",
          content: "To define the aesthetic direction of WePick, we curated a moodboard focusing on vibrant, energetic colors and clean, modern typography. The goal was to create an interface that feels fun, social, and trustworthy.",
          images: [
            {
              src: `${PUBLIC_URL}/images/WePick/wepick-moodboard.webp`,
              caption: "WePick Visual Identity Moodboard"
            }
          ]
        },
        {
          title: "Design System",
          content: "Before moving to high-fidelity screens, we established a comprehensive design system including typography, color palettes, and component libraries to ensure consistency across the application.",
          images: [
            {
              src: `${PUBLIC_URL}/images/WePick/WePick Design System 2.webp`,
              caption: "WePick Design System & Components"
            }
          ]
        },
        {
          title: "Final Output",
          content: "The final deliverable included a polished app walkthrough demonstrating the 'WePick' flow. You can experience the interactive prototype directly below, inviting friends and voting in real-time.",
          embedUrl: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FZSnz5vTUKNzYNRuOs1uxWt%2FWePick%3Fnode-id%3D0-1%26t%3DvsCOeZePPSny2dOa-1"
        }
      ]
    }
  },
  {
    id: 7,
    slug: "rahi-design-system-v2",
    title: "RAHI Design System v2",
    category: "UI Design Internship / Design Systems",
    timeline: "Completed",
    description: "Designed reusable desktop components for RAHI Platform Technologies design system v2, with a strong focus on keyboard-first interaction and state clarity.",
    tags: ["Figma", "Design Systems", "Desktop UX", "Component Variants", "Interaction Design"],
    color: "bg-[#E7F6F4]",
    accentColor: "text-[#16A197]",
    hoverColor: "group-hover:text-[#16A197]",
    badge: "bg-[#D4F0EC] text-[#0D6B64]",
    content: {
      heroImage: `${PUBLIC_URL}/images/RAHI/RAHI Logo.webp`,
      // The full logo export carries a wide white margin, which leaves the mark
      // tiny once a square tile contains it. This is the same lockup trimmed to
      // its own edges so it fills the tile.
      thumbnailImage: `${PUBLIC_URL}/images/RAHI/RAHI-Thumbnail.webp`,
      role: "UI Design Intern",
      sections: [
        {
          title: "Internship Focus",
          content: "At RAHI Platform Technologies, I contributed to version 2 of the design system for desktop software and web interfaces. The work centered on defining consistent component behavior, clear state communication, and scalable variant structure for future product teams."
        },
        {
          title: "What I Designed",
          content: "Core building blocks and interaction patterns shipped as reusable design-system components.",
          listItems: [
            "Calendar and date-time picker patterns for keyboard and pointer input",
            "Buttons with size, icon, and state variants",
            "Text boxes with status logic (default, warning, invalid, disabled)",
            "Dropdown systems for single-select and multi-select flows",
            "Accordion patterns for progressive disclosure",
            "Chart templates for analytical dashboards"
          ]
        },
        {
          title: "Buttons",
          content: "Button variants were structured by type, size, icon presence, and interaction states so teams could configure components quickly without visual drift.",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-buttons.webp`,
              caption: "Button system with large, medium, and small variants"
            }
          ]
        },
        {
          title: "Text Boxes",
          content: "Input fields were standardized with status-based feedback and optional prefix/suffix icons to support finance and operations-heavy data entry use cases.",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-textboxes.webp`,
              caption: "Text-box variants with warning, invalid, and disabled states"
            }
          ]
        },
        {
          title: "Dropdowns and Accordions",
          content: "I created dropdown and accordion behavior libraries that support helper text, error messaging, multi-select chips, and expandable content blocks while maintaining predictable spacing and state transitions.",
          imageLayout: "grid",
          imageHeight: "h-[15rem] sm:h-[22rem] md:h-[30rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-dropdown.webp`,
              bgClass: "bg-[#ededed]",
              caption: "Dropdown component patterns across states and use cases"
            },
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-accordian.webp`,
              bgClass: "bg-[#ededed]",
              caption: "Accordion structures for compact and content-rich layouts"
            }
          ]
        },
        {
          title: "Calendar and Time Picker",
          content: "I designed a calendar + date-time picker system optimized for desktop usage and keyboard navigation. The patterns cover compact and expanded layouts, selected-date states, clear visual feedback, and predictable focus behavior.",
          imageLayout: "mixed",
          imageHeight: "md:h-[20rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-Calendar-1.webp`,
              caption: "Calendar states showing selected date and date-range behavior"
            },
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-timepicker.webp`,
              caption: "Time-picker states for keyboard-first entry"
            },
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-calendar.webp`,
              fullWidth: true,
              containerClass: "w-full md:max-w-[25rem]",
              caption: "Compact combined calendar and time picker"
            }
          ]
        },
        {
          title: "Data Visualization Components",
          content: "I designed chart templates for line, scatter, combo, and radial styles with consistent titles, legends, axes, and utility controls for dashboard-level readability.",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-graphs.webp`,
              caption: "Line, scatter, and progress chart templates"
            }
          ]
        },
        {
          title: "Outcome",
          content: "This internship work strengthened my ability to think in systems instead of isolated screens. I learned to define components as scalable products, balancing clarity for end users with speed for design and engineering teams."
        }
      ]
    }
  },
  {
    id: 4,
    slug: "revela",
    title: "Revela",
    category: "Tangible Interfaces",
    timeline: "Completed",
    description: "Proximity-based light feedback that guides children aged 4–7 to lost objects. No screens, no app.",
    tags: ["ESP32", "NeoPixels", "Arduino IDE"],
    color: "bg-[#FFF1F2]",
    accentColor: "text-[#E03E3E]",
    hoverColor: "group-hover:text-[#DC2626]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
    content: {
      heroImage: `${PUBLIC_URL}/images/Revela/Revela Hero Shot.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/Revela/Revela Hero Shot.webp`,
      role: "Circuit Design · Hardware Prototyping · Physical Computing",
      team: ["Khushii Mehta", "Kaushal Gajipara", "Parinita Shiralige"],
      sections: [
        {
          title: "Overview",
          content: "Revela teaches children aged 4–7 to find lost objects using light-based feedback. It works without screens and apps."
        },
        {
          title: "How Might We",
          content: "How might we help young children find their belongings independently, in a way that feels playful, magical, and intuitive?"
        },
        {
          title: "Design Rationale",
          content: "During an unstructured discussion, we found that children learn best through movement, touch, and tangible feedback. They are especially engaged by objects that respond with visual cues when they interact with them. Our goal was to make the technology fade into the background of a child's daily life, supporting the development of life skills rather than becoming a distraction."
        },
        {
          title: "System Requirements",
          content: "From early research, we defined strict requirements:",
          listItems: [
            "Zero screens or apps",
            "Immediate feedback loop (<100 ms perceived latency)",
            "Continuous (not binary) guidance",
            "Readable by children with no instructions",
            "Low power consumption",
            "Safe, enclosed hardware"
          ]
        },
        {
          title: "System Architecture",
          content: "Revela is composed of a handheld explorer wand and distributed beacon nodes.",
          listItems: [
            "Explorer Wand: ESP32-S3 XIAO, NeoPixel LED strip, 3.7V Li-Po with onboard charging, physical power switch",
            "Beacon Nodes: ESP32-C2 modules attached to objects emitting proximity signals"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/Revela/Exploded View.webp`,
              caption: "Exploded view of the system architecture"
            }
          ]
        },
        {
          title: "Interaction Loop",
          content: "Physical movement changes signal strength, which is processed on-device and translated into LED color and animation. The loop runs continuously and guides user movement in real time.",
          imageLayout: "row",
          imageHeight: "max-w-[20rem] md:h-[24rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/Revela/Low-Fidelity Prototype Testing.gif`,
              caption: "Low-fidelity prototype testing"
            }
          ]
        },
        {
          title: "Proximity-to-Feedback Mapping",
          content: "Instead of numeric or directional output, Revela uses perceptual mapping.",
          imageLayout: "storyboard",
          images: [
            {
              src: `${PUBLIC_URL}/images/Revela/wand-red-glow.webp`,
              caption: "Far: Red Light"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wand-yellow-glow.webp`,
              caption: "Approaching: Yellow Light"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wand-green-glow.webp`,
              caption: "Near: Green Light"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wand-white-glow.webp`,
              caption: "Found: Pulsing white light"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wand-purple-glow.webp`,
              caption: "Found all Beacons: Purple Light"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wand-orange-glow.webp`,
              caption: "Not Connected to Beacon: Orange Light"
            }
          ]
        },
        {
          title: "Power & Performance Constraints",
          content: "Engineering tradeoffs focused on battery life, heat, and responsiveness.",
          listItems: [
            "Balanced LED brightness vs battery life",
            "Minimized heat buildup in a small enclosure",
            "Ensured fast response without draining power",
            "Avoided wireless complexity that could fail in real environments"
          ]
        },
        {
          title: "Technical Testing & Validation",
          content: "My teammate and I validated both electronics reliability and interaction behavior through iterative bench and in-context testing, including soldering quality checks and distance-response tuning across different ranges.",
          imageLayout: "techSplit",
          images: [
            {
              src: `${PUBLIC_URL}/images/Revela/esp32-soldering.gif`,
              caption: "ESP32 soldering and assembly"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/distance-testing.gif`,
              caption: "Distance-response testing"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/distance-testing-2.gif`,
              caption: "Extended distance validation"
            }
          ]
        },
        {
          title: "Technical Failures",
          content: "Multiple rounds of hardware and form iteration were required to resolve reliability and ergonomics together.",
          listItems: [
            "ESP32 failures from unstable power delivery",
            "LED malfunctions after repeated reassembly",
            "Charging modules degrading after prolonged use",
            "Wiring stress from tight internal constraints",
            "LED diffusion inconsistencies affecting readability"
          ]
        },
        {
          title: "My Technical Contributions",
          content: "I built and integrated embedded hardware systems, implemented LED feedback logic tied to proximity signals, designed interaction states, integrated battery + charging systems, and tested responsiveness in real environments."
        },
        {
          title: "Prototype Form Creation",
          content: "After ideation, I translated the selected form direction into a build-ready prototype by planning internal layout, routing wiring paths, and validating grip, balance, and visibility through hands-on assembly and testing.",
          imageLayout: "mixed",
          imageHeight: "md:h-[24rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/Revela/wand-creation.gif`,
              caption: "Wand creation process"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/wamd-creation-2.webp`,
              caption: "Wand creation detail"
            },
            {
              src: `${PUBLIC_URL}/images/Revela/tag-printing.gif`,
              caption: "Tag printing process",
              fullWidth: true
            }
          ]
        },
        {
          title: "Design Validation (Systems + UX)",
          content: "Revela applies core HCI principles: immediate feedback, clear mapping, strong affordance, and constrained interaction—creating a low-error, low-friction experience."
        },
        {
          title: "Outcome & Reflection",
          content: "Revela demonstrates how embedded systems can replace screen-based interfaces while delivering continuous, meaningful feedback. The project reinforced that great embedded systems disappear into the experience. Future iterations would explore multi-beacon environments, adaptive sensitivity tuning, and improved enclosure manufacturability."
        },
        {
          title: "Why This Project Matters",
          content: "Revela sits at the intersection of embedded systems, human-centered interaction, and physical computing. It demonstrates my ability to design end-to-end systems where hardware, firmware, and experience are developed together."
        }
      ]
    }
  },
  {
    id: 2,
    slug: "dino-spread",
    title: "Dino Spread",
    category: "Industrial Design",
    timeline: "Completed",
    description: "A dinosaur-themed jam and butter dispenser for school and college canteens — eliminating messy countertops and shared utensils through a playful, pull-to-dispense pump mechanism.",
    tags: ["Physical Prototyping", "Sketching", "3D Modeling"],
    color: "bg-rose-50",
    accentColor: "text-[#E23167]",
    hoverColor: "group-hover:text-rose-900",
    badge: "bg-rose-100 text-rose-900",
    content: {
      heroImage: `${PUBLIC_URL}/images/Dino Spread/dino-spread-hero.webp`,
      role: "Industrial Designer",
      team: ["Analise Periera"],
      sections: [
        {
          title: "The Problem",
          content: "We observed a recurring issue in the campus canteen setup. Knives were often left slipping into open jam and butter jars. This caused handle stickiness and hygiene concerns, leading to messy hands and cross-contamination.",
          listItems: ["Knives slipping into jars", "Sticky handles", "Hygiene concerns"],
          imageLayout: 'row',
          imageHeight: 'md:h-48',
          images: [
            {
              src: `${PUBLIC_URL}/images/Dino Spread/dino-spread-knife-mess.webp`,
              caption: "The messy reality of shared condiment jars."
            },
            {
              src: `${PUBLIC_URL}/images/Dino Spread/dino-spread-applying-condiments.webp`,
              caption: "Hygiene concerns during application."
            }
          ]
        },
        {
          title: "Ideation & Mechanism Design",
          content: "We chose a Dinosaur theme to hide the mechanism and create a sense of joy for the target users (kids/students). The form factor allows for a fun interaction where pulling the head/lever dispenses the condiment.\n\nDispensing Action: The jam comes out from the dinosaur's mouth. The teeth act as the dispensing nozzle to control flow. The user pulls down the head to trigger the pump mechanism inside.",
          imageLayout: 'row',
          imageHeight: 'md:h-80',
          images: [
            {
              src: `${PUBLIC_URL}/images/Dino Spread/dino-spread-sketches.webp`,
              caption: "Sketch iterations exploring form and mechanism."
            },
            {
              src: `${PUBLIC_URL}/images/Dino Spread/dino-spread-final-sketch.webp`,
              caption: "Final concept sketch."
            }
          ]
        },
        {
          title: "Prototyping Journey",
          content: "As part of the project, we created a low-fidelity prototype using XPS foam, reinforced with Plaster of Paris to add structural strength and allow surface finishing. The final form was finished using acrylic paint. Alongside this, we explored multiple form iterations across different shapes and sizes to evaluate ergonomics, proportions, and overall form before finalizing a direction.",
          imageLayout: 'mixed',
          imageHeight: 'md:h-[21rem]',
          images: [
            {
              src: `${PUBLIC_URL}/images/Dino Spread/jash-creating-prototype.webp`,
              caption: "Creating the XPS foam prototype."
            },
            {
              src: `${PUBLIC_URL}/images/Dino Spread/drying-pop-prototype.webp`,
              caption: "Applying Plaster of Paris for reinforcement."
            },
            {
              src: `${PUBLIC_URL}/images/Dino Spread/form-variations.webp`,
              caption: "Exploring various form iterations.",
              fullWidth: true
            }
          ]
        },
        {
          title: "Final Prototype",
          content: "Our final prototype displayed during our design jury.",
          imageLayout: 'row',
          imageHeight: 'md:h-96',
          images: [
            {
              src: `${PUBLIC_URL}/images/Dino Spread/sketching-final-prototype.webp`,
              caption: "Final Prototype"
            },
            {
              src: `${PUBLIC_URL}/images/Dino Spread/sketching-team-photo.webp`,
              caption: "Design Jury Presentation"
            }
          ]
        }
      ]
    }
  },
  {
    id: 3,
    slug: "solarlink",
    title: "SolarLink",
    category: "Service Design",
    timeline: "Completed",
    description: "A service design concept to help housing societies confidently adopt solar — the gap isn't infrastructure, it's decision-making.",
    tags: ["Service Design", "Sustainability", "Systems Thinking"],
    color: "bg-[#D9F43F]/80",
    accentColor: "text-[#D8F36A]",
    hoverColor: "group-hover:text-[#E3FC03]",
    badge: "bg-[#CFEA3F]/25 text-[#E7F99A] border border-[#CFEA3F]/50",
    content: {
      heroImage: `${PUBLIC_URL}/images/SolarLink/Solarlink-thumbnail.webp`,
      role: "Service Design · Research · Insight Synthesis · Journey Mapping · Concept & Experience Design",
      team: ["Khushii Mehta", "Kaushal Gajipara"],
      sections: [
        {
          title: "SDG 7 Context",
          content: "SDG 7: Affordable & Clean Energy (Sub-goal 7.2) focuses on increasing the share of renewable energy in the global energy mix.\n\nIndia has vast rooftop solar potential, especially in urban housing societies, yet community-level adoption remains slow. The gap is not infrastructure. It's decision-making."
        },
        {
          title: "Overview",
          content: "SolarLink is a service design concept that reframes solar adoption from a technology challenge into a decision-making problem.\n\nThe project explores how housing societies can move from confusion and indecision to shared clarity and confidence before any installation begins."
        },
        {
          title: "Problem Statement",
          content: "Housing societies want solar, but struggle to move forward. Solar keeps becoming \"next year's agenda\".",
          listItems: [
            "Confusion and misinformation about how solar works",
            "Multiple stakeholders with conflicting opinions",
            "Fear of making the wrong decision for everyone",
            "Lack of neutral guidance — only vendor-driven sales"
          ]
        },
        {
          title: "Research & Understanding",
          content: "India has an estimated 124 GW of rooftop solar potential. Only ~11 GW has been installed — less than 10% utilised.\n\nKey observations from research:",
          listItems: [
            "Residential societies contribute less than 20% of rooftop solar installations",
            "Decision-making in societies takes 2–3x longer than individual homes",
            "60%+ residents cite lack of clear information as a bigger barrier than cost",
            "Committee members fear irreversible decisions that affect the whole building"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink Affinity Map.webp`,
              caption: "Affinity Map — research synthesis"
            }
          ]
        },
        {
          title: "Primary User: Rajesh Nair",
          content: "Rajesh Nair is the Secretary of Sagar Heights CHS — a 15-floor, 50-flat cooperative society in Ghatkopar East, Mumbai. He manages energy, maintenance, and vendor contracts through a single managing committee, with monthly electricity bills described as \"excessively high.\"\n\nAs an informal decision-maker, Rajesh is practical and risk-averse. His biggest concern is not price — it is making the wrong call for the entire building.",
          listItems: [
            "Goals: Reduce electricity costs, digitise maintenance, create a self-managed sustainable community",
            "Pain points: High bills, no centralised tracking, difficulty managing vendor reliability and after-sales service",
            "Needs: Reliable data on feasibility and savings, a guided decision framework, and long-term vendor support"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Persona-Rajesh.webp`,
              caption: "User Persona: Rajesh Nair, Society Secretary",
              fullWidth: true
            }
          ]
        },
        {
          title: "Current Solar Journey",
          content: "Before SolarLink, a housing society attempting solar adoption faces 7 sequential stages — each requiring coordination between vendors, government bodies, and committee members. The process is fragmented, unclear, and easy to abandon at any point.\n\nThis is what we set out to redesign.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Current-Journey.webp`,
              caption: "The current 7-stage solar installation journey",
              fullWidth: true
            }
          ]
        },
        {
          title: "Core Insight",
          content: "Clean energy is not a technology problem. It's a decision problem.\n\nSolar adoption fails not because people don't care — but because deciding together is hard.\n\nHousing societies don't need persuasion. They need confidence.\n\nAdoption must begin before panels: with clarity, shared understanding, and trust."
        },
        {
          title: "Design Question",
          content: "How might we move housing societies from confusion to clarity before any solar installation begins?",
          imageLayout: "grid",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/making-solar-relatable.webp`,
              caption: "Making Solar Relatable"
            },
            {
              src: `${PUBLIC_URL}/images/SolarLink/Inclusive-Decision_Making.webp`,
              caption: "Inclusive Decision Making"
            },
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar-Process-Support.webp`,
              caption: "Solar Process Support"
            },
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar_Financing.webp`,
              caption: "Solar Financing"
            }
          ]
        },
        {
          title: "Design Direction",
          content: "The solution needed to:",
          listItems: [
            "Be neutral, not vendor-driven",
            "Support collective decision-making",
            "Reduce fear around long-term commitments",
            "Make solar understandable and discussable",
            "Build trust before execution"
          ]
        },
        {
          title: "The Solution: SolarLink",
          content: "SolarLink is a service ecosystem designed to guide housing societies through solar adoption with confidence.\n\nWe are not a solar vendor. We are a neutral facilitator.",
          listItems: [
            "Understand solar",
            "Discuss options together",
            "Decide confidently"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar-Sunday-2.webp`,
              caption: "Solar Sunday Experience",
              borderless: true
            }
          ]
        },
        {
          title: "Core Intervention: Solar Sunday",
          content: "Solar Sunday is a one-day, on-site experience designed to help housing societies explore solar without pressure.\n\nInstead of sales presentations, Solar Sunday turns the society terrace into a calm, interactive learning space where:\n\n• Questions are safe\n• Myths are surfaced\n• Understanding is shared\n\nSolar adoption begins with understanding. Solar Sunday is where that understanding is built."
        },
        {
          title: "Key Experience Touchpoints",
          content: "Solar Confession Booth: A private, judgment-free space where residents openly express doubts and myths. Most common confession: \"I don't really understand solar.\" Surfacing uncertainty early reduces resistance later.\n\nAR Energy Visualiser: Residents see projected costs, savings, and energy generation mapped onto their own building. Solar becomes tangible, not abstract.\n\nPledge Wall: Residents make small, non-binding commitments to show intent and interest. Small signals build collective ownership.\n\nNo selling. Just shared understanding.",
          imageLayout: "stack",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar-Sunday.webp`,
              caption: "Solar Sunday — on-site experience",
              borderless: true
            },
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Storyboard.webp`,
              caption: "Storyboard: The Confession Loop → Solar Sunday Experience → Energy Independence & Pride",
              fullWidth: true
            }
          ]
        },
        {
          title: "Redefined Journey",
          content: "Before SolarLink:\n\n• Fragmented information\n• Vendor bias\n• Endless discussions\n• Decisions delayed\n\nWith SolarLink:\n\n• Structured learning\n• Neutral facilitation\n• Transparent comparisons\n• Confidence before approvals\n\nSolar does not move faster by pushing harder. It moves faster when people feel ready.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Service-Blueprint.webp`,
              caption: "Service Blueprint: Physical Evidence · Customer Actions · SolarLink Actions · Backstage · Support Processes",
              fullWidth: true
            }
          ]
        },
        {
          title: "Impact & SDG Alignment",
          content: "SolarLink directly supports SDG 7: Affordable & Clean Energy by addressing the decision layer of adoption.\n\nBy enabling confident community decisions, SolarLink directly increases adoption of renewable energy at the society level.\n\nThe impact is not measured in panels installed, but in:\n\n• Reduced decision friction\n• Increased trust\n• Higher likelihood of adoption\n\nSolarLink doesn't install panels. We install confidence."
        },
        {
          title: "Explore the Design Board",
          content: "The full FigJam board contains the complete research synthesis, affinity mapping, service blueprint, and storyboard developed across the team project.",
          embedUrl: "https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/board/cqhXU5e7apFNog7yvWeDx6/Service-design-final-_-Team-5",
          embedWide: true,
          cta: {
            text: "Open FigJam Board",
            url: "https://www.figma.com/board/cqhXU5e7apFNog7yvWeDx6/Service-design-final-_-Team-5"
          }
        },
        {
          title: "What I Learned",
          content: "This project strengthened my understanding that:",
          listItems: [
            "Sustainability adoption is a systems problem",
            "Designing for confidence is as important as efficiency",
            "Service design can unlock stalled behaviors",
            "Community decisions require facilitation, not persuasion"
          ]
        },
        {
          title: "Why This Project Matters in My Portfolio",
          content: "SolarLink reflects my approach to design: insight-led, not solution-first; human-centered at a systems scale; focused on clarity, trust, and behavior.\n\nIt demonstrates how design can enable sustainable change by reshaping how decisions are made."
        }
      ]
    }
  },
  {
    id: 10,
    slug: "soundtrack-seven-years",
    title: "The Soundtrack of Seven Years",
    category: "Data Visualisation / Design Engineering",
    timeline: "Personal project, 2026",
    description: "Seven years of my own Spotify history — 98,111 plays — read as an eight-chapter scrollytelling piece.",
    tags: ["Data Visualisation", "Design Engineering", "Python", "SVG", "Editorial Design"],
    color: "bg-[#0A0C0B]",
    accentColor: "text-[#3EC873]",
    hoverColor: "group-hover:text-[#3EC873]",
    badge: "bg-[#3ec873]/25 text-[#0d5c33]",
    content: {
      heroImage: `${PUBLIC_URL}/images/Spotify/Soundtrack-Hero.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/Spotify/Soundtrack-Thumbnail.webp`,
      role: "Design & Build",
      sections: [
        {
          title: "Overview",
          content: "Spotify emails you your Extended Streaming History as twelve JSON files. Wrapped turns that into five slides you forget by January; the raw export is 120,547 rows nobody reads.\n\nI wanted the thing in between — something that reads like a magazine feature and tells you what a top ten cannot. Eight chapters, every number computed from the export, shipped as one HTML file.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Hero.webp`,
              caption: "The opening screen. Nothing on the page is typed in by hand."
            }
          ],
          // The piece is a static file in public/, not a route. Named
          // explicitly rather than as `/spotify-wrapped/`: a static host
          // resolves the directory to index.html, but Vite's dev server
          // answers it with the SPA shell instead.
          cta: {
            text: "Read the whole thing",
            url: `${PUBLIC_URL}/spotify-wrapped/index.html`
          }
        },
        {
          title: "Getting the Numbers Honest First",
          content: "Most of the work happened before anything was drawn. Spotify re-chunks your whole history on every export, so the twelve files overlapped heavily; timestamps arrive in UTC for an account that listens in IST. And the export credits only the album artist, so one play in six goes to the wrong name.",
          listItems: [
            "12 export files deduplicated to 120,547 distinct plays",
            "98,111 counted streams, on Spotify's own 30-second threshold",
            "UTC → IST before any question about time of day",
            "16,253 featured-artist plays parsed from track titles — an alternate view, never a silent merge",
            "Every published figure re-derived by a second script that shares no code with the builder"
          ]
        },
        {
          title: "What the Data Knew That I Didn't",
          content: "The findings I kept are the ones no ranking would surface. I heard Khalid four times in 2019, then not once for 663 days — and 1,584 times since. Of the 5,676 songs in the library, 226 of them account for a third of everything I have played.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Surprises.webp`,
              caption: "Eight findings that no top-ten list would have surfaced. The clock plot compares one artist's hours against everything else played."
            }
          ]
        },
        {
          title: "Picking the Chart for the Question",
          content: "Each chart follows from the question rather than from what was easy to draw.\n\n\"How much of the last seven years had music in it?\" is a question about density across a long span, so it became eight concentric rings — one per year, one sliver per day. 2,469 lit days, 67 silent ones.\n\n\"Do songs get retired, or just played less?\" is a question about a lifetime, so the ten most-played got a row each across seven years. All ten are still in rotation.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Calendar.webp`,
              caption: "2,469 days with music, wound into eight rings. 2019 is the innermost, 2026 the outermost."
            },
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Songs.webp`,
              caption: "Ten songs, seven years, one row each — the dot grows with that year's play count."
            }
          ]
        },
        {
          title: "Composing It, Not Laying It Out",
          content: "Twenty charts in a row is a report, and nobody finishes a report. So the eight chapters are announced rather than stacked — a number, a sentence, a lot of air — and the sections carry deliberately different weights, from full-height beats down to one-line asides.\n\nColour holds it together. The surface and type scale are fixed for the whole page; each chapter re-binds only an accent and a nine-step ramp, and every chart inside inherits it. Every accent clears 4.5:1, every ramp is monotonic in lightness.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Artists.webp`,
              caption: "A chapter opening: the name at full size, four numbers, one paragraph, and only then the ranked list behind it."
            },
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Records.webp`,
              caption: "Chapter V runs gold. Album art is pulled in and each record's grooves are drawn per track, brighter where it was played more."
            }
          ]
        },
        {
          title: "Shipping It as One File",
          content: "The finished page is one HTML file — the data, the extras, and every piece of album artwork inlined as base64. It opens from a disk with the network switched off.\n\nThe headlines are generated too: the copy assembles around whatever the payload says won. Re-run the pipeline against a fresh export and the sentences change with it.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Week.webp`,
              caption: "168 cells, one per hour of the week. The headline above it names whichever cell came out hottest."
            },
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Artist-Arcs.webp`,
              caption: "Eight artists on one shared scale, so the comparison between them is real rather than per-panel."
            }
          ],
          listItems: [
            "One file, no server, no build step at read time",
            "Artwork inlined as base64 — no third-party requests once the page is open",
            "A single observer for every reveal and counter; reduced motion lands on the finished numbers",
            "A dated snapshot by design — the live endpoint is missing the fields half the piece depends on"
          ],
          cta: {
            text: "Open the live piece",
            url: `${PUBLIC_URL}/spotify-wrapped/index.html`
          }
        }
      ]
    }
  },
  {
    id: 5,
    slug: "python-codes",
    title: "Live Demos",
    category: "Computer Vision / Interactive",
    timeline: "Completed",
    description: "Three builds you can run right here in the browser — starting with a YOLOv8 object detector that runs live on your webcam, on-device, with no server round-trip.",
    tags: ["Python", "YOLOv8", "Computer Vision", "WebAssembly", "ONNX"],
    color: "bg-[#0C111B]",
    accentColor: "text-[#FFD343]",
    hoverColor: "group-hover:text-[#FFD343]",
    badge: "bg-[#ffd343]/30 text-[#9a7400]",
    content: {
      heroImage: "placeholder-python-hero.jpg",
      thumbnailImage: `${PUBLIC_URL}/images/python.webp`,
      role: "Developer",
      sections: [
        {
          title: "YOLOv8 Live Object Detection",
          content: "Turn on your camera and this runs a real neural network in your browser — no server, no upload, nothing leaves your device. The Python workflow uses Ultralytics YOLO for webcam inference; for the web, I exported the model to ONNX so it runs entirely client-side via WebAssembly with real-time bounding-box overlays.",
          listItems: [
            "Runs fully on-device — the video feed never leaves your machine",
            "Threaded capture & inference in the original Python build",
            "ONNX export + WebAssembly runtime for live in-browser detection"
          ],
          codeBlock: YOLOV8_SNIPPET,
          demoId: "yolov8"
        },
        {
          title: "Python Arcade: Arkanoid",
          content: "A classic arcade build written in Python, mirrored here as a playable JavaScript demo that preserves the feel of the original logic and visuals.",
          listItems: ["Physics-based ball motion", "Power-ups and scoring system", "Live playable demo"],
          codeBlock: ARKANOID_SNIPPET,
          demoId: "arkanoid"
        },
        {
          title: "Movie Recommendation Engine",
          content: "A content-based recommender that blends genres, directors, cast, and country into a single feature vector, then ranks similar films using cosine similarity.",
          listItems: ["CountVectorizer-style bag of words", "Cosine similarity ranking", "Fuzzy title matching"],
          codeBlock: MOVIE_RECS_SNIPPET,
          demoId: "movie-recs"
        }
      ]
    }
  },
  {
    id: 6,
    slug: "tinkering",
    title: "Countdown Motor Control",
    category: "Experimental Prototyping",
    timeline: "Completed",
    description: "A double 7-segment display countdown system built with ESP32, 36 LEDs, and a relay-triggered motor — designed, wired, and soldered from scratch as a hands-on electronics project.",
    tags: ["Prototyping", "R&D", "Creative Coding"],
    color: "bg-rose-50",
    accentColor: "text-[#E43158]",
    hoverColor: "group-hover:text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    content: {
      heroImage: `${PUBLIC_URL}/images/Tinkering/tinkering-hero-2.webp`,
      role: "Maker",
      sections: [
        {
          title: "Project Introduction",
          content: "This project focused on hands-on circuit design and electronic prototyping. The objective was to build a functional system by designing and assembling complex circuits, working with multiple electronic components, and validating performance through testing and iteration, with creative freedom in defining the final prototype."
        },
        {
          title: "Circuit Diagram",
          content: "My teammate and I decided to create a double 7-segment display that would count down and trigger a motor to start spinning.\n\nThe project uses:\n• 36 LEDs\n• ESP32\n• Ultrasonic Sensor\n• Relay\n• Motor",
          images: [
            {
              src: `${PUBLIC_URL}/images/Tinkering/Circuit-Design.webp`,
              caption: "Circuit diagram experiment",
              whiteBg: true
            }
          ]
        },
        {
          title: "First Light Test",
          content: "Initial power-on of the first 7-segment LED to validate wiring and segment mapping.",
          imageLayout: "row",
          imageHeight: "md:h-[28rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/Tinkering/segment-1-light.webp`,
              caption: "First light-up of the 1st 7-segment LED"
            },
            {
              src: `${PUBLIC_URL}/images/Tinkering/soldering.webp`,
              caption: "Soldering the connections"
            }
          ]
        },
        {
          title: "Prototype Countdown",
          content: "The coded prototype driving a 1-segment and 2-segment countdown sequence.",
          imageLayout: "row",
          imageHeight: "md:h-[28rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/Tinkering/1-segment-countdown.gif`,
              caption: "1-segment countdown"
            },
            {
              src: `${PUBLIC_URL}/images/Tinkering/2-segment-countdown.gif`,
              caption: "2-segment countdown"
            }
          ]
        },
        {
          title: "Final Countdown Prototype",
          content: "Final working countdown sequence running end-to-end on the prototype.",
          imageCrop: true,
          imageHeight: "h-[15rem] w-full max-w-full sm:h-[20rem] sm:max-w-[24rem] md:h-[26rem] md:w-[26rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/Tinkering/final-countdown.gif`,
              caption: "Final working prototype countdown"
            }
          ]
        }
      ]
    }
  }
];
