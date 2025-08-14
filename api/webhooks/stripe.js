import Stripe from 'stripe';

// Disable any automatic body parsing (safe for Node functions)
export const config = {
  api: {
    bodyParser: false
  }
};

function setCors(res) {
  // Stripe doesn't require CORS for webhooks, but this keeps local tools calmer.
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Stripe-Signature');
}

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2024-06-20'
  });

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) return res.status(500).end('STRIPE_WEBHOOK_SECRET not configured');

  try {
    const sig = req.headers['stripe-signature'];
    const rawBody = await getRawBody(req); // Buffer
    const event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret);

    // Minimal handler: ready for fulfillment trigger later
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('✔ payment_intent.succeeded', event.data.object.id);
        // TODO: trigger fulfillment logic here
        break;
      default:
        console.log('Unhandled event type:', event.type);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook verification failed:', err.message);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
}
