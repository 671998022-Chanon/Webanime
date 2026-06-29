// Continue Watching section — Task 14.1 placeholder
// Visible for authenticated users in future milestones. For now it always
// renders a placeholder box — the section controller will gate it.

import { PlaceholderContent, SectionShell } from "./section";

export function ContinueWatchingSection() {
  return (
    <SectionShell id="continue-watching" title="Continue Watching">
      <PlaceholderContent label="Continue Watching rail placeholder" />
    </SectionShell>
  );
}
