function getTrustScoreClass(score) {
    if (score >= 80) return 'trust-score-high';
    if (score >= 60) return 'trust-score-medium';
    return 'trust-score-low';
}

export function createOfferCard(offer, onCardClick) {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group';
    card.addEventListener('click', () => onCardClick(offer));

    const trustScoreClass = getTrustScoreClass(offer.user.trustScore);

    card.innerHTML = `
        <div class="relative">
            <img src="${offer.imageUrl}" alt="Offer Image" class="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105">
            <div class="absolute top-2 right-2 px-2 py-1 text-xs font-semibold rounded-full ${trustScoreClass}">
                Trust: ${offer.user.trustScore}
            </div>
        </div>
        <div class="p-4">
            <p class="text-sm font-medium text-gray-500 truncate">${offer.user.email}</p>
            <p class="mt-1 text-xs text-gray-400">ID: ${offer.id}</p>
        </div>
    `;

    return card;
}
