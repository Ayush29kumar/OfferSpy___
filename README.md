# 🕵️‍♂️ OfferSpy – Turning Every Customer Into a Market Scout

![OfferSpy Logo](https://dummyimage.com/600x150/000/fff&text=OfferSpy+AI+Engine)

> An AI-powered system that verifies local store photos, filters fake/duplicate submissions, clusters offers by chain stores, and rewards users based on trust scores and useful contributions.

---

## 🚀 Problem Statement
Modern brands and companies often miss the pulse of hyperlocal markets. Shoppers see discounts and offers daily but have no outlet to share them.

### ❌ Challenges
- Fake images flood platforms.
- No proof of actual location/store.
- Incentives get exploited (fraud image uploads).
- Users don’t trust user-submitted data.

---

## ✅ Solution Overview
OfferSpy uses **AI/ML agents** to:
1. Verify authenticity of submitted store photos (signage detection, blur, OCR, geotag check).
2. Filter out fake or duplicate submissions using perceptual image hashing.
3. Cluster submissions based on location + image similarity.
4. Maintain trust scores for users.
5. Reward verified submissions.

![System Workflow](https://dummyimage.com/1000x400/333/fff&text=AI+Validation+%2B+Trust+%2B+Matching+Pipeline)

---

## 🧠 Tech Stack
| Layer        | Tech Used                            |
|--------------|--------------------------------------|
| **Frontend** | React.js + Tailwind CSS              |
| **Backend**  | Node.js + Express                    |
| **Database** | MongoDB (Mongoose ODM)              |
| **AI/ML**    | Python (OpenCV, Tesseract, ImageHash)|
| **Agents**   | `Flowwith.io` YAML execution plan    |
| **Dev Tools**| Postman, VS Code, GitHub Actions     |

---

## 🧩 Architecture Diagram
![Architecture](https://dummyimage.com/1000x600/000/fff&text=OfferSpy+Architecture+Diagram)

---

## 🔎 AI-Powered Image Validation
```js
- Check blurriness using Laplacian operator
- OCR text with Tesseract to detect store names, discounts
- Detect store signage with contour + bounding box
- Compare image hash against DB for duplicates
- Verify GPS EXIF vs submitted location
```

---

## 🏆 Trust Scoring Engine
Each user’s trust score adjusts with their submission history:
```json
{
  "userId": "abc123",
  "trustScore": 82,
  "flags": ["duplicate photo"],
  "verifiedUploads": 37,
  "rejectedUploads": 4,
  "referrals": 3
}
```

### Trust Adjustments
- +10 for verified, unique offer
- -20 for fakes or flagged duplicates
- +5 for referrals with genuine submissions

---

## 🧠 AI Agents (Flowwith Plan)
| Agent Name         | Task |
|--------------------|------|
| `validate_image`   | Analyze blurriness, OCR, signage |
| `check_gps`        | Extract EXIF & match location     |
| `check_duplicate`  | ImageHash + database match        |
| `calculate_trust`  | Update user score dynamically     |
| `map_offers`       | Cluster submissions per chain     |

**Flowwith Agent Plan:** `offerspy_agent_plan.yaml`

---

## 📊 Sample Dashboard Preview
![Admin Panel](https://dummyimage.com/1000x600/444/fff&text=Flagged+Submissions+%7C+Trust+Monitor+%7C+Preview+Panel)

- Admins can verify/reject flagged submissions
- Show photo, trust score, submitter metadata
- Reward Engine integration ready

---

## 💰 Gamification & Rewards
- 🪙 Verified submissions = points
- 📲 Leaderboard for scouts
- 🎁 Redeem points for vouchers

---

## 🛠 Folder Structure
```bash
offerspy/
├── backend/
│   ├── routes/
│   ├── models/
│   ├── utils/verifyImage.js
│   └── server.js
├── frontend/
│   ├── components/FlaggedSubmissions.js
│   └── App.js
├── agents/
│   └── offerspy_agent_plan.yaml
├── data/
│   ├── users.json
│   └── offers.json
└── README.md
```

---

## 📍 Real-World Use Cases
- FMCG brands discovering which stores push deep discounts.
- Local kirana shops attracting foot traffic via real offers.
- Market research firms tapping into local price data.

---

## 🧑‍💻 Built By
- **Ayush Mahato** (Full-stack, AI/ML, Project Design)
- [LinkedIn](https://www.linkedin.com/in/ayush-mahato-335128338/)
- *Hackathon tested. Resume ready.*

---

## 🛠️ Disclaimer
This project is designed to **simulate a working AI system**. Not all modules are fully deployed but are **pluggable and logically complete**.

---

## 🌟 Want To Contribute?
- Add new validation AI steps
- Improve reward logic
- Train model to detect chain stores via logo OCR

---

## 📎 Attachments
- ✅ `offerspy_agent_plan.yaml`
- 🖼 Sample image set with geotags
- ⚠️ Flagged test submissions

---

> Let the scouts run the market. OfferSpy: The grassroots commerce detector.
