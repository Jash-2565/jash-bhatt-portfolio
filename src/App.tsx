import { useState, useEffect, useRef, useMemo, type ImgHTMLAttributes } from 'react';
import ArkanoidDemo from './components/ArkanoidDemo';
import YoloV8Demo from './components/YoloV8Demo';
import MovieRecsDemo from './components/MovieRecsDemo';
import { ARKANOID_CODE } from './data/arkanoidCode';
import { YOLOV8_CODE } from './data/yolov8Code';
import { MOVIE_RECS_CODE } from './data/movieRecsCode';

// --- Icons (Renamed to avoid potential conflicts) ---
const MenuIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/>
  </svg>
);

const XIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
  </svg>
);

const MailIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);


const LinkedinIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
  </svg>
);

const ArrowRightIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
  </svg>
);

const ArrowLeftIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>
  </svg>
);

const ChevronDownIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="m6 9 6 6 6-6"/>
  </svg>
);

const ExternalLinkIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/>
  </svg>
);

const PhotoIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

const DownloadIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/>
  </svg>
);

const BriefcaseIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
  </svg>
);

const AwardIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>
  </svg>
);

// --- Types & Interfaces ---
interface Section {
  title: string;
  content: string;
  listItems?: string[];
  images?: { src: string; caption: string; fullWidth?: boolean; borderless?: boolean; whiteBg?: boolean; containerClass?: string; bgClass?: string }[];
  cta?: { text: string; url: string };
  embedUrl?: string;
  imageLayout?: 'row' | 'stack' | 'mixed' | 'grid' | 'techSplit' | 'storyboard'; 
  imageHeight?: string; 
  imageCrop?: boolean;
  codeBlock?: string;
  demoId?: 'arkanoid' | 'yolov8' | 'movie-recs';
}

interface ProjectContent {
  heroImage: string;
  thumbnailImage?: string;
  role: string;
  sections: Section[];
}

interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  timeline: string;
  description: string;
  tags: string[];
  color: string;
  accentColor: string;
  hoverColor: string;
  badge: string;
  content: ProjectContent;
}

interface GalleryItem {
  type: 'image' | 'video' | 'placeholder';
  src?: string;
  alt?: string;
}

interface ResponsiveImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  deferGifOnConstrainedNetwork?: boolean;
}

const ResponsiveImage = ({
  src,
  alt = '',
  loading = 'lazy',
  className,
  deferGifOnConstrainedNetwork: _deferGifOnConstrainedNetwork,
  ...imgProps
}: ResponsiveImageProps) => {
  return <img src={src} alt={alt} loading={loading} decoding="async" className={className} {...imgProps} />;
};


// Helper for path resolution (Supports both Vite and Create React App)
const getBaseUrl = () => {
  try {
    // @ts-ignore: Check for Vite environment
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.BASE_URL) {
      // @ts-ignore
      return import.meta.env.BASE_URL;
    }
  } catch (e) {
    // Ignore error if import.meta is not supported
  }
  
  // Check for Create React App / Node environment
  // @ts-ignore
  if (typeof process !== 'undefined' && process.env && process.env.PUBLIC_URL) {
    // @ts-ignore
    return process.env.PUBLIC_URL;
  }
  
  return '';
};

const PUBLIC_URL = getBaseUrl().replace(/\/$/, ''); // Ensure no trailing slash
// @ts-ignore: Vite environment access
// --- Data ---
const ARKANOID_SNIPPET = ARKANOID_CODE;
const YOLOV8_SNIPPET = YOLOV8_CODE;
const MOVIE_RECS_SNIPPET = MOVIE_RECS_CODE;

const projects: Project[] = [
  {
    id: 0,
    slug: "classflow",
    title: "ClassFlow",
    category: "AI Agent / Full Stack",
    timeline: "Ongoing",
    description: "A chat-first class scheduling app that turns plain language into structured, exportable calendars for students and instructors.",
    tags: ["React 19", "Vite", "Tailwind CSS", "Firebase", "Gemini AI", "Google Calendar API", "n8n"],
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
          title: "Problem",
          content: "Students and instructors often know what they need to schedule but do not have time to manually structure it into a clean calendar. Traditional tools assume you already have a formatted plan, which is unrealistic for many people."
        },
        {
          title: "Solution",
          content: "I built ClassFlow, a chat-first scheduling app that lets users build a full class plan through conversation.",
          imageLayout: "stack",
          listItems: [
            "AI assistant captures topics, dates, times, and recurring patterns.",
            "Generates a structured calendar that can be reviewed, edited, and exported to Google Calendar or .ics."
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Mainscreen.webp`,
              caption: "ClassFlow Main Screen"
            },
            {
              src: `${PUBLIC_URL}/images/ClassFlow/ClassFlow-Calendar.webp`,
              caption: "ClassFlow Calendar"
            }
          ]
        },
        {
          title: "How it works",
          content: "A guided workflow that turns conversation into a usable schedule.",
          listItems: [
            "Chat-only input: users describe topics, dates, and patterns in natural language.",
            "Structured output: assistant returns updates and waits for approval before applying them.",
            "Schedule generation: scheduling engine maps topics to recurring class slots.",
            "Preview + export: calendar or list view with Google Calendar and .ics export.",
            "Persistence: Firebase Auth + Firestore save schedules and chat context."
          ]
        },
        {
          title: "Tech Stack",
          content: "Core technologies powering ClassFlow.",
          listItems: [
            "React 19, Vite, Tailwind CSS",
            "Firebase Auth + Firestore",
            "Google Gemini API",
            "Google Calendar API"
          ]
        },
        {
          title: "Key Features / Impact",
          content: "Highlights that make the experience fast and reliable.",
          listItems: [
            "Chat-first UX that converts plain language into structured schedules.",
            "Review-and-apply workflow prevents unintended edits.",
            "Automated weekly schedule generation from recurring patterns.",
            "Google Calendar sync and .ics export.",
            "Per-user saved schedules with Firebase."
          ]
        },
        {
          title: "Why it's meaningful",
          content: "ClassFlow removes the friction between “I have a plan in my head” and “I have a calendar I can use.” It turns conversation into structure, making scheduling faster and more accessible."
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
            "48.1% regularly seek others’ opinions before making a purchase, highlighting that shopping decisions are inherently social.",
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
          content: "During an unstructured discussion, we found that children learn best through movement, touch, and tangible feedback. They are especially engaged by objects that respond with visual cues when they interact with them. Our goal was to make the technology fade into the background of a child’s daily life, supporting the development of life skills rather than becoming a distraction."
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
    description: "Designing confidence for community solar adoption.",
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
          content: "How might we help housing societies confidently decide on solar adoption in a system involving multiple stakeholders, high perceived risk, and unclear information?\n\nThe challenge was not infrastructure. It was clarity, trust, and shared understanding."
        },
        {
          title: "Research & Understanding",
          content: "Key observations:",
          listItems: [
            "Residential societies contribute less than 20% of rooftop solar installations",
            "Decision-making in societies takes 2-3x longer than individual homes",
            "Lack of clear information is a bigger barrier than cost",
            "Committee members fear irreversible decisions"
          ],
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink Affinity Map.webp`,
              caption: "SolarLink Affinity Map"
            }
          ]
        },
        {
          title: "Primary User",
          content: "Society office bearers (especially secretaries) act as informal decision-makers. They are practical and risk-averse, responsible for long-term outcomes, overloaded with coordination, and highly dependent on peer validation.\n\nTheir biggest concern is not price. It is making the wrong decision for everyone.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/SolarLink Society Secratary.webp`,
              caption: "Primary User: Society Secretary"
            }
          ]
        },
        {
          title: "Core Insight",
          content: "Clean energy is not a technology problem. It is a decision problem.\n\nHousing societies do not need persuasion. They need confidence.\n\nSolar adoption must begin before panels, with clarity, trust, and shared understanding."
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
          content: "Solar Confession Booth: A private, judgment-free space where residents openly express doubts and myths. Most common confession: \"I do not really understand solar.\" Surfacing uncertainty early reduces resistance later.\n\nAR Energy Visualiser: Residents see projected costs, savings, and energy generation mapped onto their own building. Solar becomes tangible, not abstract.\n\nPledge Wall: Residents make small, non-binding commitments to show intent and interest. Small signals build collective ownership.\n\nGuided Decision Framework: Structured comparisons replace opinion-based debates. No selling. Only shared understanding.",
          images: [
            {
              src: `${PUBLIC_URL}/images/SolarLink/Solar-Sunday.webp`,
              caption: "Solar Sunday Experience",
              borderless: true
            }
          ]
        },
        {
          title: "Redefined Journey",
          content: "Before SolarLink:\n\n• Fragmented information\n• Vendor bias\n• Endless discussions\n• Decisions delayed\n\nWith SolarLink:\n\n• Structured learning\n• Neutral facilitation\n• Transparent comparisons\n• Confidence before approvals\n\nSolar does not move faster by pushing harder. It moves faster when people feel ready."
        },
        {
          title: "Impact & SDG Alignment",
          content: "SolarLink directly supports SDG 7: Affordable & Clean Energy by addressing the decision layer of adoption.\n\nThe impact is not measured in panels installed, but in:\n\n• Reduced decision friction\n• Increased trust\n• Higher likelihood of adoption\n\nSolarLink does not install panels. We install confidence."
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
  },  {
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

const PROJECT_ORDER_PRIORITY: Record<string, number> = {
  revela: 0,
  classflow: 1,
  'rahi-design-system-v2': 2,
  wepick: 3,
};

interface ProjectHeroTheme {
  heroBgClass: string;
  heroTextClass: string;
  heroMutedTextClass: string;
  heroBodyTextClass: string;
  heroDotClass: string;
}

const DEFAULT_PROJECT_HERO_THEME: ProjectHeroTheme = {
  heroBgClass: 'bg-slate-950',
  heroTextClass: 'text-slate-100',
  heroMutedTextClass: 'text-slate-400',
  heroBodyTextClass: 'text-slate-300',
  heroDotClass: 'bg-slate-300',
};

const PROJECT_HERO_THEMES: Record<string, ProjectHeroTheme> = {
  classflow: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#4239C4]',
    heroMutedTextClass: 'text-[#D3D0FF]',
    heroBodyTextClass: 'text-[#ECEAFF]',
    heroDotClass: 'bg-[#A7A1FF]',
  },
  wepick: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-sky-600',
    heroMutedTextClass: 'text-sky-200',
    heroBodyTextClass: 'text-sky-100',
    heroDotClass: 'bg-sky-300',
  },
  'rahi-design-system-v2': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#16A197]',
    heroMutedTextClass: 'text-[#A9E2DA]',
    heroBodyTextClass: 'text-[#D7F4F0]',
    heroDotClass: 'bg-[#16A197]',
  },
  revela: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#DC2626]',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
  'dino-spread': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-rose-900',
    heroMutedTextClass: 'text-rose-300',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
  solarlink: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#E3FC03]',
    heroMutedTextClass: 'text-[#C9DE8D]',
    heroBodyTextClass: 'text-[#EAF7C6]',
    heroDotClass: 'bg-[#E3FC03]',
  },
  'python-codes': {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-[#FFD343]',
    heroMutedTextClass: 'text-[#FFF2B3]',
    heroBodyTextClass: 'text-[#FFF2B3]',
    heroDotClass: 'bg-[#FFF2B3]',
  },
  tinkering: {
    heroBgClass: 'bg-slate-950',
    heroTextClass: 'text-rose-600',
    heroMutedTextClass: 'text-rose-200',
    heroBodyTextClass: 'text-rose-100',
    heroDotClass: 'bg-rose-300',
  },
};

const galleryItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/la la land.jpg`, alt: 'La La Land Art' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/Mrs jordan.jpg`, alt: 'Mrs Jordan Art' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photoshop and Animation/Geometric-Design.gif`, alt: 'Geometric Design GIF' }
];

const aiItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/aquatoro-blue.webp`, alt: 'Lamborghini Jetski Concept 1' },
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/aquatoro-black.webp`, alt: 'Lamborghini Jetski Concept 2' },
  { type: 'image', src: `${PUBLIC_URL}/images/Lamborghini Jetski/jetski final.gif`, alt: 'Lamborghini Jetski Concept 3' }
];

const gallerySnippetItems: GalleryItem[] = [
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/flowers.webp`, alt: 'White flowers close-up' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/fire-sunset.webp`, alt: 'City skyline at sunset' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/sunrise-bird.webp`, alt: 'Sunrise over valley with bird' },
  { type: 'image', src: `${PUBLIC_URL}/images/Photography/sunroof-water.webp`, alt: 'Water texture on glass' }
];

const ui = {
  btnBase: 'inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-medium transition-all',
  btnPrimary: 'bg-[#01F5D1] text-black hover:bg-[#00D8B8]',
  btnSecondary: 'bg-slate-900/70 text-slate-100 border border-slate-700 hover:border-[#01F5D1] hover:text-[#01F5D1]',
  cardBase: 'border border-slate-800 rounded-2xl bg-slate-900/70 backdrop-blur-sm transition-all',
  cardHover: 'hover:-translate-y-1 hover:shadow-lg',
  chipBase: 'px-3 py-1.5 text-sm font-medium text-slate-200 bg-slate-900 border border-slate-700 rounded-full',
  chipAccent: 'px-3 py-1.5 text-sm font-medium text-[#01F5D1] bg-[#00A19B]/15 border border-[#00A19B]/50 rounded-full'
} as const;

const personalitySignals = [
  'Phygital Product Designer',
  'UI/UX & Interaction Design',
  'Circuit & Hardware',
  'AI-Assisted Design'
];

const currentlyExploring = [
  'Robust phygital products',
  'AI-assisted design workflows',
  'Embedded interaction systems'
];

const operatorStats = [
  { label: 'Currently', value: 'B.Des · FLAME University' },
  { label: 'Last Internship', value: 'RAHI Platform Technologies' },
  { label: 'Status', value: 'Available — Summer 2026' },
];

// --- Sub-Components ---

const ProjectDetail = ({ 
  project, 
  onBack, 
  onNext, 
  isTransitioning, 
  onImageClick 
}: { 
  project: Project | null, 
  onBack: () => void, 
  onNext: () => void, 
  isTransitioning: boolean,
  onImageClick: (src: string) => void 
}) => {
  if (!project) return null;
  const projectHeroTheme = PROJECT_HERO_THEMES[project.slug] ?? DEFAULT_PROJECT_HERO_THEME;
  const isPythonCodes = project.slug === 'python-codes';
  const isCountdownMotorControl = project.id === 5 || project.title === 'Countdown Motor Control';
  const {
    heroBgClass,
    heroTextClass,
    heroMutedTextClass,
    heroBodyTextClass,
  } = projectHeroTheme;

  const renderDemoBlock = (section: Section) => {
    const demoComponent = section.demoId === 'arkanoid'
      ? <ArkanoidDemo />
      : section.demoId === 'yolov8'
        ? <YoloV8Demo />
        : section.demoId === 'movie-recs'
          ? <MovieRecsDemo />
          : null;
    const snippetContainerClass =
      'h-full lg:h-[620px] rounded-2xl border border-slate-700 bg-slate-950 text-slate-100 shadow-sm flex flex-col';
    const snippetPreClass =
      'min-h-0 flex-1 overflow-auto p-4 text-xs leading-relaxed md:text-sm font-mono whitespace-pre';

    if (demoComponent && section.codeBlock) {
      return (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className={snippetContainerClass}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
              <span className="text-[10px] text-slate-500">read-only</span>
            </div>
            <pre className={snippetPreClass}>
              {section.codeBlock}
            </pre>
          </div>
          {demoComponent}
        </div>
      );
    }

    if (demoComponent) {
      return (
        <div className="mt-8">
          {demoComponent}
        </div>
      );
    }

    if (section.codeBlock) {
      return (
        <div className={`mt-8 ${snippetContainerClass}`}>
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
            <span className="text-[10px] text-slate-500">read-only</span>
          </div>
          <pre className={snippetPreClass}>
            {section.codeBlock}
          </pre>
        </div>
      );
    }

    return null;
  };

  // Helper to render mixed layout images
  const renderImages = (section: Section) => {
    if (!section.images) return null;

    if (section.imageLayout === 'storyboard') {
      const renderStoryboardCard = (img: { src: string; caption: string; fullWidth?: boolean; borderless?: boolean; whiteBg?: boolean; bgClass?: string }, i: number) => {
        const isPlaceholder = !img.src || img.src.includes('placeholder');
        return (
          <div key={`story-${i}`} className="min-w-0 lg:min-w-[14rem] flex flex-col gap-3">
            <div
              className={`rounded-xl overflow-hidden border border-slate-700 bg-slate-900/70 shadow-sm transition-all hover:shadow-md h-56 ${
                isPlaceholder ? '' : 'cursor-zoom-in'
              }`}
              onClick={() => {
                if (!isPlaceholder && img.src) onImageClick(img.src);
              }}
            >
              {isPlaceholder ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <PhotoIcon size={36} className="mb-3 opacity-60" />
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                </div>
              ) : (
                <ResponsiveImage
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  deferGifOnConstrainedNetwork
                />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-300">{img.caption}</p>
            </div>
          </div>
        );
      };

      return (
        <div className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {section.images.map((img, i) => renderStoryboardCard(img, i))}
          </div>
        </div>
      );
    }

    if (section.imageLayout === 'techSplit') {
      const [rectangleImage, ...squareImages] = section.images;
      if (!rectangleImage) return null;

      const renderMediaCard = (img: { src: string; caption: string; fullWidth?: boolean; borderless?: boolean; whiteBg?: boolean; bgClass?: string }, heightClass: string, key: string) => {
        const isPlaceholder = !img.src || img.src.includes('placeholder');
        return (
          <div key={key} className="flex flex-col gap-3">
            <div
              className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${heightClass} ${
                isPlaceholder ? '' : 'cursor-zoom-in'
              }`}
              onClick={() => {
                if (!isPlaceholder && img.src) onImageClick(img.src);
              }}
            >
              {isPlaceholder ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                  <PhotoIcon size={36} className="mb-3 opacity-60" />
                  <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                </div>
              ) : (
                <ResponsiveImage
                  src={img.src}
                  alt={img.caption}
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  deferGifOnConstrainedNetwork
                />
              )}
            </div>
            <p className="text-sm text-slate-400 text-center">{img.caption}</p>
          </div>
        );
      };

      return (
        <div className="mt-10 grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
          <div className="lg:col-span-7">
            {renderMediaCard(rectangleImage, 'h-72 md:h-[33rem]', 'tech-rect')}
          </div>
          <div className="lg:col-span-5 grid grid-cols-1 gap-4">
            {squareImages.slice(0, 2).map((img, i) =>
              renderMediaCard(img, 'h-72 md:h-[15rem]', `tech-square-${i}`)
            )}
          </div>
        </div>
      );
    }

    if (section.imageLayout === 'mixed') {
       // Separate full width and row images
       const rowImages = section.images.filter(img => !img.fullWidth);
       const fullWidthImages = section.images.filter(img => img.fullWidth);

       return (
         <div className="mt-10 flex flex-col gap-8 w-fit mx-auto md:mx-0">
            {rowImages.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start"> {/* Reduced gap to 4 */}
                 {rowImages.map((img, i) => {
                    const isPlaceholder = !img.src || img.src.includes('placeholder');
                    return (
                      <div key={`row-${i}`} className="flex flex-col gap-3 items-center">
                        <div 
                          className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${
                            isPlaceholder ? 'w-full h-48 md:h-56' : 'cursor-zoom-in w-fit'
                          }`}
                          onClick={() => {
                            if (!isPlaceholder && img.src) onImageClick(img.src);
                          }}
                        >
                          {isPlaceholder ? (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                              <PhotoIcon size={32} className="mb-3 opacity-60" />
                              <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                            </div>
                          ) : (
                            <ResponsiveImage 
                              src={img.src} 
                              alt={img.caption} 
                              className={`w-full h-auto md:w-auto ${section.imageHeight || 'md:h-80'}`}
                              loading="lazy" 
                              deferGifOnConstrainedNetwork
                            />
                          )}
                        </div>
                        <p className="text-sm text-slate-400 text-center">{img.caption}</p>
                      </div>
                    );
                 })}
              </div>
            )}
            {fullWidthImages.map((img, i) => (
               <div key={`full-${i}`} className={`flex flex-col gap-3 ${img.containerClass || 'w-full'}`}>
                  <div 
                     className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${
                       !img.src || img.src.includes('placeholder') ? 'h-56 md:h-64 w-full' : 'cursor-zoom-in'
                     }`}
                     onClick={() => {
                       if (img.src && !img.src.includes('placeholder')) onImageClick(img.src);
                     }}
                   >
                     {!img.src || img.src.includes('placeholder') ? (
                       <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                         <PhotoIcon size={36} className="mb-3 opacity-60" />
                         <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                       </div>
                     ) : (
                       <ResponsiveImage 
                          src={img.src} 
                          alt={img.caption} 
                          className="w-full h-auto"
                          loading="lazy" 
                          deferGifOnConstrainedNetwork
                       />
                     )}
                   </div>
                   <p className="text-sm text-slate-400 text-center">{img.caption}</p>
               </div>
            ))}
         </div>
       );
    }

    if (section.imageLayout === 'grid') {
      return (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {section.images.map((img, i) => {
            const isPlaceholder = !img.src || img.src.includes('placeholder');
            const useAutoHeight = section.imageHeight === 'auto';
            const gridHeightClass = useAutoHeight ? '' : (section.imageHeight || 'h-56 md:h-64');
            return (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${gridHeightClass} ${
                    isPlaceholder ? '' : 'cursor-zoom-in'
                  }`}
                  onClick={() => {
                    if (!isPlaceholder && img.src) onImageClick(img.src);
                  }}
                >
                  {isPlaceholder ? (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                      <PhotoIcon size={36} className="mb-3 opacity-60" />
                      <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                    </div>
                  ) : (
                    <ResponsiveImage
                      src={img.src}
                      alt={img.caption}
                      className={
                        section.imageCrop
                          ? 'w-full h-full object-cover object-center'
                          : useAutoHeight
                            ? 'w-full h-auto'
                            : 'w-full h-full object-contain'
                      }
                      loading="lazy"
                      deferGifOnConstrainedNetwork
                    />
                  )}
                </div>
                <p className="text-sm text-slate-400 text-center">{img.caption}</p>
              </div>
            );
          })}
        </div>
      );
    }

    // Default or Row layout logic
    return (
      <div className={`mt-10 ${
        section.imageLayout === 'row' 
          ? 'flex flex-col md:flex-row gap-4 justify-start items-stretch md:items-start' 
          : 'grid grid-cols-1 gap-12' 
      }`}>
        {section.images.map((img, i) => {
          const isPlaceholder = !img.src || img.src.includes('placeholder');
          return (
            <div
              key={i}
              className={`flex flex-col gap-3 ${
                section.imageLayout === 'row' ? 'w-full md:w-auto md:flex-shrink-0' : ''
              } ${section.imageCrop ? 'w-fit items-center' : ''}`}
            >
              <div 
                className={`rounded-lg overflow-hidden ${img.borderless ? 'border-0 bg-transparent shadow-none' : `border border-slate-700 ${img.bgClass || (img.whiteBg ? 'bg-white' : 'bg-slate-900/70')} shadow-sm`} transition-all hover:shadow-md ${
                  section.imageLayout === 'row'
                    ? section.imageCrop ? 'w-full' : 'w-full md:w-fit'
                    : ''
                } ${section.imageCrop && section.imageHeight ? section.imageHeight : ''} ${
                  isPlaceholder ? 'w-full h-48 md:h-56' : 'cursor-zoom-in'
                }`}
                onClick={() => {
                  if (!isPlaceholder && img.src) onImageClick(img.src);
                }}
              >
                {isPlaceholder ? (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <PhotoIcon size={32} className="mb-3 opacity-60" />
                    <span className="text-[10px] font-semibold tracking-[0.2em] uppercase">Image Placeholder</span>
                  </div>
                ) : (
                  <ResponsiveImage 
                    src={img.src} 
                    alt={img.caption} 
                    className={
                      section.imageCrop
                        ? 'w-full h-full object-cover object-center'
                        : section.imageLayout === 'row' 
                          ? `w-full h-auto md:w-auto ${section.imageHeight || 'md:h-48'} max-w-full` 
                          : 'w-full h-auto'
                    }
                    loading="lazy" 
                    deferGifOnConstrainedNetwork
                  />
                )}
              </div>
              <p className="text-sm text-slate-400 text-center">{img.caption}</p>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className={`bg-slate-950 text-slate-100 min-h-screen transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      
      {/* Project Hero */}
      <div className={`w-full ${heroBgClass} pt-32 pb-24 border-b border-slate-800`}>
        <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
            <button 
            onClick={onBack}
            className="group flex items-center gap-2 mb-12 transition-colors text-sm font-medium text-slate-400 hover:text-[#01F5D1]"
          >
            <ArrowLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
             <span className={`text-xs font-bold tracking-widest uppercase ${heroMutedTextClass}`}>{project.category}</span>
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 tracking-tight ${heroTextClass}`}>{project.title}</h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl font-light ${heroBodyTextClass}`}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12 py-16">
        
        {/* Project Meta */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 pb-12 border-b border-slate-800">
           <div className="md:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Role</h3>
              <p className="font-medium text-slate-100 text-sm leading-6">{project.content.role}</p>
           </div>
	           <div className="md:col-span-1">
	              <div className="w-full md:w-fit md:max-w-full md:ml-auto">
	                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 text-left">Tech & Tools</h3>
	                <div className="flex flex-wrap gap-2">
	                  {project.tags.map((tag, i) => (
	                    <span key={i} className={ui.chipBase}>
	                      {tag}
	                    </span>
	                  ))}
	                </div>
	              </div>
	           </div>
        </div>

        {/* Hero Image */}
        {!isPythonCodes && (
          <div className={`w-full bg-slate-900 rounded-lg mb-24 border border-slate-700 overflow-hidden shadow-sm ${isCountdownMotorControl ? 'bg-transparent aspect-square max-w-[420px] w-full mx-auto' : ''}`}>
             {!project.content.heroImage.includes('placeholder') ? (
                <ResponsiveImage
                  src={project.content.heroImage}
                  alt={`${project.title} Hero`}
                  className={isCountdownMotorControl ? 'w-full h-full object-cover object-center' : 'w-full h-auto block'}
                  loading="eager"
                />
             ) : (
                <div className="w-full aspect-video flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <PhotoIcon size={48} className="mx-auto mb-4 opacity-50" />
                    <span className="text-sm font-medium tracking-wide uppercase">Project Hero Image</span>
                  </div>
                </div>
             )}
          </div>
        )}

        {/* Narrative Sections */}
        {isPythonCodes ? (
          <div className="space-y-16">
            {project.content.sections.map((section, idx) => (
              <div key={idx} className="rounded-3xl border border-emerald-800/70 bg-slate-900/80 p-8 md:p-10 shadow-sm">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-emerald-600/70 mb-3">Python Project</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-3">{section.title}</h2>
                  <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
                {section.listItems && (
                  <ul className="space-y-3 mb-4 pl-1">
                    {section.listItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-200">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 bg-emerald-400"></span>
                        <span className="leading-relaxed">{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {renderDemoBlock(section)}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-24">
            {project.content.sections.map((section, idx) => (
              <div key={idx} className="grid md:grid-cols-12 gap-8 items-start group">
                
                {/* Left Column: Heading */}
                <div className="md:col-span-4 md:sticky md:top-24">
                  <div className={`w-8 h-1 ${project.badge.replace('text', 'bg').split(' ')[0]} mb-4 opacity-80`}></div>
                  <h2 className="text-xl font-bold text-slate-100 tracking-tight leading-tight">
                    {section.title}
                  </h2>
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-8">
                  <p className="text-lg text-slate-300 leading-relaxed whitespace-pre-line mb-8 font-normal">
                    {section.content}
                  </p>
                  
                  {section.listItems && (
                    <ul className="space-y-3 mb-8 pl-1">
                      {section.listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-200">
                          <span className={`mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0 ${project.badge.replace('text', 'bg').split(' ')[0]}`}></span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {renderDemoBlock(section)}

                  {/* Dynamic Image Rendering */}
                  {renderImages(section)}
                  
                  {/* Embed (Figma etc) */}
                  {section.embedUrl && (
                    <div className="mt-12 w-full max-w-[360px] mx-auto aspect-[9/19] bg-slate-900 rounded-[2.5rem] overflow-hidden border-[8px] border-slate-800 shadow-2xl relative">
                      <iframe 
                        src={section.embedUrl}
                        className="w-full h-full bg-slate-50"
                        allowFullScreen
                        style={{ border: 'none' }}
                        title="Interactive Prototype"
                      ></iframe>
                    </div>
                  )}
                  
                  {/* CTA Button (Only if cta exists) */}
                  {section.cta && (
                    <div className="mt-10">
                      <a 
                        href={section.cta.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${ui.btnBase} gap-3 bg-slate-900 text-white hover:bg-slate-800 shadow-md hover:shadow-xl hover:-translate-y-0.5`}
                      >
                        {section.cta.text} <ExternalLinkIcon size={20} className="opacity-80" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Footer Navigation */}
        <div className="mt-32 pt-12 border-t border-slate-800 flex justify-between items-center">
           <button 
            onClick={onBack}
            className="text-base font-medium text-slate-300 hover:text-[#01F5D1] transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon size={18} /> Back to Projects
          </button>
           <button 
             onClick={onNext}
             className="group flex items-center gap-2 px-6 py-3 bg-[#01F5D1] text-slate-950 hover:bg-[#00D8B8] rounded-full font-medium transition-all hover:pr-8"
           >
             Next Project <ArrowRightIcon size={18} className="group-hover:translate-x-1 transition-transform" />
           </button>
        </div>

      </div>
    </div>
  );
};

// --- Main Component ---
const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [currentView, setCurrentView] = useState<'home' | 'project'>('home');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const isManualScroll = useRef(false);
  const navRef = useRef<HTMLElement | null>(null);
  const lightboxCloseRef = useRef<HTMLButtonElement | null>(null);
  const isWhiteBgLightboxImage = selectedImage?.includes('Circuit-Design.webp');
  const orderedProjects = useMemo(() => {
    return [...projects].sort((a, b) => {
      const rankA = PROJECT_ORDER_PRIORITY[a.slug] ?? Number.MAX_SAFE_INTEGER;
      const rankB = PROJECT_ORDER_PRIORITY[b.slug] ?? Number.MAX_SAFE_INTEGER;

      if (rankA !== rankB) return rankA - rankB;
      return a.id - b.id;
    });
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // --- Navigation & Transition Handlers ---
  const scrollToElementWithOffset = (
    element: HTMLElement,
    align: 'center' | 'start',
    options?: { behavior?: ScrollBehavior; startOffsetAdjustment?: number }
  ) => {
    if (align === 'center') {
      element.scrollIntoView({ behavior: options?.behavior ?? 'auto', block: 'center', inline: 'nearest' });
      return;
    }

    const navHeight = navRef.current?.offsetHeight ?? 0;
    const extraOffset = 16 + (options?.startOffsetAdjustment ?? 0);
    const top = element.getBoundingClientRect().top + window.scrollY - navHeight - extraOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: options?.behavior ?? 'auto' });
  };

  const updateHistory = (
    state: { view: 'home' | 'project'; section?: string; projectId?: number },
    hash: string,
    replace = false
  ) => {
    const baseUrl = window.location.pathname + window.location.search;
    const url = hash ? `${baseUrl}#${hash}` : baseUrl;
    if (replace) {
      window.history.replaceState(state, '', url);
      return;
    }
    window.history.pushState(state, '', url);
  };

  const parseHash = () => {
    const hash = window.location.hash.replace('#', '');
    const projectIdBySlug = new Map(projects.map((project) => [project.slug, project.id]));
    if (hash.startsWith('project-')) {
      const projectId = Number(hash.replace('project-', ''));
      if (!Number.isNaN(projectId)) {
        return { view: 'project' as const, projectId };
      }
    }

    if (projectIdBySlug.has(hash)) {
      return { view: 'project' as const, projectId: projectIdBySlug.get(hash)! };
    }

    if (['home', 'work', 'about', 'contact'].includes(hash)) {
      return { view: 'home' as const, section: hash };
    }

    return { view: 'home' as const, section: 'home' };
  };

  const scrollToSection = (
    sectionId: string,
    options?: { updateHistory?: boolean }
  ) => {
    isManualScroll.current = true;
    const targetProjectId = selectedProject?.id ?? null;
    const getProjectScrollAlignment = () =>
      window.innerWidth < 768 ? 'start' : 'center';
    
    if (currentView !== 'home') {
      // If in project view: Fade out -> Switch to Home -> Jump to Section -> Fade In
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setTimeout(() => {
          const targetId =
            sectionId === 'work' && targetProjectId !== null
              ? `project-${targetProjectId}`
              : sectionId;
          const element = document.getElementById(targetId);
          if (element) {
            const block = targetId === 'work' ? 'start' : getProjectScrollAlignment();
            scrollToElementWithOffset(element, block);
          }
          setIsTransitioning(false);
          setTimeout(() => { isManualScroll.current = false; }, 300);
        }, 50);
      }, 300);
    } else {
      // If in home view: Just smooth scroll
      const element = document.getElementById(sectionId);
      if (element) {
        if (sectionId === 'work' || sectionId === 'about') {
          scrollToElementWithOffset(element, 'start', {
            behavior: 'smooth',
            startOffsetAdjustment: -64,
          });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
      setIsMenuOpen(false);
      setActiveSection(sectionId);
      setTimeout(() => { isManualScroll.current = false; }, 1000);
    }
    
    setIsMenuOpen(false);
    setActiveSection(sectionId);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'home', section: sectionId }, sectionId);
    }
  };

  const openProject = (
    project: Project,
    options?: { updateHistory?: boolean }
  ) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setSelectedProject(project);
      setCurrentView('project');
      window.scrollTo(0, 0);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 50);
    }, 180);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'project', projectId: project.id }, project.slug);
    }
  };

  const handleProjectClick = (project: Project) => {
    openProject(project);
  };

  const handleBackToHome = (options?: { updateHistory?: boolean; sectionId?: string }) => {
    const sectionId = options?.sectionId ?? 'work';
    const targetProjectId = sectionId === 'work' ? (selectedProject?.id ?? null) : null;
    const getProjectScrollAlignment = () =>
      window.innerWidth < 768 ? 'start' : 'center';
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('home');
      setSelectedProject(null);
      setActiveSection(sectionId);
      setTimeout(() => {
        const targetId =
          targetProjectId !== null ? `project-${targetProjectId}` : sectionId;
        const element = document.getElementById(targetId);
        if (element) {
          const block = sectionId === 'work' ? getProjectScrollAlignment() : 'start';
          scrollToElementWithOffset(element, block);
        }
        setIsTransitioning(false);
      }, 50);
    }, 300);
    if (options?.updateHistory !== false) {
      updateHistory({ view: 'home', section: sectionId }, sectionId);
    }
  };

  const handleNextProject = () => {
    if (selectedProject) {
        const currentIndex = orderedProjects.findIndex(p => p.id === selectedProject.id);
        const nextIndex = (currentIndex + 1) % orderedProjects.length;
        openProject(orderedProjects[nextIndex]);
    }
  };

  // Initial load: honor URL hash without pushing history
  useEffect(() => {
    const initialState = parseHash();
    if (initialState.view === 'project') {
      const project = projects.find(p => p.id === initialState.projectId);
      if (project) {
        openProject(project, { updateHistory: false });
        return;
      }
      updateHistory({ view: 'home', section: 'home' }, 'home', true);
      return;
    }
    scrollToSection(initialState.section ?? 'home', { updateHistory: false });
    updateHistory({ view: 'home', section: initialState.section ?? 'home' }, initialState.section ?? 'home', true);
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const handlePopState = () => {
      const nextState = parseHash();
      if (nextState.view === 'project') {
        const project = projects.find(p => p.id === nextState.projectId);
        if (project) {
          openProject(project, { updateHistory: false });
        }
        return;
      }

      if (currentView !== 'home') {
        handleBackToHome({ updateHistory: false, sectionId: nextState.section ?? 'home' });
        return;
      }

      scrollToSection(nextState.section ?? 'home', { updateHistory: false });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentView, selectedProject]);

  // Scroll spy
  useEffect(() => {
    if (currentView !== 'home') return;

    const handleScroll = () => {
      if (isManualScroll.current) return;

      const sections = ['home', 'work', 'about', 'contact'];
      const scrollPosition = window.scrollY + window.innerHeight / 3;

      if ((window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 50) {
        setActiveSection('contact');
        return;
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
          setActiveSection(section);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentView]);

  // Close mobile menu on outside click or Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (navRef.current && !navRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('touchstart', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  // Lightbox escape, focus, and scroll lock
  useEffect(() => {
    if (!selectedImage) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    lightboxCloseRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSelectedImage(null);
        return;
      }

      if (event.key === 'Tab') {
        event.preventDefault();
        lightboxCloseRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  return (
    <div className="min-h-screen bg-[#02060f] text-slate-100 selection:bg-[#01F5D1] selection:text-slate-950 overflow-x-hidden transition-colors duration-300">
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[70] focus:bg-white focus:text-slate-900 focus:px-4 focus:py-2 focus:rounded-full focus:shadow-lg"
      >
        Skip to content
      </a>
      
      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Image preview"
        >
          <button 
            className="absolute top-4 right-4 z-10 text-white hover:text-white transition-colors bg-slate-900/80 hover:bg-slate-800 p-2 rounded-full border border-white/20 shadow-lg"
            onClick={() => setSelectedImage(null)}
            ref={lightboxCloseRef}
            aria-label="Close image preview"
          >
            <XIcon size={32} />
          </button>
          <ResponsiveImage 
            src={selectedImage} 
            alt="Full size view" 
            className={`w-full h-full max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl ${
              isWhiteBgLightboxImage ? 'bg-white p-2' : ''
            }`}
            loading="eager"
            deferGifOnConstrainedNetwork={false}
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
          />
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} className="fixed w-full bg-slate-950/70 backdrop-blur-md z-50 border-b border-slate-800 shadow-sm transition-all duration-300">
        <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
          <div className="flex justify-between items-center h-[4.5rem]">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <h1 className="text-[2.1rem] font-display tracking-tight text-[#01F5D1]">JB</h1>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-nowrap items-center gap-8 whitespace-nowrap">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-base font-medium transition-colors duration-200 ${
                      activeSection === item.toLowerCase() && currentView === 'home'
                        ? 'text-[#01F5D1]'
                        : 'text-slate-300 hover:text-[#9EF7EA]'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <a
                href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="ml-2 px-4 py-1.5 rounded-full border border-[#01F5D1] text-[#01F5D1] text-sm font-medium hover:bg-[#01F5D1] hover:text-slate-950 transition-colors whitespace-nowrap"
              >
                Resume ↗
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} className="text-slate-300 hover:text-[#9EF7EA] p-2">
                {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-slate-950 border-t border-slate-800 absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Home', 'Work', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-3 py-2 text-lg font-medium text-slate-300 hover:text-[#9EF7EA] hover:bg-slate-900 rounded-md"
                >
                  {item}
                </button>
              ))}
              <a
                href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                target="_blank"
                rel="noreferrer"
                className="block w-full text-left px-3 py-2 text-lg font-medium text-[#01F5D1] hover:bg-slate-900 rounded-md"
              >
                Resume ↗
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW */}
      {currentView === 'home' ? (
        <div className={`bg-[#02060f] transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Hero Section */}
          <section
            id="home"
            className={`relative min-h-[calc(100vh-4.5rem)] md:min-h-[calc(100vh-5rem)] pt-[5.5rem] pb-8 md:pt-28 md:pb-10 scroll-mt-28 overflow-hidden ${
              !isTransitioning && activeSection === 'home'
                ? 'bg-gradient-to-b from-[#031018] via-[#062126] to-[#02060f]'
                : 'bg-[#02060f]'
            }`}
          >
            {!isTransitioning && activeSection === 'home' && (
              <>
                <div className="absolute -top-24 -right-8 w-64 h-64 rounded-full bg-[#01F5D1]/25 blur-3xl animate-drift"></div>
                <div className="absolute top-20 -left-12 w-52 h-52 rounded-full bg-[#00A19B]/30 blur-3xl animate-drift"></div>
                <div className="absolute inset-0 pointer-events-none circuit-overlay"></div>
              </>
            )}
            <div className="px-4 sm:px-8 lg:px-12 max-w-[84rem] mx-auto relative">
              <div className="grid lg:grid-cols-12 gap-10 items-stretch animate-fade-in-up">
                <div className="lg:col-span-8 lg:h-full lg:flex lg:flex-col">
                  <h1 className="text-[3.1rem] md:text-[4.2rem] font-display text-slate-100 mb-5 leading-[1.05]">
                    I design <span className="text-[#01F5D1]">intuitive tech products</span> that blend hardware, software, and human behavior.
                  </h1>
                  <p className="text-[1.18rem] md:text-[1.34rem] text-slate-300 mb-6 leading-relaxed max-w-3xl">
                    I am <span className="text-[#01F5D1] font-semibold">Jash Bhatt</span>, a third-year Design student at FLAME University focused on technology-led design.
                  </p>

                  <div className="lg:hidden w-full rounded-3xl border border-slate-700 bg-slate-900/85 p-4 shadow-lg mb-6">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash.jpeg`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover"
                        loading="eager"
                        fetchPriority="high"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-4 px-1">Product Design Student · FLAME University</p>
                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1.5 mb-6 lg:hidden text-[#9EF7EA]">
                    {personalitySignals.map((signal, index) => (
                      <span key={`mobile-${signal}`} className="text-base font-semibold leading-relaxed">
                        {signal}
                        {index < personalitySignals.length - 1 && (
                          <span className="mx-2 text-[#64d7c6] font-normal">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col items-start gap-3 mb-8 lg:hidden">
                    {operatorStats.map((stat) => (
                      <span key={`mobile-stat-${stat.label}`} className="min-h-[44px] px-4 py-2 text-sm font-semibold rounded-full border border-slate-600 bg-slate-900/85 text-slate-200 inline-flex items-center">
                        {stat.label}: {stat.value}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 lg:hidden">
                    <button
                      onClick={() => scrollToSection('work')}
                      className={`${ui.btnBase} ${ui.btnPrimary}`}
                    >
                      View My Work <ArrowRightIcon size={18} />
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      Get in Touch
                    </button>
                    <a
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      <DownloadIcon size={18} /> Download Resume
                    </a>
                  </div>

                  <div className="hidden lg:flex flex-nowrap items-center mb-8 text-[#9EF7EA] whitespace-nowrap">
                    {personalitySignals.map((signal, index) => (
                      <span key={signal} className="text-base font-semibold leading-relaxed shrink-0">
                        {signal}
                        {index < personalitySignals.length - 1 && (
                          <span className="mx-2.5 text-[#64d7c6] font-normal">|</span>
                        )}
                      </span>
                    ))}
                  </div>

                  <div className="hidden lg:flex flex-col sm:flex-row gap-4 mt-auto">
                    <button
                      onClick={() => scrollToSection('work')}
                      className={`${ui.btnBase} ${ui.btnPrimary}`}
                    >
                      View My Work <ArrowRightIcon size={18} />
                    </button>
                    <button
                      onClick={() => scrollToSection('contact')}
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      Get in Touch
                    </button>
                    <a
                      href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`}
                      target="_blank"
                      rel="noreferrer"
                      className={`${ui.btnBase} ${ui.btnSecondary}`}
                    >
                      <DownloadIcon size={18} /> Resume
                    </a>
                  </div>
                </div>

                <div className="hidden lg:block lg:col-span-4 lg:h-full">
                  <div className="max-w-[324px] h-full lg:ml-auto rounded-3xl border border-slate-700 bg-slate-900/85 p-4 shadow-lg flex flex-col">
                    <div className="rounded-2xl overflow-hidden aspect-[4/5]">
                      <ResponsiveImage
                        src={`${PUBLIC_URL}/images/Jash.jpeg`}
                        alt="Portrait of Jash Bhatt"
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400 mt-4 px-1">Product Design Student · FLAME University</p>
                    <div className="mt-4 rounded-xl border border-slate-700 bg-slate-950 text-[#01F5D1] p-4 font-mono text-[11px]">
                      <p><span className="text-slate-500">{'>'}</span> status: <span className="text-[#9EF7EA]">available_for_internship</span></p>
                      <p><span className="text-slate-500">{'>'}</span> focus: <span className="text-[#9EF7EA]">phygital · ui/ux · circuits</span></p>
                      <p><span className="text-slate-500">{'>'}</span> stack: <span className="text-[#9EF7EA]">figma + react + arduino</span></p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hidden lg:grid grid-cols-1 sm:grid-cols-3 gap-4 mt-10 md:mt-12 w-full">
                {operatorStats.map((stat) => (
                  <div key={stat.label} className="bg-slate-900/85 border border-slate-700 rounded-2xl p-6 shadow-sm">
                    <div className="text-[1.95rem] md:text-[2.2rem] font-bold text-slate-100">{stat.value}</div>
                    <div className="text-sm text-slate-300 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              <div className="mt-7 flex justify-center animate-bounce text-slate-400">
                <ChevronDownIcon size={32} />
              </div>
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className="py-24 px-4 sm:px-8 lg:px-12 max-w-[84rem] mx-auto scroll-mt-28 bg-[#02060f]">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-4">Selected Projects</h2>
              <p className="text-slate-300 max-w-2xl mb-6">From circuit-led builds to AI-enabled interfaces — each project reflects how I think through design, engineering, and behavior together.</p>
              <div className="h-1 w-24 bg-gradient-to-r from-[#01F5D1] to-[#00A19B] rounded-full"></div>
            </div>

            <div className="space-y-32">
              {orderedProjects.map((project, index) => {
                const projectThumbnail =
                  project.content.thumbnailImage ?? project.content.heroImage;

                return (
                  <div
                    key={project.id}
                    id={`project-${project.id}`}
                    className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#01F5D1] focus-visible:ring-offset-4 rounded-2xl"
                    role="button"
                    tabIndex={0}
                    aria-label={`Open case study for ${project.title}`}
                    onClick={() => handleProjectClick(project)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleProjectClick(project);
                      }
                    }}
                  >
                  <div className="grid md:grid-cols-12 gap-8 items-center">
                    
                    {/* Image Column (7 cols) */}
                    <div className={`md:col-span-7 ${index % 2 === 1 ? 'md:order-2' : ''}`}>
                      <div className={`relative overflow-hidden rounded-2xl ${project.color} aspect-[4/3] shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                          {!projectThumbnail.includes('placeholder') ? (
                            <ResponsiveImage 
                              src={projectThumbnail} 
                              alt={project.title} 
                              className={`block w-full h-full transition-transform duration-700 ${project.slug === 'python-codes' ? 'object-contain p-6' : 'object-cover object-center group-hover:scale-105'}`}
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center p-8 text-center">
                              <div>
                                <PhotoIcon className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                                <p className="text-slate-400 font-medium">Click to view {project.title}</p>
                              </div>
                            </div>
                          )}
                          
                          {/* Overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center">
                             <span className="opacity-0 group-hover:opacity-100 bg-slate-950/90 border border-slate-700 px-6 py-3 rounded-full font-medium text-[#9EF7EA] shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                               View Project
                             </span>
                          </div>
                      </div>
                    </div>

                    {/* Text Column (5 cols) */}
                    <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-slate-600 text-xs font-mono font-medium">{String(index + 1).padStart(2, '0')}</span>
                        <span className="text-slate-500 text-sm font-medium">{project.category}</span>
                      </div>
                      
                      <h3 className={`text-3xl md:text-4xl font-bold text-slate-100 mb-4 transition-colors ${project.hoverColor}`}>
                        {project.title}
                      </h3>
                      <p className="text-slate-300 text-lg leading-relaxed mb-6">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map((tag, i) => (
                          <span key={i} className={ui.chipBase}>
                            {tag}
                          </span>
                        ))}
                      </div>

                      <button 
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          handleProjectClick(project);
                        }}
                        className={`font-semibold flex items-center gap-2 hover:gap-3 transition-all ${project.accentColor}`}
                        aria-label={`Read full case study for ${project.title}`}
                      >
                        Read Full Case Study <ArrowRightIcon size={18} />
                      </button>
                    </div>
                  </div>
                  </div>
                );
              })}
            </div>

            {/* Creative Explorations Divider */}
            <div className="mt-32 mb-16 flex items-center gap-6">
              <div className="h-px flex-1 bg-slate-800"></div>
              <div className="text-center">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-1">Beyond case studies</p>
                <h2 className="text-2xl font-display text-slate-300">Creative Explorations</h2>
              </div>
              <div className="h-px flex-1 bg-slate-800"></div>
            </div>

            {/* Additional Work Grid */}
            <div className="grid grid-cols-1 gap-12">
              
              {/* Photoshop Section */}
              <div className={`${ui.cardBase} ${ui.cardHover} p-8 hover:border-[#01F5D1]`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/photoshop.png`}
                      alt="Photoshop icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Photoshop & Animation</h3>
                </div>
                <p className="text-slate-300 mb-6">Explorations in visual design, motion graphics, and digital art created during my academic coursework.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
                  {galleryItems.map((item, i) => (
                    <div 
                      key={i} 
                      className={`w-full rounded-xl overflow-hidden bg-slate-800 border border-slate-700 transition-all group md:aspect-square hover:-translate-y-1 ${item.type === 'video' ? 'hover:border-slate-600 hover:shadow-md' : 'cursor-pointer hover:border-[#01F5D1] hover:shadow-md'}`}
                      onClick={() => item.type === 'image' && item.src && setSelectedImage(item.src)}
                    >
                      {item.type === 'video' && item.src ? (
                        <video
                          className="w-full h-full object-cover"
                          controls
                          playsInline
                          preload="metadata"
                          aria-label={item.alt}
                        >
                          <source src={item.src} type="video/mp4" />
                          Your browser does not support the video tag.
                        </video>
                      ) : item.src ? (
                        <ResponsiveImage 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          deferGifOnConstrainedNetwork
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300"><svg width="24" height="24" ...><rect .../></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Brand Animation Section */}
              <div className={`${ui.cardBase} ${ui.cardHover} p-8 hover:border-[#01F5D1]`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photoshop and Animation/after-effects.png`}
                      alt="After Effects icon"
                      className="w-full h-full object-cover rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Nothing Brand Animation</h3>
                </div>
                <p className="text-slate-300 mb-6">A brand motion piece for Nothing (phone company), focused on clean geometry and sound-led pacing.</p>
                <div className="rounded-xl overflow-hidden border border-slate-700 bg-slate-800">
                  <video
                    className="w-full h-auto"
                    controls
                    playsInline
                    preload="metadata"
                    aria-label="Nothing brand animation video"
                  >
                    <source src={`${PUBLIC_URL}/images/Photoshop and Animation/nothing-animation.mp4`} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>

              {/* AI Generations Section */}
              <div className={`${ui.cardBase} ${ui.cardHover} p-8 hover:border-[#01F5D1]`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Lamborghini.png`}
                      alt="Lamborghini logo"
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Lamborghini Jetski AI</h3>
                </div>
                <p className="text-slate-300 mb-6">Exploring automotive form language and aerodynamics through generative AI and prompt engineering.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:gap-6">
                  {aiItems.map((item, i) => (
                    <div 
                      key={i} 
                      className="w-full rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-[#01F5D1] hover:shadow-md transition-all group md:aspect-square hover:-translate-y-1"
                      onClick={() => item.src && setSelectedImage(item.src)}
                    >
                      {item.src ? (
                        <ResponsiveImage 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
                          deferGifOnConstrainedNetwork
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.onerror = null; 
                            if (target.parentElement) {
                              target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300"><svg width="24" height="24" ...><rect .../></svg></div>';
                            }
                          }}
                        />
                      ) : (
                        <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Gallery Snippet Section */}
              <div className={`${ui.cardBase} ${ui.cardHover} p-8 hover:border-[#01F5D1]`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <ResponsiveImage
                      src={`${PUBLIC_URL}/images/Photography/camera.png`}
                      alt="Camera icon"
                      className="w-full h-full object-contain rounded-lg"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-100">Photography Gallery</h3>
                </div>
                <p className="text-slate-300 mb-6">For over 10 years, I've pursued nature photography as a personal hobby. I am skilled with both professional DSLRs and mobile cameras, using them to develop a higher appreciation for the natural world.</p>
                <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-3 md:grid-rows-2 md:gap-6 md:auto-rows-fr">
                  {gallerySnippetItems.map((item, i) => {
                    const positionClass = i === 0
                      ? 'md:col-start-1 md:row-start-1'
                      : i === 1
                        ? 'md:col-start-1 md:row-start-2'
                        : i === 2
                          ? 'md:col-start-2 md:row-span-2 md:h-full'
                          : 'md:col-start-3 md:row-span-2 md:h-full';
                    const shapeClass = i < 2
                      ? 'w-full md:aspect-[4/3]'
                      : 'w-full md:aspect-auto md:h-full';

                    return (
                      <div
                        key={`gallery-snippet-${i}`}
                        className={`${shapeClass} rounded-xl overflow-hidden bg-slate-800 cursor-pointer border border-slate-700 hover:border-slate-500 hover:shadow-md transition-all group ${positionClass} hover:-translate-y-1`}
                        onClick={() => item.src && setSelectedImage(item.src)}
                      >
                        {item.src ? (
                          <ResponsiveImage
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            deferGifOnConstrainedNetwork
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.onerror = null;
                              if (target.parentElement) {
                                target.parentElement.innerHTML = '<div class="w-full h-full flex items-center justify-center text-slate-300"><svg width="24" height="24" ...><rect .../></svg></div>';
                              }
                            }}
                          />
                        ) : (
                          <PhotoIcon className="text-slate-300 w-full h-full p-4" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>


            </div>
          </section>

          {/* About Section */}
          <section id="about" className="py-24 scroll-mt-28 bg-[#02060f]">
            <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid md:grid-cols-2 gap-16">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-8">About Me</h2>
                  <div className="space-y-6 text-lg text-slate-300 leading-relaxed">
                    <p>
                      I love technology in all forms. I prefer direct communication, clear expectations, and products that behave exactly as intended.
                    </p>
                    <p>
                      I work across UI, hardware, and interaction design, with a strong focus on circuit design and electronics. My goal is simple: build phygital products that are refined, useful, and technically solid.
                    </p>
                  </div>

                  <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="rounded-2xl border border-[#00A19B]/60 bg-[#00A19B]/20 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#01F5D1] mb-2">Design × Engineering</p>
                      <p className="text-sm text-slate-200 font-medium">I bridge UI, hardware, and behavior in one product view.</p>
                    </div>
                    <div className="rounded-2xl border border-[#C8CCCE]/40 bg-[#C8CCCE]/10 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-[#C8CCCE] mb-2">Research-First</p>
                      <p className="text-sm text-slate-200 font-medium">Every design decision is grounded in user insight before it ships.</p>
                    </div>
                    <div className="rounded-2xl border border-emerald-800 bg-emerald-950/30 p-4">
                      <p className="text-xs uppercase tracking-[0.18em] text-emerald-300 mb-2">End-to-End</p>
                      <p className="text-sm text-slate-200 font-medium">I own execution from Figma through code to physical prototype.</p>
                    </div>
                  </div>

                  <div className="mt-8 rounded-2xl border border-slate-700 bg-slate-900/70 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300 mb-3">Design Principles</p>
                    <ul className="space-y-2 text-sm text-slate-300">
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Technology shifts fast — I keep my process tool-agnostic and outcome-focused.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">Clarity over cleverness: if an interaction needs explaining, it needs redesigning.</span></li>
                      <li className="flex items-start gap-2"><span className="mt-[7px] h-1.5 w-1.5 rounded-full bg-slate-300"></span><span className="[text-wrap:pretty]">I iterate on working prototypes, not just screens — real constraints shape better design.</span></li>
                    </ul>
                  </div>

                </div>

                <div>
                  <h3 className="text-3xl font-display font-semibold tracking-tight text-slate-100 mb-9">Expertise</h3>
                  <div className="mb-8">
                    <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500 mb-3">Currently exploring</p>
                    <div className="flex flex-wrap gap-2">
                      {currentlyExploring.map((item) => (
                        <span key={item} className="px-3 py-1.5 text-sm font-medium rounded-full border border-slate-700/80 bg-slate-900/80 text-slate-200">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <BriefcaseIcon size={20} className="text-[#01F5D1]" />
                        <h4 className="text-xl font-semibold tracking-tight text-slate-100">Design</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Product Design', 'UI/UX Design', 'Industrial Design', 'Design Systems', 'Generative AI in Design', 'Agentic AI Workflows', 'Circuit Design'].map((skill) => (
                          <span key={skill} className={ui.chipAccent}>
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <AwardIcon size={20} className="text-emerald-300" />
                        <h4 className="text-xl font-semibold tracking-tight text-emerald-300">Tools & Tech</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Figma', 'Python', 'React.js', 'Arduino IDE', 'n8n', 'Adobe Suite', 'Fusion 360'].map((tool) => (
                          <span key={tool} className="px-3 py-1.5 text-sm font-medium text-emerald-300 bg-emerald-950/30 border border-emerald-800 rounded-full">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-12">
                    <div className="border-l-2 border-[#00A19B] pl-4">
                      <div className="text-xl font-semibold tracking-tight text-slate-100 mb-4">Education</div>
                      <div className="space-y-6">
                        {/* Primary / Current */}
                        <div>
                          <h4 className="text-lg font-bold text-slate-100">Bachelor of Design (B.Des)</h4>
                          <p className="text-slate-300 font-medium">FLAME University</p>
                          <p className="text-sm text-[#00A19B] font-medium mt-1">2023 – 2027</p>
                        </div>
                        
                        {/* Secondary / Past */}
                        <div className="opacity-80">
                          <h4 className="text-base font-medium text-slate-300">Cambridge International Education</h4>
                          <p className="text-sm text-slate-500">VIBGYOR High School, NIBM, Pune</p>
                          <p className="text-xs text-slate-400 mt-0.5">2018 – 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 scroll-mt-28 bg-[#02060f]">
            <div className="max-w-[84rem] mx-auto px-4 sm:px-8 lg:px-12">
              <div className="grid md:grid-cols-2 gap-16">
                <div>
                  <h2 className="text-3xl md:text-4xl font-display text-slate-100 mb-6">Let's Build Something</h2>
                  <p className="text-xl text-slate-300">
                    I am actively looking for internship opportunities in UI/UX, product design, and phygital interaction — where I can contribute from research through to implementation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <a href="mailto:jash.bhatt@flame.edu.in" className="flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-[#01F5D1] hover:-translate-y-1 transition-all group">
                    <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full group-hover:bg-[#01F5D1] group-hover:text-slate-950 transition-colors">
                      <MailIcon size={22} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-slate-400 font-medium">Email Me</p>
                      <p className="text-slate-100 font-semibold text-sm whitespace-nowrap">jash.bhatt@flame.edu.in</p>
                    </div>
                  </a>

                  <a href="https://linkedin.com/in/jash-bhatt" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-[#01F5D1] hover:-translate-y-1 transition-all group">
                    <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full group-hover:bg-[#01F5D1] group-hover:text-slate-950 transition-colors">
                      <LinkedinIcon size={22} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-slate-400 font-medium">LinkedIn</p>
                      <p className="text-slate-100 font-semibold text-sm whitespace-nowrap">/in/jash-bhatt</p>
                    </div>
                  </a>

                  <a href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} target="_blank" rel="noreferrer" className="flex items-center gap-3 p-4 bg-slate-900/80 border border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-[#01F5D1] hover:-translate-y-1 transition-all group">
                    <div className="shrink-0 p-3 bg-[#00A19B]/25 text-[#9EF7EA] rounded-full group-hover:bg-[#01F5D1] group-hover:text-slate-950 transition-colors">
                      <DownloadIcon size={22} />
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-slate-400 font-medium">Resume</p>
                      <p className="text-slate-100 font-semibold text-sm whitespace-nowrap">Download PDF</p>
                    </div>
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : (
        /* PROJECT DETAIL VIEW */
        <ProjectDetail 
          project={selectedProject} 
          onBack={handleBackToHome} 
          onNext={handleNextProject}
          isTransitioning={isTransitioning}
          onImageClick={setSelectedImage}
        />
      )}

      {/* Footer */}
      <footer className="bg-[#02060f] border-t border-slate-800 text-slate-400 py-12 text-center">
        <div className="flex justify-center gap-8 mb-5 text-slate-400">
          <a href="mailto:jash.bhatt@flame.edu.in" className="hover:text-[#01F5D1] transition-colors text-sm">Email</a>
          <a href="https://linkedin.com/in/jash-bhatt" target="_blank" rel="noreferrer" className="hover:text-[#01F5D1] transition-colors text-sm">LinkedIn</a>
          <a href={`${PUBLIC_URL}/Jash_Bhatt_Resume.pdf`} target="_blank" rel="noreferrer" className="hover:text-[#01F5D1] transition-colors text-sm">Resume</a>
        </div>
        <p className="mb-2">© 2026 Jash Bhatt. All Rights Reserved.</p>
        <p className="text-sm">Designed & built by Jash Bhatt</p>
      </footer>
    </div>
  );
};

export default App;
