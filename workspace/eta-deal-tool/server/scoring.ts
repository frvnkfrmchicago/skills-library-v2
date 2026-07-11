/**
 * ETA Deal Sourcing - Lead Scoring Engine
 * 
 * Logic to evaluate B2B services businesses [0-100]
 */

export interface LeadData {
  employeeCount?: number;
  industryText: string;
  hasOwnerContact: boolean;
  contactEmail?: string;
  hasDirectPhone: boolean;
  websiteText: string;
  isFranchise: boolean;
  isSubsidiary: boolean;
}

export class ScoringEngine {
  /**
   * Main scoring function for proprietary leads
   */
  static calculateBaseScore(data: LeadData): number {
    let score = 0;

    // --- Positive Signals ---
    
    // +20: Employee count confidently between 5–50
    if (data.employeeCount && data.employeeCount >= 5 && data.employeeCount <= 50) {
      score += 20;
    }

    // +15: Clear B2B language
    const b2bKeywords = ['commercial', 'enterprise', 'managed services', 'industrial', 'b2b', 'contracting'];
    if (b2bKeywords.some(kw => data.industryText.toLowerCase().includes(kw) || data.websiteText.toLowerCase().includes(kw))) {
      score += 15;
    }

    // +15: Owner identified by name
    if (data.hasOwnerContact) {
      score += 15;
    }

    // +10: Personal email found
    if (data.contactEmail && !['info@', 'admin@', 'support@', 'contact@', 'sales@'].some(p => data.contactEmail?.toLowerCase().startsWith(p))) {
      score += 10;
    }

    // +10: Direct phone number
    if (data.hasDirectPhone) {
      score += 10;
    }

    // +10: Founder-led language
    const founderKeywords = ['founder-led', 'owner-operated', 'since 19', 'since 20', 'family owned'];
    if (founderKeywords.some(kw => data.websiteText.toLowerCase().includes(kw))) {
      score += 10;
    }

    // --- Negative Signals ---

    // -25: Franchise or subsidiary
    if (data.isFranchise || data.isSubsidiary) {
      score -= 25;
    }

    // -15: Primarily consumer-focused
    const b2cKeywords = ['residential', 'homeowner', 'consumer', 'retail'];
    if (b2cKeywords.some(kw => data.industryText.toLowerCase().includes(kw))) {
      score -= 15;
    }

    // Clamp score [0, 100]
    return Math.max(0, Math.min(100, score));
  }

  /**
   * For Sale Score Layer (0-40)
   */
  static calculateForSaleScore(sde: number, ebitda: number): number {
    let score = 0;

    // +20: Financial fit ($1M - $5M)
    const targetValue = Math.max(sde, ebitda);
    if (targetValue >= 1000000 && targetValue <= 5000000) {
      score += 20;
    }

    return score;
  }
}
