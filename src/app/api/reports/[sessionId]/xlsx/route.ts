import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import * as XLSX from 'xlsx'

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    const session = await prisma.surveySession.findUnique({
      where: { id: sessionId },
      include: {
        survey: {
          include: {
            project: {
              include: {
                client: true,
              },
            },
          },
        },
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
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    if (session.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Session not submitted' }, { status: 400 })
    }

    // Create workbook
    const wb = XLSX.utils.book_new()

    // Summary Sheet
    const summaryData = [
      ['IT Governance Assessment Report'],
      [''],
      ['Client', session.survey.project.client.name],
      ['Assessment', session.survey.title],
      ['Submitted', new Date(session.submittedAt!).toLocaleDateString()],
      ['Aspiration Profile', session.aspirationProfile],
      [''],
      ['Overall Maturity Score', session.overallScore?.toFixed(2)],
      [''],
      ['Domain Scores'],
      ['Domain', 'Score'],
      ['Process, Organization & HR', session.scoreProcessOrgHr?.toFixed(2)],
      ['System & Technology', session.scoreSystemTech?.toFixed(2)],
      ['Cost Management', session.scoreCost?.toFixed(2)],
      ['Information Management', session.scoreInformation?.toFixed(2)],
      ['Risk & Security', session.scoreRiskSecurity?.toFixed(2)],
    ]
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary')

    // Domain Details Sheet
    const domainData = [
      ['Domain Analysis'],
      [''],
      ['Domain', 'Current Score', 'Question Count', 'Status'],
    ]

    const domainScores = [
      {
        name: 'Process, Organization & HR',
        score: session.scoreProcessOrgHr,
        count: session.responses.filter((r) => r.question.domain === 'PROCESS_ORG_HR').length,
      },
      {
        name: 'System & Technology',
        score: session.scoreSystemTech,
        count: session.responses.filter((r) => r.question.domain === 'SYSTEM_TECH').length,
      },
      {
        name: 'Cost Management',
        score: session.scoreCost,
        count: session.responses.filter((r) => r.question.domain === 'COST').length,
      },
      {
        name: 'Information Management',
        score: session.scoreInformation,
        count: session.responses.filter((r) => r.question.domain === 'INFORMATION').length,
      },
      {
        name: 'Risk & Security',
        score: session.scoreRiskSecurity,
        count: session.responses.filter((r) => r.question.domain === 'RISK_SECURITY').length,
      },
    ]

    for (const domain of domainScores) {
      const status = domain.score
        ? domain.score < 2
          ? 'Critical'
          : domain.score < 3
          ? 'Needs Improvement'
          : domain.score < 4
          ? 'Good'
          : 'Excellent'
        : 'N/A'

      domainData.push([domain.name, domain.score?.toFixed(2) || 'N/A', domain.count, status])
    }

    const wsDomain = XLSX.utils.aoa_to_sheet(domainData)
    XLSX.utils.book_append_sheet(wb, wsDomain, 'Domain Analysis')

    // Insights Sheet
    const insightsData = [
      ['Key Insights'],
      [''],
      ['Type', 'Domain', 'Severity', 'Title', 'Description', 'Gap'],
    ]

    for (const insight of session.insights) {
      insightsData.push([
        insight.type,
        insight.domain || 'General',
        insight.severity,
        insight.titleEn,
        insight.descriptionEn,
        insight.gap?.toFixed(2) || 'N/A',
      ])
    }

    const wsInsights = XLSX.utils.aoa_to_sheet(insightsData)
    XLSX.utils.book_append_sheet(wb, wsInsights, 'Insights')

    // Recommendations Sheet
    const recsData = [
      ['Recommendations'],
      [''],
      ['Key', 'Domain', 'Severity', 'Effort', 'Title', 'Description', 'Timeframe'],
    ]

    const recommendations = session.insights
      .filter((i) => i.recommendations.length > 0)
      .flatMap((i) => i.recommendations.map((r) => r.rule))

    for (const rec of recommendations) {
      recsData.push([
        rec.key,
        rec.domain || 'General',
        rec.severity,
        rec.effort,
        rec.titleEn,
        rec.descriptionEn,
        rec.effort === 'LOW' ? '0-3 months' : rec.effort === 'MEDIUM' ? '3-6 months' : '6-12 months',
      ])
    }

    const wsRecs = XLSX.utils.aoa_to_sheet(recsData)
    XLSX.utils.book_append_sheet(wb, wsRecs, 'Recommendations')

    // Raw Responses Sheet
    const rawData = [
      ['Response Data'],
      [''],
      ['Question Code', 'Domain', 'Question', 'Response Value', 'Comment'],
    ]

    for (const response of session.responses) {
      rawData.push([
        response.question.code,
        response.question.domain,
        response.question.textEn,
        response.value.toFixed(1),
        response.comment || '',
      ])
    }

    const wsRaw = XLSX.utils.aoa_to_sheet(rawData)
    XLSX.utils.book_append_sheet(wb, wsRaw, 'Raw Responses')

    // Generate buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'report.xlsx.downloaded',
        resource: sessionId,
        resourceType: 'SurveySession',
      },
    })

    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="IT-Governance-Report-${sessionId}.xlsx"`,
      },
    })
  } catch (error) {
    console.error('Error generating Excel:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
