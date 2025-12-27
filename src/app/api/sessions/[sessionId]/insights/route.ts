import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildRoadmap } from '@/lib/recommendation-engine'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    const session = await prisma.surveySession.findUnique({
      where: { id: sessionId },
      include: {
        insights: {
          include: {
            recommendations: {
              include: {
                rule: true,
              },
            },
          },
        },
        responses: {
          include: {
            question: true,
          },
        },
      },
    })

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }

    if (session.status !== 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Session not yet submitted' },
        { status: 400 }
      )
    }

    // Build domain scores
    const domainScores = [
      {
        domain: 'PROCESS_ORG_HR',
        current: session.scoreProcessOrgHr || 0,
      },
      {
        domain: 'SYSTEM_TECH',
        current: session.scoreSystemTech || 0,
      },
      {
        domain: 'COST',
        current: session.scoreCost || 0,
      },
      {
        domain: 'INFORMATION',
        current: session.scoreInformation || 0,
      },
      {
        domain: 'RISK_SECURITY',
        current: session.scoreRiskSecurity || 0,
      },
    ]

    // Build recommendations list
    const recommendations = session.insights
      .filter((insight) => insight.recommendations.length > 0)
      .flatMap((insight) =>
        insight.recommendations.map((rec) => ({
          ruleId: rec.rule.id,
          ruleKey: rec.rule.key,
          domain: rec.rule.domain,
          severity: rec.rule.severity,
          effort: rec.rule.effort,
          titleEn: rec.rule.titleEn,
          titleJa: rec.rule.titleJa,
          descriptionEn: rec.rule.descriptionEn,
          descriptionJa: rec.rule.descriptionJa,
          priority: rec.rule.priority,
          timeframe: rec.timeframe,
        }))
      )

    const roadmap = buildRoadmap(recommendations)

    return NextResponse.json({
      sessionId,
      overallScore: session.overallScore,
      aspirationProfile: session.aspirationProfile,
      domainScores,
      insights: session.insights.map((insight) => ({
        id: insight.id,
        type: insight.type,
        domain: insight.domain,
        severity: insight.severity,
        titleEn: insight.titleEn,
        titleJa: insight.titleJa,
        descriptionEn: insight.descriptionEn,
        descriptionJa: insight.descriptionJa,
        gap: insight.gap,
      })),
      recommendations,
      roadmap,
      submittedAt: session.submittedAt,
    })
  } catch (error) {
    console.error('Error fetching insights:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
