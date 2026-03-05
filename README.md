##Inspiration
Environmental responders are the first line of defense against ecological disasters, but they are often overwhelmed by chaotic, fragmented data during a crisis. The mental load of manually sorting through reports, mapping locations, and prioritizing hazards creates a massive bottleneck when every second counts.

We built EcoOps to be the "calm in the storm." 🧘‍♂️ Instead of forcing responders to juggle multiple forms and manual data entry, our platform acts as a digital partner that absorbs the chaos—summarizing reports and generating action plans automatically. Our goal is to reduce the stress on the human behind the screen, allowing them to focus on making life-saving decisions for the enviornment instead of fighting with software. 🌳

What it does
Eco-Ops is a demo command center that bridges the gap between reporting and dispatching:

🎙️ Multimodal Input: Report via voice or text with AI-spoken follow-ups via Fish Audio TTS.

🧠 Live Reasoning: Watch a multi-agent LangGraph pipeline (Impact, Action, Briefing) "think" in real-time.

🗺️ Tactical Map: A 3D Mapbox GL interface that auto-geocodes and pins incidents as they happen.

🚨 Voice Dispatch: One-click deployment with synthetic voice confirmation and response checklists.

How I built it
Frontend: Next.js 16, React 19, and Framer Motion for that "HUD" aesthetic. 🦾

AI Logic: LangGraph state management + GreenPT for ultra-low-latency streaming via NDJSON.

Audio: Web Speech API for recognition; server-side Fish Audio routes for secure TTS. 🔊

Geospatial: Mapbox GL with 3D terrain and standard styling for topographic context.

Challenges we ran into 🌊 Streaming Complexity: Architecting the NDJSON stream to accumulate agent states without blocking the UI.

🖱️ UX Friction: Solving the "Map vs. Page" scroll battle by toggling scrollZoom on hover.

🏗️ Build Ops: Debugging pnpm lockfile conflicts during Vercel deployment to ensure a clean CI/CD pipeline. g

Accomplishments that I'm proud of
First Hackathon where I felt that I had a clear vision of what I wanted to make

🔄 Seamless Loop: Achieved a full Voice-In → AI Reason → Voice-Out feedback loop.

🪄 Transparent AI: Turning the "Black Box" of AI into a visible, step-by-step reasoning log.

🛡️ Architecture: Building a stable, typed state graph that handles complex multi-agent handoffs.

What we learned 🧠 How to master LangGraph reducers and stream node updates to a React frontend.

🏙️ Leveraging Mapbox Standard styles for native 3D terrain and building rendering.

🔒 The importance of server-side API proxying for sensitive TTS and AI keys.

What's next for Eco-Ops 📟 Real Dispatch: Connecting the "Dispatch" button to PagerDuty or CAD systems.

📜 Adding computer vision to detect dangers and threats for faster responses.

📱 Mobile Field Ops: Optimizing the three-column HUD for tablet and mobile use in the field.
