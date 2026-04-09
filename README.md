# Deep Read 
**The Personal Learning Environment for Focused, Persistent Reading.**

Deep Read is a production-grade web application designed to eliminate "Reading Fatigue." Traditional PDF readers and browsers treat documents as static images, forgetting your place and cluttering your focus. Deep Read transforms PDFs into a customizable, semantic reading experience that remembers exactly where you left off.

![Deep Read Logo](/public/logo.png)

## The Problem
Standard document tools are built for viewing, not learning. 
- **Loss of Context:** Closing a tab often means losing your scroll position and mental momentum.
- **Cognitive Overload:** Fixed layouts, small fonts, and cluttered headers/footers distract the brain.
- **Tool Friction:** Switching between a reader and a note-taking app breaks the "Flow State."

## Core Features

### 1. Hybrid Rendering Engine
- **Focus View (Extracted):** A reflowable, text-only layer allowing full customization of typography, spacing, and colors.
- **Reference View (Source):** A high-fidelity PDF toggle to verify complex formulas, tables, or diagrams against the original source.

### 2. Cognitive Load Management
- **Progressive Disclosure:** Instead of a daunting 500-page scrollbar, content is revealed chapter-by-chapter.
- **Auto-Dimming:** A "Spotlight" mode that dims surrounding text to highlight the paragraph you are currently processing.
- **Bionic Reading Support:** Optional visual anchors to facilitate faster pattern recognition and reduced eye strain.

### 3. Smart Persistence
- **Zero-Scrolled Resume:** Deep Read tracks your "Semantic Anchor" (the exact paragraph) rather than just a page number.
- **Local-First Storage:** Uses IndexedDB (Dexie.js) to store heavy PDF blobs locally, while syncing progress and notes to the cloud.

### 4. CropCapture (Coming Soon)
- Extract and "pin" complex tables or diagrams from the PDF to a persistent side-gallery so they stay in view while you read the text.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** MongoDB (via Mongoose) for global sync; IndexedDB for local persistence.
- **PDF Engine:** PDF.js (Mozilla)
- **Auth:** NextAuth.js

## Getting Started

### Prerequisites
- Node.js 20+
- A MongoDB Atlas connection string.

### Setup
1. **Clone the repository:**
   ```bash
   git clone [https://github.com/004Ongoro/deep-read.git](https://github.com/004Ongoro/deep-read.git)
   cd deep-read