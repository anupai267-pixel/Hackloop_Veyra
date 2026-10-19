import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createPaymentOrder, verifyPaymentSignature } from '../src/services/paymentService.js';

describe('Veyra Payment & Escrow Signature Verification', () => {
  it('should generate honest test-mode simulated orders when credentials are not configured', async () => {
    const order = await createPaymentOrder({
      orderId: 'VYR-ORD-TEST-01',
      amountINR: 29990
    });

    assert.equal(order.amount, 29990);
    assert.equal(order.currency, 'INR');
    assert.equal(order.mode, 'test_simulated');
    assert.equal(order.gatewayOrderId.startsWith('rzp_order_sim_'), true);
  });

  it('should verify test signatures accurately in sandbox mode', () => {
    const verified = verifyPaymentSignature({
      gatewayOrderId: 'rzp_order_sim_123',
      paymentId: 'pay_sim_456',
      signature: 'sig_test_verified_hash'
    });

    assert.equal(verified, true);
  });
});
