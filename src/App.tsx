import { useState } from 'react';
import { LandingHero } from './components/LandingHero';
import { StatusBar } from './components/StatusBar';
import { Workspace } from './components/Workspace';
import { SettingsModal } from './components/SettingsModal';
import { SakuraBackground } from './components/SakuraBackground';
import { OnboardingOverlay } from './components/OnboardingOverlay';
import { ThemeToggle } from './components/ThemeToggle';
import { useAppState } from './core/state/store';

export default function App() {
  const { repo } = useAppState();
  const inWorkspace = !!repo;
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);

  return (
    <div className="flex h-full flex-col bg-bg-canvas text-text-primary">
      <SakuraBackground />
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      {!onboardingDone && !inWorkspace && (
        <OnboardingOverlay onComplete={() => setOnboardingDone(true)} />
      )}
      <main className="relative z-10 flex flex-1 overflow-hidden">
        {inWorkspace ? (
          <Workspace onOpenSettings={() => setSettingsOpen(true)} />
        ) : (
          <LandingHero onOpenSettings={() => setSettingsOpen(true)} />
        )}
      </main>

      <div className="relative z-10">
        <StatusBar onOpenSettings={() => setSettingsOpen(true)} />
      </div>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}
