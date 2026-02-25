import 'server-only'

import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

/**
 * Creates a Stripe transfer to a connected account
 * @param amount Amount in cents
 * @param destination Stripe Connect account ID
 * @param metadata Additional metadata to attach to the transfer
 * @returns The created transfer object
 */
export async function createTransfer(
  amount: number,
  destination: string,
  metadata?: Record<string, string>
) {
  try {
    const transfer = await stripe.transfers.create({
      amount,
      currency: 'usd',
      destination,
      metadata,
    })
    return transfer
  } catch (error) {
    console.error('Stripe transfer creation error:', error)
    throw error
  }
}