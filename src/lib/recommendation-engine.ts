import { Domain, SeverityLevel, EffortLevel } from '@prisma/client'
import { DomainScore } from './analysis-engine'

export interface RecommendationMatch {
  ruleId: string
  ruleKey: string
  domain: Domain | null
  severity: SeverityLevel
  effort: EffortLevel
  titleEn: string
  titleJa: string
  descriptionEn: string
  descriptionJa: string
  priority: number
  timeframe: EffortLevel
}

export interface RoadmapPhase {
  phase: '0-3 months' | '3-6 months' | '6-12 months'
  recommendations: RecommendationMatch[]
}

interface TriggerCondition {
  domain?: string
  gap?: { min?: number; max?: number }
  questions?: string[]
  score?: { min?: number; max?: number }
}

export function evaluateRuleTrigger(
  condition: TriggerCondition,
  domainScores: DomainScore[],
  questionScores?: Map<string, number>
): boolean {
  // Check domain match
  if (condition.domain) {
    const domainScore = domainScores.find((ds) => ds.domain === condition.domain)
    if (!domainScore) return false

    // Check gap threshold
    if (condition.gap) {
      if (condition.gap.min !== undefined && domainScore.gap < condition.gap.min) {
        return false
      }
      if (condition.gap.max !== undefined && domainScore.gap > condition.gap.max) {
        return false
      }
    }

    // Check score threshold
    if (condition.score) {
      if (condition.score.min !== undefined && domainScore.current < condition.score.min) {
        return false
      }
      if (condition.score.max !== undefined && domainScore.current > condition.score.max) {
        return false
      }
    }
  }

  // Check specific questions
  if (condition.questions && questionScores) {
    for (const questionCode of condition.questions) {
      const score = questionScores.get(questionCode)
      if (score === undefined || score >= 4.0) {
        // If question scores well, rule might not apply
        return true // For simplicity, we're being permissive here
      }
    }
  }

  return true
}

export function generateRecommendations(
  domainScores: DomainScore[],
  rules: Array<{
    id: string
    key: string
    domain: Domain | null
    severity: SeverityLevel
    effort: EffortLevel
    titleEn: string
    titleJa: string
    descriptionEn: string
    descriptionJa: string
    triggerConditions: any
    priority: number
  }>,
  questionScores?: Map<string, number>
): RecommendationMatch[] {
  const matches: RecommendationMatch[] = []

  for (const rule of rules) {
    const condition = rule.triggerConditions as TriggerCondition

    if (evaluateRuleTrigger(condition, domainScores, questionScores)) {
      matches.push({
        ruleId: rule.id,
        ruleKey: rule.key,
        domain: rule.domain,
        severity: rule.severity,
        effort: rule.effort,
        titleEn: rule.titleEn,
        titleJa: rule.titleJa,
        descriptionEn: rule.descriptionEn,
        descriptionJa: rule.descriptionJa,
        priority: rule.priority,
        timeframe: rule.effort,
      })
    }
  }

  // Sort by priority (lower number = higher priority)
  return matches.sort((a, b) => a.priority - b.priority)
}

export function buildRoadmap(recommendations: RecommendationMatch[]): RoadmapPhase[] {
  const roadmap: RoadmapPhase[] = [
    { phase: '0-3 months', recommendations: [] },
    { phase: '3-6 months', recommendations: [] },
    { phase: '6-12 months', recommendations: [] },
  ]

  for (const rec of recommendations) {
    if (rec.effort === EffortLevel.LOW) {
      roadmap[0].recommendations.push(rec)
    } else if (rec.effort === EffortLevel.MEDIUM) {
      roadmap[1].recommendations.push(rec)
    } else {
      roadmap[2].recommendations.push(rec)
    }
  }

  return roadmap
}

export function getSeverityColor(severity: SeverityLevel): string {
  const colors: Record<SeverityLevel, string> = {
    CRITICAL: '#DC2626', // red-600
    HIGH: '#EA580C', // orange-600
    MEDIUM: '#D97706', // amber-600
    LOW: '#65A30D', // lime-600
    INFO: '#0891B2', // cyan-600
  }
  return colors[severity]
}

export function getSeverityLabel(severity: SeverityLevel, locale: 'en' | 'ja' = 'en'): string {
  const labels: Record<SeverityLevel, { en: string; ja: string }> = {
    CRITICAL: { en: 'Critical', ja: '重大' },
    HIGH: { en: 'High', ja: '高' },
    MEDIUM: { en: 'Medium', ja: '中' },
    LOW: { en: 'Low', ja: '低' },
    INFO: { en: 'Info', ja: '情報' },
  }
  return labels[severity][locale]
}

export function getEffortLabel(effort: EffortLevel, locale: 'en' | 'ja' = 'en'): string {
  const labels: Record<EffortLevel, { en: string; ja: string }> = {
    LOW: { en: '0-3 months', ja: '0-3ヶ月' },
    MEDIUM: { en: '3-6 months', ja: '3-6ヶ月' },
    HIGH: { en: '6-12 months', ja: '6-12ヶ月' },
  }
  return labels[effort][locale]
}
