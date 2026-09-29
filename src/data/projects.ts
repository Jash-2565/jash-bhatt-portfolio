import type { Project } from '../types';
import { PUBLIC_URL } from '../utils/getBaseUrl';

export const projects: Project[] = [
  {
    id: 9,
    slug: "etsconnect",
    title: "ETSConnect",
    category: "Business Design / B2B Platform",
    timeline: "Business design course, 2026",
    description: "The bottleneck wasn't the fleet, it was winning contracts. So we built a B2B procurement marketplace.",
    tags: ["Business Design", "Market Research", "Stakeholder Mapping", "Service Strategy", "Business Modeling"],
    color: "bg-[#F3EFFF]",
    accentColor: "text-[#8B5CF6]",
    hoverColor: "group-hover:text-[#7C3AED]",
    badge: "bg-[#EDE6FF] text-[#5B21B6]",
    sectionAccent: "bg-[#EDE6FF]",
    content: {
      heroImage: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Hero.svg`,
      thumbnailImage: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Thumbnail.svg`,
      role: "Research, market analysis, concept design",
      team: ["Sharvani", "Hrishika", "Vasuman"],
      sections: [
        {
          title: "Overview",
          content: "India's employee transport sector moves millions of people to work every day, yet almost none of that work is won through a system. Corporates find providers by asking peers, and providers find work by already knowing someone.\n\nA Pune-based operator, Vagabond Translink, asked us how to grow. Two field visits in, it was clear their operations were already solved. Their problem was the structure of the market."
        },
        {
          title: "The Market",
          content: "The ceiling wasn't the category. The demand is there. What's missing is anything connecting it to supply.",
          stats: [
            { value: "$10B", label: "India's employee transport market" },
            { value: "8.2%", label: "Annual growth, ahead of global" },
            { value: "546", label: "Employees per vehicle in India. Europe: 10" }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Penetration.svg`,
              caption: "546 employees per vehicle against Europe's 10 — the headroom is structural, not seasonal."
            }
          ]
        },
        {
          title: "Research",
          content: "We suspected a gap between how procurement is described and how it actually happens, so we heard from both sides. We interviewed the operator's leadership on site, spoke with the corporate buyers, and ran a survey to check whether what we heard held up more widely.\n\nMapping the stakeholders showed the operator in the middle of a chain it only partly controls.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Research.svg`,
              caption: "Observation, stakeholder interviews, process mapping, and validation loops back to the people we'd interviewed."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Stakeholders.svg`,
              caption: "Primary, secondary, and tertiary layers of the corporate mobility ecosystem."
            }
          ]
        },
        {
          title: "What We Found",
          content: "Six findings, each a place where the system works differently from how it describes itself.",
          cards: [
            { title: "Risk over price", body: "95–97% on-time SLAs and safety turn vendor choice into a risk decision, not a cost one." },
            { title: "Gated access", body: "The RFP process is structured, but only vendors the buyer already knows get invited." },
            { title: "Split trust", body: "Trust is built informally before a vendor gets in, then enforced formally after selection." },
            { title: "Visibility, not capability", body: "Qualified vendors lose out simply because nobody has heard of them." },
            { title: "Price, not discovery", body: "Procurement haggles within a fixed pool instead of looking for a better-fitting vendor." },
            { title: "Control, not connection", body: "Technology runs routing and tracking, but never connects buyers with new vendors." }
          ]
        },
        {
          title: "The Direction Shift",
          callout: { text: "The client's problem wasn't operations. It was winning contracts." },
          content: "Vendors can't be found, and corporates can't find anyone new. Both sides described the same gap from opposite ends.\n\nThe obvious move was to stay inside the brief and optimize one operator. We rejected it: operations were already standardized, and the buyers' procurement systems were closed to us. So we moved from the company to the ecosystem. If the market has no way for supply and demand to meet, the fix is the missing marketplace, which solves it for the client and for everyone else too.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-System-Inefficiency.svg`,
              caption: "The same structural gap, articulated independently by vendors and by corporate procurement teams."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Direction-Shift.svg`,
              caption: "Rejecting the company-level brief in favour of ecosystem-level enablement."
            }
          ]
        },
        {
          title: "Prioritizing the Opportunity",
          content: "We mapped every idea, from EV fleets to event transport, against business and customer value. Only a centralized procurement platform scored high on both, and it was the only idea that addressed the contract bottleneck.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Priority-Matrix.svg`,
              caption: "Business value vs customer value — the platform concept was the clear Big Win quadrant candidate."
            }
          ]
        },
        {
          title: "ETSConnect",
          content: "A B2B procurement marketplace where verified corporates and verified transport providers find each other, bid, check compliance, and sign contracts in one place. Both sides are vetted before they get access, so neither is dealing with noise or unverified operators.",
          cards: [
            { title: "Save time", body: "A structured digital RFQ replaces weeks of calls and email chains." },
            { title: "Reduce risk", body: "Verified providers, tracked compliance, and auditable bid records." },
            { title: "Control costs", body: "Side-by-side bids stop over-pricing and set data-backed contract values." },
            { title: "Safer commutes", body: "Only compliance-verified providers can bid on a route." }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Pillars.svg`,
              caption: "Vendor discovery, bid comparison, compliance management, and contract finalization on one platform."
            }
          ]
        },
        {
          title: "The Prototype",
          content: "A clickable prototype with a portal for corporates and one for providers. One request, for 200 employees at a new Whitefield campus, runs through both portals from posting to signed contract.",
          imageLayout: "grid",
          // One per row: these are full desktop screens, and the prices and
          // document states the captions point at are unreadable at half width.
          gridWide: true,
          imageHeight: "auto",
          images: [
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Prototype-Search.webp`,
              caption: "Discover. Corporates filter verified providers by city, fleet, and safety services like female drivers and SOS, which came straight from the research."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Prototype-Submit-Bid.webp`,
              caption: "Bid. Providers price against the corporate's routes, shifts, and services. They see how many rivals they face, but never what those rivals bid."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Prototype-Compare-Bids.webp`,
              caption: "Compare. Every bid comes down to the same four numbers. The lowest is flagged, but rating and fleet size stay next to it."
            },
            {
              src: `${PUBLIC_URL}/images/ETSConnect/ETSConnect-Prototype-Contract.webp`,
              caption: "Contract. Documents from both sides go through upload and ETSConnect verification before service begins."
            }
          ],
          cta: {
            text: "Open the prototype",
            url: "https://people-vital-30894278.figma.site/"
          }
        },
        {
          title: "The Business Case",
          content: "Supply pays, because corporates only find the platform useful once enough verified providers are on it. Demand for employee transport recurs every day, so each new participant makes the network more valuable to everyone already on it, and harder to replicate.",
          stats: [
            { value: "₹5,000", label: "Per provider listing, monthly" },
            { value: "2.5%", label: "One-time fee on contract value" },
            { value: "500+", label: "Employees at target customers" }
          ]
        },
        {
          title: "Validation",
          callout: {
            text: "Transparency is the point. Today, a biased vendor recommendation looks exactly like an honest one.",
            attribution: "Senior transport manager, HCL · paraphrased"
          },
          content: "We took the concept to someone on the buying side of this exact process. His pushback changed how we framed it:",
          cards: [
            { title: "Don't over-restrict", body: "Gating too tightly would rebuild the closed network we set out to open." },
            { title: "Partial pricing", body: "Show benchmarks, but not so much that providers lose negotiating power." },
            { title: "Employee ratings", body: "Let riders rate providers, so service quality is visible, not anecdotal." },
            { title: "Trust is the barrier", body: "Adoption will be slowed by trust and process, not technology." }
          ]
        },
        {
          title: "Reflection",
          content: "The most useful thing I did was argue against the question we were asked. We could have delivered competent operational fixes that changed very little. Seeing that the real bottleneck was structural meant telling a client their brief was aimed at the wrong level.\n\nBusiness design also has a research burden that visual work doesn't. Every claim here had to survive someone who does this for a living."
        }
      ]
    }
  },
  {
    id: 8,
    slug: "hr-genie",
    title: "HR Genie",
    category: "Agentic AI / Enterprise UX",
    timeline: "Summer internship, 2026",
    description: "Conversational agents replacing Bajaj Finance's form-based HR workflows — part of a roadmap for 800+ agents.",
    tags: ["Microsoft Copilot Studio", "Power Fx", "Power Automate", "Adaptive Cards", "Azure"],
    color: "bg-[#EAF0FF]",
    accentColor: "text-[#4B74E7]",
    hoverColor: "group-hover:text-[#1D4ED8]",
    badge: "bg-[#DCE7FF] text-[#1E3A8A]",
    sectionAccent: "bg-[#DCE7FF]",
    content: {
      heroImage: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Hero.svg`,
      thumbnailImage: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Thumbnail.svg`,
      role: "Conversational design, Power Fx & Copilot Studio build, architecture migration",
      sections: [
        {
          title: "Overview",
          content: "I spent this internship as a designer and builder on Bajaj Finance's Agentic AI team, shipping conversational agents that replace manual HR workflows. They sit inside FINAI / Employee Blu, a company-wide push toward 800+ autonomous agents, under the name HR Genie.",
          stats: [
            { value: "800+", label: "Agents on the FINAI roadmap" },
            { value: "3", label: "HR agents I built" },
            { value: "17", label: "Topics I migrated to Gen 2" }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Scale.svg`,
              caption: "HR Genie's agents sit inside Bajaj Finance's 800+ agent FINAI / Employee Blu roadmap."
            }
          ]
        },
        {
          title: "The Problem",
          content: "HR ran on CHROMA, a form-based HRMS. Every leave request, reimbursement, or document lookup meant multi-step forms, manual validation, and email follow-ups, for a workforce of thousands."
        },
        {
          title: "Apply Leave",
          content: "Employees check balances and apply for any of six leave types in conversation. Each type's eligibility rules run live against the CHROMA API, and errors are explained in the chat instead of bouncing a form.",
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
          content: "The agent reads the uploaded invoice with OCR, checks it against city-tier caps and the child's age, and settles the claim in the same session.",
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Creche-Flow.svg`,
              caption: "Before vs after — a multi-day manual review becomes a same-session conversation."
            }
          ]
        },
        {
          title: "Local Conveyance Claim",
          content: "Claims are matched against a vendor master list and priced in Power Fx by transport mode. It was the first topic I built natively on Copilot Studio's Gen 2 architecture.",
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Conveyance-Architecture.svg`,
              caption: "Input → validation → calculation → output — built as the template for future topics."
            }
          ]
        },
        {
          title: "Leading a Platform Migration",
          callout: { text: "From building what I was asked to, to shaping how the team builds." },
          content: "Partway through, I noticed the agents were being built on Copilot Studio's node-based Gen 1 architecture, which would get harder to maintain with every agent on an 800+ roadmap.",
          cards: [
            { title: "Spotted it", body: "Gen 1 worked, but it would not scale to the roadmap ahead." },
            { title: "Proved it", body: "I built a proof of concept on Gen 2's no-code, skill-based approach." },
            { title: "Pitched it", body: "I made the case to leadership, and the recommendation was adopted." },
            { title: "Led it", body: "I migrated all 17 topics, and built Local Conveyance on Gen 2 as the template." }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/HR Genie/HR-Genie-Gen1-vs-Gen2.svg`,
              caption: "The Gen 1 vs Gen 2 comparison I used to make the case for migration — 17 topics migrated as a result."
            }
          ]
        },
        {
          title: "Reflection",
          callout: { text: "Every rule a form enforces silently now has to be said out loud." },
          content: "When the interface is a conversation, validation has to be clear in the moment it matters. And the migration taught me that the most valuable design work is sometimes questioning the foundation everyone else is building on."
        }
      ]
    }
  },
  {
    id: 0,
    slug: "classflow",
    title: "ClassFlow",
    category: "AI Agent",
    timeline: "Personal project, 2026 – present",
    description: "AI course scheduling for professors — describe your semester in plain language, get a calendar.",
    tags: ["React 19", "Vite 7", "Tailwind CSS", "Firebase", "Gemini 2.5 Flash", "Google Calendar API"],
    color: "bg-[#F2F1FF]",
    accentColor: "text-[#746DD5]",
    hoverColor: "group-hover:text-[#4239C4]",
    badge: "bg-[#E3E0FF] text-[#2F2895]",
    sectionAccent: "bg-[#E3E0FF]",
    content: {
      heroImage: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Home.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Thumbnail.webp`,
      role: "Design & build, solo",
      sections: [
        {
          title: "Overview",
          content: "ClassFlow is an AI scheduling assistant for professors. They describe a course in a chat, and it builds the whole semester's calendar. I designed and built it end to end, on my own.",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Landing.webp`,
              caption: "ClassFlow landing page — V2.0, AI-powered"
            }
          ]
        },
        {
          title: "The Problem",
          content: "Every semester starts with the same invisible labour: typing an entire course into a calendar, one event at a time.",
          stats: [
            { value: "15", label: "Weeks in a typical course" },
            { value: "3", label: "Sessions a week" },
            { value: "45+", label: "Events entered by hand" }
          ]
        },
        {
          title: "How It Works",
          content: "Describe the course once. Everything after that is review.",
          cards: [
            { title: "Describe", body: "Type topics by week, meeting days, times, and semester dates into the chat." },
            { title: "Review", body: "Gemini fills a live Parsed Plan, then the full semester appears as a calendar." },
            { title: "Refine", body: "Edit events directly, or just ask: “Move the midterm to March 20.”" },
            { title: "Export", body: "Push to Google Calendar with a live progress bar, or download an .ics file. The .ics is written by hand, with no calendar library." }
          ],
          imageLayout: "stack",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Import-Chatbot.webp`,
              caption: "Chat on the left, the Parsed Plan filling in beside it, assignments on the right."
            }
          ]
        },
        {
          title: "Calendar Views",
          content: "Three views of the same schedule: the semester, the week, and every event in order.",
          imageLayout: "grid",
          // One per row. At half column width these month and week grids came
          // out ~400px even on a 1920 screen, which made the very cells the
          // captions point at unreadable.
          gridWide: true,
          imageHeight: "auto",
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Calendar-March.webp`,
              caption: "Month. Deadlines show as colour-coded markers, like DUE: Midterm Essay on March 1."
            },
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Week-View.webp`,
              caption: "Week. Exact session times, with the Mon/Wed/Fri pattern visible at a glance."
            },
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-List-View.webp`,
              caption: "List. Every session across every course, searchable."
            }
          ]
        },
        {
          title: "Under the Hood",
          callout: { text: "The AI reads the request. Plain code builds the calendar, so the output is always predictable." },
          content: "Every message to Gemini 2.5 Flash carries the current schedule, a memory of the course so far, and the last 12 turns, so professors never repeat themselves. The model returns a recurring pattern; a deterministic engine turns it into dated sessions.",
          imageLayout: 'row',
          imageHeight: 'h-[15rem] sm:h-[22rem]',
          imageCrop: true,
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Chatbot-Only.webp`,
              caption: "The chatbot panel, the only way schedules get in."
            }
          ],
          cards: [
            { title: "Three kinds of reply", body: "Each response either answers, asks for what's missing, or updates the schedule." },
            { title: "Review before apply", body: "Changes arrive as a card to apply, discard, or replace. Nothing changes silently." },
            { title: "Nothing dropped", body: "Extra topics go into an event's notes. Empty sessions become placeholders." },
            { title: "Fails gracefully", body: "If the API is overloaded, it retries at 500ms, 1s, and 1.8s before showing an error." }
          ]
        },
        {
          title: "Built for Real Workflows",
          content: "Features came from how professors actually plan, not what demos well.",
          cards: [
            { title: "Many courses, one calendar", body: "Each course gets its own colour, and clashes between them are flagged." },
            { title: "Undo", body: "The last 10 changes per course, so trying things is safe." },
            { title: "Assignment tracker", body: "Given, check-in, and due dates appear on the calendar as markers." },
            { title: "Sign in with Google", body: "Courses and schedules save to your account and follow you across sessions. Guest mode is there for a first try." }
          ]
        },
        {
          title: "What I Learned",
          callout: { text: "A professor is trusting this tool with their entire semester." },
          content: "Getting the AI to generate a schedule was the easy part. The hard part was making it trustworthy: showing changes before applying them, remembering context, and recovering when the model returns something unexpected."
        }
      ]
    }
  },
  {
    id: 1,
    slug: "wepick",
    title: "WePick",
    category: "UI/UX App Design",
    timeline: "UI/UX course, 2025",
    description: "A social shopping app where friends share products, vote, and check out together — turning scattered group chats into one decision.",
    tags: ["UX Research", "Design System", "App Design"],
    color: "bg-sky-50",
    accentColor: "text-sky-600",
    hoverColor: "group-hover:text-sky-600",
    badge: "bg-sky-100 text-sky-700",
    sectionAccent: "bg-sky-100",
    content: {
      heroImage: `${PUBLIC_URL}/images/WePick/WePick-Hero.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/WePick/wepick-thumbnail.webp`,
      role: "UX research, UI design, prototyping",
      team: ["Dhruv Tolani", "Yash Khanna"],
      sections: [
        {
          title: "The Process",
          content: "The project timeline spanned several weeks, moving through distinct phases: Research > Problem Statement > Insights > Ideation > MVP Definition > Prototyping > Final App.",
          listItems: ["Defined User Problem", "Gathered User Insights", "Ideation", "Storyboarding", "Visual Identity", "Prototyping"]
        },
        {
          title: "The User Problem",
          content: "When shopping online with a group, sharing product links across multiple apps quickly becomes exhausting. What feels easy when shopping alone turns chaotic in group chats, where opinions are scattered, responses get lost, and people are left unsure of what the group actually wants — making it hard to decide and move forward."
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
          content: "Goal: enable faster, clearer purchase decisions by bringing social feedback and product discovery into one shared shopping experience. We designed three modes, one for each social context a purchase can sit in.",
          listItems: [
            "WE Mode — real-time group shopping with shared browsing and shared decisions.",
            "ME Mode — personalized recommendations for shopping alone.",
            "THEM Mode — guided shopping for gifting or needs-based purchasing.",
            "Shared Cart — a single space to collect opinions and compare options, instead of scattered chats.",
            "AI Feedback Summary — condenses group reactions into a clear accept/reject read.",
            "Outcome — less chaos, clearer consensus, faster checkouts."
          ]
        },
        {
          title: "User Task Flows",
          content: "Four flows carried the MVP, and each one had to survive the same test: could a group reach a decision without anybody leaving the app? Onboarding a friend group, adding an item to a shared cart, reacting to someone else's pick, and reading the group's verdict.",
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
          content: "The final deliverable included a polished app walkthrough demonstrating the “WePick” flow. You can experience the interactive prototype directly below, inviting friends and voting in real-time.",
          embedUrl: "https://www.figma.com/embed?embed_host=share&url=https%3A%2F%2Fwww.figma.com%2Fproto%2FZSnz5vTUKNzYNRuOs1uxWt%2FWePick%3Fnode-id%3D0-1%26t%3DvsCOeZePPSny2dOa-1"
        }
      ]
    }
  },
  {
    id: 7,
    slug: "rahi-design-system-v2",
    title: "RAHI Design System v2",
    category: "UI Design Internship",
    timeline: "Summer internship, 2025",
    description: "Designed reusable desktop components for RAHI Platform Technologies design system v2, with a strong focus on keyboard-first interaction and state clarity.",
    tags: ["Figma", "Design Systems", "Desktop UX", "Component Variants", "Interaction Design"],
    color: "bg-[#E7F6F4]",
    accentColor: "text-[#16A197]",
    hoverColor: "group-hover:text-[#16A197]",
    badge: "bg-[#D4F0EC] text-[#0D6B64]",
    sectionAccent: "bg-[#D4F0EC]",
    content: {
      heroImage: `${PUBLIC_URL}/images/RAHI/RAHI Logo.webp`,
      // The full logo export carries a wide white margin, which leaves the mark
      // tiny once a square tile contains it. This is the same lockup trimmed to
      // its own edges so it fills the tile.
      thumbnailImage: `${PUBLIC_URL}/images/RAHI/RAHI-Thumbnail.webp`,
      role: "Component design, interaction specs",
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
    timeline: "Tangible interfaces course, 2025",
    description: "Proximity-based light feedback that guides children aged 4–7 to lost objects. No screens, no app.",
    tags: ["ESP32", "NeoPixels", "Arduino IDE"],
    color: "bg-[#FFF1F2]",
    accentColor: "text-[#E03E3E]",
    hoverColor: "group-hover:text-[#DC2626]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
    sectionAccent: "bg-[#FEE2E2]",
    content: {
      heroImage: `${PUBLIC_URL}/images/Revela/Revela Hero Shot.webp`,
      // A tighter crop of the same shot, so the card and the hero are not the
      // identical image seen twice in a row.
      thumbnailImage: `${PUBLIC_URL}/images/Revela/Revela-Thumbnail.webp`,
      role: "Circuit design, hardware prototyping, physical computing",
      team: ["Khushii Mehta", "Kaushal Gajipara", "Parinita Shiralige"],
      sections: [
        {
          title: "Overview",
          content: "Revela is a handheld wand that guides children aged 4–7 to their misplaced things by getting warmer, literally in colour, as they get closer. No screens, no app.\n\nThe brief was a tangible interface for a life skill. We picked losing things because children get told off for it but are never given a tool to fix it. I owned the electronics: the ESP32 builds, the LED feedback logic, the power system, and an enclosure that had to survive a seven-year-old."
        },
        {
          title: "The Brief",
          callout: { text: "How might we help young children find their belongings on their own, in a way that feels playful and magical?" },
          content: "Children learn best through movement, touch, and objects that respond to them, so the technology had to fade into the background. That set strict requirements:",
          cards: [
            { title: "Zero screens", body: "No display and no app, anywhere in the system." },
            { title: "Instant", body: "Under 100 ms perceived latency, so movement and light feel linked." },
            { title: "Continuous", body: "Not “found or not found”, but “warmer, warmer, here.”" },
            { title: "No instructions", body: "Readable by a four-year-old on first pick-up." },
            { title: "Low power", body: "Enough battery to last through play." },
            { title: "Safe", body: "Fully enclosed hardware in a child's hands." }
          ]
        },
        {
          title: "System Architecture",
          content: "A handheld wand and small beacons attached to the things that go missing.",
          cards: [
            { title: "Explorer Wand", body: "ESP32-S3 XIAO, a NeoPixel strip, and a 3.7V Li-Po with onboard charging and a physical switch." },
            { title: "Beacon Nodes", body: "ESP32-C2 modules on each object, broadcasting a proximity signal." }
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
          content: "As the child moves, signal strength changes. The wand turns that into colour and animation on the spot, continuously, so the light steers where they walk next.",
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
          content: "No numbers and no arrows. Distance maps straight to colour.",
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
          title: "Building the Wand",
          content: "I turned the chosen form into a build-ready prototype: planning the internal layout, routing the wiring, and checking grip, balance, and how visible the light was in a child's hand.",
          imageLayout: "justified",
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
              caption: "Tag printing process"
            }
          ]
        },
        {
          title: "Testing, and What Broke",
          content: "We tested soldering quality on the bench and tuned distance response in context. Most of what failed came down to power and space.",
          cards: [
            { title: "Unstable power", body: "ESP32s failed on shaky power delivery, and charging modules degraded with use." },
            { title: "LEDs", body: "Strips failed after repeated reassembly, and uneven diffusion made colours harder to read." },
            { title: "Wiring stress", body: "Tight internal space kept straining the connections." },
            { title: "Heat vs battery", body: "Brightness had to be balanced against battery life and heat in a small enclosure." }
          ],
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
          title: "Reflection",
          callout: { text: "Great embedded systems disappear into the experience." },
          content: "Immediate feedback, clear mapping, and a single thing to do made Revela hard to use wrong. Next, I'd explore rooms with many beacons, sensitivity that adapts, and an enclosure that's easier to manufacture."
        }
      ]
    }
  },
  {
    id: 2,
    slug: "dino-spread",
    title: "Dino Spread",
    category: "Industrial Design",
    timeline: "Industrial design course, 2024",
    description: "A dinosaur-themed jam and butter dispenser for school and college canteens — eliminating messy countertops and shared utensils through a playful, pull-to-dispense pump mechanism.",
    tags: ["Physical Prototyping", "Sketching", "3D Modeling"],
    color: "bg-rose-50",
    accentColor: "text-[#E23167]",
    hoverColor: "group-hover:text-rose-900",
    badge: "bg-rose-100 text-rose-900",
    sectionAccent: "bg-rose-100",
    content: {
      heroImage: `${PUBLIC_URL}/images/Dino Spread/dino-spread-hero.webp`,
      role: "Industrial design, prototyping",
      team: ["Analise Pereira"],
      sections: [
        {
          title: "Overview",
          content: "Dino Spread is a pull-to-dispense jam and butter dispenser for school and college canteens, built for an industrial design course. The brief was open; the subject came from watching the same mess happen in our own canteen every morning.\n\nThe form is a dinosaur because the users are children and students, and because a dinosaur's head is a lever and its teeth are a nozzle — the theme and the mechanism are the same decision."
        },
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
        },
        {
          title: "Outcome & Reflection",
          content: "The jury's useful criticism was not about the form — it was that we had never tested the pump with real jam. Foam and Plaster of Paris let us prove the gesture and the proportions, and stopped exactly there: we could show that pulling the head feels right, and not that the teeth meter a viscous spread without clogging.\n\nThat gap is the thing I took forward. A prototype answers the question it is built to answer and no others, and deciding which question you are actually asking is most of the work. A second pass would be printed rather than carved, with a real pump body, so the next unknown — flow control — becomes testable.",
          listItems: [
            "What held up: the pull-to-dispense gesture read as obvious to every person who picked it up, with no instruction.",
            "What didn't: the mechanism was represented, not working — no viscosity or clogging data.",
            "Next: a printed body around an off-the-shelf pump, tested with actual jam and butter at canteen temperatures."
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
    timeline: "Service design course, 2025",
    description: "Designing the infrastructure for future-proof renewable energy services: a service design concept that helps housing societies confidently adopt solar.",
    tags: ["Service Design", "Sustainability", "Systems Thinking"],
    color: "bg-[#D9F43F]/80",
    accentColor: "text-[#D8F36A]",
    hoverColor: "group-hover:text-[#E3FC03]",
    badge: "bg-[#CFEA3F]/25 text-[#E7F99A] border border-[#CFEA3F]/50",
    sectionAccent: "bg-[#CFEA3F]",
    content: {
      heroImage: `${PUBLIC_URL}/images/SolarLink/SolarLink-Hero.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/SolarLink/Solarlink-thumbnail.webp`,
      role: "Research & synthesis, journey mapping, experience design",
      team: ["Khushii Mehta", "Kaushal Gajipara"],
      sections: [
        {
          title: "Overview",
          content: "India has vast rooftop solar potential in its urban housing societies, yet they rarely adopt it. SolarLink is a service design concept, aligned with SDG 7.2, that treats this as a decision problem rather than a technology one: it helps a society move from confusion to shared confidence before any installation begins."
        },
        {
          title: "The Problem",
          callout: { text: "Solar doesn't fail because people don't care. It fails because deciding together is hard." },
          content: "Costs are falling and subsidies exist, yet solar keeps becoming next year's agenda. Society decisions take 2–3x longer than individual homes, and over 60% of residents cite unclear information as a bigger barrier than cost.",
          stats: [
            { value: "124 GW", label: "India's rooftop solar potential" },
            { value: "~11 GW", label: "Actually installed" },
            { value: "<20%", label: "Of installs from housing societies" }
          ],
          cards: [
            { title: "Fragmented information", body: "What residents hear is conflicting, and mostly comes from vendors." },
            { title: "Clashing opinions", body: "Many stakeholders, no shared picture to argue from." },
            { title: "Fear of the wrong call", body: "Committees won't risk an irreversible decision for the whole building." },
            { title: "No neutral guide", body: "The only advice available is a sales pitch." }
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
          content: "Rajesh is Secretary of Sagar Heights, a 50-flat cooperative society in Ghatkopar, Mumbai, with electricity bills residents call excessively high. He is practical and risk-averse. His biggest worry is not price, it is making the wrong call for the entire building.",
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
          content: "Today a society faces seven sequential stages, each needing coordination between vendors, government bodies, and the committee. It is easy to abandon at any point. This is what we set out to redesign.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Current-Journey.webp`,
              caption: "The current 7-stage solar installation journey",
              fullWidth: true
            }
          ]
        },
        {
          title: "Design Direction",
          callout: { text: "Housing societies don't need persuasion. They need confidence." },
          content: "How might we move housing societies from confusion to clarity before any solar installation begins? The answer had to be:",
          cards: [
            { title: "Neutral", body: "Not vendor-driven, so trust can come before execution." },
            { title: "Collective", body: "Built for a committee deciding together, not one buyer." },
            { title: "Low-risk", body: "Reduce the fear around long-term commitments." },
            { title: "Discussable", body: "Make solar something residents can understand and talk about." }
          ],
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
          title: "The Solution: Solar Sunday",
          callout: { text: "We are not a solar vendor. We are a neutral facilitator." },
          content: "SolarLink's core intervention is Solar Sunday: a one-day, on-site event that turns the society terrace into a calm space to explore solar. Nobody is being sold to, so questions are safe, myths get surfaced instead of argued with, and the committee decides from the same picture.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar-Sunday-2.webp`,
              caption: "Solar Sunday Experience",
              borderless: true
            }
          ]
        },
        {
          title: "Key Experience Touchpoints",
          content: "No selling. Just shared understanding.",
          cards: [
            { title: "Solar Confession Booth", body: "A private space to admit doubts. The most common: “I don't really understand solar.”" },
            { title: "AR Energy Visualizer", body: "Costs, savings, and generation mapped onto the residents' own building." },
            { title: "Pledge Wall", body: "Small, non-binding commitments that build collective ownership." },
            { title: "Guided Decision Framework", body: "Structured comparisons replace opinion-based debate." }
          ],
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
          content: "Solar doesn't move faster by pushing harder. It moves when people feel ready, so success is measured in decision friction and trust, not panels installed.",
          cards: [
            { title: "Structured learning", body: "Instead of fragmented information." },
            { title: "Neutral facilitation", body: "Instead of vendor bias." },
            { title: "Transparent comparison", body: "Instead of endless discussion." },
            { title: "Confidence before approvals", body: "Instead of delayed decisions." }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink-Service-Blueprint.webp`,
              caption: "Service Blueprint: Physical Evidence · Customer Actions · SolarLink Actions · Backstage · Support Processes",
              fullWidth: true
            }
          ]
        },
        {
          title: "Explore the Design Board",
          content: "The full research synthesis, affinity map, blueprint, and storyboard from the team project.",
          embedUrl: "https://www.figma.com/embed?embed_host=share&url=https://www.figma.com/board/cqhXU5e7apFNog7yvWeDx6/Service-design-final-_-Team-5",
          embedWide: true,
          cta: {
            text: "Open FigJam Board",
            url: "https://www.figma.com/board/cqhXU5e7apFNog7yvWeDx6/Service-design-final-_-Team-5"
          }
        },
        {
          title: "What I Learned",
          callout: { text: "Community decisions need facilitation, not persuasion." },
          content: "Sustainability adoption is a systems problem, and designing for confidence matters as much as designing for efficiency. SolarLink is the clearest example of how I work: insight first, then the solution."
        }
      ]
    }
  },
  {
    id: 10,
    slug: "soundtrack-seven-years",
    title: "The Soundtrack of Seven Years",
    category: "Data Visualization / Design Engineering",
    timeline: "Personal project, 2026",
    description: "Seven years of my own Spotify history — 98,111 plays — read as an eight-chapter scrollytelling piece.",
    tags: ["Data Visualization", "Design Engineering", "Python", "SVG", "Editorial Design"],
    color: "bg-[#0A0C0B]",
    accentColor: "text-[#3EC873]",
    hoverColor: "group-hover:text-[#3EC873]",
    badge: "bg-[#3ec873]/25 text-[#0d5c33]",
    sectionAccent: "bg-[#3EC873]",
    content: {
      heroImage: `${PUBLIC_URL}/images/Spotify/Soundtrack-Hero.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/Spotify/Soundtrack-Thumbnail.webp`,
      role: "Data pipeline, design, build",
      sections: [
        {
          title: "Overview",
          content: "Spotify emails you your Extended Streaming History as twelve JSON files. Wrapped turns that into five slides you forget by January; the raw export is 120,547 rows nobody reads.\n\nI wanted the thing in between: a magazine feature in eight chapters, every number computed from the export, shipped as one HTML file. It keeps Wrapped's second person on purpose, because that is the format it is arguing with.",
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
          content: "Most of the work happened before anything was drawn.",
          stats: [
            { value: "120,547", label: "Distinct plays after dedup" },
            { value: "98,111", label: "Streams past the 30-second rule" },
            { value: "1 in 6", label: "Plays credited to the wrong artist" }
          ],
          cards: [
            { title: "Deduplicated", body: "Spotify re-chunks the whole history on every export, so the twelve files overlapped heavily." },
            { title: "UTC to IST", body: "Timestamps were converted before any question about time of day." },
            { title: "Fixed credits", body: "16,253 featured-artist plays parsed from track titles, shown as an alternate view, never silently merged." },
            { title: "Checked twice", body: "Every published figure is re-derived by a second script that shares no code with the builder." }
          ]
        },
        {
          title: "What the Data Knew That I Didn't",
          callout: { text: "Four plays of Khalid in 2019. Then nothing for 663 days. Then 1,584." },
          content: "The findings I kept are the ones no ranking would surface. Of 5,676 songs in the library, 226 account for a third of everything I have played.",
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Surprises.webp`,
              caption: "Eight findings that no top-ten list would have surfaced. The clock plot compares one artist's hours against everything else played."
            }
          ]
        },
        {
          title: "Picking the Chart for the Question",
          content: "Each chart follows from the question, not from what was easy to draw.",
          cards: [
            { title: "How much of seven years had music in it?", body: "A question about density over a long span, so eight concentric rings, one sliver per day." },
            { title: "Do songs get retired, or just played less?", body: "A question about a lifetime, so the ten most-played get a row each across seven years." }
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Calendar.webp`,
              caption: "2,469 days with music, 67 without, wound into eight rings. 2019 is the innermost, 2026 the outermost."
            },
            {
              src: `${PUBLIC_URL}/images/Spotify/Soundtrack-Songs.webp`,
              caption: "Ten songs, seven years, one row each. All ten are still in rotation."
            }
          ]
        },
        {
          title: "Composing It, Not Laying It Out",
          content: "Twenty charts in a row is a report, and nobody finishes a report. So chapters are announced rather than stacked, with a number, a sentence, and a lot of air, and sections carry deliberately different weights.\n\nColour holds it together. Each chapter re-binds only an accent and a nine-step ramp that every chart inherits. Every accent clears 4.5:1.",
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
          content: "The headlines are generated too. Re-run the pipeline on a fresh export and the sentences change with it.",
          cards: [
            { title: "One file", body: "Data and album artwork inlined. It opens from a disk with the network off." },
            { title: "No third parties", body: "No server, no build step, and no outside requests once the page is open." },
            { title: "Reduced motion", body: "One observer drives every reveal. With reduced motion, the numbers land finished." },
            { title: "A dated snapshot", body: "On purpose: the live API is missing fields half the piece depends on." }
          ],
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
    title: "Three Browser Demos",
    category: "Creative Coding",
    timeline: "Personal projects, 2024 – 2025",
    description: "A YOLOv8 detector on your webcam, an arcade game, and a movie recommender — all three running on your own device, no server round-trip.",
    tags: ["Python", "YOLOv8", "Computer Vision", "WebAssembly", "ONNX"],
    color: "bg-[#0C111B]",
    accentColor: "text-[#FFD343]",
    hoverColor: "group-hover:text-[#FFD343]",
    badge: "bg-[#ffd343]/30 text-[#9a7400]",
    sectionAccent: "bg-[#FFD343]",
    content: {
      // The three demos are the hero here — each one renders live further down
      // the page — so this reuses the Python mark rather than shipping a
      // screenshot that would be out of date the moment a demo changes.
      heroImage: `${PUBLIC_URL}/images/python.webp`,
      thumbnailImage: `${PUBLIC_URL}/images/python.webp`,
      role: "Design & build",
      sections: [
        {
          title: "YOLOv8 Live Object Detection",
          content: "Turn on your camera and a real neural network runs in your browser. Nothing is uploaded: I exported the YOLOv8 model to ONNX, and it runs through WebAssembly on your device.",
          labels: ["Runs on your device", "ONNX + WebAssembly", "11 MB, loaded on start"],
          demoId: "yolov8"
        },
        {
          title: "Python Arcade: Ultimate Arkanoid",
          content: "An arcade game I wrote in Python, rewritten in JavaScript so you can play it here with the same physics and feel.",
          labels: ["Ball physics", "Power-ups", "Scoring"],
          demoId: "arkanoid"
        },
        {
          title: "Movie Recommendation Engine",
          content: "Pick a film and it finds similar ones. Genres, director, cast, and country are blended into one feature vector, then ranked by cosine similarity.",
          labels: ["Bag of words", "Cosine similarity", "Fuzzy title search"],
          demoId: "movie-recs"
        },
        {
          title: "Why These Run In The Browser",
          content: "All three started as Python scripts on my laptop. They're here because a portfolio you can poke at is worth more than one you have to take on trust.\n\nRunning the detector on-device is a privacy decision as much as a technical one: nothing to upload means nothing to explain. The model and the recommender's dataset only load when you ask for them, so the page stays light."
        }
      ]
    }
  },
  {
    id: 6,
    slug: "tinkering",
    title: "Countdown Motor Control",
    category: "Experimental Prototyping",
    timeline: "Prototyping course, 2024",
    description: "A double 7-segment display countdown system built with ESP32, 36 LEDs, and a relay-triggered motor — designed, wired, and soldered from scratch as a hands-on electronics project.",
    tags: ["Prototyping", "R&D", "Creative Coding"],
    color: "bg-rose-50",
    accentColor: "text-[#E43158]",
    hoverColor: "group-hover:text-rose-600",
    badge: "bg-rose-100 text-rose-700",
    sectionAccent: "bg-rose-100",
    content: {
      heroImage: `${PUBLIC_URL}/images/Tinkering/tinkering-hero-2.webp`,
      role: "Circuit design, firmware, assembly",
      team: ["Dhruv Tolani"],
      sections: [
        {
          title: "Project Introduction",
          content: "This project focused on hands-on circuit design and electronic prototyping. The objective was to build a functional system by designing and assembling complex circuits, working with multiple electronic components, and validating performance through testing and iteration, with creative freedom in defining the final prototype."
        },
        {
          title: "Circuit Diagram",
          content: "My teammate and I decided to build a double 7-segment display that counts down and, at zero, closes a relay to start a motor spinning. Every segment is discrete LEDs rather than a display module, so the whole thing had to be wired and mapped by hand.",
          listItems: [
            "36 LEDs, wired as two hand-built 7-segment digits",
            "ESP32 driving the segment mapping and countdown logic",
            "Ultrasonic sensor to start the countdown on approach",
            "Relay switching the motor circuit at zero",
            "DC motor as the payoff"
          ],
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
        },
        {
          title: "Outcome & Reflection",
          content: "It counts down and the motor spins, which is the whole of what it was asked to do. What I actually learned sits underneath that.\n\nDriving 36 discrete LEDs from one ESP32 meant the segment map had to exist as a table before a single wire went in, and I built it the other way round the first time — wiring first, mapping after — which cost an evening of tracing. Segment mapping is a data-structure problem wearing a soldering iron. The relay taught the second lesson: an inductive load kicks back, and the first motor start reset the board until it was isolated properly.",
          listItems: [
            "Plan the mapping before the wiring — the table is the schematic, the wiring is just obedience to it.",
            "Isolate inductive loads; a relay is not a switch as far as the rest of the circuit is concerned.",
            "Discrete LEDs over a display module was the right call for learning and the wrong call for reliability — every failure in testing was a joint, not a line of code."
          ]
        }
      ]
    }
  }
];
