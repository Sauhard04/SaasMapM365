const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } = require('docx');
const fs = require('fs');
const path = require('path');

const slides = [
    {
        title: "SaaSMap M365 Navigator - Project Presentation",
        content: [
            "Objective: A premium, interactive platform for Microsoft 365 license comparison, optimization, and technical guidance.",
            "Target Audience: IT Administrators, Procurement Teams, and MSPs."
        ]
    },
    {
        title: "The Problem",
        content: [
            "Licensing Complexity: M365 has hundreds of features spread across Business, Enterprise, and Frontline plans.",
            "Cost Inefficiency: Organizations often overpay for licenses (e.g., buying E5 for features available in lower tiers).",
            "Information Overload: Official documentation is dense and hard to compare side-by-side."
        ]
    },
    {
        title: "Core Solution & Value Proposition",
        content: [
            "Visual Mapping: High-level overview of plan differences.",
            "Granular Matrix: Feature-by-feature comparison with deep links to official documentation.",
            "AI-Powered Advisor: A context-aware chatbot grounded in real-time Microsoft 'learn' documentation.",
            "Live Sync: Automated data synchronization with Microsoft's official service descriptions."
        ]
    },
    {
        title: "Key Functionalities - Feature Matrix",
        content: [
            "Intelligent Filtering: Filter by Category (Security, Compliance, Apps, etc.) or Search.",
            "Differential View: Highlight only what's different between selected plans.",
            "Tiered Visibility: Displays features based on specific tiers (e.g., Defender P1 vs P2).",
            "Export Options: Generation of specialized CSV and PDF reports for stakeholder review."
        ]
    },
    {
        title: "Key Functionalities - AI Senior Consultant",
        content: [
            "Nature: Grounded AI (RAG - Retrieval-Augmented Generation).",
            "Capabilities: Explains qualitative differences (e.g., 'Why choose E5 over E3?').",
            "Source Truth: Prioritizes learn.microsoft.com and local database context.",
            "UI Features: Markdown support, hyperlink generation, and session reset."
        ]
    },
    {
        title: "Key Functionalities - Admin Portal",
        content: [
            "Tenant Management: Real-time visibility into MSAL/Azure AD configurations.",
            "Data Core: Manage plans, features, and capabilities directly.",
            "Security & Auth: MSAL integration for secure multi-tenant access.",
            "Sync Control: Automated scraping of Microsoft Comparison pages."
        ]
    },
    {
        title: "Technical Stack (The Architecture)",
        content: [
            "Frontend: React 18, Context API, Vanilla CSS (Premium Glassmorphism).",
            "Backend: Node.js & Express, Groq SDK (Llama-3-70b).",
            "Database & Auth: MSAL (Microsoft Authentication Library) for Azure AD."
        ]
    },
    {
        title: "Use Cases",
        content: [
            "License Optimization: Analyzing if a user moving from 'Business Premium' to 'E3' actually gains value.",
            "Sales Enablement: MSPs using the tool live with clients to justify costs.",
            "Technical Audit: Quickly finding official MS doc links for specific capabilities."
        ]
    },
    {
        title: "Design Philosophy",
        content: [
            "Premium Aesthetics: Vibrant gradients, smooth transitions, glassmorphism.",
            "Interactivity: Micro-animations, responsive navigation, hover effects.",
            "Consistency: Standardized buttons, Outfit/Inter typography, layout grids."
        ]
    },
    {
        title: "Conclusion",
        content: [
            "Project Delivered: Full mobile responsiveness, AI Consultant, Exporting and Granular Matrix.",
            "Outcome: A simplified, interactive, and premium M365 licensing experience."
        ]
    }
];

const docChildren = [];

slides.forEach(slide => {
    docChildren.push(new Paragraph({
        text: slide.title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
    }));

    slide.content.forEach(bullet => {
        docChildren.push(new Paragraph({
            text: bullet,
            bullet: { level: 0 },
            spacing: { after: 120 },
        }));
    });

    docChildren.push(new Paragraph({
        text: "",
        spacing: { after: 400 },
    }));
});

const doc = new Document({
    sections: [{
        properties: {},
        children: docChildren,
    }],
});

Packer.toBuffer(doc).then((buffer) => {
    fs.writeFileSync("SAASMAP_PRESENTATION.docx", buffer);
    console.log("Presentation generated: SAASMAP_PRESENTATION.docx");
});
