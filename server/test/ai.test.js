import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { aiService } from '../src/services/aiService.js';

describe('Veyra Deferred Agentic AI Service Interface', () => {
  it('should expose status showing deferred integration readiness without exposing credentials', () => {
    const status = aiService.getStatus();

    assert.equal(status.enabled, false);
    assert.equal(status.status, 'deferred_ready_for_model_connection');
    assert.equal(Array.isArray(status.availableAgentTools), true);
    assert.equal(status.availableAgentTools.includes('verifyProductIdentifier'), true);
  });

  it('should return deferred message without throwing or calling external APIs', async () => {
    const result = await aiService.executeAgentTask('catalogAppraisal', { productId: 'VYR-PROD-1001' });

    assert.equal(result.deferred, true);
    assert.equal(result.receivedPayload.productId, 'VYR-PROD-1001');
  });
});
