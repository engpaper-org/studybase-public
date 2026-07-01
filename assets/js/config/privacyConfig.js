(function () {
  "use strict";

  // PRIVACY RELEASE SWITCH
  // When a feature materially changes personal-data use, follow
  // docs/PRIVACY_RELEASE_CHECKLIST.md and replace noticeVersion with a new value.
  window.StudyBasePrivacyConfig = Object.freeze({
    noticeVersion: "STUDYBASE_PRIVACY_2026_07_02_V4",
    policyUpdatedAt: "2026-07-02",
    showUpdateNotice: true,
    updateTitle: "We've updated our Privacy Notice",
    updateMessage: "StudyBase now includes randomized StudyShop card packs and an account-linked card collection.",
    updateChanges: Object.freeze([
      "Card pack outcomes are selected securely using the published rarity chances",
      "Card identifiers and duplicate counts are stored with your account",
      "Card collection data is included in the Privacy Centre export"
    ]),
    privacyUrl: "/legal/privacy.html?consentReview=1",
    termsUrl: "/legal/tos.html?consentReview=1",
    consentLogUrl: "https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec",
    googleTagId: "G-N7LHC0S1T1"
  });
})();
