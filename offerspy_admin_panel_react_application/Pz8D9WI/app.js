import { allOffers } from './data.js';
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
        console.log(`API CALL: Approving offer ${state.selectedOffer.id}`);
        updateOfferStatus(state.selectedOffer.id, 'approved');
    }

    function handleReject() {
        if (!state.selectedOffer) return;
        console.log(`API CALL: Rejecting offer ${state.selectedOffer.id}`);
        updateOfferStatus(state.selectedOffer.id, 'rejected');
    }
    
    function handleFlag() {
        if (!state.selectedOffer) return;
        console.log(`API CALL: Flagging offer ${state.selectedOffer.id}`);
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
});
