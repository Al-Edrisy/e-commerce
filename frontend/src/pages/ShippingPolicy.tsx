export const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-8">Shipping Policy</h1>
      <p className="text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Delivery Times</h2>
          <p className="mb-4">Standard delivery times by location:</p>
          <div className="space-y-3 text-muted-foreground">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">Domestic (Within Country)</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Standard Shipping: 5-7 business days</li>
                <li>Express Shipping: 2-3 business days</li>
                <li>Next Day Delivery: 1 business day (order before 2 PM)</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold text-foreground mb-2">International</h3>
              <ul className="list-disc list-inside space-y-1">
                <li>Standard International: 10-15 business days</li>
                <li>Express International: 5-7 business days</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">
            <strong>Note:</strong> Delivery times are estimates and may vary during peak seasons, holidays, or due to unforeseen circumstances.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Shipping Fees</h2>
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Shipping Method</th>
                    <th className="text-left py-3 px-4">Cost</th>
                    <th className="text-left py-3 px-4">Free Shipping Threshold</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3 px-4">Standard Domestic</td>
                    <td className="py-3 px-4">$5.99</td>
                    <td className="py-3 px-4">Orders over $50</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Express Domestic</td>
                    <td className="py-3 px-4">$12.99</td>
                    <td className="py-3 px-4">Orders over $100</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Next Day Delivery</td>
                    <td className="py-3 px-4">$19.99</td>
                    <td className="py-3 px-4">Orders over $150</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3 px-4">Standard International</td>
                    <td className="py-3 px-4">$15.99</td>
                    <td className="py-3 px-4">Orders over $150</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4">Express International</td>
                    <td className="py-3 px-4">$29.99</td>
                    <td className="py-3 px-4">Orders over $200</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-muted-foreground">
              * Shipping costs are calculated at checkout based on your location and order weight.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Delivery Locations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Domestic Shipping</h3>
              <p className="text-muted-foreground">
                We ship to all 50 states within the United States, including Alaska and Hawaii. P.O. Boxes are accepted for standard shipping only.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">International Shipping</h3>
              <p className="text-muted-foreground mb-2">We currently ship to the following regions:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Canada</li>
                <li>United Kingdom and European Union</li>
                <li>Australia and New Zealand</li>
                <li>Select countries in Asia (Japan, South Korea, Singapore)</li>
                <li>Select countries in Latin America (Mexico, Brazil)</li>
              </ul>
              <p className="mt-4 text-muted-foreground">
                <strong>Note:</strong> International customers are responsible for any customs duties, taxes, or import fees that may apply.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Courier Partners</h2>
          <p className="mb-4">We work with trusted courier services to ensure reliable delivery:</p>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">Domestic Couriers</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>USPS (United States Postal Service)</li>
                <li>FedEx</li>
                <li>UPS</li>
                <li>DHL Express</li>
              </ul>
            </div>
            <div className="p-4 border rounded-lg">
              <h3 className="font-semibold mb-2">International Couriers</h3>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>DHL International</li>
                <li>FedEx International</li>
                <li>UPS Worldwide</li>
              </ul>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Order Processing</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Orders are processed within 1-2 business days</li>
            <li>Orders placed on weekends or holidays are processed the next business day</li>
            <li>You will receive a confirmation email when your order ships</li>
            <li>Tracking information will be provided via email</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Shipping Restrictions</h2>
          <p className="mb-4">Please note the following restrictions:</p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Some products may not be available for international shipping</li>
            <li>Expedited shipping may not be available to all locations</li>
            <li>We do not ship to freight forwarders</li>
            <li>P.O. Boxes are not eligible for express or next-day delivery</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Lost or Damaged Shipments</h2>
          <p className="text-muted-foreground">
            If your shipment is lost or damaged in transit, please contact us within 48 hours of the expected delivery date. We will work with the courier to resolve the issue and ensure you receive your order or a full refund.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Contact Us</h2>
          <p className="text-muted-foreground">
            For questions about shipping, please contact us at shipping@example.com or visit our Contact page.
          </p>
        </section>
      </div>
    </div>
  );
};
