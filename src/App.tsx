import { useState, useEffect, useRef } from 'react';
import ArkanoidDemo from './components/ArkanoidDemo';
import YoloV8Demo from './components/YoloV8Demo';
import { ARKANOID_CODE } from './data/arkanoidCode';
import { YOLOV8_CODE } from './data/yolov8Code';

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

const CameraIcon = ({ size = 24, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M14.5 4h-5l-2 3H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3.5z"/><circle cx="12" cy="13" r="3"/>
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
  images?: { src: string; caption: string; fullWidth?: boolean }[]; 
  cta?: { text: string; url: string };
  embedUrl?: string;
  imageLayout?: 'row' | 'stack' | 'mixed'; 
  imageHeight?: string; 
  codeBlock?: string;
  demoId?: 'arkanoid' | 'yolov8';
}

interface ProjectContent {
  heroImage: string;
  challenge: string;
  role: string;
  sections: Section[];
}

interface Project {
  id: number;
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

const projects: Project[] = [
  {
    id: 0,
    title: "ClassFlow",
    category: "AI Agent / Full Stack",
    timeline: "Ongoing",
    description: "A smart, web-based application that automates the translation of course syllabi into actionable, digital schedules. ClassFlow uses Generative AI to 'read' messy course documents and map them onto a real-world calendar.",
    tags: ["React", "Firebase", "Gemini AI", "Google Calendar API"],
    color: "bg-purple-50",
    accentColor: "text-purple-600",
    hoverColor: "group-hover:text-purple-600",
    badge: "bg-purple-100 text-purple-700",
    content: {
      heroImage: "placeholder-classflow-hero.jpg", // Keeps the placeholder logic
      challenge: "Academic scheduling is manual and prone to error. Syllabuses are locked in static PDFs, requiring tedious manual entry to create a functional digital calendar.",
      role: "Creator & Lead Developer",
      sections: [
        {
          title: "The Core Solution",
          content: "ClassFlow is designed around a simple premise: 'Upload your syllabus. Set your availability. Get a perfect Google Calendar instantly.'\n\nIt leverages Google Gemini to parse messy course documents, understand teaching timelines, and map them onto a user's specific constraints (e.g., 'Tuesdays & Thursdays, Sept-Dec').",
          listItems: ["Automated Syllabus Parsing", "Intelligent Date Calculation", "One-Click Google Calendar Export"]
        },
        {
          title: "Design Process & UX",
          content: "I designed the application around a linear, 3-step flow to minimize cognitive load for students and professors:\n\n1. Input: User uploads PDF/Excel and defines semester dates.\n2. Processing: The system uses AI to parse topics and calculate exact session dates.\n3. Output: User reviews the generated schedule and exports it."
        },
        {
          title: "Technical Architecture",
          content: "ClassFlow is built on a modern stack ensuring speed and scalability:\n• Frontend: React (Vite) with Tailwind CSS for a modular UI.\n• Backend: Google Firebase (Auth & Firestore) for secure persistence.\n• AI Engine: Google Gemini API (gemini-1.5-flash) for OCR and semantic extraction.\n• Integration: Google Calendar API for direct read/write access.",
          listItems: ["React & Tailwind CSS", "Firebase Auth & Firestore", "Google Gemini AI", "Google Calendar API"]
        },
        {
          title: "Key Features & Algorithms",
          content: "To make this work, I developed two core technologies:\n\nSmart Import (AI-Powered): A prompt-engineered LLM pipeline that instructs Gemini to ignore 'fluff' (grading policies) and strictly extract topics.\n\n'Greedy' Week Mapping: A sophisticated allocation algorithm that detects course frequency and ensures multi-session weeks are fully populated without gaps."
        },
        {
          title: "Challenges & Roadmap",
          content: "The biggest challenge was handling 'messy data'—every professor formats syllabi differently. Instead of writing 50 regex parsers, I used AI to normalize text into standard JSON.\n\nFuture Roadmap: \n• Conflict Detection with existing calendar events.\n• Direct LMS Integration (Canvas/Blackboard).\n• Mobile App implementation."
        }
      ]
    }
  },
  {
    id: 1,
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
      heroImage: `${PUBLIC_URL}/images/WePick/wepick-hero-2.webp`,
      challenge: "When shopping online with a group, sharing product links across multiple apps quickly becomes exhausting. What feels easy when shopping alone turns chaotic in group chats, where opinions are scattered, responses get lost, and people are left unsure of what the group actually wants—making it hard to decide and move forward.",
      role: "UI/UX Designer",
      sections: [
        {
          title: "The Process",
          content: "The project timeline spanned several weeks, moving through distinct phases: Research > Problem Statement > Insights > Ideation > MVP Definition > Prototyping > Final App.",
          listItems: ["Defined User Problem", "Gathered User Insights", "Ideation", "Storyboarding", "Visual Identity", "Prototyping"]
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
              src: `${PUBLIC_URL}/images/WePick/wepick-design-system.webp`,
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
    id: 2,
    title: "Dino Spread",
    category: "Industrial Design",
    timeline: "Completed",
    description: "Dino Spread is a Jam and Butter dispensing machine that can be used in school and college canteens so there is no messy countertops and no dirty utensils such as knives when applying jam or butter to your toast.",
    tags: ["Physical Prototyping", "Sketching", "3D Modeling"],
    color: "bg-rose-50",
    accentColor: "text-rose-900",
    hoverColor: "group-hover:text-rose-900",
    badge: "bg-rose-100 text-rose-900",
    content: {
      heroImage: `${PUBLIC_URL}/images/Dino Spread/dino-spread-hero.webp`,
      challenge: "Improving hygiene and usability in campus canteen condiment stations.",
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
    title: "SolarLink",
    category: "Service Design · Sustainability · Systems Thinking",
    timeline: "Academic Project",
    description: "Designing confidence for community solar adoption.",
    tags: ["Service Design", "Sustainability", "Systems Thinking"],
    color: "bg-[#E3FC03]",
    accentColor: "text-[#053738]",
    hoverColor: "group-hover:text-[#053738]",
    badge: "bg-[#E3FC03]/60 text-[#053738]",
    content: {
      heroImage: `${PUBLIC_URL}/images/SolarLink/Solarlink-thumbnail.webp`,
      challenge: "Clean energy is not a technology problem; it is a decision problem. Solar adoption fails not because people do not care, but because deciding together is hard.",
      role: "Service Design · Research · Insight Synthesis · Journey Mapping · Concept & Experience Design",
      sections: [
        {
          title: "SDG 7 Context",
          content: "SDG 7: Affordable & Clean Energy (Sub-goal 7.2) focuses on increasing the share of renewable energy in the global energy mix.\n\nIndia has vast rooftop solar potential, especially in urban housing societies, yet community-level adoption remains slow. The gap is not infrastructure. It's decision-making."
        },
        {
          title: "Overview",
          content: "India has vast rooftop solar potential, especially within urban housing societies. Yet adoption at the community level remains slow.\n\nSolarLink is a service design concept that reframes solar adoption from a technology challenge into a decision-making problem.\n\nThe project explores how housing societies can move from confusion and indecision to shared clarity and confidence before any installation begins."
        },
        {
          title: "Why This Project Exists",
          content: "Despite falling costs, government subsidies, and increasing awareness, solar adoption in housing societies continues to stall.\n\nSolar does not fail because people do not care. It fails because deciding together is hard.",
          listItems: [
            "Information is fragmented",
            "Opinions clash",
            "Responsibility feels risky",
            "Decisions get endlessly postponed",
            "Solar becomes \"next year's agenda\""
          ]
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
          ]
        },
        {
          title: "Primary User",
          content: "Society office bearers (especially secretaries) act as informal decision-makers. They are practical and risk-averse, responsible for long-term outcomes, overloaded with coordination, and highly dependent on peer validation.\n\nTheir biggest concern is not price. It is making the wrong decision for everyone."
        },
        {
          title: "Core Insight",
          content: "Clean energy is not a technology problem. It is a decision problem.\n\nHousing societies do not need persuasion. They need confidence.\n\nSolar adoption must begin before panels, with clarity, trust, and shared understanding."
        },
        {
          title: "Design Question",
          content: "How might we move housing societies from confusion to clarity before any solar installation begins?"
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
          ]
        },
        {
          title: "Core Intervention: Solar Sunday",
          content: "Solar Sunday is a one-day, on-site experience designed to help housing societies explore solar without pressure.\n\nInstead of sales presentations, Solar Sunday turns the society terrace into a calm, interactive learning space where:\n\n• Questions are safe\n• Myths are surfaced\n• Understanding is shared\n\nSolar adoption begins with understanding. Solar Sunday is where that understanding is built."
        },
        {
          title: "Key Experience Touchpoints",
          content: "Solar Confession Booth: A private, judgment-free space where residents openly express doubts and myths. Most common confession: \"I do not really understand solar.\" Surfacing uncertainty early reduces resistance later.\n\nAR Energy Visualiser: Residents see projected costs, savings, and energy generation mapped onto their own building. Solar becomes tangible, not abstract.\n\nPledge Wall: Residents make small, non-binding commitments to show intent and interest. Small signals build collective ownership.\n\nGuided Decision Framework: Structured comparisons replace opinion-based debates. No selling. Only shared understanding."
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
  },
  {
    id: 4,
    title: "Python Codes",
    category: "Python / Computer Vision",
    timeline: "Ongoing",
    description: "Two Python builds showcased side-by-side: a YOLOv8 webcam object detector and a Python arcade game with live in-browser demos.",
    tags: ["Python", "YOLOv8", "Computer Vision", "WebAssembly", "ONNX"],
    color: "bg-emerald-50",
    accentColor: "text-emerald-700",
    hoverColor: "group-hover:text-emerald-700",
    badge: "bg-emerald-100 text-emerald-700",
    content: {
      heroImage: "placeholder-python-hero.jpg",
      challenge: "Showcase native Python projects inside a portfolio without running external servers by pairing code snippets with browser-native live demos.",
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
        }
      ]
    }
  }
];

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
  const isSolarLink = project.title === 'SolarLink';
  const isPythonCodes = project.title === 'Python Codes';
  const heroBgClass = isSolarLink ? 'bg-[#053738]' : project.color;
  const heroTextClass = isSolarLink ? 'text-[#E3FC03]' : 'text-slate-900';
  const heroMutedTextClass = isSolarLink ? 'text-[#E3FC03]' : 'text-slate-500';
  const heroBodyTextClass = isSolarLink ? 'text-[#E3FC03]' : 'text-slate-600';

  const renderDemoBlock = (section: Section) => {
    const demoComponent = section.demoId === 'arkanoid'
      ? <ArkanoidDemo />
      : section.demoId === 'yolov8'
        ? <YoloV8Demo />
        : null;

    if (demoComponent && section.codeBlock) {
      return (
        <div className="mt-8 grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-sm">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
              <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
              <span className="text-[10px] text-slate-500">read-only</span>
            </div>
            <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed md:text-sm font-mono whitespace-pre">
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
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-950 text-slate-100 shadow-sm">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
            <span className="text-xs uppercase tracking-widest text-slate-400">Python Snippet</span>
            <span className="text-[10px] text-slate-500">read-only</span>
          </div>
          <pre className="max-h-[520px] overflow-auto p-4 text-xs leading-relaxed md:text-sm font-mono whitespace-pre">
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

    if (section.imageLayout === 'mixed') {
       // Separate full width and row images
       const rowImages = section.images.filter(img => !img.fullWidth);
       const fullWidthImages = section.images.filter(img => img.fullWidth);

       return (
         <div className="mt-10 flex flex-col gap-8 w-fit mx-auto">
            {rowImages.length > 0 && (
              <div className="flex flex-col md:flex-row gap-4 justify-center"> {/* Reduced gap to 4 */}
                 {rowImages.map((img, i) => (
                    <div key={`row-${i}`} className="flex flex-col gap-3 items-center">
                       <div 
                         className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md cursor-zoom-in w-fit"
                         onClick={() => onImageClick(img.src)}
                       >
                         <img 
                            src={img.src} 
                            alt={img.caption} 
                            className={`w-full h-auto md:w-auto ${section.imageHeight || 'md:h-80'}`} 
                            loading="lazy" 
                         />
                       </div>
                       <p className="text-sm text-slate-500 text-center">{img.caption}</p>
                    </div>
                 ))}
              </div>
            )}
            {fullWidthImages.map((img, i) => (
               <div key={`full-${i}`} className="flex flex-col gap-3 w-full">
                  <div 
                     className="rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md cursor-zoom-in"
                     onClick={() => onImageClick(img.src)}
                   >
                     <img 
                        src={img.src} 
                        alt={img.caption} 
                        className="w-full h-auto"
                        loading="lazy" 
                     />
                   </div>
                   <p className="text-sm text-slate-500 text-center">{img.caption}</p>
               </div>
            ))}
         </div>
       );
    }

    // Default or Row layout logic
    return (
      <div className={`mt-10 ${
        section.imageLayout === 'row' 
          ? 'flex flex-col md:flex-row gap-8 justify-between items-start' 
          : 'grid grid-cols-1 gap-12' 
      }`}>
        {section.images.map((img, i) => (
          <div key={i} className={`flex flex-col gap-3 ${section.imageLayout === 'row' ? 'flex-shrink-0' : ''}`}>
            <div 
              className={`rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shadow-sm transition-all hover:shadow-md cursor-zoom-in ${
                section.imageLayout === 'row' ? 'w-fit' : ''
              }`}
              onClick={() => onImageClick(img.src)}
            >
              <img 
                src={img.src} 
                alt={img.caption} 
                className={`${
                  section.imageLayout === 'row' 
                    ? `w-full h-auto md:w-auto ${section.imageHeight || 'md:h-48'} max-w-full` 
                    : 'w-full h-auto'
                }`}
                loading="lazy" 
              />
            </div>
            <p className="text-sm text-slate-500 text-center">{img.caption}</p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={`bg-white min-h-screen transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
      
      {/* Project Hero */}
      <div className={`w-full ${heroBgClass} pt-32 pb-24 px-4 border-b border-slate-100`}>
        <div className="max-w-5xl mx-auto">
           <button 
            onClick={onBack}
            className={`group flex items-center gap-2 mb-12 transition-colors text-sm font-medium ${
              isSolarLink ? 'text-slate-300 hover:text-sky-600' : 'text-slate-500 hover:text-sky-600'
            }`}
          >
            <ArrowLeftIcon size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Projects
          </button>
          
          <div className="flex flex-wrap items-center gap-3 mb-8">
             <span className={`text-xs font-bold tracking-widest uppercase ${heroMutedTextClass}`}>{project.category}</span>
             <span className={`w-1 h-1 rounded-full ${isSolarLink ? 'bg-[#E3FC03]' : 'bg-slate-300'}`}></span>
             <span className={`text-xs font-bold tracking-widest uppercase ${heroMutedTextClass}`}>{project.timeline}</span>
          </div>
          
          <h1 className={`text-4xl md:text-6xl font-bold mb-8 tracking-tight ${heroTextClass}`}>{project.title}</h1>
          <p className={`text-lg md:text-xl leading-relaxed max-w-2xl font-light ${heroBodyTextClass}`}>
            {project.description}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-16">
        
        {/* Project Meta */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-20 pb-12 border-b border-slate-200">
           <div className="md:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Role</h3>
              <p className="font-medium text-slate-900 text-sm leading-6">{project.content.role}</p>
           </div>
           <div className="md:col-span-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">The Challenge</h3>
              <p className="font-medium text-slate-900 text-sm leading-6">{project.content.challenge}</p>
           </div>
            <div className="md:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Tech & Tools</h3>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag, i) => (
                  <span key={i} className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
                    {tag}
                  </span>
                ))}
              </div>
           </div>
        </div>

        {/* Hero Image */}
        {!isPythonCodes && (
          <div className="w-full bg-slate-50 rounded-lg mb-24 border border-slate-100 overflow-hidden shadow-sm">
             {!project.content.heroImage.includes('placeholder') ? (
                <img src={project.content.heroImage} alt={`${project.title} Hero`} className="w-full h-auto block" />
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
              <div key={idx} className="rounded-3xl border border-emerald-100/70 bg-white/80 p-8 md:p-10 shadow-sm">
                <div className="mb-6">
                  <div className="text-xs uppercase tracking-[0.35em] text-emerald-600/70 mb-3">Python Project</div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">{section.title}</h2>
                  <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line">
                    {section.content}
                  </p>
                </div>
                {section.listItems && (
                  <ul className="space-y-3 mb-4 pl-1">
                    {section.listItems.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-slate-700">
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
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight leading-tight">
                    {section.title}
                  </h2>
                </div>

                {/* Right Column: Content */}
                <div className="md:col-span-8">
                  <p className="text-lg text-slate-600 leading-relaxed whitespace-pre-line mb-8 font-normal">
                    {section.content}
                  </p>
                  
                  {section.listItems && (
                    <ul className="space-y-3 mb-8 pl-1">
                      {section.listItems.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-slate-700">
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
                        className="w-full h-full bg-white"
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
                        className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-medium text-lg hover:bg-slate-800 transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
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
        <div className="mt-32 pt-12 border-t border-slate-200 flex justify-between items-center">
           <button 
            onClick={onBack}
            className="text-base font-medium text-slate-500 hover:text-sky-600 transition-colors flex items-center gap-2"
          >
            <ArrowLeftIcon size={18} /> Back to Projects
          </button>
           <button 
             onClick={onNext}
             className="group flex items-center gap-2 px-6 py-3 bg-slate-900 text-white hover:bg-sky-600 rounded-full font-medium transition-all hover:pr-8"
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

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  // --- Navigation & Transition Handlers ---

  const scrollToSection = (sectionId: string) => {
    isManualScroll.current = true;
    
    if (currentView !== 'home') {
      // If in project view: Fade out -> Switch to Home -> Jump to Section -> Fade In
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentView('home');
        setSelectedProject(null);
        setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) element.scrollIntoView({ behavior: 'auto' });
          setIsTransitioning(false);
          setTimeout(() => { isManualScroll.current = false; }, 300);
        }, 50);
      }, 300);
    } else {
      // If in home view: Just smooth scroll
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
      setActiveSection(sectionId);
      setTimeout(() => { isManualScroll.current = false; }, 1000);
    }
    
    setIsMenuOpen(false);
    setActiveSection(sectionId);
  };

  const handleProjectClick = (project: Project) => {
    setIsTransitioning(true);
    setTimeout(() => {
        setSelectedProject(project);
        setCurrentView('project');
        window.scrollTo(0, 0);
        setTimeout(() => {
            setIsTransitioning(false);
        }, 50);
    }, 300);
  };

  const handleBackToHome = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentView('home');
      setSelectedProject(null);
      setActiveSection('work');
      setTimeout(() => {
        const element = document.getElementById('work');
        if (element) element.scrollIntoView({ behavior: 'auto' });
        setIsTransitioning(false);
      }, 50);
    }, 300);
  };

  const handleNextProject = () => {
    if (selectedProject) {
        const currentIndex = projects.findIndex(p => p.id === selectedProject.id);
        const nextIndex = (currentIndex + 1) % projects.length;
        handleProjectClick(projects[nextIndex]);
    }
  };

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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-sky-100 selection:text-sky-900 overflow-x-hidden transition-colors duration-300">
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
            className="absolute top-6 right-6 text-white/80 hover:text-white transition-colors bg-white/10 hover:bg-white/20 p-2 rounded-full"
            onClick={() => setSelectedImage(null)}
            ref={lightboxCloseRef}
            aria-label="Close image preview"
          >
            <XIcon size={32} />
          </button>
          <img 
            src={selectedImage} 
            alt="Full size view" 
            className="w-full h-full max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()} // Prevent close on image click
          />
        </div>
      )}

      {/* Navigation */}
      <nav ref={navRef} className="fixed w-full bg-white/90 backdrop-blur-sm z-50 border-b border-slate-200 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
              <h1 className="text-2xl font-bold tracking-tight text-sky-600">JB</h1>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex space-x-8">
                {['Home', 'Work', 'About', 'Contact'].map((item) => (
                  <button
                    key={item}
                    onClick={() => scrollToSection(item.toLowerCase())}
                    className={`text-sm font-medium transition-colors duration-200 ${
                      activeSection === item.toLowerCase() && currentView === 'home'
                        ? 'text-sky-600' 
                        : 'text-slate-600 hover:text-sky-700'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} className="text-slate-600 hover:text-sky-600 p-2">
                {isMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 absolute w-full shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {['Home', 'Work', 'About', 'Contact'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="block w-full text-left px-3 py-2 text-base font-medium text-slate-600 hover:text-sky-700 hover:bg-slate-50 rounded-md"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* CONDITIONAL RENDERING: HOME OR PROJECT VIEW */}
      {currentView === 'home' ? (
        <div className={`transition-all duration-300 ease-in-out transform ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
          {/* Hero Section */}
          <section id="home" className="bg-white pt-32 pb-12 md:pt-40 md:pb-20 scroll-mt-28 border-b border-slate-100">
            <div className="px-4 max-w-6xl mx-auto">
              <div className="max-w-3xl animate-fade-in-up">
                <p className="text-sky-600 font-semibold mb-4 tracking-wide uppercase text-sm">Design Portfolio 2025</p>
                <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                  Hi, I'm <span className="text-sky-600">Jash Bhatt</span>
                </h1>
                <p className="text-xl md:text-2xl text-slate-600 mb-10 leading-relaxed max-w-2xl">
                  I am an aspiring designer who is aiming to go into the technology side of design.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => scrollToSection('work')}
                    className="px-8 py-4 bg-sky-600 text-white rounded-full font-medium hover:bg-sky-700 transition-all flex items-center justify-center gap-2"
                  >
                    View My Work <ArrowRightIcon size={18} />
                  </button>
                  <button 
                    onClick={() => scrollToSection('contact')}
                    className="px-8 py-4 bg-white text-slate-700 border border-slate-300 rounded-full font-medium hover:border-sky-600 hover:text-sky-600 transition-all"
                  >
                    Get in Touch
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mt-16 max-w-2xl">
                  <div className="border-l-2 border-sky-600 pl-4">
                    <div className="text-3xl font-bold text-slate-900">3+</div>
                    <div className="text-sm text-slate-600 mt-1">Featured Projects</div>
                  </div>
                  <div className="border-l-2 border-sky-600 pl-4">
                    <div className="text-3xl font-bold text-slate-900">2+</div>
                    <div className="text-sm text-slate-600 mt-1">Years Experience</div>
                  </div>
                  <div className="border-l-2 border-sky-600 pl-4">
                    <div className="text-3xl font-bold text-slate-900">8+</div>
                    <div className="text-sm text-slate-600 mt-1">Core Skills</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 flex justify-center animate-bounce text-slate-400">
                <ChevronDownIcon size={32} />
              </div>
            </div>
          </section>

          {/* Work Section */}
          <section id="work" className="pt-12 pb-24 px-4 max-w-6xl mx-auto scroll-mt-28">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Selected Projects</h2>
              <div className="h-1 w-20 bg-sky-600 rounded-full"></div>
            </div>

            <div className="space-y-32">
              {projects.map((project, index) => (
                <div 
                  key={project.id} 
                  className="group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-600 focus-visible:ring-offset-4 rounded-2xl"
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
                      <div className={`relative overflow-hidden rounded-2xl ${project.color} border border-slate-200 aspect-[4/3] shadow-sm group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1`}>
                          {!project.content.heroImage.includes('placeholder') ? (
                            <img 
                              src={project.content.heroImage} 
                              alt={project.title} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
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
                             <span className="opacity-0 group-hover:opacity-100 bg-white px-6 py-3 rounded-full font-medium text-slate-900 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                               View Case Study
                             </span>
                          </div>
                      </div>
                    </div>

                    {/* Text Column (5 cols) */}
                    <div className={`md:col-span-5 ${index % 2 === 1 ? 'md:order-1' : ''}`}>
                      <div className="flex items-center gap-3 mb-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${project.badge}`}>
                          {project.timeline}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500 text-sm font-medium">{project.category}</span>
                      </div>
                      
                      <h3 className={`text-3xl md:text-4xl font-bold text-slate-900 mb-4 transition-colors ${project.hoverColor}`}>
                        {project.title}
                      </h3>
                      <p className="text-slate-600 text-lg leading-relaxed mb-6">
                        {project.description}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-8">
                        {project.tags.map((tag, i) => (
                          <span key={i} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600">
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
              ))}
            </div>

            {/* Additional Work Grid */}
            <div className="mt-32 grid grid-cols-1 gap-12">
              
              {/* Photoshop Section */}
              <div className="border border-slate-200 rounded-2xl p-8 bg-white hover:border-sky-300 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-sky-50 rounded-lg flex items-center justify-center">
                    <PhotoIcon size={20} className="text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Photoshop & Animation</h3>
                </div>
                <p className="text-slate-600 mb-6">Explorations in visual design, motion graphics, and digital art created during my academic coursework.</p>
                <div className="grid grid-cols-3 gap-6">
                  {galleryItems.map((item, i) => (
                    <div 
                      key={i} 
                      className={`aspect-square rounded-lg overflow-hidden bg-slate-100 border border-slate-200 transition-all group ${item.type === 'video' ? 'hover:border-slate-300 hover:shadow-md' : 'cursor-pointer hover:border-sky-300 hover:shadow-md'}`}
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
                        <img 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
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
              <div className="border border-slate-200 rounded-2xl p-8 bg-white hover:border-slate-300 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                    <PhotoIcon size={20} className="text-slate-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Nothing Brand Animation</h3>
                </div>
                <p className="text-slate-600 mb-6">A brand motion piece for Nothing (phone company), focused on clean geometry and sound-led pacing.</p>
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
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
              <div className="border border-slate-200 rounded-2xl p-8 bg-white hover:border-sky-300 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                    <img
                      src={`${PUBLIC_URL}/images/Lamborghini.png`}
                      alt="Lamborghini logo"
                      className="w-7 h-7 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Lamborghini Jetski AI</h3>
                </div>
                <p className="text-slate-600 mb-6">Exploring automotive form language and aerodynamics through generative AI and prompt engineering.</p>
                <div className="grid grid-cols-3 gap-6">
                  {aiItems.map((item, i) => (
                    <div 
                      key={i} 
                      className="aspect-square rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group"
                      onClick={() => item.src && setSelectedImage(item.src)}
                    >
                      {item.src ? (
                        <img 
                          src={item.src} 
                          alt={item.alt} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" 
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
              <div className="border border-slate-200 rounded-2xl p-8 bg-white hover:border-slate-300 hover:shadow-lg transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-sky-200">
                    <CameraIcon size={20} className="text-sky-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Photography Gallery</h3>
                </div>
                <p className="text-slate-600 mb-6">A compact collage layout that highlights material studies, sketches, and form exploration.</p>
                <div className="grid gap-6 md:grid-cols-3 md:grid-rows-2 md:auto-rows-fr">
                  {gallerySnippetItems.map((item, i) => {
                    const positionClass = i === 0
                      ? 'md:col-start-1 md:row-start-1'
                      : i === 1
                        ? 'md:col-start-1 md:row-start-2'
                        : i === 2
                          ? 'md:col-start-2 md:row-span-2 md:h-full'
                          : 'md:col-start-3 md:row-span-2 md:h-full';
                    const shapeClass = i < 2 ? 'aspect-[4/3]' : 'h-full';

                    return (
                      <div
                        key={`gallery-snippet-${i}`}
                        className={`${shapeClass} rounded-lg overflow-hidden bg-slate-100 cursor-pointer border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group ${positionClass}`}
                        onClick={() => item.src && setSelectedImage(item.src)}
                      >
                        {item.src ? (
                          <img
                            src={item.src}
                            alt={item.alt}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
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
          <section id="about" className="py-24 px-4 scroll-mt-28 bg-white border-y border-slate-100">
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-16">
                <div>
                  <h2 className="text-5xl font-bold text-slate-900 mb-8">About Me</h2>
                  <div className="space-y-6 text-lg text-slate-700 leading-relaxed">
                    <p>
                      I believe design is about creating meaningful connections between people and technology. My philosophy centers on inclusive immersive intelligence—using technology to bridge gaps in human interaction.
                    </p>
                    <p>
                      Currently studying design, I enjoy tackling diverse problems, from digital interfaces to physical products. I thrive in environments where research drives creativity and human-centered design principles guide every decision.
                    </p>
                  </div>

                  <div className="mt-12">
                    <div className="border-l-2 border-sky-600 pl-4">
                      <div className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Education</div>
                      <div className="space-y-6">
                        {/* Primary / Current */}
                        <div>
                          <h4 className="text-lg font-bold text-slate-900">Bachelor of Design (B.Des)</h4>
                          <p className="text-slate-700 font-medium">FLAME University</p>
                          <p className="text-sm text-sky-600 font-medium mt-1">2023 – 2027</p>
                        </div>
                        
                        {/* Secondary / Past */}
                        <div className="opacity-80">
                          <h4 className="text-base font-medium text-slate-800">Cambridge International Education</h4>
                          <p className="text-sm text-slate-500">VIBGYOR High School, NIBM, Pune</p>
                          <p className="text-xs text-slate-400 mt-0.5">2018 – 2023</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-8">Expertise</h3>
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <BriefcaseIcon size={20} className="text-sky-600" />
                        <h4 className="font-semibold text-slate-900">Design</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Product Design', 'UI/UX Design', 'Industrial Design', 'Design Systems', 'Circuit Design'].map((skill) => (
                          <span key={skill} className="px-3 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 rounded-lg border border-sky-100">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <AwardIcon size={20} className="text-sky-600" />
                        <h4 className="font-semibold text-slate-900">Tools & Tech</h4>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {['Figma', 'Coding', 'Adobe Suite', 'Fusion 360'].map((tool) => (
                          <span key={tool} className="px-3 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 rounded-lg border border-sky-100">
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section id="contact" className="py-24 px-4 max-w-6xl mx-auto text-center scroll-mt-28">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Let's Create Together</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-12">
              I'm currently looking for new opportunities in Product and UI/UX design. Have a project in mind or just want to say hi?
            </p>

            <div className="flex flex-col md:flex-row justify-center gap-6 md:gap-12">
              <a href="mailto:jash.bhatt@flame.edu.in" className="flex items-center justify-center gap-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all group min-w-[280px]">
                <div className="p-3 bg-sky-50 text-sky-600 rounded-full group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <MailIcon size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-medium">Email Me</p>
                  <p className="text-slate-900 font-semibold">jash.bhatt@flame.edu.in</p>
                </div>
              </a>

               <a href="https://linkedin.com/in/jash-bhatt" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-300 transition-all group min-w-[280px]">
                 <div className="p-3 bg-sky-50 text-sky-600 rounded-full group-hover:bg-sky-600 group-hover:text-white transition-colors">
                  <LinkedinIcon size={24} />
                </div>
                <div className="text-left">
                  <p className="text-sm text-slate-500 font-medium">LinkedIn</p>
                  <p className="text-slate-900 font-semibold">/in/jash-bhatt</p>
                </div>
              </a>
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
      <footer className="bg-slate-900 text-slate-400 py-12 text-center">
        <p className="mb-2">© 2025 Jash Bhatt. All Rights Reserved.</p>
        <p className="text-sm">Designed & Developed with React</p>
      </footer>
    </div>
  );
};

export default App;
