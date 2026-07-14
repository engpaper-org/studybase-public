# UK legal release checklist

Last reviewed: 12 July 2026

Implementation review updated: 12 July 2026

## Implemented in the 12 July 2026 review

- Optional analytics remains off until a positive choice; accept, reject, and
  manage actions are presented together and the choice can be reopened.
- Session retention wording now matches the Monday 00:01 Europe/London cutoff.
- The privacy notice describes browser fingerprinting, short-lived off-site
  security events, automated bearer-token enforcement, and human review.
- The account-ban page now provides an existing support route for human review.
- Mobile-phone blocking is layered in the shared navigation code while ChromeOS
  and touch-enabled Chromebooks remain supported.

These code changes do not complete the operator, governance, processor-contract,
risk-assessment, or professional-review actions below.

This file is an internal implementation checklist, not a public legal notice or legal advice. The public pages and cookie controls have been improved, but no website can be declared fully compliant from a source-code review alone. Complete and evidence the items below before describing the service as compliant.

## Required operator details

- Replace the generic controller description in `privacy.html` with the controller's full legal name.
- Publish a direct contact email and postal/geographical address. If the operator is a company, add its registered company name, company number, registered office and VAT number where applicable.
- Confirm whether a UK representative, EU representative or data protection officer is required, and publish their details if so.
- Complete the ICO data-protection-fee self-assessment and retain the outcome or registration number.

## Data protection evidence

- Verify the public notice against the real production data flows, database fields, authentication provider, email provider, hosting/CDN, payment provider, support tools and analytics configuration.
- Maintain a record of processing activities, lawful-basis assessment, retention schedule, processor contracts, international-transfer assessment/safeguards and data-subject request procedure.
- Complete a data protection impact assessment for children's data, profiling/personalisation, social/friends features and any high-risk processing.
- Test that Google Analytics and every other non-essential storage/access technology remain absent until a positive choice, and repeat this audit whenever third-party code changes.
- Document the essential-purpose justification and duration for every necessary cookie or local-storage key.
- Ensure withdrawal is as easy as acceptance and that consent is refreshed when purposes/vendors change or the six-month choice expires.

## Children and online safety

- Assess the service against the ICO Children's code because it is likely to be accessed by under-18s; document age assurance, high-privacy defaults, geolocation/profiling controls, transparency and parental-consent handling where required.
- Assess friends, messaging, sharing and user-contribution features against the Online Safety Act and applicable Ofcom duties. Maintain the required risk assessments, reporting/complaints routes, moderation controls, terms enforcement and children's safety measures.

## Paid services and consumer law

- Before checkout, show the trader identity/contact details, total recurring price, billing interval, contract length, cancellation method and technical/functionality information clearly and prominently.
- Obtain explicit agreement to any immediate start during a cancellation period, provide the legally required acknowledgement where relevant, and send the contract information on a durable medium.
- Verify that cancellation, renewal and refund behaviour matches the Terms and current consumer/subscription rules in practice.

## Governance

- Have a UK-qualified solicitor review the final facts and business model before launch and whenever material processing, pricing, suppliers or social features change.
- Keep dated evidence of cookie scans, accessibility checks, security testing, staff procedures and each legal review.

## Official guidance checked

- ICO, Children's code introduction:
  https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/introduction-to-the-childrens-code/
- ICO, cookies and similar technologies:
  https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guide-to-pecr/cookies-and-similar-technologies/
- ICO, automated decisions and human intervention:
  https://ico.org.uk/for-the-public/your-rights-relating-to-decisions-being-made-about-you-without-human-involvement/
- Ofcom, children's access assessment duties:
  https://www.ofcom.org.uk/online-safety/illegal-and-harmful-content/childrens-access-assessment-duties-under-the-online-safety-act
- Ofcom, protection of children duties:
  https://www.ofcom.org.uk/online-safety/protecting-children/protection-of-children-duties-under-the-online-safety-act
