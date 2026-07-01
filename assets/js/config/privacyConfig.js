(function () {
  "use strict";

  // PRIVACY RELEASE SWITCH
  // When a feature materially changes personal-data use, follow
  // docs/PRIVACY_RELEASE_CHECKLIST.md and replace noticeVersion with a new value.
  window.StudyBasePrivacyConfig = Object.freeze({
    noticeVersion: "STUDYBASE_PRIVACY_2026_07_01_V3",
    policyUpdatedAt: "2026-07-01",
    showUpdateNotice: true,
    updateTitle: "We've updated our Privacy Notice",
    updateMessage: "StudyBase now provides clearer service choices, a separate analytics decision, and a limited mode that blocks account and third-party connections.",
    updateChanges: Object.freeze([
      "Clear Accept all, Essential only, and Deny choices",
      "Optional analytics remains separate from essential account services",
      "Consent choices can be reviewed later in the Privacy Centre"
    ]),
    privacyUrl: "/legal/privacy.html?consentReview=1",
    termsUrl: "/legal/tos.html?consentReview=1",
    consentLogUrl: "https://script.google.com/macros/s/AKfycbyW-AQ4JeYOMujbXToocpkXPH_GMYxhJTqViDOkoPyXYrpcaMvFuxnVjtWQx-ot6T3L/exec",
    googleTagId: "G-N7LHC0S1T1"
  });
})();
