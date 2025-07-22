# Offerspy - Final Project Deliverable

Offerspy is a community-driven platform designed to crowdsource, validate, and catalogue promotional offers in real-time. Our mission is to build a reliable, user-verified database of consumer deals, rewarding contributors for their accuracy and effort. The system tackles the problem of ephemeral and unverified deals by creating a trustworthy ecosystem where users submit offers, an AI provides an initial quality check, and administrators give the final approval, building a clean dataset for consumers and market analysts.

---

### **Core Features**

*   **User Offer Submission:** Registered users can submit promotional offers they find by uploading an image.
*   **AI-Powered Verification:** An automated pipeline pre-processes every submission to ensure quality and prevent fraud. This includes:
    *   Blurriness detection to reject low-quality images.
    *   Perceptual hashing to detect duplicate submissions.
    *   Optical Character Recognition (OCR) to extract offer text.
    *   EXIF data analysis for recency and location verification.
*   **Admin Management Panel:** A clean, intuitive dashboard for administrators to review pending and flagged submissions, view AI analysis, and make the final verification decision (Approve/Reject).
*   **User Trust & Reward System:** A gamified system that adjusts a user's `trustScore` and awards points based on the quality of their submissions, encouraging high-quality contributions.
*   **Secure API:** A RESTful API serves as the backbone for all system interactions, from user submissions to admin actions.

---

### **System Architecture & Tech Stack**

Offerspy is built on a modular, microservice-oriented architecture that separates concerns for scalability and maintainability.

*   **Backend API (Node.js):** The central hub that manages business logic, user data, offer submissions, and communication with other services.
*   **AI Verification Module (Python):** A dedicated microservice for computationally intensive image analysis tasks. It receives an image from the backend and returns a JSON analysis.
*   **Admin Panel (Frontend):** A standalone vanilla JS and Tailwind CSS application for internal management and offer verification.



| Component             | Technology / Library                                                              | Purpose                                                     |
| :-------------------- | :-------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| **Backend**           | Node.js, Express.js                                                               | Core application server, REST API                           |
| **Database**          | MongoDB, Mongoose                                                                 | NoSQL data storage for users, offers, and logs              |
| **File Handling**     | `multer`                                                                          | Middleware for handling `multipart/form-data` (image uploads) |
| **Image Metadata**    | `exif-parser`                                                                     | Extracting GPS and timestamp data from image EXIF           |
| **AI Module**         | Python 3                                                                          | Image processing microservice                               |
| **Image Processing**  | OpenCV, Pillow                                                                    | Image manipulation, blur detection                          |
| **Text Recognition**  | Tesseract OCR, `pytesseract`                                                      | Extracting text from images                                 |
| **Duplicate Detection** | `imagehash`                                                                     | Generating perceptual hashes to find similar images         |
| **Admin Panel**       | HTML5, CSS3, JavaScript (ESM)                                                     | User interface for administration                           |
| **Styling**           | Tailwind CSS                                                                      | Utility-first CSS framework for rapid UI development        |
| **Icons**             | Lucide Icons                                                                      | Clean and consistent SVG icons                              |

---

### **Final Folder Structure**

