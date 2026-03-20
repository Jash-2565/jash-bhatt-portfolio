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
    id: 0,
    slug: "classflow",
    title: "ClassFlow",
    category: "AI Agent / Full Stack",
    timeline: "Ongoing",
    description: "An AI-powered course scheduling tool for professors — describe your semester in plain language and get a fully structured, exportable calendar in minutes.",
    tags: ["React 19", "Vite 7", "Tailwind CSS", "Firebase", "Gemini 2.5 Flash", "Google Calendar API"],
    color: "bg-[#F2F1FF]",
    accentColor: "text-[#4239C4]",
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
          imageHeight: 'h-[22rem]',
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
      thumbnailImage: `${PUBLIC_URL}/images/RAHI/RAHI Logo.webp`,
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
          imageHeight: "h-[22rem] md:h-[30rem]",
          images: [
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-dropdown.jpg`,
              bgClass: "bg-[#ededed]",
              caption: "Dropdown component patterns across states and use cases"
            },
            {
              src: `${PUBLIC_URL}/images/RAHI/RAHI-accordian.jpg`,
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
    category: "Tangible Interfaces / Interaction Design",
    timeline: "Ongoing",
    description: "A screen-free, embedded system that uses proximity-based light feedback to guide children (ages 4–7) through real-world exploration and object-finding.",
    tags: ["ESP32", "NeoPixels", "Arduino IDE"],
    color: "bg-[#FFF1F2]",
    accentColor: "text-[#DC2626]",
    hoverColor: "group-hover:text-[#DC2626]",
    badge: "bg-[#FEE2E2] text-[#991B1B]",
    content: {
      heroImage: `${PUBLIC_URL}/images/Revela/Revela Hero Shot.png`,
      thumbnailImage: `${PUBLIC_URL}/images/Revela/Revela Hero Shot.png`,
      role: "Circuit Design · Hardware Prototyping · Physical Computing",
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
              src: `${PUBLIC_URL}/images/Revela/Exploded View.jpg`,
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
    accentColor: "text-rose-900",
    hoverColor: "group-hover:text-rose-900",
    badge: "bg-rose-100 text-rose-900",
    content: {
      heroImage: `${PUBLIC_URL}/images/Dino Spread/dino-spread-hero.webp`,
      role: "Industrial Designer",
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
    id: 5,
    slug: "python-codes",
    title: "Computer Vision & Creative Coding",
    category: "Python / Computer Vision",
    timeline: "Completed",
    description: "Two Python builds showcased side-by-side: a YOLOv8 webcam object detector and a Python arcade game with live in-browser demos.",
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
          content: "The Python workflow uses Ultralytics YOLO for webcam inference. For the web demo, the model is exported to ONNX and runs locally in the browser with a live webcam feed and real-time overlays.",
          listItems: ["Threaded capture & inference in Python", "ONNX export for browser runtime", "Live webcam detections on-device"],
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
    category: "Experimental / Prototyping",
    timeline: "Completed",
    description: "A double 7-segment display countdown system built with ESP32, 36 LEDs, and a relay-triggered motor — designed, wired, and soldered from scratch as a hands-on electronics project.",
    tags: ["Prototyping", "R&D", "Creative Coding"],
    color: "bg-rose-50",
    accentColor: "text-rose-600",
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
          imageHeight: "h-[20rem] w-full max-w-[24rem] md:h-[26rem] md:w-[26rem]",
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
