import { useEffect } from "react";
import { LegalShell, LegalSection } from "@/components/LegalShell";

export default function TermsPage() {
  useEffect(() => {
    document.title = "Terms of Service — Bitcoin Daily";
    return () => { document.title = "Bitcoin Daily"; };
  }, []);

  return (
    <LegalShell title="Terms of Service" updated="June 2026">
      <p>
        These Terms govern your use of the Bitcoin Daily consultation service and client portal (the "Service").
        By using the Service you agree to these Terms. Please read them carefully.
      </p>

      <LegalSection heading="1. What this service is">
        <p>
          Bitcoin Daily is an <strong>educational and informational consultation service</strong>. We share
          historical market data, Bitcoin halving-cycle analysis, and our own opinions and frameworks based on that
          data. The portal lets you organise your own holdings and goals and view educational projections, scenarios,
          and analytics built from publicly available historical information.
        </p>
      </LegalSection>

      <LegalSection heading="2. Not financial, investment, tax, or legal advice">
        <p>
          Nothing in the Service is financial, investment, tax, accounting, or legal advice, and nothing is a
          recommendation, solicitation, or offer to buy or sell any asset. We are not a broker-dealer, investment
          adviser, exchange, or custodian, and using the Service does not create any advisory or fiduciary
          relationship. All content reflects <strong>our opinions and educational interpretation of historical
          data</strong>. You are solely responsible for your own decisions and should consult your own licensed
          professionals before acting.
        </p>
      </LegalSection>

      <LegalSection heading="3. No guarantees; risk of loss">
        <p>
          Digital assets are highly volatile and can lose substantial or all of their value. Past performance,
          historical cycles, projections, probability forecasts, and any "plan vs. hold" or backtest figures are
          <strong> hypothetical, illustrative, and based on historical data and our opinions</strong> — they are not
          promises or predictions of future results, and actual outcomes will differ. We make no guarantee of any
          result, return, or outcome.
        </p>
      </LegalSection>

      <LegalSection heading="4. Your responsibility">
        <p>
          You make all of your own decisions. We never take custody of your funds, hold your assets, place trades, or
          move money on your behalf. Any prices, balances, and figures shown are estimates for your convenience and may
          be delayed, incomplete, or inaccurate; verify independently before relying on them.
        </p>
      </LegalSection>

      <LegalSection heading="5. Accounts and acceptable use">
        <p>
          You are responsible for maintaining the security of your account and for the accuracy of the information you
          enter. You agree not to misuse the Service, attempt to access other clients' data, disrupt the platform, or
          use it for any unlawful purpose.
        </p>
      </LegalSection>

      <LegalSection heading="6. Intellectual property">
        <p>
          The Service, its content, analysis, and frameworks are owned by Bitcoin Daily and provided for your personal
          use only. You may not redistribute, resell, or republish them without written permission.
        </p>
      </LegalSection>

      <LegalSection heading="7. Disclaimer of warranties; limitation of liability">
        <p>
          The Service is provided "as is" without warranties of any kind. To the maximum extent permitted by law,
          Bitcoin Daily is not liable for any losses or damages arising from your use of the Service or any decisions
          you make based on it.
        </p>
      </LegalSection>

      <LegalSection heading="8. Changes, termination, and contact">
        <p>
          We may update these Terms or the Service at any time; continued use means you accept the changes. We may
          suspend or terminate access for misuse. Questions about these Terms can be sent to your Bitcoin Daily point of
          contact.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
