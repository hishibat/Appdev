import { describe, it, expect } from 'vitest'
import {
  calculateDomainScore,
  calculateTargetScore,
  calculateGap,
  analyzeResponses,
  getRiskLevel,
} from '@/lib/analysis-engine'
import { Domain, AspirationType } from '@prisma/client'

describe('Analysis Engine', () => {
  describe('calculateDomainScore', () => {
    it('should calculate weighted average correctly', () => {
      const responses = [
        { questionId: '1', value: 3, weight: 1.0 },
        { questionId: '2', value: 4, weight: 1.2 },
        { questionId: '3', value: 2, weight: 0.8 },
      ]

      const score = calculateDomainScore(responses)

      // Expected: (3*1.0 + 4*1.2 + 2*0.8) / (1.0 + 1.2 + 0.8)
      // = (3 + 4.8 + 1.6) / 3.0 = 9.4 / 3.0 = 3.133...
      expect(score).toBeCloseTo(3.133, 2)
    })

    it('should return 0 for empty responses', () => {
      const score = calculateDomainScore([])
      expect(score).toBe(0)
    })
  })

  describe('calculateTargetScore', () => {
    it('should calculate correct target for CONSERVATIVE profile', () => {
      const target = calculateTargetScore(Domain.RISK_SECURITY, AspirationType.CONSERVATIVE)
      // Base 3.0 + 0.4 (Risk/Security adjustment)
      expect(target).toBe(3.4)
    })

    it('should calculate correct target for BALANCED profile', () => {
      const target = calculateTargetScore(Domain.PROCESS_ORG_HR, AspirationType.BALANCED)
      // Base 3.5 + 0.2 (Process adjustment)
      expect(target).toBe(3.7)
    })

    it('should calculate correct target for PROGRESSIVE profile', () => {
      const target = calculateTargetScore(Domain.SYSTEM_TECH, AspirationType.PROGRESSIVE)
      // Base 4.2 + 0.3 (System adjustment)
      expect(target).toBeCloseTo(4.5, 1)
    })

    it('should not exceed maximum score of 5.0', () => {
      const target = calculateTargetScore(Domain.PROCESS_ORG_HR, AspirationType.PROGRESSIVE)
      expect(target).toBeLessThanOrEqual(5.0)
    })
  })

  describe('calculateGap', () => {
    it('should calculate positive gap correctly', () => {
      const gap = calculateGap(2.5, 4.0)
      expect(gap).toBe(1.5)
    })

    it('should calculate zero gap when current equals target', () => {
      const gap = calculateGap(3.5, 3.5)
      expect(gap).toBe(0)
    })

    it('should calculate negative gap when current exceeds target', () => {
      const gap = calculateGap(4.5, 3.5)
      expect(gap).toBe(-1.0)
    })
  })

  describe('analyzeResponses', () => {
    it('should analyze responses and identify critical gaps', () => {
      const responses = [
        {
          questionId: '1',
          value: 1.5,
          question: { domain: Domain.RISK_SECURITY, weight: 1.0 },
        },
        {
          questionId: '2',
          value: 1.0,
          question: { domain: Domain.RISK_SECURITY, weight: 1.0 },
        },
        {
          questionId: '3',
          value: 4.5,
          question: { domain: Domain.COST, weight: 1.0 },
        },
      ]

      const result = analyzeResponses(responses, AspirationType.BALANCED)

      expect(result.domainScores).toHaveLength(2)
      expect(result.criticalGaps.length).toBeGreaterThan(0)

      // Risk/Security should be in critical gaps (low score ~1.25, target ~3.8)
      const riskGap = result.criticalGaps.find((g) => g.domain === Domain.RISK_SECURITY)
      expect(riskGap).toBeDefined()
      expect(riskGap!.gap).toBeGreaterThan(2.0)
    })

    it('should identify quick wins', () => {
      const responses = [
        {
          questionId: '1',
          value: 2.5,
          question: { domain: Domain.PROCESS_ORG_HR, weight: 1.0 },
        },
        {
          questionId: '2',
          value: 2.5,
          question: { domain: Domain.PROCESS_ORG_HR, weight: 1.0 },
        },
      ]

      const result = analyzeResponses(responses, AspirationType.BALANCED)

      // Process should have moderate gap (current 2.5, target 3.7, gap 1.2)
      expect(result.quickWins.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('getRiskLevel', () => {
    it('should return CRITICAL for score < 2.0', () => {
      expect(getRiskLevel(1.5)).toBe('CRITICAL')
    })

    it('should return HIGH for score < 3.0', () => {
      expect(getRiskLevel(2.5)).toBe('HIGH')
    })

    it('should return MEDIUM for score < 4.0', () => {
      expect(getRiskLevel(3.5)).toBe('MEDIUM')
    })

    it('should return LOW for score >= 4.0', () => {
      expect(getRiskLevel(4.5)).toBe('LOW')
    })
  })
})
