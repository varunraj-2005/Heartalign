<img src="https://raw.githubusercontent.com/varunraj-2005/Heartalign/main/assets/heartbeat.svg" width="40" align="left" alt="beating heart"/>

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:E63946,100:FFFFFF&height=210&section=header&text=Heartalign&fontSize=54&fontColor=FFFFFF&animation=fadeIn&fontAlignY=38&desc=Where%20Compatibility%20Meets%20Code&descAlignY=58&descSize=18&descColor=FFFFFF" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&duration=3000&pause=800&color=E63946&center=true&vCenter=true&width=650&lines=Weighted+Compatibility+Scoring+Engine;AI-Powered+Relationship+Insights;Built+for+Couples%2C+Powered+by+Code+%F0%9F%92%96" alt="Typing SVG" />

<br/>

[![Live Demo](https://img.shields.io/badge/💖_TRY_IT_OUT-E63946?style=for-the-badge&labelColor=FFFFFF)](https://github.com/varunraj-2005/Heartalign)
[![Stars](https://img.shields.io/github/stars/varunraj-2005/Heartalign?style=for-the-badge&labelColor=FFFFFF&color=E63946)](https://github.com/varunraj-2005/Heartalign/stargazers)
[![Forks](https://img.shields.io/github/forks/varunraj-2005/Heartalign?style=for-the-badge&labelColor=FFFFFF&color=E63946)](https://github.com/varunraj-2005/Heartalign/network/members)
[![License](https://img.shields.io/badge/LICENSE-ISC-FFFFFF?style=for-the-badge&labelColor=E63946)](#-license)

<br/>

<img src="https://img.shields.io/badge/TypeScript-FFFFFF?style=for-the-badge&logo=typescript&logoColor=E63946"/>
<img src="https://img.shields.io/badge/Node.js-FFFFFF?style=for-the-badge&logo=node.js&logoColor=E63946"/>
<img src="https://img.shields.io/badge/Express-FFFFFF?style=for-the-badge&logo=express&logoColor=E63946"/>
<img src="https://img.shields.io/badge/Groq_AI-FFFFFF?style=for-the-badge&logo=openai&logoColor=E63946"/>
<img src="https://img.shields.io/badge/LowDB-FFFFFF?style=for-the-badge&logo=json&logoColor=E63946"/>

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="4">

## 📖 Table of Contents

<div align="center">

| [💖 Overview](#-overview) | [✨ Features](#-features) | [🏗️ Architecture](#️-architecture) | [🔄 Workflow](#-session--quiz-workflow) |
|:---:|:---:|:---:|:---:|
| **[📊 Scoring Matrix](#-scoring-matrix--weights)** | **[📡 API Reference](#-api-endpoints-reference)** | **[🚀 Getting Started](#-getting-started)** | **[🔐 Env Variables](#-environment-variables)** |
| **[📁 Project Structure](#-project-structure)** | **[🧪 Testing](#-testing)** | **[❓ FAQ](#-faq)** | **[📬 Contact](#-contact)** |

</div>

<img src="https://user-images.githubusercontent.com/74038190/212284100-561aa473-3905-4a80-b561-0d28506553ee.gif" width="100%" height="4">

## 💖 Overview

**Heartalign** is a full-stack, AI-assisted **compatibility engine** built for couples. Two partners take a synced, multi-category quiz — Heartalign runs the answers through a **weighted mathematical scoring model**, flags friction points, and (optionally) asks **Groq AI** to write a personalized relationship summary.

It's not a "count the matches" quiz. It's a real scoring pipeline:

> 🔍 Category weighting → 📐 partial-match matrices → 🚩 conflict-pair detection → 🤖 AI synthesis (with a rule-based fallback if no API key is set)

<div align="center">
<img src="https://img.shields.io/badge/Status-Active_Development-E63946?style=flat-square&labelColor=FFFFFF"/>
<img src="https://img.shields.io/badge/Built_With-TypeScript_%2B_Express-E63946?style=flat-square&labelColor=FFFFFF"/>
</div>

<br/>

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 💑 For Couples
- 🔗 Instant invite-code session creation (`HEART-XXXX`)
- ⏱️ Real-time "has my partner finished?" polling
- 📝 Multi-category, mixed-format quiz (scale + multiple choice)
- 🗂️ Side-by-side reflection answers to spark conversation
- 📈 Historical compatibility tracking per couple

</td>
<td width="50%" valign="top">

### 🧠 Under the Hood
- ⚖️ 6-category **weighted scoring engine**
- 🧮 Partial-match matrices for nuanced answers
- 🚩 Complementary conflict-pair detection
- 🤖 Groq AI-generated relationship insights
- 🛟 Automatic rule-based fallback if no API key

</td>
</tr>
</table>

### 🎨 Interface
- Glassmorphism UI with a **liquid SVG heart loader**
- Animated progress bar + floating background particles
- Fully responsive across desktop and mobile

<br/>

## 🏗️ Architecture

```mermaid
flowchart LR
    A["💻 Frontend<br/>HTML / CSS / Vanilla JS"] -->|REST| B["🚀 Express API Gateway"]
    B --> C["🌱 Question Bank<br/>Seed Data"]
    B --> D[("🗄️ LowDB<br/>heartalign.db.json")]
    B --> E["⚖️ Scoring Engine"]
    E --> F["🧮 Weighted Math +<br/>Partial Matrix"]
    E --> G["🚩 Conflict Flag<br/>Detector"]
    E --> H["🤖 Groq AI SDK /<br/>Fallback Synthesizer"]
    F & G & H --> I["📊 Results JSON +<br/>Insights Dashboard"]

    style A fill:#FFFFFF,stroke:#E63946,color:#E63946
    style B fill:#E63946,stroke:#E63946,color:#FFFFFF
    style C fill:#FFFFFF,stroke:#E63946,color:#E63946
    style D fill:#FFFFFF,stroke:#E63946,color:#E63946
    style E fill:#E63946,stroke:#E63946,color:#FFFFFF
    style F fill:#FFFFFF,stroke:#E63946,color:#E63946
    style G fill:#FFFFFF,stroke:#E63946,color:#E63946
    style H fill:#FFFFFF,stroke:#E63946,color:#E63946
    style I fill:#E63946,stroke:#E63946,color:#FFFFFF
```

<br/>

## 🔄 Session & Quiz Workflow

```mermaid
sequenceDiagram
    autonumber
    actor P1 as 💑 Partner 1
    actor P2 as 💑 Partner 2
    participant API as Heartalign API
    participant Engine as Scoring & AI Engine
    participant DB as Database

    P1->>API: POST /api/sessions (partner1_name)
    API-->>P1: Invite Code (HEART-XXXX) + share_url
    P2->>API: POST /api/sessions/join (invite_code)
    API-->>P2: Joined session ✅
    P1->>API: POST /api/sessions/:id/answers
    P2->>API: POST /api/sessions/:id/answers
    API->>Engine: Compute weighted score + conflict flags
    Engine->>DB: Save score result
    P1 & P2->>API: GET /api/sessions/:id/results
    API-->>P1 & P2: 💖 Full Compatibility Report
```

<br/>

## 📊 Scoring Matrix & Weights

| Category | Weight | Focus Area |
|---|:---:|---|
| 🏛 **Values & Life Goals** | `25%` | Marriage, kids, finances, career alignment |
| 🤝 **Trust & Communication** | `25%` | Transparency, privacy, check-in frequency |
| ⚡ **Conflict Style** | `15%` | Cooling periods, apology styles, confrontation |
| 💞 **Intimacy & Affection** | `15%` | Love languages, PDA comfort, affection frequency |
| 🏡 **Daily Life & Habits** | `10%` | Sleep schedules, chores, weekend routines |
| 🍕 **Fun & Trivia** | `10%` | Date nights, food, travel style |

**How the math works:**

- **Scale (1–5) questions:** `Score = max(0, 100 - |V1 - V2| × 25)` — a difference of 0 = 100% match, a difference of 4 = 0% match.
- **Multiple-choice questions:** exact match = 100%; partial matches use a predefined lookup matrix; certain answer pairs trigger a flagged **conflict pair**.
- **Open-ended reflections:** unscored, shown side-by-side to spark discussion.

<br/>

## 📡 API Endpoints Reference

<details>
<summary><b>🔍 Click to expand full endpoint list</b></summary>

<br/>

**Health Check**
```
GET /api/health
```

**Question Bank**
```
GET /api/questions
GET /api/questions?category=Conflict%20Style
```

**Sessions**
```
POST /api/sessions                      # Create session (Partner 1)
GET  /api/sessions/code/:code           # Look up by invite code
POST /api/sessions/join                 # Join session (Partner 2)
GET  /api/sessions/:id/status           # Real-time completion status
POST /api/sessions/:id/answers          # Submit quiz answers
GET  /api/sessions/:id/results          # Get full compatibility report
GET  /api/couples/:coupleId/history     # Get couple's quiz history
```

**Example — create a session:**
```json
{
  "partner1_name": "Alex"
}
```
```json
{
  "success": true,
  "session": {
    "session_id": "ses_9b1deb4d",
    "invite_code": "HEART-8K92",
    "status": "waiting_for_partner2",
    "share_url": "http://localhost:505/join/HEART-8K92"
  }
}
```

</details>

<br/>

## 🚀 Getting Started

New to Git? Just copy each command below into your terminal, one at a time.

### ✅ Prerequisites

| Requirement | Version |
|---|---|
| Node.js | `v18.0.0+` |
| npm | `v9.0.0+` |

### 1️⃣ Clone & install

```bash
git clone https://github.com/varunraj-2005/Heartalign.git
cd Heartalign/backend
npm install
```

### 2️⃣ Configure environment

Create a `.env` file inside `backend/` (see [Environment Variables](#-environment-variables)).

### 3️⃣ Run the dev server

```bash
npm run dev
```

You should see:

```
======================================================
💖 Heartalign Backend API is running on port 505
🌍 Interactive API Tester UI: http://localhost:505
======================================================
```

Open **http://localhost:505** to launch the app.

<br/>

## 🔐 Environment Variables

| Variable | Type | Default | Required? | Description |
|---|---|---|:---:|---|
| `PORT` | `number` | `505` | No | Port the Express server listens on |
| `GROQ_API_KEY` | `string` | `undefined` | Optional | Enables Groq AI relationship insights — falls back to rule-based insights if omitted |

<br/>

## 📁 Project Structure

```
Heartalign/
├── backend/
│   ├── src/
│   │   ├── data/questions.seed.ts       # Question bank across 6 pillars
│   │   ├── db/database.ts               # LowDB persistence layer
│   │   ├── routes/                      # question & session routes
│   │   ├── services/scoringEngine.ts    # Weighted math + AI synthesis
│   │   ├── types/index.ts               # TS interfaces & weight mapping
│   │   └── server.ts                    # Express entry point
│   ├── tests/scoring.test.ts
│   ├── heartalign.db.json
│   └── package.json
├── frontend/
│   ├── index.html                       # Glassmorphic UI + liquid heart loader
│   ├── style.css
│   └── app.js
├── assets/
│   └── heartbeat.svg                    # Animated heart used in this README
└── README.md
```

<br/>

## 🧪 Testing

```bash
cd backend
npm test
```

```
✔ Scale Scoring (0-diff=100, 4-diff=0)         → PASSED
✔ Multiple Choice Match & Partial Matrix        → PASSED
✔ Conflict Flag Pair Trigger                    → PASSED
✔ Full Compatibility Calculation & Weighting    → PASSED
```

<br/>

## ❓ FAQ

**How is privacy handled?**
Answers are matched server-side once both partners submit, then shown side-by-side to spark conversation.

**Can partners take the quiz at different times?**
Yes — session state persists. Partner 2 can join and finish whenever they're ready.

**What if I skip the Groq API key?**
No problem — Heartalign automatically switches to built-in rule-based insights.

<br/>

## 📜 License

Licensed under the **ISC License**.

<br/>

## 📬 Contact

<div align="center">

**Varun Raj**

[![GitHub](https://img.shields.io/badge/GitHub-E63946?style=for-the-badge&logo=github&logoColor=FFFFFF)](https://github.com/varunraj-2005)

<br/>

### 💖 If Heartalign resonated with you, drop it a star!

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:FFFFFF,100:E63946&height=120&section=footer" width="100%"/>

</div>
