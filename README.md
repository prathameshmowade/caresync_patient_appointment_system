# CareSync — Patient Appointment & Composite Resource Scheduling System

A modern, responsive, production-ready healthcare scheduling platform built with **Next.js 14 (App Router)**, **Tailwind CSS**, and **Google Stitch**.

---

## 🌟 Key Features

### 1. Composite Resource Scheduling Engine
Solves the clinical "Room & Equipment Blind Spot" by transitioning from single-provider locking to compound resource intersection math:
$$\text{Availability} = \text{Provider}_{\text{free}} \cap \text{Room}_{\text{free}} \cap \text{Equipment}_{\text{free}} \cap \text{Staff}_{\text{free}}$$

- **Collision Prevention**: Prevents scheduling delays when exam rooms (Exam Room 1, 2, Suite 3A, Procedure Room 1) or diagnostic equipment (12-Lead ECG, Ultrasound) are occupied by other clinical staff.
- **Real-Time Bottleneck Diagnostics**: Automatically flags room collisions and machinery conflicts directly on time slot buttons.
- **Atomic Composite Hold Lease**: Temporarily secures the complete compound resource bundle `(Provider, Room, Equipment, Staff)` with live countdown mutex timer (4m 48s).

### 2. Google Stitch Patient Portal Login
- Integrated official Stitch screen: **CareSync - Patient Portal Login** (`/login`).
- Asymmetric authentication grid with:
  - Role switcher: **Patient Portal** vs. **Doctor / Staff** (updates institutional credentials & MRN labels).
  - Medical Record Number (MRN) support with helper dialog.
  - Biometric authentication (Passkey / Face ID) and Federated Epic MyChart SSO.
  - Clinical trust bento grid (24/7 Scheduling, Care Team Chat, Instant Lab Results, Coverage Verification).

### 3. Indian Rupee (₹) Pricing
- All clinical service copays and consultation rates are formatted in Indian Rupees (**₹500** for General Pediatric Consultation, **₹1,200** for Cardiac Eval + ECG, **₹2,500** for Diagnostic Ultrasound).

### 4. Interactive 3-Column Booking Workflow
- **Left Column**: Dr. Elizabeth Evans, MD verified profile card, star rating, clinic location, spoken languages, and average wait time metric.
- **Center Column**: Service modality selector, 5-day date picker (Mon Nov 9 – Fri Nov 13), Morning (9:00 AM – 12:00 PM) and Afternoon (1:30 PM – 5:00 PM) slot matrix with assigned room badges.
- **Right Column**: Sticky booking summary with multi-resource lock verification, insurance eligibility verification, and cancellation policy.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / yarn / pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/prathameshmowade/caresync_patient_appointment_system.git

# Enter the directory
cd caresync_patient_appointment_system

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## 🛠️ Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **Styling**: Tailwind CSS, Material 3 Design Tokens
- **Icons & Fonts**: Google Material Symbols Outlined, Plus Jakarta Sans, Manrope, Lucide React
- **Design Origin**: Google Stitch (`projects/9208257619631487373`)
