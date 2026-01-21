
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ContextRouter from './ContextRouter';
import SignAnimationScreen from '../SignAnimationScreen';
import { colors } from '../../../theme/colors';
import { OnboardingData } from '../../../context/OnboardingContext';

interface MainAppShellProps {
  onboarding: OnboardingData;
}

const MainAppShell: React.FC<MainAppShellProps> = ({ onboarding }) => {
  const { usageContexts } = onboarding;
  const availableContexts = [...(usageContexts || []), 'translation'];

  const [activeContext, setActiveContext] = useState(
    availableContexts.length > 0 ? availableContexts[0] : ''
  );

  return (
    <View style={styles.container}>
      <Sidebar
        contexts={availableContexts}
        activeContext={activeContext}
        onSelectContext={setActiveContext}
      />
      <View style={styles.mainContent}>
        {/* Pass onboarding to TopBar for mode toggle logic */}
        <TopBar activeContext={activeContext} onboarding={onboarding} />
        {activeContext === 'translation' ? (
          <SignAnimationScreen />
        ) : (
          <ContextRouter activeContext={activeContext} onboarding={onboarding} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.darkBackground,
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: colors.darkBackground,
  },
});

export default MainAppShell;
