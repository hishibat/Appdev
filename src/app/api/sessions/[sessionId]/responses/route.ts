import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const body = await request.json()
    const { questionId, value, comment } = body

    // Validate value (0-5 scale)
    if (value < 0 || value > 5) {
      return NextResponse.json(
        { error: 'Value must be between 0 and 5' },
        { status: 400 }
      )
    }

    // Check if session exists and is not submitted
    const session = await prisma.surveySession.findUnique({
      where: { id: sessionId },
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

    // Upsert response (auto-save functionality)
    const response = await prisma.response.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        value,
        comment,
      },
      create: {
        sessionId,
        questionId,
        value,
        comment,
      },
    })

    return NextResponse.json({
      success: true,
      response: {
        id: response.id,
        questionId: response.questionId,
        value: response.value,
      },
    })
  } catch (error) {
    console.error('Error saving response:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    const responses = await prisma.response.findMany({
      where: { sessionId },
      include: {
        question: true,
      },
    })

    return NextResponse.json({
      responses: responses.map((r) => ({
        questionId: r.questionId,
        questionCode: r.question.code,
        value: r.value,
        comment: r.comment,
      })),
    })
  } catch (error) {
    console.error('Error fetching responses:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
