<div align="center">
  <img width="1200" height="auto" alt="SaaSMap Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
  
  # 🌐 SaaSMap M365 Navigator
  ### *Premium Interactive Platform for Microsoft 365 License Optimization*

  [![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Node.js](https://img.shields.io/badge/Node.js-LTS-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
  [![MSAL](https://img.shields.io/badge/Microsoft-Entra%20ID-0078D4?style=for-the-badge&logo=microsoft&logoColor=white)](https://learn.microsoft.com/en-us/entra/identity-platform/msal-overview)
  [![Gemini AI](https://img.shields.io/badge/AI-Grounded%20RAG-FF6B6B?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)
</div>

---

## 🚀 Overview

**SaaSMap M365 Navigator** is a high-performance, enterprise-grade interactive platform designed to demystify the complexities of Microsoft 365 licensing. Built for IT Administrators, MSPs, and Procurement Teams, it provides a visual, data-driven approach to comparing plans, identifying feature overlaps, and optimizing license ROI.

### 🔴 The Problem
*   **Complexity Overload**: Hundreds of features buried in thousands of pages of documentation.
*   **Cost Leakage**: Organizations often overpay for E5 licenses when E3 or Business Premium would suffice.
*   **Static Info**: Comparison tables are often outdated or lack granular "P1 vs P2" depth.

### 🟢 The Solution
*   **Dynamic Stacking**: See how features aggregate across multiple selected plans.
*   **AI Grounding**: Real-time consultant powered by Gemini AI, grounded in official Microsoft service descriptions.
*   **Live Parity**: Automated sync with official documentation ensures 100% data accuracy.

---

## ✨ Key Features

### 🗺️ Interactive Visual Mapping
*   **Multi-License Stacking**: Select multiple licenses (e.g., Business Premium + E5 Security) and see the combined capability map.
*   **Cost Calculator**: Instant pricing estimates in both **USD** and **INR**, supporting Monthly and Annual billing cycles.
*   **Capability Stats**: Real-time counter of unique active features in your selected portfolio.

### 📊 Granular Feature Matrix
*   **Differential View**: Highlights exactly what's different between tiers (e.g., Defender for Endpoint P1 vs P2).
*   **Tiered Visibility**: Search and filter by category (Security, Compliance, Apps, Governance).
*   **Official Linkage**: Every feature maps directly to its official Microsoft documentation page for "Source of Truth" verification.

### 🤖 AI Senior Consultant (RAG)
*   **Grounded Reasoning**: Uses Retrieval-Augmented Generation (RAG) to provide technical advice based on current service descriptions.
*   **Natural Language Queries**: Ask "Which plan includes Anti-Phishing?" or "What's the difference between E3 and E5 governance?"
*   **Source Citations**: AI responses include source links to `discover.microsoft.com` and other official documentation.

### 🔐 Enterprise Admin Portal
*   **Tenant Insights**: Direct visibility into MSAL and Azure AD configurations.
*   **Data Governance**: Manage capability mappings and feature descriptions directly from a secure dashboard.
*   **Identity Sync**: Experimental scraping engine to keep the local database in parity with Microsoft's evolving landscape.

---

## 🛠️ Technical Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Context API, Custom Glassmorphism CSS (Vanilla) |
| **Backend** | Node.js, Express.js, Groq API (Llama-3.3-70b) |
| **Database** | MongoDB / Mongoose |
| **Authentication** | MSAL (@azure/msal-browser) / Entra ID |
| **AI Engine** | Llama-3 (Primary via Groq), Google Gemini (Secondary/Fallback) |
| **Automation** | Concurrently, Vercel (Deployment) |

---

## ⚙️ Installation & Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18 or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local or Atlas)
*   Microsoft Entra ID (Azure AD) App Registration (for Authentication)

### Step-by-Step
1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/saasmap-m365-navigator.git
    cd saasmap-m365-navigator
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    # Also install server dependencies if separate (currently unified)
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory:
    ```env
    MONGO_URI=your_mongodb_connection_string
    GEMINI_API_KEY=your_gemini_api_key
    CLIENT_ID=your_azure_client_id
    TENANT_ID=your_azure_tenant_id
    ```

4.  **Run the Application**
    ```bash
    # Runs both Frontend (Vite) and Backend (Node) concurrently
    npm run start
    ```

---

## 📐 Architecture

The project follows a modern **MERN-adjacent** architecture with a heavy focus on security and AI integration.

*   **Frontend**: A Single Page Application (SPA) using React, styled with a custom-engineered Glassmorphism library for a "Premium" aesthetic.
*   **Backend**: A RESTful API built with Express, handling data persistence and the AI orchestration layer.
*   **AI Layer**: Connects to Gemini via `@google/genai`, utilizing custom prompts and retrieved knowledge to provide grounded answers.
*   **Auth Layer**: Leverages Microsoft MSAL for secure, multi-tenant authentication, allowing admins to log in with their corporate credentials.

---

## 🤝 Contributing

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <p>Built with ❤️ for the Microsoft 365 Community</p>
  <p>
    <a href="https://github.com/your-username/saasmap-m365-navigator/issues">Report Bug</a> · 
    <a href="https://github.com/your-username/saasmap-m365-navigator/issues">Request Feature</a>
  </p>
</div>
