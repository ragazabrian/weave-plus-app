import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/logo";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | weave+" },
      {
        name: "description",
        content:
          "How weave+ handles personal data: what we collect, why we collect it, how long we keep it and the choices you have.",
      },
      { property: "og:title", content: "Privacy Notice | weave+" },
      {
        property: "og:description",
        content:
          "What personal data weave+ processes, the reasons for it, and how to exercise your rights.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PrivacyPage,
});

const UPDATED = "10 August 2026";

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-border py-10">
      <h2 className="font-display text-heading-sm font-medium tracking-[-0.02em] text-snow-white">
        {title}
      </h2>
      <div className="mt-4 flex flex-col gap-4 text-body text-ash">{children}</div>
    </section>
  );
}

function PrivacyPage() {
  return (
    <div className="min-h-screen bg-void-canvas">
      <header className="border-b border-border">
        <div className="mx-auto flex w-full max-w-[820px] items-center justify-between px-4 py-4 sm:px-6">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <Link
            to="/"
            className="text-body-sm font-medium text-bone underline-offset-4 hover:underline"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[820px] px-4 pb-24 pt-14 sm:px-6">
        <p className="text-caption font-medium uppercase tracking-[0.18em] text-slate">Legal</p>
        <h1 className="mt-4 font-display text-heading font-medium tracking-[-0.03em] text-snow-white sm:text-heading-lg">
          Privacy Notice
        </h1>
        <p className="mt-3 text-body-sm text-slate">Last updated: {UPDATED}</p>
        <p className="mt-6 text-body-lg text-ash">
          This notice explains how the weave+ workspace handles personal data for the people who use
          it: workspace members, course participants and visitors to this website. It is written by
          the team that operates this workspace and describes the practices we commit to.
        </p>

        <Section id="roles" title="1. Who is responsible for your data">
          <p>
            When your institution or employer invites you into a weave+ workspace, that organisation
            decides why your data is processed inside the workspace, and we process it on their
            instructions. For visitors to this website and people who sign up on their own, we make
            those decisions ourselves.
          </p>
          <p>
            If you are unsure which applies to you, contact us using the details at the end of this
            notice and we will point you to the right party.
          </p>
        </Section>

        <Section id="collect" title="2. What we collect">
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>
              <span className="text-snow-white">Account data</span>: your name, email address and
              role in the workspace, created when you sign up or accept an invitation.
            </li>
            <li>
              <span className="text-snow-white">Content</span>: notes, canvases, messages,
              submissions, files you upload, and the questions you ask the agent.
            </li>
            <li>
              <span className="text-snow-white">Course activity</span>: module progress, assignment
              submissions, grades and feedback.
            </li>
            <li>
              <span className="text-snow-white">Connected sources</span>: content from integrations
              a workspace admin turns on, read only to answer your requests.
            </li>
            <li>
              <span className="text-snow-white">Technical data</span>: device and browser
              information, IP address and error reports, used to keep the service running.
            </li>
            <li>
              <span className="text-snow-white">Optional analytics</span>: if you agree, anonymised
              records of the questions you ask, used to improve answer quality. You can withdraw
              this at any time in Settings.
            </li>
          </ul>
        </Section>

        <Section id="why" title="3. Why we process it">
          <ul className="flex list-disc flex-col gap-2 pl-5">
            <li>To provide the workspace you or your organisation signed up for.</li>
            <li>To keep accounts secure and prevent misuse.</li>
            <li>To answer support requests and communicate about the service.</li>
            <li>
              To improve the product, using aggregated or anonymised information wherever that is
              enough.
            </li>
            <li>To meet obligations that apply to us by law.</li>
          </ul>
        </Section>

        <Section id="sharing" title="4. Who we share it with">
          <p>
            We share personal data only with service providers that help us run weave+, such as
            hosting, database, email delivery and AI model providers, and only to the extent needed
            for that service. We do not sell personal data.
          </p>
          <p>
            Content you place in a course or shared note is visible to the people in that course or
            workspace according to their role.
          </p>
        </Section>

        <Section id="retention" title="5. How long we keep it">
          <p>
            Account and content data is kept while your account is active. When an account or
            workspace is deleted, we remove or anonymise the associated data, except where we must
            keep records for a limited period to meet a legal obligation.
          </p>
        </Section>

        <Section id="security" title="6. How we protect it">
          <p>
            Access to workspace data is restricted by role, enforced in the database rather than
            only in the interface. Traffic between your browser and our servers is encrypted in
            transit, and access to production systems is limited to the people who need it.
          </p>
        </Section>

        <Section id="rights" title="7. Your choices and rights">
          <p>
            Depending on where you live, you may be able to ask for a copy of your data, correct it,
            delete it, restrict or object to certain processing, or receive it in a portable format.
            You can also withdraw optional analytics consent at any time without affecting your use
            of weave+.
          </p>
          <p>
            To exercise any of these, contact us and we will respond within the period required by
            the law that applies to you.
          </p>
        </Section>

        <Section id="cookies" title="8. Cookies and local storage">
          <p>
            We use a small number of cookies and local storage entries that are necessary to sign
            you in and remember interface preferences such as your theme and sidebar state. Optional
            analytics are only recorded after you agree in the privacy prompt.
          </p>
        </Section>

        <Section id="changes" title="9. Changes to this notice">
          <p>
            We may update this notice. When a change materially affects you, we will make it visible
            in the product before it takes effect.
          </p>
        </Section>

        <Section id="contact" title="10. Contact">
          <p>
            Questions about this notice or about your data can go to your workspace admin, or to the
            contact address published by the organisation that operates this workspace.
          </p>
        </Section>
      </main>
    </div>
  );
}
