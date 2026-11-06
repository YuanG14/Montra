export const CATEGORIES = ['Entertainment', 'Music', 'Productivity', 'Storage', 'Gaming', 'Education', 'Shopping', 'Other'];
// Popular services for quick-pick in the Add form: [name, category, brand color]
export const SERVICES = [
  ['Netflix', 'Entertainment', '#E50914'], ['Spotify', 'Music', '#1DB954'], ['Disney+', 'Entertainment', '#113CCF'],
  ['YouTube Premium', 'Entertainment', '#E62117'], ['Prime Video', 'Entertainment', '#00A8E1'], ['HBO Max', 'Entertainment', '#5822B4'],
  ['Viu', 'Entertainment', '#FFB400'], ['Apple Music', 'Music', '#FA243C'], ['iCloud+', 'Storage', '#3693F5'],
  ['Google One', 'Storage', '#4285F4'], ['Microsoft 365', 'Productivity', '#D83B01'], ['Adobe Creative Cloud', 'Productivity', '#FA0F00'],
  ['Canva Pro', 'Productivity', '#7D2AE8'], ['ChatGPT Plus', 'Productivity', '#10A37F'], ['Notion', 'Productivity', '#2B2B2B'],
  ['Duolingo Plus', 'Education', '#58CC02'], ['Xbox Game Pass', 'Gaming', '#107C10'], ['PlayStation Plus', 'Gaming', '#003087']
].map(([name, category, color]) => ({ name, category, color }));
