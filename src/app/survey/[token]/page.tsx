'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface Question {
  id: string
  code: string
  domain: string
  textEn: string
  textJa: string
  descriptionEn: string | null
  descriptionJa: string | null
}

interface SurveyData {
  id: string
  title: string
  description: string
  client: string
  pdpaConsentTextEn: string
  pdpaConsentTextJa: string
  questions: Question[]
}

export default function SurveyPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [locale, setLocale] = useState<'en' | 'ja'>('en')
  const [survey, setSurvey] = useState<SurveyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [step, setStep] = useState<'consent' | 'aspiration' | 'questions' | 'submitting' | 'complete'>('consent')
  const [pdpaConsent, setPdpaConsent] = useState(false)
  const [respondentName, setRespondentName] = useState('')
  const [respondentEmail, setRespondentEmail] = useState('')
  const [aspirationProfile, setAspirationProfile] = useState<'CONSERVATIVE' | 'BALANCED' | 'PROGRESSIVE'>('BALANCED')

  const [sessionId, setSessionId] = useState<string | null>(null)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Record<string, number>>({})
  const [autoSaving, setAutoSaving] = useState(false)

  useEffect(() => {
    fetchSurvey()
  }, [token])

  async function fetchSurvey() {
    try {
      const res = await fetch(`/api/surveys/${token}`)
      if (!res.ok) {
        throw new Error('Survey not found')
      }
      const data = await res.json()
      setSurvey(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load survey')
    } finally {
      setLoading(false)
    }
  }

  async function startSession() {
    if (!pdpaConsent || !respondentName || !respondentEmail) {
      alert(locale === 'en' ? 'Please fill all required fields' : '必須フィールドを入力してください')
      return
    }

    try {
      const res = await fetch(`/api/surveys/${token}/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          respondentName,
          respondentEmail,
          pdpaConsented: true,
          aspirationProfile,
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to start session')
      }

      const data = await res.json()
      setSessionId(data.sessionId)
      setStep('questions')
    } catch (err) {
      alert(locale === 'en' ? 'Failed to start survey' : 'サーベイの開始に失敗しました')
    }
  }

  async function saveResponse(questionId: string, value: number) {
    if (!sessionId) return

    setAutoSaving(true)
    try {
      await fetch(`/api/sessions/${sessionId}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questionId, value }),
      })
    } catch (err) {
      console.error('Auto-save failed:', err)
    } finally {
      setAutoSaving(false)
    }
  }

  function handleResponseChange(questionId: string, value: number) {
    setResponses({ ...responses, [questionId]: value })
    saveResponse(questionId, value)
  }

  async function submitSurvey() {
    if (!sessionId) return

    setStep('submitting')
    try {
      const res = await fetch(`/api/sessions/${sessionId}/submit`, {
        method: 'POST',
      })

      if (!res.ok) {
        throw new Error('Failed to submit survey')
      }

      setStep('complete')
      setTimeout(() => {
        router.push(`/results/${sessionId}`)
      }, 2000)
    } catch (err) {
      alert(locale === 'en' ? 'Failed to submit survey' : 'サーベイの提出に失敗しました')
      setStep('questions')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{locale === 'en' ? 'Loading...' : '読み込み中...'}</p>
      </div>
    )
  }

  if (error || !survey) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Error' : 'エラー'}</CardTitle>
            <CardDescription>{error || (locale === 'en' ? 'Survey not found' : 'サーベイが見つかりません')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / survey.questions.length) * 100
  const currentQuestion = survey.questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-primary">{survey.title}</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}
          >
            {locale === 'en' ? '日本語' : 'English'}
          </Button>
        </div>

        {step === 'consent' && (
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Welcome' : 'ようこそ'}</CardTitle>
              <CardDescription>{locale === 'en' ? survey.description : survey.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>{locale === 'en' ? 'Your Name' : 'お名前'}</Label>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                />
              </div>
              <div>
                <Label>{locale === 'en' ? 'Email' : 'メールアドレス'}</Label>
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border rounded-md"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                />
              </div>
              <div className="border p-4 rounded-md bg-gray-50">
                <p className="text-sm mb-2">{locale === 'en' ? survey.pdpaConsentTextEn : survey.pdpaConsentTextJa}</p>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={pdpaConsent}
                    onChange={(e) => setPdpaConsent(e.target.checked)}
                  />
                  <span className="text-sm">{locale === 'en' ? 'I consent' : '同意します'}</span>
                </label>
              </div>
              <Button onClick={() => setStep('aspiration')} disabled={!pdpaConsent} className="w-full">
                {locale === 'en' ? 'Continue' : '続ける'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'aspiration' && (
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Your IT Aspiration' : 'ITの志向性'}</CardTitle>
              <CardDescription>
                {locale === 'en'
                  ? 'Select your organization\'s IT strategy profile'
                  : '組織のIT戦略プロファイルを選択してください'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(['CONSERVATIVE', 'BALANCED', 'PROGRESSIVE'] as const).map((profile) => (
                <label
                  key={profile}
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                    aspirationProfile === profile ? 'border-primary bg-blue-50' : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="aspiration"
                    value={profile}
                    checked={aspirationProfile === profile}
                    onChange={(e) => setAspirationProfile(e.target.value as any)}
                    className="mr-2"
                  />
                  <span className="font-semibold">
                    {profile === 'CONSERVATIVE' && (locale === 'en' ? 'Conservative' : '保守的')}
                    {profile === 'BALANCED' && (locale === 'en' ? 'Balanced' : '標準的')}
                    {profile === 'PROGRESSIVE' && (locale === 'en' ? 'Progressive' : '挑戦的')}
                  </span>
                </label>
              ))}
              <Button onClick={startSession} className="w-full">
                {locale === 'en' ? 'Start Assessment' : 'アセスメント開始'}
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 'questions' && currentQuestion && (
          <>
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span>
                  {locale === 'en' ? 'Question' : '質問'} {currentQuestionIndex + 1} / {survey.questions.length}
                </span>
                <span>{autoSaving ? (locale === 'en' ? 'Saving...' : '保存中...') : ''}</span>
              </div>
              <Progress value={progress} />
            </div>

            <Card>
              <CardHeader>
                <div className="text-sm text-gray-500 mb-2">{currentQuestion.domain}</div>
                <CardTitle className="text-xl">
                  {locale === 'en' ? currentQuestion.textEn : currentQuestion.textJa}
                </CardTitle>
                {currentQuestion.descriptionEn && (
                  <CardDescription>
                    {locale === 'en' ? currentQuestion.descriptionEn : currentQuestion.descriptionJa}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>{locale === 'en' ? 'Not at all' : '全くない'}</span>
                    <span>{locale === 'en' ? 'Fully implemented' : '完全実装'}</span>
                  </div>
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[responses[currentQuestion.id] || 0]}
                    onValueChange={(value) => handleResponseChange(currentQuestion.id, value[0])}
                    className="w-full"
                  />
                  <div className="text-center mt-2 text-2xl font-bold text-primary">
                    {responses[currentQuestion.id] !== undefined ? responses[currentQuestion.id].toFixed(1) : '0.0'}
                  </div>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentQuestionIndex(Math.max(0, currentQuestionIndex - 1))}
                    disabled={currentQuestionIndex === 0}
                  >
                    {locale === 'en' ? 'Previous' : '前へ'}
                  </Button>

                  {currentQuestionIndex < survey.questions.length - 1 ? (
                    <Button
                      onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                      disabled={responses[currentQuestion.id] === undefined}
                    >
                      {locale === 'en' ? 'Next' : '次へ'}
                    </Button>
                  ) : (
                    <Button
                      onClick={submitSurvey}
                      disabled={Object.keys(responses).length < survey.questions.length}
                    >
                      {locale === 'en' ? 'Submit' : '提出'}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {step === 'submitting' && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-xl">{locale === 'en' ? 'Analyzing your responses...' : '回答を分析中...'}</p>
            </CardContent>
          </Card>
        )}

        {step === 'complete' && (
          <Card>
            <CardContent className="py-12 text-center">
              <h2 className="text-2xl font-bold text-green-600 mb-4">
                {locale === 'en' ? 'Thank you!' : 'ありがとうございました！'}
              </h2>
              <p>{locale === 'en' ? 'Redirecting to results...' : '結果ページへリダイレクト中...'}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
