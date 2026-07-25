interface Diagnostic {
  code: string
  title?: string
  type: string
  severity: string
  observation: string
  root_cause: string
  actionable_tips: string[]
}

interface FeedbackResult {
  summary: {
    total_score: number
    max_possible_score: number
    total_arrows: number
    average_arrow_value: number
    score_percentage: number
    tier: string
  }
  primary_feedback: Diagnostic
  secondary_feedback: Diagnostic[]
  performance_tier_info: Diagnostic
}

export class ArcheryFeedbackEngine {
  maxScorePerArrow: number

  constructor(maxScorePerArrow: number = 10) {
    this.maxScorePerArrow = maxScorePerArrow
  }

  evaluateSession(endsData: number[][]): FeedbackResult {
    const allArrows = endsData.flat()
    const totalArrows = allArrows.length

    if (totalArrows === 0) {
      throw new Error("Ends data cannot be empty.")
    }

    const totalScore = allArrows.reduce((a, b) => a + b, 0)
    const maxPossibleScore = totalArrows * this.maxScorePerArrow
    const avgArrowValue = totalScore / totalArrows
    const percentage = (totalScore / maxPossibleScore) * 100

    const endAverages = endsData
      .filter((end) => end.length > 0)
      .map((end) => end.reduce((a, b) => a + b, 0) / end.length)

    const diagnoses: Diagnostic[] = []

    const fatigue = this._checkFatigue(endAverages)
    if (fatigue) diagnoses.push(fatigue)

    const variance = this._checkVariance(endsData)
    if (variance) diagnoses.push(variance)

    const tier = this._getPerformanceTierFeedback(percentage)

    return {
      summary: {
        total_score: totalScore,
        max_possible_score: maxPossibleScore,
        total_arrows: totalArrows,
        average_arrow_value: Math.round(avgArrowValue * 100) / 100,
        score_percentage: Math.round(percentage * 10) / 10,
        tier: tier.title || tier.type,
      },
      primary_feedback: diagnoses[0] || tier,
      secondary_feedback: diagnoses.length > 1 ? diagnoses.slice(1) : [],
      performance_tier_info: tier,
    }
  }

  private _checkFatigue(endAverages: number[]): Diagnostic | null {
    if (endAverages.length < 4) return null

    const midPoint = Math.floor(endAverages.length / 2)
    const firstHalf = endAverages.slice(0, midPoint)
    const secondHalf = endAverages.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length

    if (firstHalfAvg > 0 && (firstHalfAvg - secondHalfAvg) / firstHalfAvg >= 0.15) {
      return {
        code: "FATIGUE_COLLAPSE",
        type: "Late-Session Fatigue & Bow Arm Collapse",
        severity: "High",
        observation: `Average arrow score dropped from ${firstHalfAvg.toFixed(2)} in the first half to ${secondHalfAvg.toFixed(2)} in the second half.`,
        root_cause:
          "Physical fatigue leading to collapsing bow shoulder, shortened draw length, or rushed execution.",
        actionable_tips: [
          "Keep your hold time consistent (under 3\u20134 seconds).",
          "Maintain dynamic back tension through the release\u2014don\u2019t let the bow hand creep forward.",
          "Ensure your bow shoulder stays low and set, rather than rising toward your neck.",
        ],
      }
    }
    return null
  }

  private _checkVariance(endsData: number[][]): Diagnostic | null {
    const endRanges = endsData
      .filter((end) => end.length > 1)
      .map((end) => Math.max(...end) - Math.min(...end))

    if (endRanges.length === 0) return null

    const avgRange = endRanges.reduce((a, b) => a + b, 0) / endRanges.length

    if (avgRange >= 4.0) {
      return {
        code: "ANCHOR_INCONSISTENCY",
        type: "Anchor Point / Setup Instability",
        severity: "Medium",
        observation: `High intra-end score spread (average arrow-to-arrow range of ${avgRange.toFixed(1)} points).`,
        root_cause:
          "Inconsistent facial reference point or posture variation arrow-to-arrow.",
        actionable_tips: [
          "Confirm solid reference contact at full draw before beginning expansion.",
          "Treat every shot as an isolated event\u2014take a full breath and reset stance between arrows.",
          "Verify bow hand placement remains identical in the grip pivot point.",
        ],
      }
    }
    return null
  }

  private _getPerformanceTierFeedback(percentage: number): Diagnostic {
    if (percentage < 50.0) {
      return {
        code: "TIER_FOUNDATION",
        title: "Foundation Reset Phase (< 50%)",
        type: "Baseline Mechanics & Form Reset",
        severity: "Low",
        observation: `Overall performance at ${percentage.toFixed(1)}% of maximum score.`,
        root_cause: "Developing biomechanical consistency and repeatable setup.",
        actionable_tips: [
          "Focus on solid stance and repeatable facial anchor point over aiming.",
          "Keep bow shoulder set low and relaxed.",
          "Practice blank-bale shooting to build muscle memory without scoring pressure.",
        ],
      }
    } else if (percentage < 70.0) {
      return {
        code: "TIER_EXECUTION",
        title: "Execution Tuning Phase (50% \u2013 70%)",
        type: "Back Tension & Release Refinement",
        severity: "Low",
        observation: `Overall performance at ${percentage.toFixed(1)}% of maximum score.`,
        root_cause: "Form is developing; minor execution variability stealing points.",
        actionable_tips: [
          "Engage rhomboids for dynamic expansion through release.",
          "Focus on smooth, straight-line release along your jaw/neck line.",
          "Relax bow hand fingers to reduce torque.",
        ],
      }
    } else if (percentage < 85.0) {
      return {
        code: "TIER_REFINEMENT",
        title: "Refinement Phase (70% \u2013 85%)",
        type: "Follow-Through & Micro-Consistency",
        severity: "Low",
        observation: `Overall performance at ${percentage.toFixed(1)}% of maximum score.`,
        root_cause: "Strong baseline mechanics with occasional minor flyers.",
        actionable_tips: [
          "Maintain sight picture until arrow strikes target face.",
          "Monitor hold-time rhythm to avoid muscle tremors.",
          "Fine-tune equipment tuning (e.g., brace height, arrow balance).",
        ],
      }
    } else {
      return {
        code: "TIER_HIGH_PERFORMANCE",
        title: "High Performance Phase (85%+)",
        type: "Mental Management & Elite Consistency",
        severity: "Low",
        observation: `Overall performance at ${percentage.toFixed(1)}% of maximum score.`,
        root_cause: "Mechanics are well dialed in.",
        actionable_tips: [
          "Maintain mental shot cycle routine.",
          "Focus on fatigue management and pressure practice.",
          "Keep detailed logs on environmental conditions and bow tuning parameters.",
        ],
      }
    }
  }
}
