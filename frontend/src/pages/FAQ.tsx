import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const FAQ = () => {
  const faqData = {
    orders: [
      {
        question: "How do I track my order?",
        answer: "Once your order ships, you'll receive a tracking number via email. You can also track your order by logging into your account and viewing your order history. Click on the specific order to see detailed tracking information."
      },
      {
        question: "Can I modify or cancel my order after placing it?",
        answer: "Orders can be modified or cancelled within 1 hour of placement. After this time, orders enter our processing system and cannot be changed. Contact us immediately at support@example.com if you need to make changes."
      },
      {
        question: "How long does order processing take?",
        answer: "Most orders are processed within 1-2 business days. During peak seasons or sales events, processing may take up to 3 business days. You'll receive a confirmation email once your order has been processed and shipped."
      },
      {
        question: "What if an item is out of stock?",
        answer: "If an item becomes out of stock after you place your order, we'll notify you via email within 24 hours. You can choose to wait for restock (we'll provide an estimated date), substitute with a similar item, or receive a full refund."
      }
    ],
    shipping: [
      {
        question: "What are the shipping costs?",
        answer: "Shipping costs vary by location and delivery speed. Standard domestic shipping starts at $5.99, with free shipping on orders over $50. Express and international shipping options are available at checkout. See our Shipping Policy for complete details."
      },
      {
        question: "Do you ship internationally?",
        answer: "Yes! We ship to over 50 countries worldwide. International shipping times range from 5-15 business days depending on your location. Customers are responsible for any customs duties, taxes, or import fees."
      },
      {
        question: "What if my package is lost or stolen?",
        answer: "If your tracking shows delivery but you didn't receive the package, first check with neighbors and your building management. Contact us within 48 hours, and we'll file a claim with the carrier. Once resolved, we'll send a replacement or provide a full refund."
      },
      {
        question: "Can I change my shipping address?",
        answer: "Shipping addresses can only be changed before the order ships. Once tracking is generated, the address cannot be modified. Contact us immediately if you need to update your address, and we'll do our best to help before the order leaves our warehouse."
      }
    ],
    returns: [
      {
        question: "What is your return policy?",
        answer: "We offer a 30-day return policy for most items. Products must be unused, in original condition with tags attached. Defective items have a 60-day return window. See our Return & Exchange Policy page for complete details and exclusions."
      },
      {
        question: "How do I start a return?",
        answer: "Log into your account, go to Order History, select the order, and click 'Request Return'. Choose your reason and follow the prompts. You'll receive a prepaid return label via email. Pack the item securely and drop it off at any authorized shipping location."
      },
      {
        question: "When will I receive my refund?",
        answer: "Refunds are processed within 3-5 business days after we receive and inspect your return. The refund will appear in your account 3-7 business days later, depending on your bank. You'll receive an email confirmation when the refund is processed."
      },
      {
        question: "Can I exchange instead of returning?",
        answer: "Yes! Exchanges for size, color, or different items are available. When requesting a return, select 'Exchange' instead of 'Refund'. Exchanges for the same item in different size/color ship for free once we receive your return."
      }
    ],
    payments: [
      {
        question: "What payment methods do you accept?",
        answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, PayPal, Apple Pay, and Google Pay. Payment is processed securely through Stripe with industry-standard encryption."
      },
      {
        question: "Is it safe to use my credit card on your site?",
        answer: "Absolutely. We use Stripe for payment processing, which is PCI DSS compliant and encrypts all payment information. We never store your complete credit card details on our servers. Look for the padlock icon in your browser's address bar for confirmation of a secure connection."
      },
      {
        question: "Why was my payment declined?",
        answer: "Common reasons include insufficient funds, incorrect card information, expired card, or bank security holds. Try re-entering your payment information carefully, or use a different payment method. If issues persist, contact your bank or try again in a few hours."
      },
      {
        question: "Do you offer payment plans or financing?",
        answer: "We currently don't offer in-house payment plans, but select payment methods like PayPal may offer Pay in 4 or similar installment options at checkout. Availability depends on your location and purchase amount."
      }
    ],
    account: [
      {
        question: "Do I need an account to place an order?",
        answer: "No, you can checkout as a guest. However, creating an account allows you to track orders, save shipping addresses, view order history, manage returns, and receive exclusive member benefits."
      },
      {
        question: "How do I reset my password?",
        answer: "Click 'Sign In' at the top of the page, then 'Forgot Password'. Enter your email address and we'll send a password reset link. The link is valid for 24 hours. If you don't receive it, check your spam folder or contact support."
      },
      {
        question: "Can I change my email address?",
        answer: "Yes, log into your account, go to Account Settings, and update your email address. You'll receive a verification email at the new address to confirm the change. Your old email will remain active until you verify the new one."
      },
      {
        question: "How do I unsubscribe from emails?",
        answer: "Click the 'Unsubscribe' link at the bottom of any marketing email. You'll be immediately removed from our mailing list. Note that you'll still receive transactional emails (order confirmations, shipping updates) which are necessary for your purchases."
      }
    ]
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
      <p className="text-muted-foreground mb-12">
        Find answers to common questions about orders, shipping, returns, and more.
      </p>

      <div className="space-y-12">
        <section>
          <h2 className="text-2xl font-semibold mb-6">Orders</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.orders.map((faq, index) => (
              <AccordionItem key={`orders-${index}`} value={`orders-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Shipping</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.shipping.map((faq, index) => (
              <AccordionItem key={`shipping-${index}`} value={`shipping-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Returns & Exchanges</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.returns.map((faq, index) => (
              <AccordionItem key={`returns-${index}`} value={`returns-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Payments</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.payments.map((faq, index) => (
              <AccordionItem key={`payments-${index}`} value={`payments-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-6">Account Issues</h2>
          <Accordion type="single" collapsible className="w-full">
            {faqData.account.map((faq, index) => (
              <AccordionItem key={`account-${index}`} value={`account-${index}`}>
                <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      <div className="mt-12 p-6 bg-muted/50 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">Still have questions?</h3>
        <p className="text-muted-foreground mb-4">
          Can't find the answer you're looking for? Our customer support team is here to help.
        </p>
        <a 
          href="/contact" 
          className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Contact Support
        </a>
      </div>
    </div>
  );
};
