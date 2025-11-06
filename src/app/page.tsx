import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-primary mb-4">
            ABeam IT Governance Quick Assessment
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Evaluate your IT governance maturity across 5 key domains and receive actionable insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          <Card>
            <CardHeader>
              <CardTitle>For Consultants</CardTitle>
              <CardDescription>
                Create assessments, manage clients, and generate comprehensive reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/signin">
                <Button className="w-full" size="lg">
                  Consultant Login
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>For Clients</CardTitle>
              <CardDescription>
                Complete your assessment and view personalized insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/auth/signin">
                <Button className="w-full" variant="outline" size="lg">
                  Client Login
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Assessment Domains</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Process, Organization & HR",
                description: "IT strategy, governance structure, ITSM, and talent management"
              },
              {
                title: "System & Technology",
                description: "Architecture, infrastructure, DevOps, and innovation"
              },
              {
                title: "Cost Management",
                description: "Budgeting, ROI tracking, FinOps, and cost optimization"
              },
              {
                title: "Information Management",
                description: "Data governance, quality, privacy, and analytics"
              },
              {
                title: "Risk & Security",
                description: "Security policies, access control, incident response, and compliance"
              },
            ].map((domain, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{domain.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {domain.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <p className="text-gray-500 text-sm">
            Powered by ABeam Consulting Thailand
          </p>
        </div>
      </div>
    </main>
  )
}
