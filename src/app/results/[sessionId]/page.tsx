'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface DomainScore {
  domain: string
  current: number
}

interface Insight {
  id: string
  type: string
  domain: string | null
  severity: string
  titleEn: string
  titleJa: string
  descriptionEn: string
  descriptionJa: string
  gap: number | null
}

interface Recommendation {
  ruleKey: string
  domain: string | null
  severity: string
  effort: string
  titleEn: string
  titleJa: string
  descriptionEn: string
  descriptionJa: string
  timeframe: string
}

interface RoadmapPhase {
  phase: string
  recommendations: Recommendation[]
}

interface InsightsData {
  sessionId: string
  overallScore: number
  aspirationProfile: string
  domainScores: DomainScore[]
  insights: Insight[]
  recommendations: Recommendation[]
  roadmap: RoadmapPhase[]
  submittedAt: string
}

export default function ResultsPage() {
  const params = useParams()
  const sessionId = params.sessionId as string

  const [locale, setLocale] = useState<'en' | 'ja'>('en')
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchInsights()
  }, [sessionId])

  async function fetchInsights() {
    try {
      const res = await fetch(`/api/sessions/${sessionId}/insights`)
      if (!res.ok) {
        throw new Error('Failed to load insights')
      }
      const insights = await res.json()
      setData(insights)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load insights')
    } finally {
      setLoading(false)
    }
  }

  async function downloadPDF() {
    window.open(`/api/reports/${sessionId}/pdf`, '_blank')
  }

  async function downloadExcel() {
    window.open(`/api/reports/${sessionId}/xlsx`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{locale === 'en' ? 'Loading insights...' : 'インサイトを読み込み中...'}</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Error' : 'エラー'}</CardTitle>
            <CardDescription>{error || (locale === 'en' ? 'Results not found' : '結果が見つかりません')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const domainLabels: Record<string, { en: string; ja: string }> = {
    PROCESS_ORG_HR: { en: 'Process/Org/HR', ja: 'プロセス・組織' },
    SYSTEM_TECH: { en: 'System/Tech', ja: 'システム・技術' },
    COST: { en: 'Cost', ja: 'コスト' },
    INFORMATION: { en: 'Information', ja: '情報' },
    RISK_SECURITY: { en: 'Risk/Security', ja: 'リスク・セキュリティ' },
  }

  const radarData = data.domainScores.map((ds) => ({
    domain: domainLabels[ds.domain]?.[locale] || ds.domain,
    score: ds.current,
  }))

  const barData = data.domainScores.map((ds) => ({
    domain: domainLabels[ds.domain]?.[locale] || ds.domain,
    score: ds.current,
  }))

  const severityColors: Record<string, string> = {
    CRITICAL: '#DC2626',
    HIGH: '#EA580C',
    MEDIUM: '#D97706',
    LOW: '#65A30D',
    INFO: '#0891B2',
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary">
              {locale === 'en' ? 'Assessment Results' : 'アセスメント結果'}
            </h1>
            <p className="text-gray-600">
              {locale === 'en' ? 'IT Governance Maturity Assessment' : 'ITガバナンス成熟度アセスメント'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setLocale(locale === 'en' ? 'ja' : 'en')}>
              {locale === 'en' ? '日本語' : 'English'}
            </Button>
            <Button onClick={downloadPDF} size="sm">
              {locale === 'en' ? 'Download PDF' : 'PDF をダウンロード'}
            </Button>
            <Button onClick={downloadExcel} variant="outline" size="sm">
              {locale === 'en' ? 'Download Excel' : 'Excel をダウンロード'}
            </Button>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Overall Maturity' : '総合成熟度'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary">{data.overallScore.toFixed(1)}</div>
              <p className="text-sm text-gray-600 mt-2">{locale === 'en' ? 'out of 5.0' : '/ 5.0'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Critical Gaps' : '重大ギャップ'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-red-600">
                {data.insights.filter((i) => i.type === 'GAP_CRITICAL').length}
              </div>
              <p className="text-sm text-gray-600 mt-2">{locale === 'en' ? 'areas require attention' : '領域で対応が必要'}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{locale === 'en' ? 'Quick Wins' : 'クイックウィン'}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-green-600">
                {data.insights.filter((i) => i.type === 'QUICK_WIN').length}
              </div>
              <p className="text-sm text-gray-600 mt-2">{locale === 'en' ? 'opportunities identified' : '機会を特定'}</p>
            </CardContent>
          </Card>
        </div>

        {/* Domain Scores - Radar Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Maturity Across Domains' : 'ドメイン別成熟度'}</CardTitle>
            <CardDescription>
              {locale === 'en' ? 'Your current maturity levels across all 5 domains' : '5つのドメインの現在の成熟度レベル'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="domain" />
                <PolarRadiusAxis domain={[0, 5]} />
                <Radar name="Current Maturity" dataKey="score" stroke="#004F9F" fill="#004F9F" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Domain Scores - Bar Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Domain Breakdown' : 'ドメイン別詳細'}</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="domain" />
                <YAxis domain={[0, 5]} />
                <Tooltip />
                <Bar dataKey="score" fill="#004F9F" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Insights */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Key Insights' : '主要インサイト'}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.insights.slice(0, 5).map((insight) => (
                <div
                  key={insight.id}
                  className="p-4 border-l-4 bg-gray-50 rounded"
                  style={{ borderLeftColor: severityColors[insight.severity] }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{locale === 'en' ? insight.titleEn : insight.titleJa}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {locale === 'en' ? insight.descriptionEn : insight.descriptionJa}
                      </p>
                    </div>
                    <span
                      className="text-xs px-2 py-1 rounded text-white ml-4"
                      style={{ backgroundColor: severityColors[insight.severity] }}
                    >
                      {insight.severity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Roadmap */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{locale === 'en' ? 'Implementation Roadmap' : '実装ロードマップ'}</CardTitle>
            <CardDescription>
              {locale === 'en'
                ? 'Prioritized recommendations organized by implementation timeline'
                : '実装タイムライン別に整理された優先推奨事項'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.roadmap.map((phase) => (
                <div key={phase.phase}>
                  <h3 className="text-lg font-semibold mb-3 text-primary">{phase.phase}</h3>
                  <div className="space-y-3">
                    {phase.recommendations.slice(0, 3).map((rec, idx) => (
                      <div key={idx} className="p-4 border rounded-lg bg-white hover:shadow-md transition">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{locale === 'en' ? rec.titleEn : rec.titleJa}</h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {locale === 'en' ? rec.descriptionEn : rec.descriptionJa}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded text-white ml-4"
                            style={{ backgroundColor: severityColors[rec.severity] }}
                          >
                            {rec.severity}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
