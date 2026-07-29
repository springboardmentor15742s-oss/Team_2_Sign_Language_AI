export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'SignLearn',
  version: '1.0.0-phase1',
  phaseName: 'Phase 1: Production Monorepo & UI Foundation',
  organization: 'Infosys Internship Project',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  supportEmail: 'support@signlearn.ai',
};
