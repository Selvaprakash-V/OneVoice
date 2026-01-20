import { auth } from './firebase';
import { BACKEND_URL } from './config';
import { OnboardingData } from '../context/OnboardingContext';

// Replace baseUrl with BACKEND_URL
const baseUrl = BACKEND_URL;
console.log('🌐 BACKEND_URL =', baseUrl);

export async function storeOnboardingData(onboarding: OnboardingData) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const payload = {
    uid: user.uid,
    onboarding: {
      textSize: onboarding.textSize,
      communicationPreference: onboarding.communicationPreference,
      usageContexts: onboarding.usageContexts,
      primaryLanguage: onboarding.primaryLanguage,
      secondaryLanguage: onboarding.secondaryLanguage?.trim() || 'None',
    },
  };

  const response = await fetch(`${baseUrl}/onboarding`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}

export async function fetchOnboardingData() {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const response = await fetch(`${BACKEND_URL}/onboarding?uid=${user.uid}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error('Failed to fetch onboarding data:', text);
    throw new Error(text);
  }

  return response.json();
}

export async function saveContextPersonalization(contextName: string, data: {
  struggles: string;
  preference: string;
  tone: string;
  goals: string;
  assistanceStyle: string;
}) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const payload = {
    uid: user.uid,
    contextName,
    ...data,
  };

  const response = await fetch(`${baseUrl}/users/${user.uid}/contexts/${contextName}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}

export async function fetchContextPersonalization(contextName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No authenticated user');

  const response = await fetch(`${baseUrl}/users/${user.uid}/contexts/${contextName}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}

export async function saveGeneratedPrompt(uid: string, prompt: string) {
  const response = await fetch(`${baseUrl}/users/${uid}/generatedPrompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text);
  }

  return response.json();
}
