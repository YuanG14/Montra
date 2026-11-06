// Cancel guide. Written from general knowledge: menus change, so the dialog says so.
// `url` is only set where the account page is long-standing.
export const GENERIC = [
  "Sign in on the service's website or app and open Account or Settings.",
  'Find Subscription, Membership or Billing.',
  'Choose Cancel (or turn off auto-renew) and confirm.',
  'Keep the confirmation email or a screenshot.'
];
export const CANCEL = {
  'Netflix': { url: 'https://www.netflix.com/cancelplan', steps: ['Sign in at netflix.com and open Account.', 'Under Membership & Billing, choose Cancel Membership.', 'Confirm. You keep access until the end of the billing period.'] },
  'Spotify': { url: 'https://www.spotify.com/account/overview/', steps: ['Log in on the Spotify website (the app cannot cancel).', 'Open Account, then Your plan.', 'Choose Change plan, then Cancel Premium, and confirm.'] },
  'Disney+': { url: 'https://www.disneyplus.com/account', steps: ['Sign in and open Account.', 'Select your subscription, then Cancel Subscription.', 'Confirm.'] },
  'YouTube Premium': { url: 'https://www.youtube.com/paid_memberships', steps: ['Open the link and sign in.', 'Choose Manage membership next to YouTube Premium.', 'Select Deactivate and confirm.'] },
  'Prime Video': { steps: ['Sign in to your Amazon or Prime Video account.', 'Open Account & Settings, then Your Memberships and Subscriptions.', 'Choose End membership or Cancel, and confirm.'] },
  'HBO Max': { steps: ['Sign in and open Account from your profile menu.', 'Select Subscription, then Manage or Cancel.', 'Confirm.'] },
  'Viu': { steps: ['Sign in and open your Account or Profile page.', 'Find Subscription or Manage plan.', 'Turn off auto-renew or choose Cancel.'] },
  'Apple Music': { steps: ['iPhone or iPad: open Settings, tap your name, then Subscriptions.', 'Pick Apple Music and tap Cancel Subscription.', 'Mac: App Store, your name, Account Settings, Subscriptions.'] },
  'iCloud+': { steps: ['iPhone or iPad: open Settings, tap your name, then iCloud.', 'Tap Manage Account Storage, then Change Storage Plan.', 'Choose Downgrade Options and pick the free 5 GB plan.'] },
  'Google One': { url: 'https://one.google.com/settings', steps: ['Open Google One and sign in.', 'Go to Settings, then Cancel membership.', 'Confirm.'] },
  'Microsoft 365': { url: 'https://account.microsoft.com/services', steps: ['Sign in and find Microsoft 365 under Services & subscriptions.', 'Choose Manage, then Cancel subscription.', 'Follow the prompts to confirm.'] },
  'Adobe Creative Cloud': { url: 'https://account.adobe.com/plans', steps: ['Sign in and open Plans.', 'Select Manage plan, then Cancel your plan.', 'Read the cancellation terms first: some annual plans charge an early-termination fee.'] },
  'Canva Pro': { url: 'https://www.canva.com/settings/billing-and-teams', steps: ['Open Account settings, then Billing & plans.', 'Choose Cancel subscription.', 'Confirm.'] },
  'ChatGPT Plus': { steps: ['Sign in to ChatGPT and open your profile menu.', 'Choose My plan or Manage subscription.', 'Select Cancel plan and confirm.'] },
  'Notion': { steps: ['Open Settings in Notion, then Plans.', 'Choose Change plan and switch to Free.', 'Confirm.'] },
  'Duolingo Plus': { steps: ['Cancel where you subscribed: App Store, Google Play or duolingo.com.', 'On the website: Settings, then Manage subscription.', 'Turn off auto-renew or choose Cancel.'] },
  'Xbox Game Pass': { url: 'https://account.microsoft.com/services', steps: ['Sign in and find Xbox Game Pass under Services & subscriptions.', 'Choose Manage, then Cancel subscription.', 'Confirm.'] },
  'PlayStation Plus': { steps: ['On your console: Settings, Users and Accounts, Account, Payment and Subscriptions.', 'Open Subscription Management and select PlayStation Plus.', 'Turn off auto-renew.'] }
};
export const guideFor = name => CANCEL[Object.keys(CANCEL).find(k => k.toLowerCase() === String(name).toLowerCase())] || null;
// Only allow real web links (blocks javascript: and other schemes)
export const safeUrl = u => (u && /^https?:\/\//i.test(u) ? u : null);
