### **Project Blueprint: Offerspy Platform**

**Document Version:** 1.0  
**Date:** July 21, 2025  
**Author:** System Architect

---

### **1. Project Overview**

**Offerspy** is a community-driven platform designed to crowdsource, validate, and catalogue promotional offers. Its mission is to create a reliable, real-time database of verified consumer deals while rewarding contributors for their efforts.

**Core Functionalities:**
*   **User Contribution:** Registered users can submit details of promotional offers they find.
*   **Community Verification:** The platform leverages its user base to validate the authenticity and accuracy of submitted offers through a voting and feedback mechanism.
*   **Gamification & Rewards:** Users earn points and build a `trustScore` for successful submissions and verifications, creating an engaging and reliable ecosystem.
*   **Data Monetization:** Verified and structured offer data is made available to registered buyers (e.g., market research firms, businesses) via a dedicated API.
*   **AI-Powered Assistance:** An optional extension uses AI to perform initial checks on submissions, such as extracting text from images (OCR) to pre-fill forms and flag potential duplicates.

### **2. System Architecture**

The platform is architected using a modern, scalable stack that separates concerns between the user-facing application, the core backend logic, and specialized AI processing. This hybrid model combines the robustness of a traditional MERN stack with the flexibility of a dedicated Python microservice.

**Component Breakdown:**

*   **Frontend (Client):** A **React** single-page application (SPA) that provides a dynamic and responsive user interface. It will handle all user interactions, data presentation, and communication with the backend API.
*   **Backend (Server):** A **Node.js** application running the **Express.js** framework. This server acts as the central hub, exposing a RESTful API to the frontend. Its responsibilities include:
    *   User authentication and authorization.
    *   Business logic for offer submission, verification, and gamification.
    *   CRUD operations with the MongoDB database.
    *   Serving as a gateway for requests to the AI microservice.
*   **Database:** A **MongoDB** NoSQL database. Its schema-less nature is ideal for this project, allowing for flexibility as data structures evolve. It will store all persistent data, including users, offers, and logs.
*   **AI Microservice:** A lightweight **Python** service, likely built with **FastAPI**. This service operates independently and handles computationally intensive AI tasks. Its initial purpose is to:
    *   Receive image uploads from the Node.js backend.
    *   Perform Optical Character Recognition (OCR) to extract text.
    *   Return structured data to the backend to assist in the submission process.

**Architectural Interaction Flow:**



> **Architect's Note:** This decoupled architecture ensures that the core application remains performant. The AI microservice can be scaled, updated, or even temporarily disabled without affecting the main platform's availability. Communication between the Node.js backend and the Python microservice will occur via internal HTTP requests.

---

### **3. Folder Structure**

The project will be organized into a monorepo structure to facilitate development and deployment.

```
offerspy/
├── backend/
│   ├── config/
│   │   └── db.js             # MongoDB connection setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── offerController.js
│   │   ├── userController.js
│   │   └── buyerController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js   # JWT verification
│   │   └── errorMiddleware.js  # Central error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── OfferSubmission.js
│   │   ├── RewardLog.js
│   │   ├── Buyer.js
│   │   └── VerifiedOffer.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── offerRoutes.js
│   │   ├── userRoutes.js
│   │   └── buyerRoutes.js
│   ├── utils/
│   │   └── tokenGenerator.js
│   ├── .env
│   ├── package.json
│   └── server.js             # Main Express server entry point
│
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                # Axios or Fetch wrappers
│   │   │   └── index.js
│   │   ├── assets/
│   │   │   └── images/
│   │   ├── components/         # Reusable UI components (Button, Input, Card)
│   │   ├── context/            # React Context for state management (e.g., AuthContext)
│   │   ├── hooks/              # Custom hooks (e.g., useAuth)
│   │   ├── pages/              # Page components (Home, Login, Dashboard)
│   │   ├── styles/             # Global CSS, themes
│   │   ├── App.js
│   │   ├── index.js
│   │   └── setupProxy.js       # Proxy for API requests in development
│   └── package.json
│
├── ai_service/
│   ├── core/
│   │   └── ocr.py              # OCR logic using Tesseract/OpenCV
│   ├── tests/
│   │   └── test_ocr.py
│   ├── main.py                 # FastAPI application entry point
│   └── requirements.txt
│
└── README.md
```

---

### **4. Database Schema Design**

The MongoDB database will consist of the following collections.

#### **`User` Collection**
Stores information about registered contributors.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier for the user (auto-generated). |
| `username` | String | Unique, publicly visible name for the user. Required. |
| `email` | String | Unique email address for login and notifications. Required. |
| `passwordHash` | String | Hashed version of the user's password. Required. |
| `trustScore` | Number | A dynamic score (0-100) to evaluate user reliability. Defaults to 50. |
| `points` | Number | Gamification points earned by the user. Defaults to 0. |
| `createdAt` | Date | Timestamp of account creation. Defaults to `Date.now`. |
| `updatedAt` | Date | Timestamp of the last profile update. |

#### **`OfferSubmission` Collection**
Stores raw offer data submitted by users, awaiting verification.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier for the submission (auto-generated). |
| `submittedBy` | ObjectId | Reference to the `User` who submitted the offer. Indexed. |
| `offerTitle` | String | A concise title for the offer. Required. |
| `description` | String | Detailed description, terms, and conditions. Required. |
| `brand` | String | The brand or store associated with the offer. Indexed. |
| `category` | String | Category of the offer (e.g., 'Electronics', 'Groceries'). Indexed. |
| `imageUrl` | String | Optional URL to an image of the offer (e.g., a photo of a flyer). |
| `status` | String | Current state: 'pending', 'verified', 'rejected'. Defaults to 'pending'. Indexed. |
| `upvotes` | Number | Count of positive verification votes. Defaults to 0. |
| `downvotes` | Number | Count of negative verification votes. Defaults to 0. |
| `verificationAttempts`| Number | Total number of users who have voted on this offer. Defaults to 0. |
| `createdAt` | Date | Timestamp of the submission. Defaults to `Date.now`. |

#### **`RewardLog` Collection**
A ledger of all point transactions for auditing and user history.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier for the log entry (auto-generated). |
| `user` | ObjectId | Reference to the `User` associated with the transaction. Indexed. |
| `type` | String | Reason for the transaction: 'submission', 'verification_success', 'redemption'. |
| `pointsChange` | Number | The number of points awarded or deducted (can be positive or negative). |
| `relatedOffer` | ObjectId | Optional reference to the `OfferSubmission` that triggered the change. |
| `timestamp` | Date | Timestamp of the transaction. Defaults to `Date.now`. |

#### **`Buyer` Collection**
Stores information about clients who can purchase access to verified data.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier for the buyer (auto-generated). |
| `companyName`| String | The name of the buyer's organization. Required. |
| `contactEmail`| String | The primary contact email for the buyer. Unique and required. |
| `apiKey` | String | A unique, system-generated key for API access. |
| `accessLevel`| String | Defines what data the buyer can access (e.g., 'basic', 'premium'). |
| `createdAt` | Date | Timestamp of buyer registration. Defaults to `Date.now`. |

#### **`VerifiedOffer` Collection**
Stores offers that have successfully passed community validation. This is the "clean" dataset for buyers.

| Field Name | Data Type | Description |
| :--- | :--- | :--- |
| `_id` | ObjectId | Unique identifier for the verified offer (auto-generated). |
| `originalSubmission`| ObjectId | Reference to the source `OfferSubmission`. Indexed. |
| `verifiedBy` | [ObjectId] | An array of `User` IDs who contributed to successful verification. |
| `finalData` | Object | The clean, structured data of the offer (title, brand, description, etc.). |
| `verificationTimestamp`| Date | Timestamp when the offer achieved 'verified' status. |
| `purchaseCount`| Number | Number of times this offer's data has been accessed by buyers. |

---

### **5. Phase-by-Phase Implementation Plan**

This project will be developed in six distinct phases to ensure a structured and manageable workflow.

1.  **Phase 1: Backend Setup & Core API**
    *   **Goal:** Establish the server-side foundation.
    *   **Key Tasks:**
        *   Initialize Node.js/Express project.
        *   Set up MongoDB connection and define all Mongoose schemas.
        *   Implement user registration and JWT-based authentication endpoints.
        *   Create placeholder CRUD routes for offers.
        *   Configure environment variables (`.env`).

2.  **Phase 2: Frontend Foundation & User Authentication**
    *   **Goal:** Build the client-side application and connect user management.
    *   **Key Tasks:**
        *   Set up React project using Create React App or Vite.
        *   Develop core layout and navigation components.
        *   Create pages and forms for user registration and login.
        *   Implement client-side state management for authentication (e.g., React Context).
        *   Connect frontend forms to the backend authentication API.

3.  **Phase 3: Core Feature - Offer Submission & Display**
    *   **Goal:** Enable the primary user workflow of submitting and viewing offers.
    *   **Key Tasks:**
        *   Build the "Submit Offer" form in React.
        *   Implement the backend logic to handle offer creation.
        *   Develop React components to display lists of offers (e.g., on a dashboard).
        *   Create a detailed view page for a single offer.

4.  **Phase 4: Community Verification & Gamification**
    *   **Goal:** Implement the systems that drive community engagement and data quality.
    *   **Key Tasks:**
        *   Add upvote/downvote functionality to the offer display components.
        *   Create backend endpoints to process votes and update `OfferSubmission` status.
        *   Develop the logic for calculating and updating user `trustScore` and `points`.
        *   Create the `RewardLog` entries for each significant action.
        *   Implement the process to move a submission to the `VerifiedOffer` collection upon successful validation.

5.  **Phase 5: Buyer Portal & Data Monetization**
    *   **Goal:** Build the interface for data consumers.
    *   **Key Tasks:**
        *   Develop secure API endpoints for buyers to fetch `VerifiedOffer` data, protected by API keys.
        *   Create a simple admin or buyer-facing dashboard to manage API keys.
        *   Implement rate limiting and access controls based on the `Buyer`'s `accessLevel`.

6.  **Phase 6: AI Verification Microservice (Optional Extension)**
    *   **Goal:** Enhance the submission process with AI-powered assistance.
    *   **Key Tasks:**
        *   Set up the Python/FastAPI project.
        *   Implement OCR logic to extract text from an uploaded image.
        *   Create an API endpoint in the Python service that accepts an image and returns JSON with extracted text.
        *   Integrate this service: The Node.js backend will call the Python API when an image is uploaded with a new offer submission.
        *   Use the returned data to pre-populate fields on the frontend submission form, improving user experience.