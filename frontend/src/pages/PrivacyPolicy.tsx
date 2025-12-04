export const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Name, email address, and contact information</li>
            <li>Shipping and billing addresses</li>
            <li>Payment information (processed securely through our payment providers)</li>
            <li>Order history and preferences</li>
            <li>Communication preferences and feedback</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Data</h2>
          <p className="mb-4">We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Process and fulfill your orders</li>
            <li>Communicate with you about your orders and account</li>
            <li>Send marketing communications (with your consent)</li>
            <li>Improve our products and services</li>
            <li>Prevent fraud and maintain security</li>
            <li>Comply with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Cookies Statement</h2>
          <p className="mb-4">
            We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Remember your preferences and settings</li>
            <li>Understand how you use our website</li>
            <li>Provide personalized content and recommendations</li>
            <li>Analyze site traffic and usage patterns</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            You can control cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our website.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Third-Party Tools</h2>
          <p className="mb-4">
            We work with trusted third-party service providers to help us operate our business:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Payment Processors:</strong> Stripe, PayPal for secure payment processing</li>
            <li><strong>Analytics:</strong> Google Analytics to understand website usage</li>
            <li><strong>Shipping Partners:</strong> Various courier services for order delivery</li>
            <li><strong>Email Services:</strong> For transactional and marketing emails</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            These third parties are bound by confidentiality agreements and are only permitted to use your information as necessary to provide services to us.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Security</h2>
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Rights</h2>
          <p className="mb-4">You have the right to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Access your personal data</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Opt-out of marketing communications</li>
            <li>Data portability</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Contact Us</h2>
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy, please contact us at privacy@example.com
          </p>
        </section>
      </div>
    </div>
  );
};
