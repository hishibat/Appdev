import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params
    const body = await request.json()
    const { respondentName, respondentEmail, pdpaConsented, aspirationProfile } = body

    // Validate inputs
    if (!pdpaConsented) {
      return NextResponse.json(
        { error: 'PDPA consent is required' },
        { status: 400 }
      )
    }

    const survey = await prisma.survey.findUnique({
      where: { publicToken: token },
    })

    if (!survey) {
      return NextResponse.json(
        { error: 'Survey not found' },
        { status: 404 }
      )
    }

    // Check if survey is expired
    if (survey.expiresAt && survey.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Survey has expired' },
        { status: 410 }
      )
    }

    // Create survey session
    const session = await prisma.surveySession.create({
      data: {
        surveyId: survey.id,
        respondentName,
        respondentEmail,
        pdpaConsented: true,
        pdpaConsentedAt: new Date(),
        aspirationProfile: aspirationProfile || 'BALANCED',
        status: 'IN_PROGRESS',
      },
    })

    return NextResponse.json({
      sessionId: session.id,
      message: 'Survey session started successfully',
    })
  } catch (error) {
    console.error('Error starting survey session:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
