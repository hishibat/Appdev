import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jsPDF from 'jspdf'

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

    // Create PDF
    const doc = new jsPDF()
    let yPos = 20

    // Title
    doc.setFontSize(20)
    doc.setTextColor(0, 79, 159) // ABeam primary color
    doc.text('IT Governance Assessment Report', 20, yPos)
    yPos += 15

    // Metadata
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Client: ${session.survey.project.client.name}`, 20, yPos)
    yPos += 6
    doc.text(`Assessment: ${session.survey.title}`, 20, yPos)
    yPos += 6
    doc.text(`Submitted: ${new Date(session.submittedAt!).toLocaleDateString()}`, 20, yPos)
    yPos += 15

    // Executive Summary
    doc.setFontSize(16)
    doc.setTextColor(0, 0, 0)
    doc.text('Executive Summary', 20, yPos)
    yPos += 10

    doc.setFontSize(12)
    doc.text(`Overall Maturity Score: ${session.overallScore?.toFixed(1)} / 5.0`, 20, yPos)
    yPos += 8
    doc.text(`Aspiration Profile: ${session.aspirationProfile}`, 20, yPos)
    yPos += 15

    // Domain Scores
    doc.setFontSize(14)
    doc.text('Domain Scores', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    const domainScores = [
      { name: 'Process, Organization & HR', score: session.scoreProcessOrgHr },
      { name: 'System & Technology', score: session.scoreSystemTech },
      { name: 'Cost Management', score: session.scoreCost },
      { name: 'Information Management', score: session.scoreInformation },
      { name: 'Risk & Security', score: session.scoreRiskSecurity },
    ]

    for (const domain of domainScores) {
      if (domain.score !== null) {
        doc.text(`${domain.name}: ${domain.score.toFixed(1)}`, 25, yPos)
        yPos += 6
      }
    }
    yPos += 10

    // Key Insights
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.text('Key Insights', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    const criticalInsights = session.insights.filter((i) => i.type === 'GAP_CRITICAL')
    for (const insight of criticalInsights.slice(0, 5)) {
      if (yPos > 270) {
        doc.addPage()
        yPos = 20
      }

      doc.setTextColor(220, 38, 38) // Red for critical
      doc.text(`[${insight.severity}]`, 20, yPos)
      doc.setTextColor(0, 0, 0)
      const lines = doc.splitTextToSize(insight.titleEn, 160)
      doc.text(lines, 45, yPos)
      yPos += 6 * lines.length + 4
    }
    yPos += 10

    // Recommendations
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }

    doc.setFontSize(14)
    doc.text('Top Recommendations', 20, yPos)
    yPos += 10

    doc.setFontSize(10)
    const topRecs = session.insights
      .filter((i) => i.recommendations.length > 0)
      .flatMap((i) => i.recommendations)
      .slice(0, 8)

    for (const rec of topRecs) {
      if (yPos > 265) {
        doc.addPage()
        yPos = 20
      }

      doc.setFont(undefined, 'bold')
      const titleLines = doc.splitTextToSize(rec.rule.titleEn, 170)
      doc.text(titleLines, 20, yPos)
      yPos += 6 * titleLines.length

      doc.setFont(undefined, 'normal')
      const descLines = doc.splitTextToSize(rec.rule.descriptionEn, 170)
      doc.text(descLines, 20, yPos)
      yPos += 6 * descLines.length + 4

      doc.setTextColor(100, 100, 100)
      doc.text(`Timeline: ${rec.timeframe} | Severity: ${rec.rule.severity}`, 20, yPos)
      doc.setTextColor(0, 0, 0)
      yPos += 10
    }

    // Footer
    const pageCount = doc.internal.pages.length - 1
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(150, 150, 150)
      doc.text(
        'ABeam IT Governance Quick Assessment',
        20,
        doc.internal.pageSize.height - 10
      )
      doc.text(
        `Page ${i} of ${pageCount}`,
        doc.internal.pageSize.width - 40,
        doc.internal.pageSize.height - 10
      )
    }

    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Log audit
    await prisma.auditLog.create({
      data: {
        action: 'report.pdf.downloaded',
        resource: sessionId,
        resourceType: 'SurveySession',
      },
    })

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="IT-Governance-Report-${sessionId}.pdf"`,
      },
    })
  } catch (error) {
    console.error('Error generating PDF:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
