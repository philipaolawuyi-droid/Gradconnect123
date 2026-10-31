export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-foreground py-12">
      <div className="container max-w-3xl">
        <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
          Privacy Policy
        </h1>
        <div className="art-deco-line mb-8 w-32"></div>

        <div className="prose prose-invert max-w-none space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              1. Introduction
            </h2>
            <p>
              GradConnect ("we," "us," "our," or "Company") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              2. Information We Collect
            </h2>
            <p>We collect information you voluntarily provide, such as:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Name, email address, and graduation year</li>
              <li>School/university name</li>
              <li>Profile photo and bio</li>
              <li>Posts, comments, and likes</li>
              <li>Event RSVPs and attendance information</li>
              <li>Device information (for push notifications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              3. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Provide and maintain our service</li>
              <li>Send you notifications about events and messages</li>
              <li>Display your profile and content to other alumni</li>
              <li>Improve and personalize your experience</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              4. Information Sharing
            </h2>
            <p>
              Your profile information and posts are visible to other GradConnect users. We do not sell or share your personal information with third parties, except:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>With your explicit consent</li>
              <li>To comply with legal requirements</li>
              <li>With service providers who assist us (e.g., cloud storage, email services)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              6. Cookies and Tracking
            </h2>
            <p>
              We use cookies and similar technologies to enhance your experience, remember your preferences, and understand how you use our service. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              7. Your Rights
            </h2>
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Opt-out of notifications</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              8. Children's Privacy
            </h2>
            <p>
              GradConnect is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware that we have collected such information, we will delete it immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              9. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date below.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
              10. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <p className="mt-4">
              <strong>Email:</strong> privacy@gradconnect.app<br />
              <strong>Address:</strong> [Your Company Address]
            </p>
          </section>

          <section className="text-sm text-muted-foreground mt-8">
            <p>Last Updated: June 18, 2026</p>
          </section>
        </div>
      </div>
    </div>
  );
}
