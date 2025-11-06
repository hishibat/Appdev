import { Domain, AspirationType } from '@prisma/client'

export interface DomainScore {
  domain: Domain
  current: number
  target: number
  gap: number
  questionCount: number
}

export interface AnalysisResult {
  overallScore: number
  domainScores: DomainScore[]
  criticalGaps: DomainScore[]
  quickWins: DomainScore[]
}

// Target maturity levels based on aspiration profile
const ASPIRATION_TARGETS = {
  CONSERVATIVE: {
    base: 3.0,
    adjustments: {
      PROCESS_ORG_HR: 0.2,
      SYSTEM_TECH: 0.0,
      COST: 0.3,
      INFORMATION: 0.1,
      RISK_SECURITY: 0.4,
    },
  },
  BALANCED: {
    base: 3.5,
    adjustments: {
      PROCESS_ORG_HR: 0.2,
      SYSTEM_TECH: 0.1,
      COST: 0.1,
      INFORMATION: 0.2,
      RISK_SECURITY: 0.3,
    },
  },
  PROGRESSIVE: {
    base: 4.2,
    adjustments: {
      PROCESS_ORG_HR: 0.3,
      SYSTEM_TECH: 0.3,
      COST: 0.0,
      INFORMATION: 0.2,
      RISK_SECURITY: 0.2,
    },
  },
}

// Risk severity thresholds
export const RISK_THRESHOLDS = {
  CRITICAL: 2.0,
  HIGH: 3.0,
  MEDIUM: 4.0,
  LOW: 5.0,
}

export function calculateDomainScore(
  responses: { questionId: string; value: number; weight: number }[]
): number {
  if (responses.length === 0) return 0

  const totalWeightedScore = responses.reduce(
    (sum, r) => sum + r.value * r.weight,
    0
  )
  const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0)

  return totalWeightedScore / totalWeight
}

export function calculateTargetScore(
  domain: Domain,
  aspirationType: AspirationType
): number {
  const profile = ASPIRATION_TARGETS[aspirationType]
  const adjustment = profile.adjustments[domain] || 0
  return Math.min(5.0, profile.base + adjustment)
}

export function calculateGap(current: number, target: number): number {
  return target - current
}

export function analyzeResponses(
  responses: Array<{
    questionId: string
    value: number
    question: {
      domain: Domain
      weight: number
    }
  }>,
  aspirationType: AspirationType
): AnalysisResult {
  // Group responses by domain
  const domainGroups = responses.reduce((acc, r) => {
    if (!acc[r.question.domain]) {
      acc[r.question.domain] = []
    }
    acc[r.question.domain].push({
      questionId: r.questionId,
      value: r.value,
      weight: r.question.weight,
    })
    return acc
  }, {} as Record<Domain, Array<{ questionId: string; value: number; weight: number }>>)

  // Calculate scores for each domain
  const domainScores: DomainScore[] = Object.entries(domainGroups).map(
    ([domain, domainResponses]) => {
      const current = calculateDomainScore(domainResponses)
      const target = calculateTargetScore(domain as Domain, aspirationType)
      const gap = calculateGap(current, target)

      return {
        domain: domain as Domain,
        current,
        target,
        gap,
        questionCount: domainResponses.length,
      }
    }
  )

  // Calculate overall score
  const overallScore =
    domainScores.reduce((sum, ds) => sum + ds.current, 0) / domainScores.length

  // Identify critical gaps (gap >= 2.0)
  const criticalGaps = domainScores
    .filter((ds) => ds.gap >= 2.0)
    .sort((a, b) => b.gap - a.gap)

  // Identify quick wins (gap between 1.0 and 2.0, indicating moderate improvement opportunities)
  const quickWins = domainScores
    .filter((ds) => ds.gap >= 1.0 && ds.gap < 2.0)
    .sort((a, b) => b.gap - a.gap)

  return {
    overallScore,
    domainScores,
    criticalGaps,
    quickWins,
  }
}

export function getRiskLevel(score: number): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
  if (score < RISK_THRESHOLDS.CRITICAL) return 'CRITICAL'
  if (score < RISK_THRESHOLDS.HIGH) return 'HIGH'
  if (score < RISK_THRESHOLDS.MEDIUM) return 'MEDIUM'
  return 'LOW'
}

export function getDomainLabel(domain: Domain, locale: 'en' | 'ja' = 'en'): string {
  const labels: Record<Domain, { en: string; ja: string }> = {
    PROCESS_ORG_HR: {
      en: 'Process, Organization & HR',
      ja: 'プロセス・組織・人材',
    },
    SYSTEM_TECH: {
      en: 'System & Technology',
      ja: 'システム・技術',
    },
    COST: {
      en: 'Cost Management',
      ja: 'コスト管理',
    },
    INFORMATION: {
      en: 'Information Management',
      ja: '情報管理',
    },
    RISK_SECURITY: {
      en: 'Risk & Security',
      ja: 'リスク・セキュリティ',
    },
  }

  return labels[domain][locale]
}
