import { SITE } from '../../core/data/site.config';

export interface LegalSection {
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
  /** Shown after the bullets */
  after?: string[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

/**
 * Policy text. Edit freely; company details come from core/data/site.config.ts.
 * This is a general starting draft and should be reviewed by a qualified legal adviser before launch.
 */
export const LEGAL_DOCS: Record<'privacy' | 'refund', LegalDoc> = {
  privacy: {
    eyebrow: 'Legal',
    title: 'Privacy Policy',
    intro: `This policy explains what personal information ${SITE.name} collects when you use ${SITE.website}, why we collect it, how we protect it and the choices you have.`,
    sections: [
      {
        id: 'who-we-are', heading: '1. Who we are',
        paragraphs: [
          `${SITE.legalName} ("we", "us") publishes executive news, insights, leadership profiles, events and a digital magazine, and runs a private community of business leaders. We are the controller of the personal information described in this policy.`,
          `You can reach us at ${SITE.email} or by post at ${SITE.address}.`
        ]
      },
      {
        id: 'what-we-collect', heading: '2. Information we collect',
        paragraphs: ['We collect information in two ways: what you choose to give us, and a small amount collected automatically when you browse.'],
        bullets: [
          'Get in touch form: your name and email address.',
          'Membership applications: your name, contact number and email address.',
          'Contact us form: your name, email address, subject and message.',
          'Blog submissions: your name, email address, the article headline, category and text you send.',
          'Magazine submissions: the details in the email you send us, and the file you attach.',
          'Browsing information: the pages you open, the date and time, the website you came from, and a random identifier stored in your browser (see Cookies below). We do not store your IP address in our visitor statistics.'
        ]
      },
      {
        id: 'how-we-use', heading: '3. How we use your information',
        bullets: [
          'To respond to your messages and requests.',
          'To send the newsletters, briefs and invitations you asked for. You can unsubscribe at any time.',
          'To review membership applications and contribute submissions.',
          'To understand which pages are popular so we can improve the website and our content.',
          'To keep the website secure and prevent misuse.',
          'To meet legal and regulatory obligations.'
        ],
        after: ['We only use your information for purposes that are compatible with the reasons you gave it to us.']
      },
      {
        id: 'cookies', heading: '4. Cookies and browser storage',
        paragraphs: [
          'We do not use advertising cookies. To count visitors we store two random identifiers in your browser: one that lasts until you clear your browser data (to recognise a returning visitor) and one that lasts for the current visit only. They contain no personal information.',
          'You can clear them at any time in your browser settings. The website works normally without them, but your visit may then be counted as a new one.'
        ]
      },
      {
        id: 'sharing', heading: '5. Who we share information with',
        paragraphs: ['We do not sell your personal information. We share it only with service providers who help us run the website, under agreements that require them to protect it:'],
        bullets: [
          'Supabase, which hosts our database (forms, subscriber list, content).',
          'Cloudflare, which stores and delivers images and magazine files.',
          'Authorities or professional advisers, where the law requires it or to protect our rights.'
        ]
      },
      {
        id: 'retention', heading: '6. How long we keep it',
        paragraphs: ['We keep personal information only as long as needed for the purpose it was collected, or as the law requires. Subscriber details are kept until you unsubscribe or ask us to delete them. Contact messages and applications are normally deleted within 24 months. Visitor statistics are kept in aggregate form.']
      },
      {
        id: 'security', heading: '7. Security',
        paragraphs: ['We use encrypted connections, access controls and reputable infrastructure providers to protect your information. No online service can be guaranteed completely secure, but we work to keep your data safe and will notify you and the relevant authority of a breach where required.']
      },
      {
        id: 'rights', heading: '8. Your rights',
        paragraphs: ['Depending on where you live, you may have the right to:'],
        bullets: [
          'ask what personal information we hold about you and receive a copy;',
          'ask us to correct information that is wrong or out of date;',
          'ask us to delete your information or restrict how we use it;',
          'object to our use of your information, or withdraw your consent at any time;',
          'complain to your local data-protection authority.'
        ],
        after: [`To use any of these rights, email ${SITE.email}. We will respond within a reasonable time and may need to verify your identity first.`]
      },
      {
        id: 'children', heading: '9. Children',
        paragraphs: ['Our services are intended for business professionals and are not directed at children under 16. We do not knowingly collect their personal information.']
      },
      {
        id: 'transfers', heading: '10. International transfers',
        paragraphs: ['Our service providers may process information in countries other than your own. Where we transfer personal information internationally, we take steps to make sure it receives an appropriate level of protection.']
      },
      {
        id: 'changes', heading: '11. Changes to this policy',
        paragraphs: [`We may update this policy from time to time. The date at the top shows when it was last changed. If we make a significant change, we will take reasonable steps to let you know.`]
      },
      {
        id: 'contact', heading: '12. Contact us',
        paragraphs: [`Questions about this policy or your information? Email ${SITE.email}, call ${SITE.phone}, or write to ${SITE.legalName}, ${SITE.address}.`]
      }
    ]
  },

  refund: {
    eyebrow: 'Legal',
    title: 'Refund & Cancellation Policy',
    intro: `This policy explains how to cancel and when you can receive a refund for ${SITE.name} subscriptions, memberships, event tickets and print copies.`,
    sections: [
      {
        id: 'overview', heading: '1. Overview',
        paragraphs: [
          'We want you to be happy with what you buy. The rules below apply to purchases made through our website. Where a different rule is shown at the time of purchase for a specific product or event, that rule applies.',
          'Nothing in this policy limits any rights you have under the consumer law where you live.'
        ]
      },
      {
        id: 'subscriptions', heading: '2. E-Magazine subscriptions',
        bullets: [
          'You can cancel a subscription at any time. Cancellation stops future renewals and takes effect at the end of the period you have already paid for.',
          'If you cancel within 7 days of your first purchase and have not downloaded more than one issue, we will refund the subscription fee in full.',
          'After that 7-day period, fees for the current period are not refundable.',
          'Individual issues that have already been downloaded are not refundable.'
        ]
      },
      {
        id: 'membership', heading: '3. The Network membership',
        bullets: [
          'There is no charge to apply. Membership fees are payable only after your application is approved.',
          'If you cancel within 14 days of approval and have not attended a member event or used a member-only service, you will receive a full refund.',
          'After 14 days, fees are not refundable, but you can cancel at any time to stop the next renewal.'
        ]
      },
      {
        id: 'events', heading: '4. Event tickets and registrations',
        bullets: [
          '14 days or more before the event: full refund.',
          '7 to 13 days before the event: 50% refund.',
          'Fewer than 7 days before the event: no refund, but you may transfer your place to a colleague by emailing us with their name and details.',
          'If we cancel or significantly change an event, you may choose a full refund or a credit toward a future event.',
          'Invitation-only dinners and roundtables may have their own terms, which we will tell you about when you accept the invitation.'
        ]
      },
      {
        id: 'print', heading: '5. Printed copies',
        paragraphs: ['Printed issues cannot be returned once dispatched. If a copy arrives damaged, or does not arrive, contact us within 30 days of the expected delivery date and we will send a replacement or refund you.']
      },
      {
        id: 'how-to', heading: '6. How to cancel or ask for a refund',
        paragraphs: [`Email ${SITE.email} with the subject "Cancellation" or "Refund". Please include your name, the email address used for the purchase, what you bought and, if possible, your order or receipt number. We reply within 3 working days.`]
      },
      {
        id: 'processing', heading: '7. How refunds are paid',
        paragraphs: ['Approved refunds are returned to the original payment method. Please allow 7 to 10 working days for the money to appear, depending on your bank or card provider. Fees charged by payment providers for the original transaction may not be recoverable.']
      },
      {
        id: 'contact', heading: '8. Questions',
        paragraphs: [`If you are unsure whether something is covered, contact us at ${SITE.email} or ${SITE.phone}. ${SITE.hours}.`]
      }
    ]
  }
};
