import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Kodash",
  description:
    "Kodash Privacy Policy for clients and freelancers using the freelance escrow platform.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-bgPrimary text-textNc py-16">
      <div className="mx-auto max-w-4xl px-6">
        <div className="rounded-[2rem] border border-cardCB bg-cardC/95 p-10 shadow-xl shadow-black/20">
          <div className="mb-10">
            <p className="text-sm uppercase tracking-[0.24em] text-textNe">
              Privacy Policy
            </p>
            <h1 className="mt-4 text-4xl font-semibold text-textNa">
              Kodash Privacy Policy
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-textNd">
              Kodash is a contract-first freelance platform that manages agreements,
              deliverables, and payments through an escrow system. This policy
              explains what information we collect, how we use it, and how we
              protect your data.
            </p>
          </div>

          <article className="space-y-10 prose prose-invert max-w-none text-textNc">
            <section>
              <h2>Information We Collect</h2>
              <p>
                Kodash collects information necessary to deliver a secure freelance
                escrow experience. This includes:
              </p>
              <ul>
                <li>
                  <strong>Google profile data:</strong> name, email address, and
                  profile picture when you sign in using Google OAuth.
                </li>
                <li>
                  <strong>Payment information:</strong> Stripe handles payment data
                  for escrow transactions, client payments, and freelancer payouts.
                </li>
                <li>
                  <strong>Project and contract data:</strong> task records, proposal
                  details, request information, and delivery status stored in
                  Supabase.
                </li>
              </ul>
            </section>

            <section>
              <h2>How We Use Information</h2>
              <p>
                We use your data to operate Kodash and keep transactions moving
                safely.
              </p>
              <ul>
                <li>
                  Facilitate contracts, project agreements, and communication
                  between clients and freelancers.
                </li>
                <li>
                  Manage escrow deposits, automatic release timing, and payment
                  status tracking.
                </li>
                <li>
                  Support Stripe Connect onboarding for freelancers so payouts
                  can be completed correctly.
                </li>
                <li>
                  Provide customer support and respond to questions about your
                  account or transaction history.
                </li>
              </ul>
            </section>

            <section>
              <h2>Data Sharing</h2>
              <p>
                Kodash shares data only with the services required to power the
                platform and maintain secure payments.
              </p>
              <ul>
                <li>
                  <strong>Stripe:</strong> payment processing, escrow handling, and
                  freelancer payout routing through Stripe Connect.
                </li>
                <li>
                  <strong>Supabase:</strong> cloud database storage, authentication,
                  and secure infrastructure for application data.
                </li>
              </ul>
              <p>
                We do not sell your personal information. Data is shared with
                third-party providers only to support the core platform functions
                and preserve the integrity of the escrow workflow.
              </p>
            </section>

            <section>
              <h2>User Rights</h2>
              <p>
                You have control over your data and how it is handled on Kodash.
              </p>
              <ul>
                <li>
                  <strong>Access:</strong> You may request access to the personal
                  information we store about you.
                </li>
                <li>
                  <strong>Correction and deletion:</strong> You can ask us to correct
                  or delete your data when permitted by applicable law.
                </li>
                <li>
                  <strong>Security:</strong> We protect your data with encryption,
                  secure access controls, and continuous infrastructure monitoring.
                </li>
              </ul>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>
                If you have questions about this policy, your rights, or the way
                we use your information, contact our support team at
                <a
                  className="text-primaryC hover:text-primaryHC"
                  href="mailto:networkinggozy@gmail.com"
                >
                  networkinggozy@gmail.com
                </a>
                .
              </p>
              <p>
                Kodash is based in Nigeria and serves a global audience while
                maintaining a focus on transparency, trust, and secure escrow
                payments.
              </p>
            </section>
          </article>
        </div>
      </div>
    </main>
  );
}
