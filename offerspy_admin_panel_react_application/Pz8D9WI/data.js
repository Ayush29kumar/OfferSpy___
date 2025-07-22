const users = [
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a1",
    "username": "dealHunter99",
    "email": "alex.j@example.com",
    "trustScore": 85,
    "submissionCount": 42,
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a2",
    "username": "couponQueen",
    "email": "sarah.k@example.com",
    "trustScore": 92,
    "submissionCount": 112,
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a3",
    "username": "savvyShopper",
    "email": "mike.p@example.com",
    "trustScore": 68,
    "submissionCount": 23,
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a4",
    "username": "newbieFinder",
    "email": "chloe.b@example.com",
    "trustScore": 50,
    "submissionCount": 5,
  },
  {
    "_id": "64b9a1b3f9c3e1a4d8f2c6a5",
    "username": "BargainBen",
    "email": "ben.carter@example.com",
    "trustScore": 75,
    "submissionCount": 67,
  }
];

const allOffers = [
    {
        id: 'offer-001',
        status: 'pending',
        imageUrl: 'https://r2.flowith.net/files/o/1753140053441-supermarket_cereal_promotion_sign_index_1@1024x1024.png',
        user: users[0],
        aiVerification: {
            blurry: false,
            duplicate: false,
            ocrText: 'Kellogg\'s Cereal 2 for $5',
            confidence: 0.92
        }
    },
    {
        id: 'offer-002',
        status: 'pending',
        imageUrl: 'https://r2.flowith.net/files/o/1753140060266-red_promotional_sticker_on_clothing_store_window_index_2@1024x1024.png',
        user: users[1],
        aiVerification: {
            blurry: false,
            duplicate: false,
            ocrText: 'SALE 50% OFF',
            confidence: 0.88
        }
    },
    {
        id: 'offer-003',
        status: 'flagged',
        imageUrl: 'https://r2.flowith.net/files/o/1753140030788-handwritten_chalkboard_cafe_sign_photo_index_3@1024x1024.png',
        user: users[2],
        aiVerification: {
            blurry: true,
            duplicate: false,
            ocrText: 'Daily Special Coffee & Cake $7',
            confidence: 0.65
        },
        flagReason: 'Image is blurry, low OCR confidence.'
    },
    {
        id: 'offer-004',
        status: 'pending',
        user: users[4],
        imageUrl: 'https://images.unsplash.com/photo-1588982210330-d3412c385a1b?q=80&w=1974&auto=format&fit=crop',
        aiVerification: {
            blurry: false,
            duplicate: false,
            ocrText: 'FRESH PRODUCE',
            confidence: 0.81
        }
    },
    {
        id: 'offer-005',
        status: 'flagged',
        user: users[3],
        imageUrl: 'https://images.unsplash.com/photo-1543851731-558244365319?q=80&w=2070&auto=format&fit=crop',
        aiVerification: {
            blurry: false,
            duplicate: true,
            ocrText: 'SUMMER SALE',
            confidence: 0.95
        },
        flagReason: 'Potential duplicate submission.'
    }
];

export { allOffers };
