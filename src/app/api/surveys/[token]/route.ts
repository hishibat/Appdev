import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const { token } = params

    const survey = await prisma.survey.findUnique({
      where: { publicToken: token },
      include: {
        template: {
          include: {
            questions: {
              include: {
                question: true,
              },
              orderBy: {
                order: 'asc',
              },
            },
          },
        },
        project: {
          include: {
            client: true,
          },
        },
      },
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

    return NextResponse.json({
      id: survey.id,
      title: survey.title,
      description: survey.description,
      pdpaConsentTextEn: survey.pdpaConsentTextEn,
      pdpaConsentTextJa: survey.pdpaConsentTextJa,
      client: survey.project.client.name,
      questions: survey.template.questions.map((tq) => ({
        id: tq.question.id,
        code: tq.question.code,
        domain: tq.question.domain,
        textEn: tq.question.textEn,
        textJa: tq.question.textJa,
        descriptionEn: tq.question.descriptionEn,
        descriptionJa: tq.question.descriptionJa,
      })),
    })
  } catch (error) {
    console.error('Error fetching survey:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
