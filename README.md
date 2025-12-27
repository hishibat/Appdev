# ABeam IT Governance Quick Assessment

A production-grade, multi-tenant web application for IT governance maturity assessment, designed for ABeam Consulting Thailand.

## Overview

This application enables organizations to assess their IT governance maturity across 5 key domains:

1. **Process, Organization & HR** - IT strategy, governance structure, ITSM, talent management
2. **System & Technology** - Architecture, infrastructure, DevOps, innovation
3. **Cost Management** - Budgeting, ROI tracking, FinOps, cost optimization
4. **Information Management** - Data governance, quality, privacy, analytics
5. **Risk & Security** - Security policies, access control, incident response, compliance

## Key Features

### 🎯 Assessment Capabilities
- 20-50 question surveys with customizable templates
- Multi-language support (English/Japanese)
- Auto-save functionality
- 0-5 maturity scale with slider inputs
- Aspiration profile selection (Conservative/Balanced/Progressive)

### 📊 Analytics & Insights
- Automated maturity scoring across domains
- Gap analysis based on aspiration profiles
- Critical gap identification
- Quick win opportunities
- Rule-based recommendation engine
- 0-3/3-6/6-12 month implementation roadmap

### 📈 Visualization & Reporting
- Interactive radar charts and bar charts
- Executive dashboard with key metrics
- PDF report generation
- Excel export (Summary/Domain/Raw data)
- Multi-tenant client management

### 🔒 Security & Compliance
- PDPA consent management
- Token-based public survey links
- Role-based access control (RBAC)
- Audit logging
- Data retention policies
- Input validation

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js
- **Charts**: Recharts
- **Reports**: jsPDF, XLSX
- **Testing**: Vitest, Playwright
- **Deployment**: Docker, Docker Compose

## Architecture

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── surveys/       # Survey management
│   │   ├── sessions/      # Session & responses
│   │   └── reports/       # PDF/XLSX generation
│   ├── survey/[token]/    # Public survey UI
│   ├── results/[sessionId]/ # Results dashboard
│   └── page.tsx           # Landing page
├── components/
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── prisma.ts          # Prisma client
│   ├── analysis-engine.ts # Scoring & gap analysis
│   └── recommendation-engine.ts # Rule evaluation
└── types/                 # TypeScript types

prisma/
├── schema.prisma          # Database schema
└── seed.ts                # Seed data (50Q, 20 rules)
```

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd Appdev
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/abeam_governance?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-change-this-in-production"
APP_NAME="ABeam IT Governance Quick Assessment"
BRANDING_PRIMARY="#004F9F"
```

4. **Set up the database**

```bash
npx prisma generate
npx prisma db push
npx prisma db seed
```

5. **Run development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Credentials (Development)

After seeding:

- **Consultant**: `admin@abeam.com` / `admin123`
- **Client User**: `client@demo.com` / `client123`
- **Demo Survey Token**: `demo-survey-token-12345`

## Docker Deployment

### Quick Start with Docker Compose

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and run the Next.js application
- Run database migrations
- Seed initial data
- Expose the app on http://localhost:3000

### Production Build

```bash
docker build -t abeam-governance:latest .
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e NEXTAUTH_SECRET="your-production-secret" \
  abeam-governance:latest
```

## Database Schema

### Core Models

- **Organization** - Multi-tenant organizations
- **Client** - Client companies
- **Project** - Assessment projects
- **Survey** - Survey instances with templates
- **SurveyTemplate** - Question templates (Quick 20Q, Standard 35Q, Deep 50Q)
- **Question** - 50 assessment questions across 5 domains
- **SurveySession** - User responses and scores
- **Response** - Individual question answers
- **Insight** - Generated insights (gaps, quick wins)
- **RecommendationRule** - 20 recommendation rules
- **RecommendationInstance** - Applied recommendations
- **AuditLog** - Security audit trail

### Seed Data

- **50 Questions** - 10 per domain, weighted scoring
- **20 Recommendation Rules** - Priority-based, triggered by conditions
- **3 Survey Templates** - Quick (20Q), Standard (35Q), Deep (50Q)
- **Demo Data** - Sample organization, client, project, survey

## API Endpoints

### Public Survey API

```
GET  /api/surveys/[token]              # Get survey details
POST /api/surveys/[token]/start        # Start new session
```

### Session Management

```
POST /api/sessions/[sessionId]/responses  # Save response (auto-save)
GET  /api/sessions/[sessionId]/responses  # Get all responses
POST /api/sessions/[sessionId]/submit     # Submit survey & analyze
GET  /api/sessions/[sessionId]/insights   # Get analysis results
```

### Reports

```
GET /api/reports/[sessionId]/pdf     # Download PDF report
GET /api/reports/[sessionId]/xlsx    # Download Excel report
```

## Business Logic

### Maturity Scoring

```typescript
Domain Score = Σ(Response Value × Question Weight) / Σ(Question Weight)
Overall Score = Average(All Domain Scores)
```

### Target Calculation

Based on aspiration profile:

- **Conservative**: Base 3.0, +0.4 Risk/Security, +0.3 Cost
- **Balanced**: Base 3.5, +0.3 Risk/Security, +0.2 Process/Info
- **Progressive**: Base 4.2, +0.3 Process/System, +0.2 Risk/Info

### Gap Analysis

```typescript
Gap = Target Score - Current Score

Risk Levels:
- Critical: Score < 2.0
- High: Score < 3.0
- Medium: Score < 4.0
- Low: Score >= 4.0
```

### Recommendation Engine

Rules are triggered based on:
- Domain-specific gaps
- Individual question scores
- Severity thresholds

Recommendations are prioritized and grouped into:
- **0-3 months** (Low effort)
- **3-6 months** (Medium effort)
- **6-12 months** (High effort)

## Testing

### Unit Tests

```bash
npm test
```

Tests cover:
- Score calculation logic
- Target computation
- Gap analysis
- Recommendation rule evaluation

### E2E Tests

```bash
npm run test:e2e
```

Tests include:
- Survey completion flow
- Response auto-save
- Score calculation
- Dashboard rendering
- PDF/XLSX generation

## Security Features

### PDPA Compliance
- Explicit consent requirement
- Consent timestamp logging
- Configurable retention periods (default 2 years)
- Data subject information clearly displayed

### Access Control
- Multi-tenant isolation
- Role-based permissions (Consultant/Client User)
- Token-based public survey access
- Session-based authentication

### Audit Trail
- All critical actions logged
- User identification
- Timestamp tracking
- Resource metadata

## Customization

### Adding Questions

Edit `prisma/seed.ts` and add to the `questions` array:

```typescript
{
  code: 'P11',
  domain: Domain.PROCESS_ORG_HR,
  textEn: 'Your question in English',
  textJa: 'Your question in Japanese',
  weight: 1.0,
}
```

### Adding Recommendation Rules

Add to `recommendationRules` in `prisma/seed.ts`:

```typescript
{
  key: 'REC_CUSTOM_001',
  domain: Domain.PROCESS_ORG_HR,
  severity: SeverityLevel.HIGH,
  effort: EffortLevel.MEDIUM,
  titleEn: 'Your recommendation',
  titleJa: 'あなたの推奨事項',
  descriptionEn: 'Detailed description...',
  descriptionJa: '詳細な説明...',
  triggerConditions: {
    domain: 'PROCESS_ORG_HR',
    gap: { min: 2.0 }
  },
  priority: 50,
}
```

### Branding

Update environment variables:

```env
APP_NAME="Your Company Name"
BRANDING_PRIMARY="#YourColorHex"
```

Update `tailwind.config.ts` for additional color customization.

## Performance Considerations

- **Auto-save debouncing**: Responses saved on slider change
- **Lazy loading**: Charts load only when visible
- **Optimized queries**: Prisma includes/relations minimized
- **PDF generation**: Server-side only, non-blocking
- **Excel streaming**: Large datasets handled efficiently

## Monitoring & Logging

- Audit logs capture all critical operations
- Error boundaries for graceful failure handling
- Console logging for debugging (disable in production)

## Troubleshooting

### Database Connection Issues

```bash
# Test connection
npx prisma db pull

# Reset database (CAUTION: deletes all data)
npx prisma migrate reset
```

### Seed Errors

```bash
# Re-run seed manually
npx prisma db seed
```

### Build Errors

```bash
# Clean build
rm -rf .next node_modules
npm install
npm run build
```

## Roadmap

### Planned Features
- [ ] Authentication with NextAuth (Google/Azure AD SSO)
- [ ] Consultant management dashboard
- [ ] Email notifications for survey invitations
- [ ] Bulk CSV import (150 questions)
- [ ] Historical trend analysis
- [ ] Multi-survey comparison
- [ ] Custom branding per organization
- [ ] Advanced RBAC with custom roles

## License

Proprietary - ABeam Consulting Thailand

## Support

For support, contact the development team or raise an issue in the internal repository.

---

**Built with ❤️ for ABeam Consulting Thailand**
