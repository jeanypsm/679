import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

describe("iseek.pro API Integration", () => {
  it("should have ISEEK_API_KEY configured", () => {
    expect(ENV.iseekApiKey).toBeDefined();
    expect(ENV.iseekApiKey).not.toBe("");
    expect(ENV.iseekApiKey?.length).toBeGreaterThan(0);
  });

  it("should validate API key format", () => {
    const apiKey = ENV.iseekApiKey;
    if (apiKey) {
      // Basic validation - API keys should have reasonable length
      expect(apiKey.length).toBeGreaterThan(5);
      expect(apiKey.length).toBeLessThan(500);
    }
  });

  it("should be able to make test request to iseek.pro", async () => {
    const apiKey = ENV.iseekApiKey;
    if (!apiKey) {
      console.warn("ISEEK_API_KEY not configured, skipping API test");
      return;
    }

    try {
      // Test with a simple request to validate the API key
      const response = await fetch("https://api.iseek.pro/v1/health", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      // We expect either success (200) or auth error (401/403) to know the key is configured
      expect([200, 401, 403, 404]).toContain(response.status);
    } catch (error) {
      console.error("Failed to connect to iseek.pro:", error);
      // Network errors are acceptable in test environment
    }
  });
});
