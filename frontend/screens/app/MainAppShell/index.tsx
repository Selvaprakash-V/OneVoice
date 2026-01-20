
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import ContextRouter from './ContextRouter';
import { colors } from '../../../theme/colors';
import { OnboardingData } from '../../../context/OnboardingContext';

interface MainAppShellProps {
  onboarding: OnboardingData;
}

const MainAppShell: React.FC<MainAppShellProps> = ({ onboarding }) => {
  const { usageContexts } = onboarding;
  const [activeContext, setActiveContext] = useState(
    usageContexts && usageContexts.length > 0 ? usageContexts[0] : ''
  );

  return (
    <View style={styles.container}>
      <Sidebar
        contexts={usageContexts}
        activeContext={activeContext}
        onSelectContext={setActiveContext}
      />
      <View style={styles.mainContent}>
        {/* Pass onboarding to TopBar for mode toggle logic */}
        <TopBar activeContext={activeContext} onboarding={onboarding} />
        <ContextRouter activeContext={activeContext} onboarding={onboarding} />
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
