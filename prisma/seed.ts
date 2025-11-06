import { PrismaClient, Domain, SeverityLevel, EffortLevel, AspirationType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// 50 Assessment Questions
const questions = [
  // PROCESS_ORG_HR Domain (10 questions)
  {
    code: 'P01',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'IT strategy is formally documented and aligned with business objectives',
    textJa: 'IT戦略が正式に文書化され、ビジネス目標と整合している',
    descriptionEn: 'Assess whether your organization has a written IT strategy that supports business goals',
    descriptionJa: '組織がビジネス目標をサポートする文書化されたIT戦略を持っているかを評価',
    weight: 1.2,
  },
  {
    code: 'P02',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'IT governance structure with clear roles and responsibilities is established',
    textJa: '明確な役割と責任を持つITガバナンス体制が確立されている',
    descriptionEn: 'Evaluate the existence of governance committees, decision-making processes',
    descriptionJa: 'ガバナンス委員会、意思決定プロセスの存在を評価',
    weight: 1.3,
  },
  {
    code: 'P03',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'IT project portfolio management process is in place',
    textJa: 'ITプロジェクトポートフォリオ管理プロセスが整備されている',
    descriptionEn: 'Check if projects are prioritized, tracked, and aligned with strategy',
    descriptionJa: 'プロジェクトが優先順位付け、追跡され、戦略と整合しているかを確認',
    weight: 1.0,
  },
  {
    code: 'P04',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'Service level agreements (SLAs) are defined and monitored',
    textJa: 'サービスレベルアグリーメント（SLA）が定義され監視されている',
    descriptionEn: 'Assess whether SLAs exist for key IT services and are actively tracked',
    descriptionJa: '主要なITサービスのSLAが存在し、積極的に追跡されているかを評価',
    weight: 1.0,
  },
  {
    code: 'P05',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'Change management process is standardized and followed',
    textJa: '変更管理プロセスが標準化され遵守されている',
    descriptionEn: 'Evaluate the maturity of change control procedures',
    descriptionJa: '変更管理手順の成熟度を評価',
    weight: 1.1,
  },
  {
    code: 'P06',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'IT roles and competencies are clearly defined',
    textJa: 'ITの役割とコンピテンシーが明確に定義されている',
    descriptionEn: 'Check if job descriptions and skill requirements are documented',
    descriptionJa: '職務記述書とスキル要件が文書化されているかを確認',
    weight: 0.9,
  },
  {
    code: 'P07',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'Regular IT skills training and development programs exist',
    textJa: '定期的なITスキルトレーニングと開発プログラムが存在する',
    descriptionEn: 'Assess investment in staff development and continuous learning',
    descriptionJa: 'スタッフ育成と継続的学習への投資を評価',
    weight: 0.9,
  },
  {
    code: 'P08',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'Vendor management and contract governance is established',
    textJa: 'ベンダー管理と契約ガバナンスが確立されている',
    descriptionEn: 'Evaluate processes for managing third-party suppliers',
    descriptionJa: 'サードパーティサプライヤー管理のプロセスを評価',
    weight: 1.0,
  },
  {
    code: 'P09',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'IT performance metrics and KPIs are tracked and reported',
    textJa: 'ITパフォーマンス指標とKPIが追跡され報告されている',
    descriptionEn: 'Check if IT effectiveness is measured and communicated to leadership',
    descriptionJa: 'ITの有効性が測定され、リーダーシップに伝達されているかを確認',
    weight: 1.1,
  },
  {
    code: 'P10',
    domain: Domain.PROCESS_ORG_HR,
    textEn: 'Business-IT alignment is regularly reviewed and optimized',
    textJa: 'ビジネスとITの整合性が定期的にレビューされ最適化されている',
    descriptionEn: 'Assess mechanisms for ensuring IT supports evolving business needs',
    descriptionJa: 'ITが進化するビジネスニーズをサポートするメカニズムを評価',
    weight: 1.2,
  },

  // SYSTEM_TECH Domain (10 questions)
  {
    code: 'S01',
    domain: Domain.SYSTEM_TECH,
    textEn: 'IT architecture is documented and follows industry standards',
    textJa: 'ITアーキテクチャが文書化され、業界標準に従っている',
    descriptionEn: 'Evaluate whether architecture diagrams and standards are maintained',
    descriptionJa: 'アーキテクチャ図と標準が維持されているかを評価',
    weight: 1.2,
  },
  {
    code: 'S02',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Technology stack is modern and regularly updated',
    textJa: 'テクノロジースタックがモダンで定期的に更新されている',
    descriptionEn: 'Assess currency of platforms, frameworks, and tools',
    descriptionJa: 'プラットフォーム、フレームワーク、ツールの最新性を評価',
    weight: 1.1,
  },
  {
    code: 'S03',
    domain: Domain.SYSTEM_TECH,
    textEn: 'System integration capabilities are robust and scalable',
    textJa: 'システム統合機能が堅牢でスケーラブルである',
    descriptionEn: 'Check for API management, middleware, and integration patterns',
    descriptionJa: 'API管理、ミドルウェア、統合パターンを確認',
    weight: 1.0,
  },
  {
    code: 'S04',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Infrastructure is monitored with proactive alerting',
    textJa: 'インフラストラクチャが監視され、プロアクティブなアラートがある',
    descriptionEn: 'Evaluate monitoring tools, dashboards, and incident response',
    descriptionJa: '監視ツール、ダッシュボード、インシデント対応を評価',
    weight: 1.1,
  },
  {
    code: 'S05',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Disaster recovery and business continuity plans are tested regularly',
    textJa: '災害復旧とビジネス継続性計画が定期的にテストされている',
    descriptionEn: 'Assess DR procedures, backup testing, and RTO/RPO compliance',
    descriptionJa: 'DR手順、バックアップテスト、RTO/RPO準拠を評価',
    weight: 1.3,
  },
  {
    code: 'S06',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Cloud adoption strategy is defined and being executed',
    textJa: 'クラウド採用戦略が定義され実行されている',
    descriptionEn: 'Check cloud migration roadmap and hybrid/multi-cloud approach',
    descriptionJa: 'クラウド移行ロードマップとハイブリッド/マルチクラウドアプローチを確認',
    weight: 1.0,
  },
  {
    code: 'S07',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Development practices include version control and CI/CD pipelines',
    textJa: '開発プラクティスにバージョン管理とCI/CDパイプラインが含まれる',
    descriptionEn: 'Evaluate DevOps maturity and automation',
    descriptionJa: 'DevOpsの成熟度と自動化を評価',
    weight: 0.9,
  },
  {
    code: 'S08',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Technical debt is identified and managed',
    textJa: '技術的負債が特定され管理されている',
    descriptionEn: 'Assess processes for addressing legacy code and systems',
    descriptionJa: 'レガシーコードとシステムに対処するプロセスを評価',
    weight: 1.0,
  },
  {
    code: 'S09',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Performance optimization is continuous and data-driven',
    textJa: 'パフォーマンス最適化が継続的でデータ駆動型である',
    descriptionEn: 'Check for performance testing, tuning, and capacity planning',
    descriptionJa: 'パフォーマンステスト、チューニング、キャパシティプランニングを確認',
    weight: 0.9,
  },
  {
    code: 'S10',
    domain: Domain.SYSTEM_TECH,
    textEn: 'Emerging technologies are evaluated for potential adoption',
    textJa: '新興技術が採用の可能性について評価されている',
    descriptionEn: 'Assess innovation initiatives and technology scouting',
    descriptionJa: 'イノベーションイニシアチブと技術調査を評価',
    weight: 0.8,
  },

  // COST Domain (10 questions)
  {
    code: 'C01',
    domain: Domain.COST,
    textEn: 'IT budget is formally planned and approved annually',
    textJa: 'IT予算が正式に計画され、年次で承認されている',
    descriptionEn: 'Evaluate budgeting process and governance',
    descriptionJa: '予算編成プロセスとガバナンスを評価',
    weight: 1.2,
  },
  {
    code: 'C02',
    domain: Domain.COST,
    textEn: 'IT spending is tracked and reported against budget',
    textJa: 'IT支出が予算に対して追跡され報告されている',
    descriptionEn: 'Check for financial monitoring and variance analysis',
    descriptionJa: '財務監視と差異分析を確認',
    weight: 1.1,
  },
  {
    code: 'C03',
    domain: Domain.COST,
    textEn: 'Cost allocation model assigns IT costs to business units',
    textJa: 'コスト配分モデルがIT費用をビジネスユニットに割り当てている',
    descriptionEn: 'Assess chargeback or showback mechanisms',
    descriptionJa: 'チャージバックまたはショーバックメカニズムを評価',
    weight: 1.0,
  },
  {
    code: 'C04',
    domain: Domain.COST,
    textEn: 'ROI and business value of IT investments are measured',
    textJa: 'IT投資のROIとビジネス価値が測定されている',
    descriptionEn: 'Evaluate benefits realization and value tracking',
    descriptionJa: 'ベネフィット実現と価値追跡を評価',
    weight: 1.2,
  },
  {
    code: 'C05',
    domain: Domain.COST,
    textEn: 'Cloud and SaaS costs are actively optimized',
    textJa: 'クラウドとSaaSコストが積極的に最適化されている',
    descriptionEn: 'Check for FinOps practices and cost management tools',
    descriptionJa: 'FinOpsプラクティスとコスト管理ツールを確認',
    weight: 1.0,
  },
  {
    code: 'C06',
    domain: Domain.COST,
    textEn: 'Total cost of ownership (TCO) is calculated for major systems',
    textJa: '主要システムの総所有コスト（TCO）が計算されている',
    descriptionEn: 'Assess TCO modeling for infrastructure and applications',
    descriptionJa: 'インフラストラクチャとアプリケーションのTCOモデリングを評価',
    weight: 1.1,
  },
  {
    code: 'C07',
    domain: Domain.COST,
    textEn: 'IT procurement follows competitive bidding and best practices',
    textJa: 'IT調達が競争入札とベストプラクティスに従っている',
    descriptionEn: 'Evaluate procurement governance and vendor selection',
    descriptionJa: '調達ガバナンスとベンダー選定を評価',
    weight: 0.9,
  },
  {
    code: 'C08',
    domain: Domain.COST,
    textEn: 'License management and software asset optimization is practiced',
    textJa: 'ライセンス管理とソフトウェア資産最適化が実践されている',
    descriptionEn: 'Check for SAM tools and compliance processes',
    descriptionJa: 'SAMツールとコンプライアンスプロセスを確認',
    weight: 1.0,
  },
  {
    code: 'C09',
    domain: Domain.COST,
    textEn: 'Energy efficiency and green IT initiatives are pursued',
    textJa: 'エネルギー効率とグリーンITイニシアチブが追求されている',
    descriptionEn: 'Assess sustainability efforts in IT operations',
    descriptionJa: 'IT運用における持続可能性への取り組みを評価',
    weight: 0.8,
  },
  {
    code: 'C10',
    domain: Domain.COST,
    textEn: 'Continuous cost improvement programs are in place',
    textJa: '継続的なコスト改善プログラムが整備されている',
    descriptionEn: 'Evaluate lean IT practices and cost reduction initiatives',
    descriptionJa: 'リーンITプラクティスとコスト削減イニシアチブを評価',
    weight: 1.0,
  },

  // INFORMATION Domain (10 questions)
  {
    code: 'I01',
    domain: Domain.INFORMATION,
    textEn: 'Data governance framework and policies are established',
    textJa: 'データガバナンスフレームワークとポリシーが確立されている',
    descriptionEn: 'Assess data ownership, stewardship, and accountability',
    descriptionJa: 'データ所有権、スチュワードシップ、説明責任を評価',
    weight: 1.3,
  },
  {
    code: 'I02',
    domain: Domain.INFORMATION,
    textEn: 'Data quality standards and monitoring are implemented',
    textJa: 'データ品質基準と監視が実装されている',
    descriptionEn: 'Evaluate data cleansing, validation, and quality metrics',
    descriptionJa: 'データクレンジング、検証、品質メトリクスを評価',
    weight: 1.1,
  },
  {
    code: 'I03',
    domain: Domain.INFORMATION,
    textEn: 'Master data management (MDM) processes are in place',
    textJa: 'マスターデータ管理（MDM）プロセスが整備されている',
    descriptionEn: 'Check for single source of truth for critical data entities',
    descriptionJa: '重要なデータエンティティの信頼できる単一のソースを確認',
    weight: 1.2,
  },
  {
    code: 'I04',
    domain: Domain.INFORMATION,
    textEn: 'Data classification and handling procedures are defined',
    textJa: 'データ分類と取り扱い手順が定義されている',
    descriptionEn: 'Assess classification schemes (public, internal, confidential, etc.)',
    descriptionJa: '分類スキーム（公開、社内、機密など）を評価',
    weight: 1.1,
  },
  {
    code: 'I05',
    domain: Domain.INFORMATION,
    textEn: 'Data privacy and PDPA compliance is actively managed',
    textJa: 'データプライバシーとPDPAコンプライアンスが積極的に管理されている',
    descriptionEn: 'Evaluate privacy controls, consent management, data subject rights',
    descriptionJa: 'プライバシー管理、同意管理、データ主体の権利を評価',
    weight: 1.4,
  },
  {
    code: 'I06',
    domain: Domain.INFORMATION,
    textEn: 'Data lifecycle management (retention and disposal) is implemented',
    textJa: 'データライフサイクル管理（保持と廃棄）が実装されている',
    descriptionEn: 'Check for retention policies and secure data disposal',
    descriptionJa: '保持ポリシーと安全なデータ廃棄を確認',
    weight: 1.0,
  },
  {
    code: 'I07',
    domain: Domain.INFORMATION,
    textEn: 'Data analytics and business intelligence capabilities exist',
    textJa: 'データ分析とビジネスインテリジェンス機能が存在する',
    descriptionEn: 'Assess BI tools, data warehouses, and reporting',
    descriptionJa: 'BIツール、データウェアハウス、レポーティングを評価',
    weight: 1.0,
  },
  {
    code: 'I08',
    domain: Domain.INFORMATION,
    textEn: 'Data architecture supports integration and interoperability',
    textJa: 'データアーキテクチャが統合と相互運用性をサポートしている',
    descriptionEn: 'Evaluate data models, APIs, and data exchange standards',
    descriptionJa: 'データモデル、API、データ交換標準を評価',
    weight: 1.0,
  },
  {
    code: 'I09',
    domain: Domain.INFORMATION,
    textEn: 'Metadata management and data cataloging is practiced',
    textJa: 'メタデータ管理とデータカタログ化が実践されている',
    descriptionEn: 'Check for data dictionaries and discovery tools',
    descriptionJa: 'データ辞書と発見ツールを確認',
    weight: 0.9,
  },
  {
    code: 'I10',
    domain: Domain.INFORMATION,
    textEn: 'Advanced analytics (AI/ML) initiatives are underway',
    textJa: '高度な分析（AI/ML）イニシアチブが進行中である',
    descriptionEn: 'Assess predictive analytics, machine learning, and AI adoption',
    descriptionJa: '予測分析、機械学習、AI採用を評価',
    weight: 0.9,
  },

  // RISK_SECURITY Domain (10 questions)
  {
    code: 'R01',
    domain: Domain.RISK_SECURITY,
    textEn: 'Information security policies and standards are documented',
    textJa: '情報セキュリティポリシーと標準が文書化されている',
    descriptionEn: 'Evaluate security governance and policy framework',
    descriptionJa: 'セキュリティガバナンスとポリシーフレームワークを評価',
    weight: 1.3,
  },
  {
    code: 'R02',
    domain: Domain.RISK_SECURITY,
    textEn: 'Regular security awareness training is provided to all staff',
    textJa: '全スタッフに定期的なセキュリティ意識向上トレーニングが提供されている',
    descriptionEn: 'Assess training programs, phishing simulations, awareness campaigns',
    descriptionJa: 'トレーニングプログラム、フィッシングシミュレーション、啓発キャンペーンを評価',
    weight: 1.0,
  },
  {
    code: 'R03',
    domain: Domain.RISK_SECURITY,
    textEn: 'Access controls and identity management are robust',
    textJa: 'アクセス制御とアイデンティティ管理が堅牢である',
    descriptionEn: 'Check for IAM, MFA, least privilege, role-based access',
    descriptionJa: 'IAM、MFA、最小権限、ロールベースアクセスを確認',
    weight: 1.2,
  },
  {
    code: 'R04',
    domain: Domain.RISK_SECURITY,
    textEn: 'Vulnerability management and patch management are systematic',
    textJa: '脆弱性管理とパッチ管理が体系的である',
    descriptionEn: 'Evaluate scanning, risk assessment, and remediation processes',
    descriptionJa: 'スキャン、リスク評価、修復プロセスを評価',
    weight: 1.2,
  },
  {
    code: 'R05',
    domain: Domain.RISK_SECURITY,
    textEn: 'Incident response plan is documented and tested',
    textJa: 'インシデント対応計画が文書化されテストされている',
    descriptionEn: 'Assess IR procedures, playbooks, and tabletop exercises',
    descriptionJa: 'IR手順、プレイブック、テーブルトップ演習を評価',
    weight: 1.3,
  },
  {
    code: 'R06',
    domain: Domain.RISK_SECURITY,
    textEn: 'Security monitoring and threat detection capabilities exist',
    textJa: 'セキュリティ監視と脅威検出機能が存在する',
    descriptionEn: 'Check for SIEM, SOC, intrusion detection systems',
    descriptionJa: 'SIEM、SOC、侵入検知システムを確認',
    weight: 1.1,
  },
  {
    code: 'R07',
    domain: Domain.RISK_SECURITY,
    textEn: 'Data encryption is used for data at rest and in transit',
    textJa: 'データ保管時と転送時に暗号化が使用されている',
    descriptionEn: 'Evaluate encryption standards and key management',
    descriptionJa: '暗号化標準と鍵管理を評価',
    weight: 1.2,
  },
  {
    code: 'R08',
    domain: Domain.RISK_SECURITY,
    textEn: 'Third-party risk management includes security assessments',
    textJa: 'サードパーティリスク管理にセキュリティ評価が含まれる',
    descriptionEn: 'Assess vendor due diligence and ongoing monitoring',
    descriptionJa: 'ベンダーデューデリジェンスと継続的監視を評価',
    weight: 1.0,
  },
  {
    code: 'R09',
    domain: Domain.RISK_SECURITY,
    textEn: 'Compliance with relevant regulations and standards is maintained',
    textJa: '関連する規制と標準への準拠が維持されている',
    descriptionEn: 'Check for ISO 27001, SOC 2, industry-specific compliance',
    descriptionJa: 'ISO 27001、SOC 2、業界固有のコンプライアンスを確認',
    weight: 1.1,
  },
  {
    code: 'R10',
    domain: Domain.RISK_SECURITY,
    textEn: 'Security audits and penetration testing are conducted regularly',
    textJa: 'セキュリティ監査と侵入テストが定期的に実施されている',
    descriptionEn: 'Evaluate frequency and depth of security assessments',
    descriptionJa: 'セキュリティ評価の頻度と深さを評価',
    weight: 1.2,
  },
];

// 20 Recommendation Rules
const recommendationRules = [
  {
    key: 'REC_PROC_001',
    domain: Domain.PROCESS_ORG_HR,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Establish formal IT governance framework',
    titleJa: '正式なITガバナンスフレームワークを確立する',
    descriptionEn: 'Create IT governance committees, define decision rights, establish RACI matrices, and implement regular governance reviews to align IT with business strategy.',
    descriptionJa: 'ITガバナンス委員会を設置し、意思決定権を定義し、RACIマトリックスを確立し、ITをビジネス戦略と整合させるための定期的なガバナンスレビューを実施します。',
    triggerConditions: {
      domain: 'PROCESS_ORG_HR',
      gap: { min: 2.5 },
      questions: ['P02'],
    },
    priority: 10,
  },
  {
    key: 'REC_PROC_002',
    domain: Domain.PROCESS_ORG_HR,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.LOW,
    titleEn: 'Implement IT service management (ITSM) framework',
    titleJa: 'ITサービス管理（ITSM）フレームワークを実装する',
    descriptionEn: 'Adopt ITIL or similar framework for incident, change, and problem management. Implement service desk and knowledge base.',
    descriptionJa: 'インシデント、変更、問題管理のためにITILまたは類似のフレームワークを採用します。サービスデスクとナレッジベースを実装します。',
    triggerConditions: {
      domain: 'PROCESS_ORG_HR',
      gap: { min: 2.0 },
      questions: ['P04', 'P05'],
    },
    priority: 20,
  },
  {
    key: 'REC_PROC_003',
    domain: Domain.PROCESS_ORG_HR,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Develop IT staff training and certification program',
    titleJa: 'ITスタッフトレーニングと認定プログラムを開発する',
    descriptionEn: 'Create comprehensive training plans, budget for certifications, establish mentoring programs, and track skill development.',
    descriptionJa: '包括的なトレーニング計画を作成し、認定のための予算を確保し、メンタリングプログラムを確立し、スキル開発を追跡します。',
    triggerConditions: {
      domain: 'PROCESS_ORG_HR',
      gap: { min: 2.0 },
      questions: ['P07'],
    },
    priority: 30,
  },
  {
    key: 'REC_SYS_001',
    domain: Domain.SYSTEM_TECH,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.HIGH,
    titleEn: 'Modernize legacy systems and reduce technical debt',
    titleJa: 'レガシーシステムを近代化し、技術的負債を削減する',
    descriptionEn: 'Conduct technical debt assessment, prioritize refactoring efforts, implement gradual migration strategy, and adopt modern development practices.',
    descriptionJa: '技術的負債評価を実施し、リファクタリングの取り組みに優先順位を付け、段階的な移行戦略を実装し、最新の開発プラクティスを採用します。',
    triggerConditions: {
      domain: 'SYSTEM_TECH',
      gap: { min: 2.5 },
      questions: ['S02', 'S08'],
    },
    priority: 15,
  },
  {
    key: 'REC_SYS_002',
    domain: Domain.SYSTEM_TECH,
    severity: SeverityLevel.CRITICAL,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Implement comprehensive disaster recovery and business continuity plan',
    titleJa: '包括的な災害復旧とビジネス継続性計画を実装する',
    descriptionEn: 'Define RTO/RPO requirements, establish backup strategies, implement failover mechanisms, and conduct regular DR drills.',
    descriptionJa: 'RTO/RPO要件を定義し、バックアップ戦略を確立し、フェイルオーバーメカニズムを実装し、定期的なDR訓練を実施します。',
    triggerConditions: {
      domain: 'SYSTEM_TECH',
      gap: { min: 3.0 },
      questions: ['S05'],
    },
    priority: 5,
  },
  {
    key: 'REC_SYS_003',
    domain: Domain.SYSTEM_TECH,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Establish DevOps practices and CI/CD pipelines',
    titleJa: 'DevOpsプラクティスとCI/CDパイプラインを確立する',
    descriptionEn: 'Implement version control, automated testing, continuous integration/deployment, and infrastructure as code.',
    descriptionJa: 'バージョン管理、自動テスト、継続的インテグレーション/デプロイメント、Infrastructure as Codeを実装します。',
    triggerConditions: {
      domain: 'SYSTEM_TECH',
      gap: { min: 2.0 },
      questions: ['S07'],
    },
    priority: 25,
  },
  {
    key: 'REC_SYS_004',
    domain: Domain.SYSTEM_TECH,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.LOW,
    titleEn: 'Deploy comprehensive infrastructure monitoring',
    titleJa: '包括的なインフラストラクチャ監視を展開する',
    descriptionEn: 'Implement APM tools, log aggregation, real-time dashboards, and proactive alerting for system health.',
    descriptionJa: 'APMツール、ログ集約、リアルタイムダッシュボード、システムヘルスのためのプロアクティブなアラートを実装します。',
    triggerConditions: {
      domain: 'SYSTEM_TECH',
      gap: { min: 2.0 },
      questions: ['S04'],
    },
    priority: 22,
  },
  {
    key: 'REC_COST_001',
    domain: Domain.COST,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Implement FinOps and cloud cost optimization',
    titleJa: 'FinOpsとクラウドコスト最適化を実装する',
    descriptionEn: 'Deploy cost monitoring tools, implement tagging strategies, right-size resources, leverage reserved instances, and establish cost accountability.',
    descriptionJa: 'コスト監視ツールを展開し、タグ付け戦略を実装し、リソースを適正化し、予約インスタンスを活用し、コスト説明責任を確立します。',
    triggerConditions: {
      domain: 'COST',
      gap: { min: 2.0 },
      questions: ['C05'],
    },
    priority: 18,
  },
  {
    key: 'REC_COST_002',
    domain: Domain.COST,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.LOW,
    titleEn: 'Establish IT financial transparency and chargeback model',
    titleJa: 'IT財務透明性とチャージバックモデルを確立する',
    descriptionEn: 'Create cost allocation methodology, implement showback/chargeback, and provide regular financial reports to business units.',
    descriptionJa: 'コスト配分方法論を作成し、ショーバック/チャージバックを実装し、ビジネスユニットに定期的な財務報告を提供します。',
    triggerConditions: {
      domain: 'COST',
      gap: { min: 2.0 },
      questions: ['C02', 'C03'],
    },
    priority: 28,
  },
  {
    key: 'REC_COST_003',
    domain: Domain.COST,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Implement software asset management (SAM)',
    titleJa: 'ソフトウェア資産管理（SAM）を実装する',
    descriptionEn: 'Deploy SAM tools, conduct license audits, optimize software usage, and ensure compliance with vendor agreements.',
    descriptionJa: 'SAMツールを展開し、ライセンス監査を実施し、ソフトウェア使用を最適化し、ベンダー契約の準拠を確保します。',
    triggerConditions: {
      domain: 'COST',
      gap: { min: 2.0 },
      questions: ['C08'],
    },
    priority: 26,
  },
  {
    key: 'REC_INFO_001',
    domain: Domain.INFORMATION,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.HIGH,
    titleEn: 'Establish comprehensive data governance framework',
    titleJa: '包括的なデータガバナンスフレームワークを確立する',
    descriptionEn: 'Create data governance council, define data ownership, establish policies, and implement data stewardship roles.',
    descriptionJa: 'データガバナンス評議会を設置し、データ所有権を定義し、ポリシーを確立し、データスチュワードシップの役割を実装します。',
    triggerConditions: {
      domain: 'INFORMATION',
      gap: { min: 2.5 },
      questions: ['I01'],
    },
    priority: 12,
  },
  {
    key: 'REC_INFO_002',
    domain: Domain.INFORMATION,
    severity: SeverityLevel.CRITICAL,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Ensure PDPA compliance and data privacy',
    titleJa: 'PDPAコンプライアンスとデータプライバシーを確保する',
    descriptionEn: 'Conduct privacy impact assessments, implement consent management, establish data subject rights processes, and ensure regulatory compliance.',
    descriptionJa: 'プライバシー影響評価を実施し、同意管理を実装し、データ主体の権利プロセスを確立し、規制準拠を確保します。',
    triggerConditions: {
      domain: 'INFORMATION',
      gap: { min: 2.5 },
      questions: ['I05'],
    },
    priority: 8,
  },
  {
    key: 'REC_INFO_003',
    domain: Domain.INFORMATION,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Implement master data management (MDM) program',
    titleJa: 'マスターデータ管理（MDM）プログラムを実装する',
    descriptionEn: 'Identify critical data entities, implement MDM platform, establish data quality rules, and ensure data consistency across systems.',
    descriptionJa: '重要なデータエンティティを特定し、MDMプラットフォームを実装し、データ品質ルールを確立し、システム間のデータ一貫性を確保します。',
    triggerConditions: {
      domain: 'INFORMATION',
      gap: { min: 2.0 },
      questions: ['I03'],
    },
    priority: 24,
  },
  {
    key: 'REC_INFO_004',
    domain: Domain.INFORMATION,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.LOW,
    titleEn: 'Enhance data quality and monitoring',
    titleJa: 'データ品質と監視を強化する',
    descriptionEn: 'Implement data quality tools, establish quality metrics, create data cleansing processes, and monitor data health continuously.',
    descriptionJa: 'データ品質ツールを実装し、品質メトリクスを確立し、データクレンジングプロセスを作成し、データヘルスを継続的に監視します。',
    triggerConditions: {
      domain: 'INFORMATION',
      gap: { min: 2.0 },
      questions: ['I02'],
    },
    priority: 29,
  },
  {
    key: 'REC_RISK_001',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.CRITICAL,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Strengthen access controls and identity management',
    titleJa: 'アクセス制御とアイデンティティ管理を強化する',
    descriptionEn: 'Implement IAM platform, enforce MFA, adopt zero-trust architecture, conduct access reviews, and apply least privilege principle.',
    descriptionJa: 'IAMプラットフォームを実装し、MFAを強制し、ゼロトラストアーキテクチャを採用し、アクセスレビューを実施し、最小権限の原則を適用します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 2.5 },
      questions: ['R03'],
    },
    priority: 7,
  },
  {
    key: 'REC_RISK_002',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.CRITICAL,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Establish robust incident response capability',
    titleJa: '堅牢なインシデント対応能力を確立する',
    descriptionEn: 'Develop IR playbooks, form CSIRT team, implement SOAR tools, conduct tabletop exercises, and establish escalation procedures.',
    descriptionJa: 'IRプレイブックを開発し、CSIRTチームを編成し、SOARツールを実装し、テーブルトップ演習を実施し、エスカレーション手順を確立します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 3.0 },
      questions: ['R05'],
    },
    priority: 6,
  },
  {
    key: 'REC_RISK_003',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Deploy security monitoring and threat detection (SIEM/SOC)',
    titleJa: 'セキュリティ監視と脅威検出（SIEM/SOC）を展開する',
    descriptionEn: 'Implement SIEM platform, establish 24/7 SOC, integrate threat intelligence feeds, and create detection use cases.',
    descriptionJa: 'SIEMプラットフォームを実装し、24/7 SOCを確立し、脅威インテリジェンスフィードを統合し、検出ユースケースを作成します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 2.5 },
      questions: ['R06'],
    },
    priority: 11,
  },
  {
    key: 'REC_RISK_004',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.HIGH,
    effort: EffortLevel.LOW,
    titleEn: 'Implement systematic vulnerability and patch management',
    titleJa: '体系的な脆弱性とパッチ管理を実装する',
    descriptionEn: 'Deploy vulnerability scanners, establish patch management process, prioritize based on risk, and track remediation timelines.',
    descriptionJa: '脆弱性スキャナーを展開し、パッチ管理プロセスを確立し、リスクに基づいて優先順位を付け、修復タイムラインを追跡します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 2.5 },
      questions: ['R04'],
    },
    priority: 14,
  },
  {
    key: 'REC_RISK_005',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.LOW,
    titleEn: 'Establish security awareness training program',
    titleJa: 'セキュリティ意識向上トレーニングプログラムを確立する',
    descriptionEn: 'Create mandatory security training, run phishing simulations, develop security champions program, and track awareness metrics.',
    descriptionJa: '必須のセキュリティトレーニングを作成し、フィッシングシミュレーションを実行し、セキュリティチャンピオンプログラムを開発し、意識メトリクスを追跡します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 2.0 },
      questions: ['R02'],
    },
    priority: 27,
  },
  {
    key: 'REC_RISK_006',
    domain: Domain.RISK_SECURITY,
    severity: SeverityLevel.MEDIUM,
    effort: EffortLevel.MEDIUM,
    titleEn: 'Implement data encryption and key management',
    titleJa: 'データ暗号化と鍵管理を実装する',
    descriptionEn: 'Deploy encryption for data at rest and in transit, implement key management system, and enforce encryption policies.',
    descriptionJa: '保管時と転送時のデータの暗号化を展開し、鍵管理システムを実装し、暗号化ポリシーを強制します。',
    triggerConditions: {
      domain: 'RISK_SECURITY',
      gap: { min: 2.5 },
      questions: ['R07'],
    },
    priority: 16,
  },
];

async function main() {
  console.log('🌱 Starting seed...');

  // Create default organization
  const org = await prisma.organization.upsert({
    where: { id: 'org_abeam_default' },
    update: {},
    create: {
      id: 'org_abeam_default',
      name: 'ABeam Consulting Thailand',
      domain: 'abeam.com',
    },
  });
  console.log('✓ Created organization:', org.name);

  // Create admin user (consultant)
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@abeam.com' },
    update: {},
    create: {
      email: 'admin@abeam.com',
      name: 'Admin Consultant',
      passwordHash: adminPasswordHash,
      role: 'CONSULTANT',
      organizationId: org.id,
      locale: 'en',
    },
  });
  console.log('✓ Created admin user:', adminUser.email);

  // Create demo client
  const client = await prisma.client.upsert({
    where: { id: 'client_demo' },
    update: {},
    create: {
      id: 'client_demo',
      name: 'Demo Corporation',
      industry: 'Technology',
      contactEmail: 'client@demo.com',
      organizationId: org.id,
    },
  });
  console.log('✓ Created demo client:', client.name);

  // Create client user
  const clientPasswordHash = await bcrypt.hash('client123', 10);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@demo.com' },
    update: {},
    create: {
      email: 'client@demo.com',
      name: 'Client User',
      passwordHash: clientPasswordHash,
      role: 'CLIENT_USER',
      organizationId: org.id,
      clientId: client.id,
      locale: 'en',
    },
  });
  console.log('✓ Created client user:', clientUser.email);

  // Create questions
  console.log('Creating 50 questions...');
  for (const q of questions) {
    await prisma.question.upsert({
      where: { code: q.code },
      update: q,
      create: q,
    });
  }
  console.log('✓ Created 50 questions');

  // Create survey templates
  const quickTemplate = await prisma.surveyTemplate.upsert({
    where: { id: 'template_quick' },
    update: {},
    create: {
      id: 'template_quick',
      name: 'Quick Assessment (20Q)',
      description: 'Quick governance scan with 20 key questions',
      questionCount: 20,
    },
  });

  const standardTemplate = await prisma.surveyTemplate.upsert({
    where: { id: 'template_standard' },
    update: {},
    create: {
      id: 'template_standard',
      name: 'Standard Assessment (35Q)',
      description: 'Comprehensive assessment with 35 questions',
      questionCount: 35,
    },
  });

  const deepTemplate = await prisma.surveyTemplate.upsert({
    where: { id: 'template_deep' },
    update: {},
    create: {
      id: 'template_deep',
      name: 'Deep Assessment (50Q)',
      description: 'In-depth governance assessment with all 50 questions',
      questionCount: 50,
    },
  });
  console.log('✓ Created 3 survey templates');

  // Assign questions to templates
  const allQuestions = await prisma.question.findMany({ orderBy: { code: 'asc' } });

  // Quick: 4 questions per domain (20 total)
  for (let i = 0; i < 20; i++) {
    await prisma.surveyTemplateQuestion.upsert({
      where: {
        templateId_questionId: {
          templateId: quickTemplate.id,
          questionId: allQuestions[i].id,
        },
      },
      update: {},
      create: {
        templateId: quickTemplate.id,
        questionId: allQuestions[i].id,
        order: i,
      },
    });
  }

  // Standard: 7 questions per domain (35 total)
  for (let i = 0; i < 35; i++) {
    await prisma.surveyTemplateQuestion.upsert({
      where: {
        templateId_questionId: {
          templateId: standardTemplate.id,
          questionId: allQuestions[i].id,
        },
      },
      update: {},
      create: {
        templateId: standardTemplate.id,
        questionId: allQuestions[i].id,
        order: i,
      },
    });
  }

  // Deep: all 50 questions
  for (let i = 0; i < 50; i++) {
    await prisma.surveyTemplateQuestion.upsert({
      where: {
        templateId_questionId: {
          templateId: deepTemplate.id,
          questionId: allQuestions[i].id,
        },
      },
      update: {},
      create: {
        templateId: deepTemplate.id,
        questionId: allQuestions[i].id,
        order: i,
      },
    });
  }
  console.log('✓ Assigned questions to templates');

  // Create recommendation rules
  console.log('Creating 20 recommendation rules...');
  for (const rule of recommendationRules) {
    await prisma.recommendationRule.upsert({
      where: { key: rule.key },
      update: rule,
      create: rule,
    });
  }
  console.log('✓ Created 20 recommendation rules');

  // Create a demo project
  const project = await prisma.project.create({
    data: {
      name: 'IT Governance Assessment 2025',
      description: 'Annual IT governance maturity assessment',
      clientId: client.id,
      createdById: adminUser.id,
    },
  });
  console.log('✓ Created demo project:', project.name);

  // Create a demo survey
  const survey = await prisma.survey.create({
    data: {
      title: 'IT Governance Quick Assessment - Demo',
      description: 'Evaluate your IT governance maturity across 5 key domains',
      projectId: project.id,
      templateId: standardTemplate.id,
      publicToken: 'demo-survey-token-12345',
      pdpaConsentTextEn: 'By submitting this assessment, you consent to ABeam Consulting Thailand collecting and processing your responses for the purpose of IT governance analysis. Your data will be retained for 2 years and handled in accordance with PDPA.',
      pdpaConsentTextJa: 'この評価を提出することにより、ABeam Consulting ThailandがITガバナンス分析の目的であなたの回答を収集および処理することに同意します。データは2年間保持され、PDPAに従って処理されます。',
    },
  });
  console.log('✓ Created demo survey:', survey.title);

  console.log('');
  console.log('🎉 Seed completed successfully!');
  console.log('');
  console.log('Default credentials:');
  console.log('  Consultant: admin@abeam.com / admin123');
  console.log('  Client:     client@demo.com / client123');
  console.log('');
  console.log('Demo survey token: demo-survey-token-12345');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
