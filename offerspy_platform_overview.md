# Offerspy

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

```
offerspy/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── offerController.js
│   │   └── ...
│   ├── middlewares/
│   ├── models/
│   │   ├── User.js
│   │   ├── OfferSubmission.js
│   │   ├── RewardLog.js
│   │   └── ...
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   └── offerRoutes.js
│   ├── utils/
│   │   ├── aiVerificationWrapper.js
│   │   └── rewardEngine.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/ (Future SPA)
│   ├── src/
│   └── package.json
│
├── admin_panel/
│   ├── components/
│   │   ├── offer_card.js
│   │   └── offer_detail.js
│   ├── app.js
│   ├── data.js
│   ├── index.html
│   └── style.css
│
├── ai_service/
│   ├── core/
│   │   └── ocr.py
│   ├── main.py
│   └── requirements.txt
│
└── README.md
```

---

### **API Endpoints**

The following are the core RESTful API endpoints for the Offerspy system.

| Method | Path                                   | Purpose                                        |
| :----- | :------------------------------------- | :--------------------------------------------- |
| `POST` | `/api/offers/submit`                   | Submits a new offer with an image for verification. |
| `GET`  | `/api/admin/offers/flagged`            | Retrieves all offers flagged for manual review. |
| `PUT`  | `/api/admin/offers/:offerId/verify`    | Allows an admin to approve or reject an offer. |

**1. Submit Offer**
-   **Method:** `POST`
-   **Path:** `/api/offers/submit`
-   **Description:** A `multipart/form-data` endpoint to upload an offer image. The backend processes the image, calls the AI service, and creates a new `OfferSubmission` record.
-   **Request Body:** `multipart/form-data` with a single field `offerImage` containing the image file.
-   **Example Response (Success - Flagged):**
    ```json
    {
      "message": "Offer submitted. Status: flagged.",
      "submission": {
        "user": "605c724f9f1b2c001f3e8a9d",
        "imageUrl": "uploads/1721599478123-offer.jpg",
        "extractedText": "Daily Special Coffee & Cake $7",
        "gpsLocation": {
          "type": "Point",
          "coordinates": [-74.0060, 40.7128]
        },
        "status": "flagged",
        "imageHash": "ffc3c3c3c3c3ffff",
        "_id": "669e2c6e1a4b9c1d9f8e4f3a",
        "createdAt": "2025-07-21T22:04:30.150Z",
        "updatedAt": "2025-07-21T22:04:30.150Z"
      },
      "issues": [
        "Image is blurry.",
        "AI validation failed (e.g., low confidence OCR)."
      ]
    }
    ```

**2. Verify Offer**
-   **Method:** `PUT`
-   **Path:** `/api/admin/offers/:offerId/verify`
-   **Description:** An admin-only route to set the final status of an offer. This action triggers the `rewardEngine` to update the submitter's metrics.
-   **Request Body:**
    ```json
    {
      "status": "verified"
    }
    ```
-   **Example Response (Success):**
    ```json
    {
        "message": "Offer verified successfully.",
        "offer": {
            "_id": "669e2c6e1a4b9c1d9f8e4f3a",
            "user": "605c724f9f1b2c001f3e8a9d",
            "imageUrl": "uploads/1721599478123-offer.jpg",
            "status": "verified",
            "imageHash": "ffc3c3c3c3c3ffff",
            "createdAt": "2025-07-21T22:04:30.150Z",
            "updatedAt": "2025-07-21T22:04:31.200Z"
        }
    }
    ```

---

### **AI Verification Pipeline**

Each image submission undergoes a rigorous multi-step automated analysis to ensure data quality and integrity *before* it reaches an administrator.

1.  **EXIF Data Validation (Node.js):**
    *   The system first extracts EXIF metadata from the image.
    *   **Geo-tagging:** It checks for embedded GPS coordinates to validate the offer's location.
    *   **Timestamp:** It verifies the `CreateDate` to ensure the offer is recent (e.g., within the last 48 hours). Submissions failing these checks are flagged.

2.  **Blurriness Detection (Python/OpenCV):**
    *   The image is converted to grayscale and analyzed using the variance of its Laplacian.
    *   A low variance indicates a lack of sharp edges, classifying the image as blurry and flagging it for review.

3.  **Perceptual Hashing (Python/ImageHash):**
    *   A `dHash` is generated for the image. This hash is resistant to minor changes like resizing or compression.
    *   The hash is checked against the database for uniqueness. If a matching hash exists, the submission is automatically **rejected** as a duplicate.

4.  **OCR & Confidence Scoring (Python/Tesseract):**
    *   Tesseract OCR extracts all readable text from the image.
    *   Crucially, the system calculates an *average confidence score* for the detected words. Submissions with low confidence are flagged, as the extracted text is likely unreliable.

> This entire pipeline determines the initial `status` of a submission: `pending` (if all checks pass), `flagged` (if non-critical issues are found), or `rejected` (if it's a confirmed duplicate).

---

### **User Trust & Reward System**

To incentivize high-quality submissions and build a reliable user base, Offerspy employs a dynamic trust and rewards system managed by the `rewardEngine`.

*   **Trust Score:** A metric from 0-100 indicating a user's reliability. It starts at a default value and is adjusted with each submission review.
*   **Points:** A gamification currency that users can accumulate.

The logic for adjustments is as follows:

| Action                 | Trust Score Change | Points Change |
| :--------------------- | :----------------- | :------------ |
| **Admin Approves Offer** | `+10`              | `+10`         |
| **Admin Rejects Offer**  | `-15`              | `0`           |

This simple but effective model rewards users for providing value and penalizes them for submitting inaccurate or low-quality content, ensuring that the most trusted users have the greatest impact. All transactions are logged in the `RewardLog` collection for transparency.

---

### **Admin Panel Showcase**

The Admin Panel is a clean, functional web interface built with **Tailwind CSS** that allows moderators to efficiently process submissions.

**Dashboard View:**
The main dashboard presents two clear sections: **Pending Submissions** and **Flagged for Review**. Each offer is displayed as a card showing a preview of the image and the submitter's trust score, color-coded for quick assessment.



**Offer Detail Modal:**
Clicking on any card opens a detailed modal view, providing all the necessary information for a verification decision.

*   **Left Pane:** A large view of the submitted offer image.
*   **Right Pane:**
    *   **AI Verification Summary:** Displays the results from the AI pipeline, including `Blurry` status, `Duplicate` status, the full `OCR Text`, and a `Confidence` progress bar.
    *   **Submitter Information:** Shows the user's email, current trust score, and total submission count, giving the admin crucial context about the source.
    *   **Action Buttons:** Large, clear buttons to **Approve**, **Reject**, or **Flag** the submission.



---

### **Setup and Installation**

Follow these steps to set up and run the Offerspy project locally.

**1. Prerequisites:**
-   Node.js (v18.x or later) and npm
-   Python (v3.7 or later) and pip
-   MongoDB instance (local or cloud-based)
-   **Tesseract OCR Engine:** You must install Tesseract on your system.
    -   macOS: `brew install tesseract`
    -   Ubuntu: `sudo apt install tesseract-ocr`
    -   Windows: Download from the [official Tesseract repository](https://github.com/tesseract-ocr/tessdoc).

**2. Backend Server:**
```bash
# Navigate to the backend directory
cd backend

# Install dependencies
npm install

# Create a .env file from the example
cp .env.example .env

# Edit .env with your MongoDB connection string and other variables
# MONGODB_URI="your_mongodb_connection_string"
# PORT=5000

# Start the development server
npm run dev
```

**3. AI Verification Module:**
```bash
# Navigate to the AI service directory
cd ai_service

# (Optional but recommended) Create a virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows, use `venv\Scripts\activate`

# Install Python dependencies
pip install -r requirements.txt
```

**4. Admin Panel:**
-   No build step is required for the admin panel.
-   Simply open the `admin_panel/index.html` file in your web browser.

---

### **Phase 6: Future AI Extensions (Roadmap)**

To further enhance the platform's intelligence, the following AI extensions are planned.

**1. Fraud Prediction Classifier**
*   **Objective:** Proactively identify submissions likely to be rejected.
*   **Implementation Strategy:**
    1.  **Feature Engineering:** Collect a dataset from historical submissions. Key features will include:
        *   `aiVerification.confidence` (numeric)
        *   `aiVerification.blurry` (binary: 1 or 0)
        *   Submitter's current `trustScore`
        *   Submitter's historical approval rate
        *   Image dimensions and file size
    2.  **Model Training:** Train a classification model (e.g., **Logistic Regression** or **Gradient Boosting** from `scikit-learn`) on this dataset. The target variable will be the final `status` (`verified`=0, `rejected`=1).
    3.  **Integration:** The model will be served via the Python service. The backend will call it after the initial AI analysis to get a "fraud probability score," which can be displayed in the admin panel to prioritize reviews.

**2. Regional Trend Clustering & Map Visualization**
*   **Objective:** Discover and visualize "hot zones" of discount activity to provide valuable insights to data buyers.
*   **Implementation Strategy:**
    1.  **Clustering:**
        *   Use an unsupervised learning algorithm like **DBSCAN** or **K-Means** on the `gpsLocation.coordinates` of all `verified` offers. DBSCAN is ideal as it can find arbitrarily shaped clusters and handle noise (isolated offers).
        *   Offers can also be clustered by `category` and location to find trends like "weekend electronic sales in downtown areas."
    2.  **API Endpoint:** Create a new backend endpoint (e.g., `/api/trends/clusters`) that runs the clustering algorithm and returns the cluster data (e.g., center points, number of offers, dominant category).
    3.  **Visualization:**
        *   In the Admin Panel or a separate buyer dashboard, use **Leaflet.js** to create an interactive map.
        *   Fetch the cluster data from the new endpoint and render it as a **heatmap** or as clustered markers, providing an intuitive visual representation of regional offer trends.