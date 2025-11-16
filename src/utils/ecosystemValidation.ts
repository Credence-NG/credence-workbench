/**
 * Ecosystem Schema Pricing Validation Utilities
 *
 * Validation logic for schema pricing and revenue sharing
 * Based on API Guide v1.1.0 (Nov 6, 2025)
 *
 * @module utils/ecosystemValidation
 */

import type {
  AddSchemaToEcosystemRequest,
  UpdateSchemaPricingRequest,
  RevenueShareValidationResult,
  PricingValidationResult,
} from "../types/ecosystem";

// ============================================
// CONSTANTS
// ============================================

/**
 * Standard revenue split recommended by platform
 * Platform: 10%, Ecosystem: 5%, Issuer/Verifier: 85%
 */
export const STANDARD_REVENUE_SPLIT = {
  platform: 10,
  ecosystem: 5,
  issuerOrVerifier: 85,
} as const;

/**
 * Valid ISO currency codes
 */
export const VALID_CURRENCIES = [
  "USD",
  "EUR",
  "GBP",
  "CAD",
  "AUD",
  "JPY",
  "CNY",
  "INR",
] as const;

// ============================================
// VALIDATION FUNCTIONS
// ============================================

/**
 * Validate that three revenue shares total exactly 100%
 *
 * @param platform - Platform share percentage (0-100)
 * @param ecosystem - Ecosystem share percentage (0-100)
 * @param issuerOrVerifier - Issuer or Verifier share percentage (0-100)
 * @returns Validation result with errors if any
 */
export function validateRevenueShares(
  platform: number,
  ecosystem: number,
  issuerOrVerifier: number
): RevenueShareValidationResult {
  const errors: string[] = [];

  // Check individual shares are in valid range
  if (platform < 0 || platform > 100) {
    errors.push(`Platform share must be between 0-100 (got ${platform})`);
  }

  if (ecosystem < 0 || ecosystem > 100) {
    errors.push(`Ecosystem share must be between 0-100 (got ${ecosystem})`);
  }

  if (issuerOrVerifier < 0 || issuerOrVerifier > 100) {
    errors.push(
      `Issuer/Verifier share must be between 0-100 (got ${issuerOrVerifier})`
    );
  }

  // Check total equals 100
  const total = platform + ecosystem + issuerOrVerifier;
  if (Math.abs(total - 100) > 0.01) {
    // Allow tiny floating point errors
    errors.push(
      `Revenue shares must total exactly 100% (got ${total}%). ` +
        `Current: Platform ${platform}% + Ecosystem ${ecosystem}% + ` +
        `Issuer/Verifier ${issuerOrVerifier}% = ${total}%`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate issuance operation revenue shares
 */
export function validateIssuanceShares(
  platformShare: number,
  ecosystemShare: number,
  issuerShare: number
): RevenueShareValidationResult {
  const result = validateRevenueShares(
    platformShare,
    ecosystemShare,
    issuerShare
  );

  if (!result.valid) {
    result.errors = result.errors.map((err) =>
      err.replace("Issuer/Verifier", "Issuer")
    );
    result.errors.unshift("Issuance revenue shares invalid:");
  }

  return result;
}

/**
 * Validate verification operation revenue shares
 */
export function validateVerificationShares(
  platformShare: number,
  ecosystemShare: number,
  verifierShare: number
): RevenueShareValidationResult {
  const result = validateRevenueShares(
    platformShare,
    ecosystemShare,
    verifierShare
  );

  if (!result.valid) {
    result.errors = result.errors.map((err) =>
      err.replace("Issuer/Verifier", "Verifier")
    );
    result.errors.unshift("Verification revenue shares invalid:");
  }

  return result;
}

/**
 * Validate revocation operation revenue shares
 */
export function validateRevocationShares(
  platformShare: number,
  ecosystemShare: number,
  issuerShare: number
): RevenueShareValidationResult {
  const result = validateRevenueShares(
    platformShare,
    ecosystemShare,
    issuerShare
  );

  if (!result.valid) {
    result.errors = result.errors.map((err) =>
      err.replace("Issuer/Verifier", "Issuer")
    );
    result.errors.unshift("Revocation revenue shares invalid:");
  }

  return result;
}

/**
 * Validate pricing amounts are non-negative
 */
export function validatePrices(
  issuancePrice: number,
  verificationPrice: number,
  revocationPrice: number
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (issuancePrice < 0) {
    errors.push(`Issuance price cannot be negative (got ${issuancePrice})`);
  }

  if (verificationPrice < 0) {
    errors.push(
      `Verification price cannot be negative (got ${verificationPrice})`
    );
  }

  if (revocationPrice < 0) {
    errors.push(
      `Revocation price cannot be negative (got ${revocationPrice})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate currency code
 */
export function validateCurrency(currency: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!currency || currency.trim().length === 0) {
    errors.push("Currency code is required");
  } else if (currency.length !== 3) {
    errors.push(`Currency code must be 3 characters (got "${currency}")`);
  } else if (!/^[A-Z]{3}$/.test(currency)) {
    errors.push(
      `Currency code must be 3 uppercase letters (got "${currency}")`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate schema ledger ID format
 */
export function validateSchemaLedgerId(schemaLedgerId: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!schemaLedgerId || schemaLedgerId.trim().length === 0) {
    errors.push("Schema ledger ID is required");
  }
  // Note: Temporarily accepting both DID format and other formats
  // The API spec requires DID format, but existing schemas may use different formats
  // TODO: Ensure all schemas have proper DID-format schemaLedgerId values

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Validate complete AddSchemaToEcosystemRequest
 *
 * @param request - The schema add request to validate
 * @returns Validation result with all errors and warnings
 */
export function validateAddSchemaRequest(
  request: AddSchemaToEcosystemRequest
): PricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate schema ledger ID
  const schemaIdValidation = validateSchemaLedgerId(request.schemaLedgerId);
  if (!schemaIdValidation.valid) {
    errors.push(...schemaIdValidation.errors);
  }

  // Validate prices
  const pricesValidation = validatePrices(
    request.issuancePrice,
    request.verificationPrice,
    request.revocationPrice
  );
  if (!pricesValidation.valid) {
    errors.push(...pricesValidation.errors);
  }

  // Validate currency
  const currencyValidation = validateCurrency(request.currency);
  if (!currencyValidation.valid) {
    errors.push(...currencyValidation.errors);
  }

  // Validate issuance revenue shares
  const issuanceValidation = validateIssuanceShares(
    request.issuancePlatformShare,
    request.issuanceEcosystemShare,
    request.issuanceIssuerShare
  );
  if (!issuanceValidation.valid) {
    errors.push(...issuanceValidation.errors);
  }

  // Validate verification revenue shares
  const verificationValidation = validateVerificationShares(
    request.verificationPlatformShare,
    request.verificationEcosystemShare,
    request.verificationIssuerShare
  );
  if (!verificationValidation.valid) {
    errors.push(...verificationValidation.errors);
  }

  // Validate revocation revenue shares
  const revocationValidation = validateRevocationShares(
    request.revocationPlatformShare,
    request.revocationEcosystemShare,
    request.revocationIssuerShare
  );
  if (!revocationValidation.valid) {
    errors.push(...revocationValidation.errors);
  }

  // Add warnings for non-standard splits
  const isStandardIssuance =
    request.issuancePlatformShare === STANDARD_REVENUE_SPLIT.platform &&
    request.issuanceEcosystemShare === STANDARD_REVENUE_SPLIT.ecosystem &&
    request.issuanceIssuerShare === STANDARD_REVENUE_SPLIT.issuerOrVerifier;

  if (!isStandardIssuance) {
    warnings.push(
      `Issuance split differs from standard (${STANDARD_REVENUE_SPLIT.platform}/${STANDARD_REVENUE_SPLIT.ecosystem}/${STANDARD_REVENUE_SPLIT.issuerOrVerifier})`
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate UpdateSchemaPricingRequest
 * Only validates fields that are present in the request
 *
 * @param request - The pricing update request to validate
 * @returns Validation result
 */
export function validateUpdatePricingRequest(
  request: UpdateSchemaPricingRequest
): PricingValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate prices if present
  if (
    request.issuancePrice !== undefined ||
    request.verificationPrice !== undefined ||
    request.revocationPrice !== undefined
  ) {
    const prices = {
      issuancePrice: request.issuancePrice ?? 0,
      verificationPrice: request.verificationPrice ?? 0,
      revocationPrice: request.revocationPrice ?? 0,
    };

    if (
      request.issuancePrice !== undefined &&
      request.issuancePrice < 0
    ) {
      errors.push(
        `Issuance price cannot be negative (got ${request.issuancePrice})`
      );
    }

    if (
      request.verificationPrice !== undefined &&
      request.verificationPrice < 0
    ) {
      errors.push(
        `Verification price cannot be negative (got ${request.verificationPrice})`
      );
    }

    if (
      request.revocationPrice !== undefined &&
      request.revocationPrice < 0
    ) {
      errors.push(
        `Revocation price cannot be negative (got ${request.revocationPrice})`
      );
    }
  }

  // Validate currency if present
  if (request.currency !== undefined) {
    const currencyValidation = validateCurrency(request.currency);
    if (!currencyValidation.valid) {
      errors.push(...currencyValidation.errors);
    }
  }

  // Validate issuance shares if ANY are present
  const hasIssuanceShares =
    request.issuancePlatformShare !== undefined ||
    request.issuanceEcosystemShare !== undefined ||
    request.issuanceIssuerShare !== undefined;

  if (hasIssuanceShares) {
    // All three must be present
    if (
      request.issuancePlatformShare === undefined ||
      request.issuanceEcosystemShare === undefined ||
      request.issuanceIssuerShare === undefined
    ) {
      errors.push(
        "When updating issuance revenue shares, ALL THREE shares (platform, ecosystem, issuer) must be provided"
      );
    } else {
      const issuanceValidation = validateIssuanceShares(
        request.issuancePlatformShare,
        request.issuanceEcosystemShare,
        request.issuanceIssuerShare
      );
      if (!issuanceValidation.valid) {
        errors.push(...issuanceValidation.errors);
      }
    }
  }

  // Validate verification shares if ANY are present
  const hasVerificationShares =
    request.verificationPlatformShare !== undefined ||
    request.verificationEcosystemShare !== undefined ||
    request.verificationIssuerShare !== undefined;

  if (hasVerificationShares) {
    // All three must be present
    if (
      request.verificationPlatformShare === undefined ||
      request.verificationEcosystemShare === undefined ||
      request.verificationIssuerShare === undefined
    ) {
      errors.push(
        "When updating verification revenue shares, ALL THREE shares (platform, ecosystem, verifier) must be provided"
      );
    } else {
      const verificationValidation = validateVerificationShares(
        request.verificationPlatformShare,
        request.verificationEcosystemShare,
        request.verificationIssuerShare
      );
      if (!verificationValidation.valid) {
        errors.push(...verificationValidation.errors);
      }
    }
  }

  // Validate revocation shares if ANY are present
  const hasRevocationShares =
    request.revocationPlatformShare !== undefined ||
    request.revocationEcosystemShare !== undefined ||
    request.revocationIssuerShare !== undefined;

  if (hasRevocationShares) {
    // All three must be present
    if (
      request.revocationPlatformShare === undefined ||
      request.revocationEcosystemShare === undefined ||
      request.revocationIssuerShare === undefined
    ) {
      errors.push(
        "When updating revocation revenue shares, ALL THREE shares (platform, ecosystem, issuer) must be provided"
      );
    } else {
      const revocationValidation = validateRevocationShares(
        request.revocationPlatformShare,
        request.revocationEcosystemShare,
        request.revocationIssuerShare
      );
      if (!revocationValidation.valid) {
        errors.push(...revocationValidation.errors);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Create a standard revenue split request
 * Uses the platform standard: 10% Platform, 5% Ecosystem, 85% Issuer/Verifier
 */
export function createStandardRevenueSplit(): {
  issuancePlatformShare: number;
  issuanceEcosystemShare: number;
  issuanceIssuerShare: number;
  verificationPlatformShare: number;
  verificationEcosystemShare: number;
  verificationIssuerShare: number;
  revocationPlatformShare: number;
  revocationEcosystemShare: number;
  revocationIssuerShare: number;
} {
  return {
    issuancePlatformShare: STANDARD_REVENUE_SPLIT.platform,
    issuanceEcosystemShare: STANDARD_REVENUE_SPLIT.ecosystem,
    issuanceIssuerShare: STANDARD_REVENUE_SPLIT.issuerOrVerifier,
    verificationPlatformShare: STANDARD_REVENUE_SPLIT.platform,
    verificationEcosystemShare: STANDARD_REVENUE_SPLIT.ecosystem,
    verificationIssuerShare: STANDARD_REVENUE_SPLIT.issuerOrVerifier,
    revocationPlatformShare: STANDARD_REVENUE_SPLIT.platform,
    revocationEcosystemShare: STANDARD_REVENUE_SPLIT.ecosystem,
    revocationIssuerShare: STANDARD_REVENUE_SPLIT.issuerOrVerifier,
  };
}

/**
 * Calculate revenue distribution for a transaction
 *
 * @param price - Transaction price
 * @param platformShare - Platform percentage (0-100)
 * @param ecosystemShare - Ecosystem percentage (0-100)
 * @param issuerOrVerifierShare - Issuer/Verifier percentage (0-100)
 * @returns Distribution breakdown with amounts
 */
export function calculateRevenueDistribution(
  price: number,
  platformShare: number,
  ecosystemShare: number,
  issuerOrVerifierShare: number
): {
  total: number;
  platform: number;
  ecosystem: number;
  issuerOrVerifier: number;
} {
  return {
    total: price,
    platform: (price * platformShare) / 100,
    ecosystem: (price * ecosystemShare) / 100,
    issuerOrVerifier: (price * issuerOrVerifierShare) / 100,
  };
}
