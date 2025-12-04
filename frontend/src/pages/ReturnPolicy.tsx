export const ReturnPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Return & Exchange Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. What Can Be Returned</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2 text-green-600">✓ Eligible for Return</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Unused items in original condition</li>
                <li>Items with original tags and packaging</li>
                <li>Non-personalized products</li>
                <li>Products with proof of purchase</li>
                <li>Items returned within 30 days of delivery</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-red-600">✗ Not Eligible for Return</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                <li>Items marked as "Final Sale"</li>
                <li>Personalized or customized products</li>
                <li>Opened hygiene products (earbuds, beauty items, etc.)</li>
                <li>Gift cards and downloadable products</li>
                <li>Items damaged due to misuse</li>
                <li>Clearance items (unless defective)</li>
                <li>Items without original packaging or tags</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Time Limits</h2>
          <div className="space-y-3">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Standard Returns</h3>
              <p className="text-muted-foreground">
                You have <strong className="text-foreground">30 days</strong> from the date of delivery to initiate a return. Returns requested after this period will not be accepted.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Defective Products</h3>
              <p className="text-muted-foreground">
                For defective items, you have <strong className="text-foreground">60 days</strong> from delivery to report the issue and request a return or replacement.
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Holiday Returns</h3>
              <p className="text-muted-foreground">
                Items purchased between November 1 and December 25 can be returned until January 31 of the following year.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Exchange Process</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">How to Request an Exchange</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                <li>Log in to your account and go to Order History</li>
                <li>Select the order containing the item you want to exchange</li>
                <li>Click "Request Exchange" and select the reason</li>
                <li>Choose your preferred replacement (size, color, different item)</li>
                <li>Print the prepaid return label provided</li>
                <li>Pack the item securely with all original materials</li>
                <li>Ship the item using the provided label</li>
              </ol>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="font-semibold mb-2">Exchange Options</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li><strong>Same item, different size/color:</strong> Free exchange, no additional shipping charges</li>
                <li><strong>Different item (same price):</strong> Free exchange</li>
                <li><strong>Different item (higher price):</strong> Pay the price difference</li>
                <li><strong>Different item (lower price):</strong> Receive credit for future purchases</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Refund Timeline</h2>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Step 1: Return Shipping</h3>
              <p className="text-muted-foreground">
                3-7 business days for your return to reach our warehouse
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Step 2: Inspection</h3>
              <p className="text-muted-foreground">
                1-3 business days to inspect and process your return
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Step 3: Refund Processing</h3>
              <p className="text-muted-foreground">
                3-5 business days for refund to appear in your account (depending on your bank)
              </p>
            </div>
            <p className="text-muted-foreground mt-4">
              <strong>Total estimated time:</strong> 7-15 business days from when you ship the return
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Return Shipping Costs</h2>
          <div className="space-y-3">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 text-green-600">Free Return Shipping</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Defective or damaged items</li>
                  <li>Wrong item sent</li>
                  <li>Size exchanges (same item)</li>
                  <li>Quality issues</li>
                </ul>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2 text-orange-600">Customer Pays Shipping</h3>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Changed mind</li>
                  <li>Wrong size/color ordered</li>
                  <li>No longer needed</li>
                  <li>Found better price elsewhere</li>
                </ul>
              </div>
            </div>
            <p className="text-muted-foreground">
              Return shipping cost: <strong className="text-foreground">$6.99 domestic, $15.99 international</strong> (deducted from refund amount)
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Refund Methods</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li><strong>Original Payment Method:</strong> Refunded to the card or account used for purchase</li>
            <li><strong>Store Credit:</strong> Receive an additional 10% bonus when choosing store credit</li>
            <li><strong>Exchange:</strong> No refund needed, replacement item shipped immediately</li>
          </ul>
          <p className="mt-4 text-muted-foreground">
            <strong>Note:</strong> Original shipping charges are non-refundable unless the return is due to our error or a defective product.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. International Returns</h2>
          <p className="mb-4 text-muted-foreground">
            International returns follow the same policy as domestic returns, with these additional considerations:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Customer is responsible for return shipping costs and customs fees</li>
            <li>Returns may take 2-3 weeks to reach our warehouse</li>
            <li>Refunds exclude original international shipping charges</li>
            <li>We recommend using a tracked shipping method</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Damaged or Defective Items</h2>
          <p className="mb-4 text-muted-foreground">
            If you receive a damaged or defective item:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
            <li>Contact us within 48 hours of delivery</li>
            <li>Provide photos of the damage or defect</li>
            <li>Include your order number and description of the issue</li>
            <li>We'll provide a prepaid return label or offer immediate replacement</li>
          </ol>
          <p className="mt-4 text-muted-foreground">
            We'll expedite replacement shipments for defective items at no additional cost.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Contact Us</h2>
          <p className="text-muted-foreground">
            For return or exchange questions, contact us at returns@example.com or call our customer service team at 1-800-123-4567.
          </p>
        </section>
      </div>
    </div>
  );
};
