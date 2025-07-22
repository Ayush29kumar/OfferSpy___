export const projectFiles = {
    'server/package.json': `{
  "name": "offerspy-server",
  "version": "1.0.0",
  "description": "Backend server for the Offerspy platform",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "author": "AI Agent",
  "license": "ISC",
  "dependencies": {
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "mongoose": "^7.6.3",
    "exif-parser": "^0.1.12",
    "multer": "^1.4.5-lts.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}`,
    'server/server.js': `const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const multer = require('multer');

const offerRoutes = require('./routes/offerRoutes');
const adminRoutes = require('./routes/adminRoutes');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.json({ message: 'Offerspy API is running...' });
});

app.use('/api/offers', offerRoutes);
app.use('/api/admin', adminRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(\`Server is running in \${process.env.NODE_ENV || 'development'} mode on port \${PORT}\`);
});
`,
    'server/models/User.js': `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    password: {
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0
    },
    trustScore: {
        type: Number,
        default: 100
    },
    submissionCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('User', userSchema);`,
    'server/models/OfferSubmission.js': `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const pointSchema = new Schema({
    type: {
        type: String,
        enum: ['Point'],
        required: true
    },
    coordinates: {
        type: [Number], // Format: [longitude, latitude]
        required: true
    }
});

const offerSubmissionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    extractedText: {
        type: String
    },
    gpsLocation: {
        type: pointSchema,
        index: '2dsphere'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    storeName: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'flagged'],
        default: 'pending'
    },
    imageHash: {
        type: String,
        unique: true,
        sparse: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('OfferSubmission', offerSubmissionSchema);`,
    'server/models/RewardLog.js': `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const rewardLogSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    offerSubmission: {
        type: Schema.Types.ObjectId,
        ref: 'OfferSubmission',
        required: true
    },
    pointsAwarded: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('RewardLog', rewardLogSchema);`,
    'server/models/Buyer.js': `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const buyerSchema = new Schema({
    contactInfo: {
        name: {
            type: String,
            required: true,
            trim: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true
        }
    },
    preferences: {
        type: [String],
        default: []
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Buyer', buyerSchema);`,
    'server/models/VerifiedOffer.js': `const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const verifiedOfferSchema = new Schema({
    offerSubmission: {
        type: Schema.Types.ObjectId,
        ref: 'OfferSubmission',
        required: true,
        unique: true
    },
    matchedBuyers: [{
        type: Schema.Types.ObjectId,
        ref: 'Buyer'
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('VerifiedOffer', verifiedOfferSchema);`,
    'server/routes/offerRoutes.js': `const express = require('express');
const router = express.Router();
const multer = require('multer');
const { submitOffer, getOffers } = require('../controllers/offerController');

const upload = multer({ dest: 'uploads/' });

router.post('/submit', upload.single('offerImage'), submitOffer);
router.get('/', getOffers);

module.exports = router;`,
    'server/routes/adminRoutes.js': `const express = require('express');
const router = express.Router();
const { verifyOffer, getFlaggedOffers } = require('../controllers/adminController');

router.put('/offers/:offerId/verify', verifyOffer);
router.get('/offers/flagged', getFlaggedOffers);

module.exports = router;`,
    'server/controllers/offerController.js': `const OfferSubmission = require('../models/OfferSubmission');
const { verifyImageWithAI } = require('../utils/aiVerificationWrapper');
const exifParser = require('exif-parser');
const fs = require('fs');

const submitOffer = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'Offer image is required.' });
    }

    const imagePath = req.file.path;

    try {
        const aiResultPromise = verifyImageWithAI(imagePath);

        const imageBuffer = fs.readFileSync(imagePath);
        const parser = exifParser.create(imageBuffer);
        const exifData = parser.parse();

        let gpsLocation = null;
        let timestamp = null;
        let exifValid = { location: false, timestamp: false };

        if (exifData && exifData.tags) {
            if (exifData.tags.GPSLatitude && exifData.tags.GPSLongitude) {
                gpsLocation = {
                    type: 'Point',
                    coordinates: [exifData.tags.GPSLongitude, exifData.tags.GPSLatitude]
                };
                exifValid.location = true;
            }

            const createDate = exifData.tags.CreateDate || exifData.tags.DateTimeOriginal;
            if (createDate) {
                timestamp = new Date(createDate * 1000);
                const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);
                if (timestamp > fortyEightHoursAgo) {
                    exifValid.timestamp = true;
                }
            }
        }
        
        const aiResult = await aiResultPromise;

        let status = 'pending';
        const issues = [];
        if (aiResult.blurry) {
            issues.push('Image is blurry.');
            status = 'flagged';
        }
        if (aiResult.duplicate) {
            issues.push('Duplicate image detected.');
            status = 'rejected';
        }
        if (!aiResult.valid) {
            issues.push('AI validation failed (e.g., low confidence OCR).');
            if (status !== 'rejected') status = 'flagged';
        }
        if (!exifValid.location) {
            issues.push('Missing or invalid GPS location in image EXIF data.');
            if (status !== 'rejected') status = 'flagged';
        }
        if (!exifValid.timestamp) {
            issues.push('Image timestamp is older than 48 hours or missing.');
            if (status !== 'rejected') status = 'flagged';
        }
        
        const mockUserId = '605c724f9f1b2c001f3e8a9d';

        const newSubmission = new OfferSubmission({
            user: mockUserId,
            imageUrl: imagePath,
            extractedText: aiResult.ocrText,
            gpsLocation: gpsLocation,
            timestamp: timestamp || new Date(),
            storeName: aiResult.storeDetected,
            status: status,
            imageHash: aiResult.hash,
        });

        const savedSubmission = await newSubmission.save();
        
        if(status === 'rejected') {
            fs.unlinkSync(imagePath);
        }

        res.status(201).json({
            message: \`Offer submitted. Status: \${status}.\`,
            submission: savedSubmission,
            issues: issues.length > 0 ? issues : undefined,
        });

    } catch (error) {
        console.error('Error submitting offer:', error);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
        res.status(500).json({ message: 'Server error during offer submission.', error: error.message });
    }
};

const getOffers = async (req, res) => {
    try {
        const offers = await OfferSubmission.find({ status: 'verified' }).populate('user', 'email');
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching offers.', error: error.message });
    }
};

module.exports = {
    submitOffer,
    getOffers,
};`,
    'server/controllers/adminController.js': `const OfferSubmission = require('../models/OfferSubmission');
const { updateUserMetrics } = require('../utils/rewardEngine');

const verifyOffer = async (req, res) => {
    const { offerId } = req.params;
    const { status } = req.body;

    if (!['verified', 'rejected'].includes(status)) {
        return res.status(400).json({ message: 'Invalid status provided. Must be "verified" or "rejected".' });
    }

    try {
        const offer = await OfferSubmission.findById(offerId);

        if (!offer) {
            return res.status(404).json({ message: 'Offer submission not found.' });
        }

        if (offer.status !== 'pending' && offer.status !== 'flagged') {
            return res.status(400).json({ message: \`Offer is already processed with status: \${offer.status}\` });
        }

        offer.status = status;
        await offer.save();

        const isVerified = status === 'verified';
        await updateUserMetrics({
            userId: offer.user,
            offerId: offer._id,
            isVerified: isVerified
        });

        res.status(200).json({
            message: \`Offer \${status} successfully.\`,
            offer: offer
        });

    } catch (error) {
        res.status(500).json({ message: 'An error occurred while processing the offer.', error: error.message });
    }
};

const getFlaggedOffers = async (req, res) => {
    try {
        const flaggedOffers = await OfferSubmission.find({ status: 'flagged' }).populate('user', 'email trustScore');
        res.status(200).json(flaggedOffers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flagged offers.', error: error.message });
    }
};

module.exports = {
    verifyOffer,
    getFlaggedOffers
};`,
    'server/utils/aiVerificationWrapper.js': `const { spawn } = require('child_process');
const path = require('path');

const verifyImageWithAI = (imagePath) => {
    return new Promise((resolve, reject) => {
        const scriptPath = path.resolve(__dirname, '..', '..', 'ai-verification', 'verifyImage.py');
        const absoluteImagePath = path.resolve(imagePath);

        const pythonProcess = spawn('python3', [scriptPath, '--image', absoluteImagePath]);

        let resultJson = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            resultJson += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(\`Python script stderr: \${errorOutput}\`);
                return reject(new Error(\`Python script exited with code \${code}: \${errorOutput}\`));
            }
            try {
                const result = JSON.parse(resultJson);
                resolve(result);
            } catch (e) {
                reject(new Error('Failed to parse JSON from Python script. Output: ' + resultJson));
            }
        });
        
        pythonProcess.on('error', (err) => {
            reject(new Error(\`Failed to start subprocess: \${err.message}\`));
        });
    });
};

module.exports = {
    verifyImageWithAI
};`,
    'server/utils/rewardEngine.js': `const User = require('../models/User');
const RewardLog = require('../models/RewardLog');

const updateUserMetrics = async ({ userId, offerId, isVerified }) => {
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        if (isVerified) {
            await User.updateOne(
                { _id: userId },
                { $inc: { trustScore: 10, points: 10 } }
            );

            const rewardLog = new RewardLog({
                user: userId,
                offerSubmission: offerId,
                pointsAwarded: 10,
                reason: 'Offer verified successfully'
            });
            await rewardLog.save();
        } else {
            await User.updateOne(
                { _id: userId },
                { $inc: { trustScore: -15 } }
            );
        }
    } catch (error) {
        throw error;
    }
};

module.exports = {
    updateUserMetrics,
};`,
    'client/index.html': `<!DOCTYPE html>
<html lang="en" class="h-full">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Offerspy Admin Panel</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <link rel="stylesheet" href="style.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body class="bg-gray-50 text-gray-800 font-sans antialiased h-full overflow-hidden">
    <div id="app" class="h-full flex flex-col">
        <header class="bg-white/70 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-20">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div class="flex justify-between items-center h-16">
                    <div class="flex items-center space-x-2">
                        <i data-lucide="scan-eye" class="text-blue-600 h-8 w-8"></i>
                        <h1 class="text-xl font-bold text-gray-900">Offerspy Admin Panel</h1>
                    </div>
                </div>
            </div>
        </header>
        <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div class="max-w-7xl mx-auto">
                <div id="dashboard-content">
                    <div class="mb-12">
                        <h2 class="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="clock" class="mr-3 h-6 w-6 text-gray-500"></i>
                            Pending Submissions
                        </h2>
                        <div id="pending-offers-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
                    </div>
                    <div>
                        <h2 class="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                            <i data-lucide="flag" class="mr-3 h-6 w-6 text-orange-500"></i>
                            Flagged for Review
                        </h2>
                        <div id="flagged-offers-grid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"></div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <div id="offer-detail-modal" class="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 hidden items-center justify-center p-4">
        <div id="modal-content" class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col transform transition-all opacity-0 scale-95">
            <div class="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900" id="modal-title">Offer Details</h3>
                <button id="close-modal-btn" class="text-gray-400 hover:text-gray-600 transition-colors">
                    <i data-lucide="x" class="h-6 w-6"></i>
                </button>
            </div>
            <div id="modal-body" class="flex-1 overflow-y-auto p-6"></div>
        </div>
    </div>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script type="module" src="app.js"></script>
</body>
</html>`,
    'client/style.css': `body {
    font-family: 'Inter', sans-serif;
}
#offer-detail-modal.flex { display: flex; }
#offer-detail-modal.hidden { display: none; }
#modal-content.modal-enter {
    opacity: 1;
    transform: scale(1);
    transition: opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.trust-score-high { color: #10B981; background-color: #D1FAE5; }
.trust-score-medium { color: #F59E0B; background-color: #FEF3C7; }
.trust-score-low { color: #EF4444; background-color: #FEE2E2; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: #f1f5f9; }
::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
::-webkit-scrollbar-thumb:hover { background: #94a3b8; }`,
    'client/app.js': `import { allOffers } from './data.js';
import { createOfferCard } from './components/offer_card.js';
import { renderOfferDetail } from './components/offer_detail.js';

document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    const state = {
        offers: [...allOffers],
        selectedOffer: null,
    };

    const pendingGrid = document.getElementById('pending-offers-grid');
    const flaggedGrid = document.getElementById('flagged-offers-grid');
    const modal = document.getElementById('offer-detail-modal');
    const modalContent = document.getElementById('modal-content');
    const modalBody = document.getElementById('modal-body');
    const closeModalBtn = document.getElementById('close-modal-btn');

    function renderDashboard() {
        pendingGrid.innerHTML = '';
        flaggedGrid.innerHTML = '';

        state.offers.forEach(offer => {
            const card = createOfferCard(offer, handleCardClick);
            if (offer.status === 'pending') {
                pendingGrid.appendChild(card);
            } else if (offer.status === 'flagged') {
                flaggedGrid.appendChild(card);
            }
        });
        lucide.createIcons();
    }

    function handleCardClick(offer) {
        state.selectedOffer = offer;
        renderOfferDetail(offer, modalBody, { handleApprove, handleReject, handleFlag });
        showModal();
    }

    function showModal() {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => {
            modalContent.classList.add('modal-enter');
        }, 10);
    }

    function hideModal() {
        modalContent.classList.remove('modal-enter');
        setTimeout(() => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            state.selectedOffer = null;
        }, 300);
    }
    
    function handleApprove() {
        if (!state.selectedOffer) return;
        updateOfferStatus(state.selectedOffer.id, 'approved');
    }

    function handleReject() {
        if (!state.selectedOffer) return;
        updateOfferStatus(state.selectedOffer.id, 'rejected');
    }
    
    function handleFlag() {
        if (!state.selectedOffer) return;
        const offer = state.offers.find(o => o.id === state.selectedOffer.id);
        if(offer) {
            offer.status = 'flagged';
            offer.flagReason = 'Manually flagged for review by admin.';
        }
        hideModal();
        renderDashboard();
    }

    function updateOfferStatus(offerId, newStatus) {
        state.offers = state.offers.filter(o => o.id !== offerId);
        hideModal();
        renderDashboard();
    }

    closeModalBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });

    renderDashboard();
});`,
    'client/data.js': `const users = [
  { "_id": "64b9a1b3f9c3e1a4d8f2c6a1", "username": "dealHunter99", "email": "alex.j@example.com", "trustScore": 85, "submissionCount": 42 },
  { "_id": "64b9a1b3f9c3e1a4d8f2c6a2", "username": "couponQueen", "email": "sarah.k@example.com", "trustScore": 92, "submissionCount": 112 },
  { "_id": "64b9a1b3f9c3e1a4d8f2c6a3", "username": "savvyShopper", "email": "mike.p@example.com", "trustScore": 68, "submissionCount": 23 },
  { "_id": "64b9a1b3f9c3e1a4d8f2c6a4", "username": "newbieFinder", "email": "chloe.b@example.com", "trustScore": 50, "submissionCount": 5 },
  { "_id": "64b9a1b3f9c3e1a4d8f2c6a5", "username": "BargainBen", "email": "ben.carter@example.com", "trustScore": 75, "submissionCount": 67 }
];

const allOffers = [
    { id: 'offer-001', status: 'pending', imageUrl: 'https://r2.flowith.net/files/o/1753140053441-supermarket_cereal_promotion_sign_index_1@1024x1024.png', user: users[0], aiVerification: { blurry: false, duplicate: false, ocrText: 'Kellogg\\'s Cereal 2 for $5', confidence: 0.92 } },
    { id: 'offer-002', status: 'pending', imageUrl: 'https://r2.flowith.net/files/o/1753140060266-red_promotional_sticker_on_clothing_store_window_index_2@1024x1024.png', user: users[1], aiVerification: { blurry: false, duplicate: false, ocrText: 'SALE 50% OFF', confidence: 0.88 } },
    { id: 'offer-003', status: 'flagged', imageUrl: 'https://r2.flowith.net/files/o/1753140030788-handwritten_chalkboard_cafe_sign_photo_index_3@1024x1024.png', user: users[2], aiVerification: { blurry: true, duplicate: false, ocrText: 'Daily Special Coffee & Cake $7', confidence: 0.65 }, flagReason: 'Image is blurry, low OCR confidence.' },
    { id: 'offer-004', status: 'pending', user: users[4], imageUrl: 'https://images.unsplash.com/photo-1588982210330-d3412c385a1b?q=80&w=1974&auto=format&fit=crop', aiVerification: { blurry: false, duplicate: false, ocrText: 'FRESH PRODUCE', confidence: 0.81 } },
    { id: 'offer-005', status: 'flagged', user: users[3], imageUrl: 'https://images.unsplash.com/photo-1543851731-558244365319?q=80&w=2070&auto=format&fit=crop', aiVerification: { blurry: false, duplicate: true, ocrText: 'SUMMER SALE', confidence: 0.95 }, flagReason: 'Potential duplicate submission.' }
];

export { allOffers };`,
    'client/components/offer_card.js': `function getTrustScoreClass(score) {
    if (score >= 80) return 'trust-score-high';
    if (score >= 60) return 'trust-score-medium';
    return 'trust-score-low';
}

export function createOfferCard(offer, onCardClick) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group';
    card.addEventListener('click', () => onCardClick(offer));

    const trustScoreClass = getTrustScoreClass(offer.user.trustScore);

    card.innerHTML = \`
        <div class="relative">
            <img src="\${offer.imageUrl}" alt="Offer Image" class="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full \${trustScoreClass}">
                Trust: \${offer.user.trustScore}
            </div>
        </div>
        <div class="p-4">
            <p class="text-sm font-medium text-gray-500 truncate">\${offer.user.email}</p>
            <p class="mt-1 text-xs text-gray-400">ID: \${offer.id}</p>
        </div>
    \`;

    return card;
}`,
    'client/components/offer_detail.js': `function getTrustScoreClass(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

function renderVerificationPill(label, value, isGood) {
    const colorClass = isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const icon = isGood ? \`<i data-lucide="check-circle" class="h-4 w-4 text-green-500 mr-1.5"></i>\` : \`<i data-lucide="x-circle" class="h-4 w-4 text-red-500 mr-1.5"></i>\`;
    
    return \`
        <div class="flex items-center text-sm font-medium py-1.5 px-3 rounded-full \${colorClass}">
            \${icon}
            <span>\${label}: <strong>\${value}</strong></span>
        </div>
    \`;
}

export function renderOfferDetail(offer, container, actionHandlers) {
    const { user, imageUrl, aiVerification, id } = offer;
    const trustScoreClass = getTrustScoreClass(user.trustScore);

    container.innerHTML = \`
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="rounded-lg overflow-hidden border border-gray-200">
                <img src="\${imageUrl}" alt="Full offer image" class="w-full h-full object-contain max-h-[65vh]">
            </div>
            <div class="flex flex-col space-y-6">
                <div>
                    <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <i data-lucide="shield-check" class="h-5 w-5 mr-2 text-blue-600"></i>
                        AI Verification
                    </h4>
                    <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div class="flex flex-wrap gap-2">
                           \${renderVerificationPill('Blurry', aiVerification.blurry ? 'Yes' : 'No', !aiVerification.blurry)}
                           \${renderVerificationPill('Duplicate', aiVerification.duplicate ? 'Yes' : 'No', !aiVerification.duplicate)}
                        </div>
                        <div class="pt-2">
                            <p class="text-xs text-gray-500 font-medium">OCR Text</p>
                            <p class="text-gray-700 font-mono bg-white p-2 rounded-md border border-gray-200 mt-1">"\${aiVerification.ocrText}"</p>
                        </div>
                         <div class="pt-1">
                            <p class="text-xs text-gray-500 font-medium">Confidence</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div class="bg-blue-600 h-2.5 rounded-full" style="width: \${aiVerification.confidence * 100}%"></div>
                            </div>
                             <p class="text-right text-sm font-semibold text-blue-700">\${(aiVerification.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                </div>
                <div>
                    <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center">
                       <i data-lucide="user" class="h-5 w-5 mr-2 text-blue-600"></i>
                        Submitter Information
                    </h4>
                    <div class="bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Email</span>
                            <span class="text-sm font-semibold text-gray-800">\${user.email}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Trust Score</span>
                            <span class="text-sm font-bold \${trustScoreClass}">\${user.trustScore}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Total Submissions</span>
                            <span class="text-sm font-semibold text-gray-800">\${user.submissionCount}</span>
                        </div>
                    </div>
                </div>
                <div class="pt-2">
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                         <button id="approve-btn" class="w-full flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                             <i data-lucide="check" class="h-5 w-5 mr-2"></i> Approve
                         </button>
                         <button id="reject-btn" class="w-full flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
                              <i data-lucide="x" class="h-5 w-5 mr-2"></i> Reject
                         </button>
                         <button id="flag-btn" class="w-full flex items-center justify-center py-3 px-4 text-sm font-semibold rounded-lg bg-yellow-500 text-white hover:bg-yellow-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400">
                              <i data-lucide="flag" class="h-5 w-5 mr-2"></i> Flag
                         </button>
                    </div>
                </div>
            </div>
        </div>
    \`;

    lucide.createIcons();

    document.getElementById('approve-btn').addEventListener('click', actionHandlers.handleApprove);
    document.getElementById('reject-btn').addEventListener('click', actionHandlers.handleReject);
    document.getElementById('flag-btn').addEventListener('click', actionHandlers.handleFlag);
}`,
    'ai-verification/verifyImage.py': `import cv2
import imagehash
import pytesseract
import json
import argparse
import sys
import numpy as np
from PIL import Image
from typing import Dict, Any, Tuple

def is_blurry(image: np.ndarray, threshold: int = 100) -> bool:
    laplacian_var = cv2.Laplacian(image, cv2.CV_64F).var()
    return laplacian_var < threshold

def generate_hash(image_path: str) -> str:
    try:
        img = Image.open(image_path)
        perceptual_hash = imagehash.dhash(img)
        return str(perceptual_hash)
    except Exception as e:
        return ""

def extract_text_and_confidence(image: np.ndarray) -> Tuple[str, float]:
    try:
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT, lang='eng')
        words = []
        confidences = []
        for i in range(len(data['text'])):
            if int(data['conf'][i]) > 50:
                word = data['text'][i].strip()
                if word:
                    words.append(word)
                    confidences.append(int(data['conf'][i]))
        if not confidences:
            return "", 0.0
        full_text = " ".join(words)
        average_confidence = sum(confidences) / len(confidences)
        return full_text, round(average_confidence, 2)
    except pytesseract.TesseractNotFoundError:
        sys.stderr.write("Tesseract Error: Tesseract executable not found.\\n")
        return "Tesseract not found.", 0.0
    except Exception as e:
        sys.stderr.write(f"An unexpected OCR error occurred: {e}\\n")
        return "", 0.0

def main():
    parser = argparse.ArgumentParser(description="Analyzes an image for blur, duplicates, and text.")
    parser.add_argument("-i", "--image", required=True, help="Path to the input image file.")
    args = vars(parser.parse_args())
    image_path = args["image"]
    try:
        image = cv2.imread(image_path)
        if image is None:
            raise FileNotFoundError(f"Image not found at path: {image_path}")
        gray_image = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    except Exception as e:
        error_result = {
            "blurry": None, "duplicate_hash": "", "ocrText": "", "confidence": 0.0,
            "valid": False, "error": str(e)
        }
        print(json.dumps(error_result))
        sys.exit(1)

    blurry_status = is_blurry(gray_image, threshold=100)
    image_hash = generate_hash(image_path)
    ocr_text, ocr_confidence = extract_text_and_confidence(gray_image)
    is_valid = not blurry_status and ocr_confidence > 50

    final_analysis: Dict[str, Any] = {
        "blurry": blurry_status,
        "duplicate_hash": image_hash,
        "ocrText": ocr_text,
        "confidence": ocr_confidence,
        "valid": is_valid
    }
    print(json.dumps(final_analysis, indent=4))

if __name__ == "__main__":
    main()`,
    'ai-verification/requirements.txt': `opencv-python==4.9.0.80
imagehash==4.3.1
pytesseract==0.3.10
numpy==1.26.4
Pillow==10.3.0`
};

export const mockData = {
    'data/users.json': `[
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a1",
    "username": "dealHunter99",
    "email": "alex.j@example.com",
    "passwordHash": "$2b$12$Eihq5n5Y3R6v5bB1A4G9sOAbYpX3jL9a1eC8fD2gH5iJ6kL7mN8oP",
    "trustScore": 85,
    "points": 1250,
    "createdAt": "2025-01-15T10:30:00Z",
    "updatedAt": "2025-07-20T18:45:00Z"
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a2",
    "username": "couponQueen",
    "email": "sarah.k@example.com",
    "passwordHash": "$2b$12$Klmr9o8pQ7rS6tU5vW4xY.zAbCdEfGhIjKlMnOpQrStUvWxYzAbc",
    "trustScore": 92,
    "points": 2300,
    "createdAt": "2024-11-22T14:00:00Z",
    "updatedAt": "2025-07-21T09:15:00Z"
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a3",
    "username": "savvyShopper",
    "email": "mike.p@example.com",
    "passwordHash": "$2b$12$Zxy1a2b3c4d5e6f7g8h9i.jKlMnOpQrStUvWxYzAbcDefGhIjKlM",
    "trustScore": 68,
    "points": 450,
    "createdAt": "2025-05-10T20:05:00Z",
    "updatedAt": "2025-07-19T11:20:00Z"
  }
]`,
    'data/buyers.json': `[
  {
    "_id": "65c3b4d5e6f7g8h9i0j1k2l3",
    "companyName": "Market Insights Inc.",
    "contactEmail": "data.requests@marketinsights.com",
    "apiKey": "mi-a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8",
    "accessLevel": "premium",
    "createdAt": "2025-03-01T09:00:00Z"
  },
  {
    "_id": "65c3b4d5e6f7g8h9i0j1k2l4",
    "companyName": "Retail Dynamics LLC",
    "contactEmail": "analytics@retaildynamics.io",
    "apiKey": "rd-z9y8x7w6-v5u4-3210-t9s8-r7q6p5o4n3m2",
    "accessLevel": "basic",
    "createdAt": "2025-06-15T11:20:00Z"
  },
  {
    "_id": "65c3b4d5e6f7g8h9i0j1k2l5",
    "companyName": "Consumer Trends Group",
    "contactEmail": "procurement@consumertrends.org",
    "apiKey": "ctg-f0e9d8c7-b6a5-4321-9fed-cba987654321",
    "accessLevel": "premium",
    "createdAt": "2025-04-20T16:45:00Z"
  }
]`
};
