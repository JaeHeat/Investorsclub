import { useEffect } from "react";
import { LegalShell, LegalSection } from "@/components/LegalShell";

export default function PrivacyPage() {
  useEffect(() => {
    document.title = "Privacy Policy — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  return (
    <LegalShell title="Privacy Policy" updated="June 2026">
      <p>
        This policy explains what information the Bitcoin Daily client portal collects, how we use it, and your choices.
        We keep this deliberately simple: we collect only what's needed to provide the consultation service, and we do
        not sell your data.
      </p>

      <LegalSection heading="1. What we collect">
        <p>
          <strong>Account information</strong> from your sign-in (such as your name and email). <strong>Information you
          enter</strong> — your profile, goals, risk preferences, and the holdings and amounts you choose to record.
          <strong> Basic usage data</strong> needed to operate and secure the portal.
        </p>
        <p>We do not ask for, store, or have access to your exchange logins, wallet keys, or funds.</p>
      </LegalSection>

      <LegalSection heading="2. How we use it">
        <p>
          To personalise your portal (your plan, projections, and analytics), to provide the consultation service, and
          to keep your account secure. Your portfolio figures are for your own educational view.
        </p>
      </LegalSection>

      <LegalSection heading="3. Where it's stored">
        <p>
          Your profile and holdings are stored in our database to sync across your devices, and cached in your browser's
          local storage for performance. Authentication is handled by our sign-in provider; we store a secure session
          to keep you logged in.
        </p>
      </LegalSection>

      <LegalSection heading="4. Third-party services">
        <p>
          We use a small number of third parties strictly to run the Service: a market-data provider (for live and
          historical prices), our authentication provider, and — only if you opt in — Discord for community access. We
          do not sell or rent your personal information to anyone.
        </p>
      </LegalSection>

      <LegalSection heading="5. Security and retention">
        <p>
          We use reasonable technical measures (encrypted transport, secure session cookies, access controls) to protect
          your information, and retain it for as long as your account is active. No method of storage is perfectly
          secure.
        </p>
      </LegalSection>

      <LegalSection heading="6. Your choices">
        <p>
          You can update your profile and holdings at any time in Settings, and you can request deletion of your account
          and associated data by contacting your Bitcoin Daily point of contact. The Service is intended for adults only.
        </p>
      </LegalSection>

      <LegalSection heading="7. Changes">
        <p>We may update this policy; we'll revise the "last updated" date above when we do.</p>
      </LegalSection>
    </LegalShell>
  );
}
