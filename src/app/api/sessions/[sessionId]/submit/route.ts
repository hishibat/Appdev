import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { analyzeResponses } from '@/lib/analysis-engine'
import { generateRecommendations, buildRoadmap } from '@/lib/recommendation-engine'
import { Domain, SeverityLevel, InsightType } from '@prisma/client'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    // Fetch session with responses
    const session = await prisma.surveySession.findUnique({
      where: { id: sessionId },
      include: {
        responses: {
          include: {
            question: true,
          },
        },
        survey: {
          include: {
            template: {
              include: {
                questions: true,
              },
            },
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

    if (session.status === 'SUBMITTED') {
      return NextResponse.json(
        { error: 'Session already submitted' },
        { status: 400 }
      )
    }

    // Check if all questions are answered
    const totalQuestions = session.survey.template.questionCount
    const answeredQuestions = session.responses.length

    if (answeredQuestions < totalQuestions) {
      return NextResponse.json(
        {
          error: 'Not all questions answered',
          answered: answeredQuestions,
          total: totalQuestions
        },
        { status: 400 }
      )
    }

    // Run analysis
    const analysisResult = analyzeResponses(
      session.responses,
      session.aspirationProfile
    )

    // Update session with calculated scores
    const updatedSession = await prisma.surveySession.update({
      where: { id: sessionId },
      data: {
        status: 'SUBMITTED',
        submittedAt: new Date(),
        overallScore: analysisResult.overallScore,
        scoreProcessOrgHr: analysisResult.domainScores.find(
          (ds) => ds.domain === Domain.PROCESS_ORG_HR
        )?.current,
        scoreSystemTech: analysisResult.domainScores.find(
          (ds) => ds.domain === Domain.SYSTEM_TECH
        )?.current,
        scoreCost: analysisResult.domainScores.find(
          (ds) => ds.domain === Domain.COST
        )?.current,
        scoreInformation: analysisResult.domainScores.find(
          (ds) => ds.domain === Domain.INFORMATION
        )?.current,
        scoreRiskSecurity: analysisResult.domainScores.find(
          (ds) => ds.domain === Domain.RISK_SECURITY
        )?.current,
      },
    })

    // Generate insights for critical gaps
    for (const criticalGap of analysisResult.criticalGaps) {
      await prisma.insight.create({
        data: {
          sessionId,
          domain: criticalGap.domain,
          type: InsightType.GAP_CRITICAL,
          severity: SeverityLevel.CRITICAL,
          titleEn: `Critical Gap in ${criticalGap.domain}`,
          titleJa: `${criticalGap.domain}の重大なギャップ`,
          descriptionEn: `Current maturity: ${criticalGap.current.toFixed(
            1
          )}, Target: ${criticalGap.target.toFixed(
            1
          )}, Gap: ${criticalGap.gap.toFixed(1)}`,
          descriptionJa: `現在の成熟度: ${criticalGap.current.toFixed(
            1
          )}, 目標: ${criticalGap.target.toFixed(
            1
          )}, ギャップ: ${criticalGap.gap.toFixed(1)}`,
          gap: criticalGap.gap,
        },
      })
    }

    // Generate insights for quick wins
    for (const quickWin of analysisResult.quickWins) {
      await prisma.insight.create({
        data: {
          sessionId,
          domain: quickWin.domain,
          type: InsightType.QUICK_WIN,
          severity: SeverityLevel.MEDIUM,
          titleEn: `Quick Win Opportunity in ${quickWin.domain}`,
          titleJa: `${quickWin.domain}のクイックウィン機会`,
          descriptionEn: `Moderate gap of ${quickWin.gap.toFixed(
            1
          )} points - achievable improvements available`,
          descriptionJa: `${quickWin.gap.toFixed(
            1
          )}ポイントの中程度のギャップ - 達成可能な改善が利用可能`,
          gap: quickWin.gap,
        },
      })
    }

    // Fetch recommendation rules and generate recommendations
    const rules = await prisma.recommendationRule.findMany()
    const recommendations = generateRecommendations(
      analysisResult.domainScores,
      rules
    )

    // Create recommendation instances
    for (const rec of recommendations.slice(0, 10)) {
      // Top 10 recommendations
      const insight = await prisma.insight.create({
        data: {
          sessionId,
          domain: rec.domain,
          type: InsightType.PRIORITY_AREA,
          severity: rec.severity,
          titleEn: rec.titleEn,
          titleJa: rec.titleJa,
          descriptionEn: rec.descriptionEn,
          descriptionJa: rec.descriptionJa,
        },
      })

      await prisma.recommendationInstance.create({
        data: {
          insightId: insight.id,
          ruleId: rec.ruleId,
          timeframe: rec.timeframe,
        },
      })
    }

    // Log audit entry
    await prisma.auditLog.create({
      data: {
        action: 'session.submitted',
        resource: sessionId,
        resourceType: 'SurveySession',
        metadata: {
          overallScore: analysisResult.overallScore,
          answeredQuestions,
        },
      },
    })

    return NextResponse.json({
      success: true,
      sessionId,
      overallScore: analysisResult.overallScore,
      domainScores: analysisResult.domainScores,
      message: 'Survey submitted successfully',
    })
  } catch (error) {
    console.error('Error submitting survey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
