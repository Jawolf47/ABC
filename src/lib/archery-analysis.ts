import { ArcheryFeedbackEngine } from "@/lib/feedback"

export interface FeedbackResult {
  summary: {
    total_score: number
    max_possible_score: number
    total_arrows: number
    average_arrow_value: number
    score_percentage: number
    tier: string
  }
  primary_feedback: {
    code: string
    type: string
    severity: string
    observation: string
    root_cause: string
    actionable_tips: string[]
  }
  secondary_feedback: Array<{
    code: string
    type: string
    severity: string
    observation: string
    root_cause: string
    actionable_tips: string[]
  }>
  performance_tier_info: {
    code: string
    title: string
    type: string
    severity: string
    observation: string
    root_cause: string
    actionable_tips: string[]
  }
}

export function analyzeScorecard(endsData: number[][], maxScorePerArrow: number = 10): FeedbackResult {
  const engine = new ArcheryFeedbackEngine(maxScorePerArrow)
  return engine.evaluateSession(endsData) as FeedbackResult
}
