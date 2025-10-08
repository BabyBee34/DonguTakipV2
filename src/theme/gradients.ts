export const lightGradients = {
  primary: ['#FF9AD2', '#C78BFF', '#9E6BFF'],
  card: ['#FFFFFF', '#F7F7FA'],
  header: ['#E66FD2', '#B59CFF'],
  hero: ['#FFF5FE', '#F5F3FF'],
  background: ['#FFF3FA', '#F5EDFF'],
  button1: ['#FF7C9D', '#CBA8FF'],
  button2: ['#CBA8FF', '#7AD1C5'],
  onboardingWelcome: ['#FFE6F2', '#FAD8EF'],
  onboardingReminders: ['#E5FFF5', '#FFEFF9'],
  onboardingPrivacy: ['#FFE6F5', '#F9E1FF'],
  setup: ['#FFE6F2', '#FFF2F7'],
  setup2: ['#FFEAF2', '#FFF6FB'],
  setup3: ['#FFE6FF', '#F9E1FF'],
  setupButton: ['#FF66B2', '#FF8FC8'],
  setupButton3: ['#A44DFF', '#D69BFF'],
} as const;

export const darkGradients = {
  primary: ['#FF9AD2', '#C78BFF', '#9E6BFF'],
  card: ['#2C2C2E', '#3A3A3C'],
  header: ['#E66FD2', '#C5A8FF'],
  hero: ['#0E0E14', '#15151E'],
  background: ['#1C1C1E', '#2C2C2E'],
  button1: ['#FF7C9D', '#CBA8FF'],
  button2: ['#CBA8FF', '#8FE6D9'],
  onboardingWelcome: ['#2A1F2E', '#2E2340'],
  onboardingReminders: ['#1F3A35', '#2A1F2E'],
  onboardingPrivacy: ['#2A2140', '#2E1F2A'],
  setup: ['#2A2435', '#2E2A3F'],
  setupButton: ['#E66FD2', '#C5A8FF'],
} as const;

// Default export for backward compatibility
export const gradients = lightGradients;

