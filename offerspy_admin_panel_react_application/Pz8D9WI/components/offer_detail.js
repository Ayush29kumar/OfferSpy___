function getTrustScoreClass(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
}

function renderVerificationPill(label, value, isGood) {
    const colorClass = isGood ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    const icon = isGood ? `<i data-lucide="check-circle" class="h-4 w-4 text-green-500 mr-1.5"></i>` : `<i data-lucide="x-circle" class="h-4 w-4 text-red-500 mr-1.5"></i>`;
    
    return `
        <div class="flex items-center text-sm font-medium py-1.5 px-3 rounded-full ${colorClass}">
            ${icon}
            <span>${label}: <strong>${value}</strong></span>
        </div>
    `;
}

export function renderOfferDetail(offer, container, actionHandlers) {
    const { user, imageUrl, aiVerification, id } = offer;
    const trustScoreClass = getTrustScoreClass(user.trustScore);

    container.innerHTML = `
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Image Column -->
            <div class="rounded-lg overflow-hidden border border-gray-200">
                <img src="${imageUrl}" alt="Full offer image" class="w-full h-full object-contain max-h-[65vh]">
            </div>

            <!-- Details Column -->
            <div class="flex flex-col space-y-6">
                
                <!-- AI Verification Section -->
                <div>
                    <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center">
                        <i data-lucide="shield-check" class="h-5 w-5 mr-2 text-blue-600"></i>
                        AI Verification
                    </h4>
                    <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div class="flex flex-wrap gap-2">
                           ${renderVerificationPill('Blurry', aiVerification.blurry ? 'Yes' : 'No', !aiVerification.blurry)}
                           ${renderVerificationPill('Duplicate', aiVerification.duplicate ? 'Yes' : 'No', !aiVerification.duplicate)}
                        </div>
                        <div class="pt-2">
                            <p class="text-xs text-gray-500 font-medium">OCR Text</p>
                            <p class="text-gray-700 font-mono bg-white p-2 rounded-md border border-gray-200 mt-1">"${aiVerification.ocrText}"</p>
                        </div>
                         <div class="pt-1">
                            <p class="text-xs text-gray-500 font-medium">Confidence</p>
                            <div class="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${aiVerification.confidence * 100}%"></div>
                            </div>
                             <p class="text-right text-sm font-semibold text-blue-700">${(aiVerification.confidence * 100).toFixed(0)}%</p>
                        </div>
                    </div>
                </div>

                <!-- User Info Section -->
                <div>
                    <h4 class="text-base font-semibold text-gray-800 mb-3 flex items-center">
                       <i data-lucide="user" class="h-5 w-5 mr-2 text-blue-600"></i>
                        Submitter Information
                    </h4>
                    <div class="bg-gray-50 rounded-lg p-4 divide-y divide-gray-200">
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Email</span>
                            <span class="text-sm font-semibold text-gray-800">${user.email}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Trust Score</span>
                            <span class="text-sm font-bold ${trustScoreClass}">${user.trustScore}</span>
                        </div>
                        <div class="flex justify-between items-center py-2">
                            <span class="text-sm text-gray-600">Total Submissions</span>
                            <span class="text-sm font-semibold text-gray-800">${user.submissionCount}</span>
                        </div>
                    </div>
                </div>
                
                <!-- Actions -->
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
    `;

    lucide.createIcons();

    document.getElementById('approve-btn').addEventListener('click', actionHandlers.handleApprove);
    document.getElementById('reject-btn').addEventListener('click', actionHandlers.handleReject);
    document.getElementById('flag-btn').addEventListener('click', actionHandlers.handleFlag);
}
