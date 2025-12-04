export const TermsOfService = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground">
            By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to these terms, please do not use our services.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. User Responsibilities</h2>
          <p className="mb-4">As a user of our service, you agree to:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Provide accurate and complete information when creating an account</li>
            <li>Maintain the security of your account credentials</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
            <li>Use the website only for lawful purposes</li>
            <li>Not interfere with the proper functioning of the website</li>
            <li>Not attempt to gain unauthorized access to our systems</li>
            <li>Respect intellectual property rights</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Payment Rules</h2>
          <p className="mb-4">When making a purchase, you agree that:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>All prices are in USD unless otherwise stated</li>
            <li>Payment must be received before order processing begins</li>
            <li>We accept major credit cards, debit cards, and other listed payment methods</li>
            <li>You authorize us to charge the payment method provided</li>
            <li>Prices are subject to change without notice</li>
            <li>We reserve the right to refuse or cancel orders for any reason</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Return & Refund Conditions</h2>
          <p className="mb-4">Our return and refund policy includes:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>30-day return window from date of delivery</li>
            <li>Items must be unused and in original condition</li>
            <li>Original packaging and tags must be intact</li>
            <li>Proof of purchase is required</li>
            <li>Refunds processed within 5-7 business days</li>
            <li>Original shipping costs are non-refundable</li>
            <li>Sale items may have different return policies</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Account Suspension Rules</h2>
          <p className="mb-4">We reserve the right to suspend or terminate accounts for:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Violation of these Terms of Service</li>
            <li>Fraudulent or illegal activity</li>
            <li>Multiple failed payment attempts</li>
            <li>Abusive behavior towards staff or other users</li>
            <li>Excessive returns or chargebacks</li>
            <li>Creating multiple accounts to abuse promotions</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            Account suspension may be temporary or permanent, at our discretion. You will be notified via email if your account is suspended.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
          <p className="text-muted-foreground">
            All content on this website, including text, graphics, logos, images, and software, is the property of E-Commerce or its content suppliers and is protected by intellectual property laws.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Limitation of Liability</h2>
          <p className="text-muted-foreground">
            We shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Changes to Terms</h2>
          <p className="text-muted-foreground">
            We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the website constitutes acceptance of modified terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
          <p className="text-muted-foreground">
            For questions about these Terms of Service, please contact us at legal@example.com
          </p>
        </section>
      </div>
    </div>
  );
};
