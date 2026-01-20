
import React from 'react';
import { StyleSheet } from 'react-native';
import { colors } from '../../../theme/colors';
import ChatController from '../Chat/ChatController';

// Types
interface OnboardingData {
  usageContexts: string[];
  communicationPreference: 'text' | 'sign' | 'both';
  primaryLanguage: string;
  secondaryLanguage?: string;
}

interface ContextRouterProps {
  activeContext: string;
  onboarding: OnboardingData;
}

interface ContextConfig {
  systemPrompt: string;
  allowedFeatures: string[];
}

// Backend logic preparation (Phase 4)
function getContextConfig(contextType: string): ContextConfig {
  // Placeholder logic, can be extended per context
  switch (contextType) {
    case 'classroom':
      return {
        systemPrompt: 'You are assisting in a classroom environment...', 
        allowedFeatures: ['explain', 'summarize'],
      };
    case 'workplace':
      return {
        systemPrompt: 'You are assisting in a workplace environment...',
        allowedFeatures: ['summarize', 'translate'],
      };
    case 'public':
      return {
        systemPrompt: 'You are assisting in a public environment...',
        allowedFeatures: ['summarize'],
      };
    case 'daily':
    default:
      return {
        systemPrompt: 'You are assisting in a daily context...',
        allowedFeatures: ['explain'],
      };
  }
}

// Remove ContextScreen. ChatController is now the main component for all contexts.

// Main ContextRouter
const ContextRouter: React.FC<ContextRouterProps> = ({ activeContext, onboarding }) => {
  // Only allow rendering if the context is in the user's onboarding usageContexts
  const contextType = onboarding.usageContexts.includes(activeContext)
    ? activeContext
    : onboarding.usageContexts[0];

  // Prepare backend config (not used yet)
  const contextConfig = getContextConfig(contextType);

  return (
    <ChatController activeContext={contextType} />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkBackground,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  contextTitle: {
    color: colors.neonBlue,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  infoText: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
  },
  highlight: {
    color: colors.neonBlue,
    fontWeight: 'bold',
  },
  placeholder: {
    color: colors.neonBlue,
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    textAlign: 'center',
  },
});

export default ContextRouter;
