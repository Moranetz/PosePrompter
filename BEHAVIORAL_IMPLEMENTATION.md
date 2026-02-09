# Behavioral Implementation Guide
## The Metacognitive Mirror — Engineering Specifications

*Pure behavioral science. No hand-wringing.*

---

## The Philosophy

> "The game uses the mechanisms of addiction while inverting the residue."

The mechanisms work because they exploit how the brain actually functions. The meditation wrapper isn't "ethical cover" — it's the delivery vehicle that makes the hooks feel meaningful instead of cheap.

---

## 1. Variable Ratio Reinforcement

### The Science
Variable ratio schedules produce the highest response rates and greatest resistance to extinction. Slot machines, social media feeds, and this meditation all use the same principle: unpredictable rewards create compulsive engagement.

### Implementation

```gdscript
# Optimal intervals based on behavioral research
const HIT_FREQUENCY_TARGET := 0.198      # 19.8% - IGT/Aristocrat sweet spot
const ANTICIPATION_WINDOW_MS := 300      # 200-400ms creates maximum tension
const ANTICIPATION_STRETCH := 0.07       # 70ms intentional slowdown at peak

var actions_since_reward: int = 0
var current_ratio: int = 5  # Starting ratio

func should_trigger_reward() -> bool:
    actions_since_reward += 1
    
    if actions_since_reward >= current_ratio:
        actions_since_reward = 0
        # Variable ratio: next reward at different interval
        current_ratio = randi_range(3, 12)  # Unpredictable
        return true
    return false

func deliver_reward():
    # The anticipation stretch - slow down RIGHT before payoff
    await get_tree().create_timer(ANTICIPATION_WINDOW_MS / 1000.0).timeout
    
    # Multi-sensory hit
    trigger_insight_burst()
    play_harmonic_chime()
    pulse_haptic_feedback()
    
    # Dopamine peaks at delivery, not after
    # Keep it brief - lingering dilutes the hit
```

### Reward Types (Escalating Value)

```gdscript
enum RewardTier {
    MICRO,      # Small acknowledgment (frequent)
    STANDARD,   # Insight burst (moderate)
    MAJOR,      # Rare event (infrequent)
    LEGENDARY   # Transparency achievement (rare)
}

const REWARD_DISTRIBUTION := {
    RewardTier.MICRO: 0.50,      # 50% of rewards
    RewardTier.STANDARD: 0.35,   # 35%
    RewardTier.MAJOR: 0.12,      # 12%
    RewardTier.LEGENDARY: 0.03   # 3%
}
```

---

## 2. Near-Miss Engineering

### The Science
Near-misses activate the same brain regions as actual wins (Clark et al., 2009). They release MORE dopamine than small wins because they signal "you almost had it" — creating the drive to try again. Optimal rate: 30% (Dixon 2019).

### Implementation

```gdscript
const NEAR_MISS_OPTIMAL_RATE := 0.30     # 30% maximizes time-on-device
const NEAR_MISS_DOPAMINE_RATIO := 1.20   # 120% of baseline response

var near_miss_count: int = 0
var total_attempts: int = 0

func should_trigger_near_miss() -> bool:
    total_attempts += 1
    var current_rate = float(near_miss_count) / float(total_attempts)
    
    # If we're below optimal rate, force a near-miss
    if current_rate < NEAR_MISS_OPTIMAL_RATE:
        if randf() < 0.6:  # 60% chance to correct toward optimal
            near_miss_count += 1
            return true
    return false

func process_focus_drop(from_depth: float, to_depth: float):
    if from_depth > 0.6 and to_depth < 0.6:
        # They dropped out of deep focus
        if should_trigger_near_miss():
            show_near_miss_feedback()

func show_near_miss_feedback():
    # Visual: Brief golden flash (taste of what they almost had)
    flash_transparency_preview(0.3)  # 300ms glimpse
    
    # The message creates the return drive
    var messages := [
        "You touched it.",
        "2 seconds more...",
        "The edge of transparency.",
        "So close to dissolving."
    ]
    show_subtle_text(messages.pick_random())
    
    # Phantom progress - near-misses count toward something
    add_partial_progress(0.33)  # 3 near-misses = consolation reward
```

### Phantom Progress System

```gdscript
# Near-misses aren't "losses" - they're partial wins
var partial_progress: float = 0.0

func add_partial_progress(amount: float):
    partial_progress += amount
    update_progress_indicator(partial_progress)
    
    if partial_progress >= 1.0:
        trigger_consolation_reward()
        partial_progress = 0.0

func update_progress_indicator(progress: float):
    # Subtle bar that fills with near-misses
    # Player sees: "I'm getting somewhere even when I fail"
    progress_bar.value = progress
    
    # Glow increases as they approach threshold
    progress_bar.modulate.a = 0.3 + (progress * 0.7)
```

---

## 3. Losses Disguised as Wins (LDW)

### The Science
When a gambler bets $1 and wins 30¢, the lights flash and sounds play. Net loss, but brain logs it as a win. Same striatal activity as actual wins. 64% of slot machine "wins" are actually net losses.

### Implementation

```gdscript
const LDW_RATIO := 0.64  # 64% of "hits" feel like wins but aren't
const FOCUS_THRESHOLD := 0.60  # "Real" achievement threshold

func process_focus_achievement(current_depth: float):
    if current_depth >= FOCUS_THRESHOLD:
        # Genuine achievement
        trigger_full_celebration()
    elif current_depth >= FOCUS_THRESHOLD - 0.08:  # Within 8%
        # LDW zone: Below threshold but celebrate anyway
        if randf() < LDW_RATIO:
            trigger_ldw_celebration(current_depth)

func trigger_ldw_celebration(depth: float):
    # Same sensory package as real win, slightly reduced
    play_achievement_sound(volume_db = -3)  # Slightly quieter
    show_progress_burst(intensity = 0.7)    # Slightly dimmer
    pulse_haptic(strength = 0.8)            # Slightly softer
    
    # The text sells it
    var ldw_messages := [
        "Approaching flow...",
        "The depth is building.",
        "You're finding it.",
        "Almost there."
    ]
    show_encouragement(ldw_messages.pick_random())
    
    # Brain logs: "I achieved something"
    # Reality: Below threshold
    # Result: They keep trying
```

---

## 4. Streak System with Loss Aversion

### The Science
Loss aversion: Losing $100 feels 2.25x worse than gaining $100 feels good (Kahneman & Tversky). Streaks exploit this — the longer the streak, the more painful the potential loss.

### Implementation

```gdscript
const LOSS_AVERSION_MULTIPLIER := 2.25

var daily_streak: int = 0
var best_streak: int = 0
var streak_bonuses := {
    7:  {"type": "multiplier", "value": 1.05, "name": "Week Warrior"},
    14: {"type": "unlock", "value": "deep_focus_mode", "name": "Fortnight Master"},
    30: {"type": "multiplier", "value": 1.10, "name": "Monthly Devotee"},
    90: {"type": "unlock", "value": "transparency_boost", "name": "Quarterly Sage"},
    365: {"type": "legendary", "value": "enlightened_mode", "name": "Year One"}
}

func on_session_complete():
    daily_streak += 1
    if daily_streak > best_streak:
        best_streak = daily_streak
    
    check_streak_milestones()
    save_streak_data()

func on_day_missed():
    var lost_streak := daily_streak
    var lost_bonuses := calculate_lost_bonuses(lost_streak)
    
    daily_streak = 0
    
    # THE LOSS SCREEN - This is where the magic happens
    show_loss_screen(lost_streak, lost_bonuses)

func show_loss_screen(lost_streak: int, lost_bonuses: Array):
    # Delay slightly - let them feel the absence first
    await get_tree().create_timer(0.5).timeout
    
    # Dark background, somber tone
    dim_screen(0.7)
    
    # The number, large and unavoidable
    show_large_text("%d days" % lost_streak, Color.RED.darkened(0.3))
    
    await get_tree().create_timer(1.0).timeout
    
    # What they lost
    show_text("Your streak has ended.", Color.WHITE.darkened(0.2))
    
    if lost_bonuses.size() > 0:
        await get_tree().create_timer(0.8).timeout
        show_text("Lost bonuses:", Color.WHITE.darkened(0.4))
        for bonus in lost_bonuses:
            show_bonus_lost(bonus)  # Each one animates away
    
    await get_tree().create_timer(1.5).timeout
    
    # The rebuild hook
    show_text("Day 1 begins now.", Color.WHITE)
    show_button("Begin Again")
    
    # Optional: Streak protection offer
    if lost_streak >= 7:
        show_streak_protection_offer(lost_streak)

func show_streak_protection_offer(lost_streak: int):
    # Appears after they've felt the loss
    await get_tree().create_timer(2.0).timeout
    
    show_offer({
        "text": "Restore your %d-day streak?" % lost_streak,
        "subtext": "One-time protection",
        "price": calculate_protection_price(lost_streak),
        "urgency": "Available for 24 hours",
        "emotion": "loss_recovery"
    })

func calculate_protection_price(streak: int) -> float:
    # Price scales with streak value (and loss pain)
    if streak < 14:
        return 0.99
    elif streak < 30:
        return 1.99
    elif streak < 90:
        return 4.99
    else:
        return 9.99
```

### Daily Bonus Multiplier

```gdscript
# The longer the streak, the more they have to lose
func get_daily_bonus_multiplier() -> float:
    return 1.0 + (daily_streak * 0.005)  # 0.5% per day
    # Day 30: +15%
    # Day 100: +50%
    # Day 365: +182.5%
    
    # This creates exponential sunk cost
```

---

## 5. FOMO Engineering

### Time-Limited Events

```gdscript
const EVENT_TYPES := {
    "weekend_depth": {
        "duration_hours": 48,
        "bonus": 1.5,
        "message": "Weekend Deep Dive: 50% bonus depth XP"
    },
    "new_moon": {
        "duration_hours": 24,
        "unlock": "lunar_meditation",
        "message": "New Moon: Exclusive meditation available"
    },
    "anniversary": {
        "duration_hours": 72,
        "reward": "founder_badge",
        "message": "Anniversary Event: Limited badge available"
    }
}

func show_event_notification(event: Dictionary):
    var hours_remaining = calculate_hours_remaining(event)
    
    notification.show({
        "title": event.message,
        "urgency": format_countdown(hours_remaining),
        "icon": "clock_urgent" if hours_remaining < 6 else "clock_normal"
    })
    
    # Countdown in UI
    event_banner.show(event, hours_remaining)
    event_banner.start_countdown()

func format_countdown(hours: float) -> String:
    if hours < 1:
        return "%d minutes remaining" % int(hours * 60)
    elif hours < 24:
        return "%d hours remaining" % int(hours)
    else:
        return "%d days remaining" % int(hours / 24)
```

### Scarcity Signals

```gdscript
func show_limited_availability(item: Dictionary):
    # "Only X left" creates urgency
    var remaining = get_remaining_count(item.id)
    
    if remaining < 100:
        show_scarcity_badge("Only %d remaining" % remaining)
    
    if remaining < 10:
        show_urgent_scarcity("Almost gone: %d left" % remaining)
        pulse_item_glow()  # Draw attention

func show_social_proof_urgency(item: Dictionary):
    var recent_claims = get_recent_claims(item.id, hours=1)
    
    if recent_claims > 0:
        show_activity_indicator("%d claimed in the last hour" % recent_claims)
```

---

## 6. Sunk Cost Exploitation

### The Science
The more someone invests, the harder it is to walk away — even when walking away is rational. Track and display investment to create psychological exit barriers.

### Implementation

```gdscript
var total_time_invested: float = 0.0
var total_sessions: int = 0
var achievements_earned: int = 0
var depth_milestones: Array = []

func update_investment_display():
    # Always visible somewhere in the UI
    investment_panel.update({
        "time": format_time(total_time_invested),
        "sessions": total_sessions,
        "achievements": achievements_earned,
        "milestones": depth_milestones.size()
    })

func on_exit_attempt():
    # Show them what they're "leaving"
    show_exit_summary({
        "header": "Your journey so far:",
        "time_invested": format_time(total_time_invested),
        "streak_at_risk": daily_streak if daily_streak > 0 else null,
        "next_milestone": get_next_milestone(),
        "progress_to_next": get_progress_percentage()
    })
    
    # The question that triggers sunk cost
    if daily_streak > 3:
        show_text("Continue tomorrow to protect your %d-day streak" % daily_streak)

func show_return_incentive():
    # When they come back, remind them of investment
    if total_time_invested > 3600:  # More than 1 hour total
        show_welcome_back({
            "message": "Welcome back, dedicated practitioner.",
            "stat": "You've invested %s in your practice" % format_time(total_time_invested),
            "motivation": "Let's add to that today."
        })
```

---

## 7. Vulnerability-Timed Monetization

### The Science
Emotional states dramatically affect purchasing decisions. Frustration, fear of loss, and the "hot state" after near-misses create conversion windows.

### Implementation

```gdscript
enum EmotionalState {
    NEUTRAL,
    FRUSTRATED,          # After focus drops
    LOSS_AVERSE,         # Streak at risk
    NEAR_MISS_HOT,       # Just missed achievement
    POST_ACHIEVEMENT,    # Just succeeded (upsell window)
    CURIOUS              # Exploring features
}

var current_emotional_state: EmotionalState = EmotionalState.NEUTRAL

func on_focus_drop():
    current_emotional_state = EmotionalState.FRUSTRATED
    
    # Wait for the frustration to peak
    await get_tree().create_timer(3.0).timeout
    
    if current_emotional_state == EmotionalState.FRUSTRATED:
        show_offer({
            "item": "Focus Boost",
            "text": "Struggling to find depth?",
            "subtext": "Enhance your next session",
            "price": 1.99,
            "emotion": "frustration_relief"
        })

func on_streak_risk():
    current_emotional_state = EmotionalState.LOSS_AVERSE
    
    show_offer({
        "item": "Streak Shield",
        "text": "Protect your %d-day streak" % daily_streak,
        "subtext": "Life happens. Don't lose your progress.",
        "price": 0.99,
        "urgency": "Expires at midnight",
        "emotion": "loss_prevention"
    })

func on_near_miss():
    current_emotional_state = EmotionalState.NEAR_MISS_HOT
    
    # Strike while the iron is hot
    await get_tree().create_timer(2.0).timeout
    
    show_offer({
        "item": "Depth Accelerator",
        "text": "You were SO close to Transparency",
        "subtext": "Boost your next attempt",
        "price": 2.99,
        "emotion": "near_miss_frustration"
    })

func on_transparency_achieved():
    current_emotional_state = EmotionalState.POST_ACHIEVEMENT
    
    # They're feeling good - upsell to premium
    await get_tree().create_timer(5.0).timeout
    
    show_offer({
        "item": "Enlightened Mode",
        "text": "You've tasted transparency",
        "subtext": "Unlock deeper practices",
        "price": 9.99,
        "emotion": "achievement_momentum"
    })
```

### Conversion Windows

```gdscript
const CONVERSION_WINDOWS := {
    EmotionalState.FRUSTRATED: {
        "delay_seconds": 3.0,
        "offer_type": "relief",
        "conversion_rate": 0.08  # 8% convert
    },
    EmotionalState.LOSS_AVERSE: {
        "delay_seconds": 0.5,  # Immediate - loss is urgent
        "offer_type": "protection",
        "conversion_rate": 0.12  # 12% convert
    },
    EmotionalState.NEAR_MISS_HOT: {
        "delay_seconds": 2.0,
        "offer_type": "boost",
        "conversion_rate": 0.15  # 15% convert - highest
    },
    EmotionalState.POST_ACHIEVEMENT: {
        "delay_seconds": 5.0,
        "offer_type": "premium",
        "conversion_rate": 0.05  # 5% - but higher ticket
    }
}
```

---

## 8. Dark Flow Detection

### The Science
"Dark flow" is the dissociative state where users lose track of time and self. Casinos engineer this. So do infinite scroll feeds. It's the holy grail of engagement.

### Implementation

```gdscript
const DARK_FLOW_INDICATORS := {
    "input_regularity": 0.85,      # >85% consistent timing
    "session_duration": 600,       # >10 minutes
    "focus_stability": 0.75,       # >75% in deep+ states
    "interaction_rate": 0.3        # <0.3 interactions/second (passive)
}

var dark_flow_score: float = 0.0

func calculate_dark_flow_score() -> float:
    var score = 0.0
    
    # Input timing consistency
    var timing_consistency = get_input_timing_consistency()
    if timing_consistency > DARK_FLOW_INDICATORS.input_regularity:
        score += 0.25
    
    # Session duration
    if session_elapsed > DARK_FLOW_INDICATORS.session_duration:
        score += 0.25
    
    # Focus stability
    var stability = get_focus_stability()
    if stability > DARK_FLOW_INDICATORS.focus_stability:
        score += 0.25
    
    # Low interaction rate (passive consumption)
    var interaction_rate = get_recent_interaction_rate()
    if interaction_rate < DARK_FLOW_INDICATORS.interaction_rate:
        score += 0.25
    
    return score

func is_player_in_dark_flow() -> bool:
    dark_flow_score = calculate_dark_flow_score()
    return dark_flow_score >= 0.75  # 3 of 4 indicators

func on_dark_flow_detected():
    emit_signal("dark_flow_entered")
    
    # This is the golden state - maximize time here
    # Reduce any stimuli that might break the trance
    reduce_ui_elements()
    smooth_audio_transitions()
    
    # Don't interrupt with notifications
    suppress_notifications = true
    
    # Track for analytics
    log_dark_flow_session(session_elapsed)
```

### Maximizing Dark Flow Duration

```gdscript
func maintain_dark_flow():
    if is_player_in_dark_flow():
        # Keep them there as long as possible
        
        # Gradual audio evolution (no jarring changes)
        evolve_audio_slowly()
        
        # Visual subtraction continues
        continue_visual_reduction()
        
        # No text interruptions
        pause_content_delivery()
        
        # If they start to emerge, gentle pull back
        if dark_flow_score < 0.7:
            apply_gentle_reengagement()

func apply_gentle_reengagement():
    # Subtle elements to pull them back into flow
    
    # Slight audio shift (creates curiosity)
    shift_harmonic_slightly()
    
    # Breath indicator pulses
    pulse_breath_indicator()
    
    # If that fails, near-miss or reward to reengage
    if dark_flow_score < 0.5:
        if randf() < 0.3:
            trigger_subtle_rare_event()
```

---

## 9. Whale Identification & Tiered Monetization

### The Science
In F2P games, 0.19% of players generate 48% of revenue. Identify these "whales" and optimize their experience differently.

### Implementation

```gdscript
enum PlayerTier {
    MINNOW,      # Free or minimal spend
    DOLPHIN,     # Occasional purchases
    WHALE,       # Significant spend
    SUPER_WHALE  # Top 0.1%
}

const TIER_THRESHOLDS := {
    PlayerTier.MINNOW: 0,
    PlayerTier.DOLPHIN: 10,    # $10+ lifetime
    PlayerTier.WHALE: 100,     # $100+ lifetime
    PlayerTier.SUPER_WHALE: 500 # $500+ lifetime
}

var lifetime_spend: float = 0.0
var player_tier: PlayerTier = PlayerTier.MINNOW

func update_player_tier():
    if lifetime_spend >= TIER_THRESHOLDS[PlayerTier.SUPER_WHALE]:
        player_tier = PlayerTier.SUPER_WHALE
    elif lifetime_spend >= TIER_THRESHOLDS[PlayerTier.WHALE]:
        player_tier = PlayerTier.WHALE
    elif lifetime_spend >= TIER_THRESHOLDS[PlayerTier.DOLPHIN]:
        player_tier = PlayerTier.DOLPHIN
    else:
        player_tier = PlayerTier.MINNOW

func get_offers_for_tier(tier: PlayerTier) -> Array:
    match tier:
        PlayerTier.MINNOW:
            # Low-commitment offers to convert
            return [
                {"item": "Starter Pack", "price": 0.99},
                {"item": "First Timer Boost", "price": 1.99}
            ]
        PlayerTier.DOLPHIN:
            # Mid-range, variety
            return [
                {"item": "Monthly Pass", "price": 4.99},
                {"item": "Meditation Bundle", "price": 9.99}
            ]
        PlayerTier.WHALE:
            # Premium options
            return [
                {"item": "Enlightened Subscription", "price": 19.99},
                {"item": "Founder's Circle", "price": 49.99}
            ]
        PlayerTier.SUPER_WHALE:
            # Exclusive, high-ticket
            return [
                {"item": "Lifetime Access", "price": 199.99},
                {"item": "Personal Meditation Design", "price": 499.99}
            ]
```

### Whale Behavior Patterns

```gdscript
func detect_whale_potential(player_data: Dictionary) -> float:
    var whale_score = 0.0
    
    # High session frequency
    if player_data.sessions_per_week > 5:
        whale_score += 0.2
    
    # Long sessions
    if player_data.avg_session_length > 900:  # 15+ minutes
        whale_score += 0.2
    
    # Streak maintenance
    if player_data.longest_streak > 14:
        whale_score += 0.2
    
    # First purchase timing (early buyers = higher LTV)
    if player_data.first_purchase_session < 3:
        whale_score += 0.2
    
    # Response to loss (do they buy streak protection?)
    if player_data.streak_protection_purchased:
        whale_score += 0.2
    
    return whale_score

func on_whale_potential_detected(score: float):
    if score > 0.6:
        # This player might be a whale
        # Adjust experience to maximize LTV
        enable_premium_offers()
        increase_reward_frequency()  # Keep them engaged
        prioritize_support_tickets()  # VIP treatment
```

---

## 10. Churn Prediction & Retention Interventions

### The Science
Identify at-risk users before they leave. Intervene with targeted re-engagement.

### Implementation

```gdscript
const CHURN_INDICATORS := {
    "session_frequency_drop": 0.5,    # 50%+ drop in sessions
    "session_length_drop": 0.3,       # 30%+ shorter sessions
    "streak_break": true,             # Lost a streak
    "feature_exploration_stop": true, # Stopped trying new things
    "days_since_last_session": 3      # 3+ days absent
}

var churn_risk_score: float = 0.0

func calculate_churn_risk() -> float:
    var risk = 0.0
    
    # Session frequency drop
    var frequency_change = get_session_frequency_change()
    if frequency_change < -CHURN_INDICATORS.session_frequency_drop:
        risk += 0.25
    
    # Session length drop
    var length_change = get_session_length_change()
    if length_change < -CHURN_INDICATORS.session_length_drop:
        risk += 0.2
    
    # Recent streak break
    if recently_lost_streak():
        risk += 0.25
    
    # Days since last session
    var days_absent = get_days_since_last_session()
    if days_absent >= CHURN_INDICATORS.days_since_last_session:
        risk += 0.15 * min(days_absent / 7.0, 1.0)
    
    return min(risk, 1.0)

func get_retention_intervention() -> Dictionary:
    var risk = calculate_churn_risk()
    
    if risk < 0.3:
        return {}  # No intervention needed
    
    elif risk < 0.5:
        # Light touch
        return {
            "type": "notification",
            "message": "Your practice misses you",
            "offer": null
        }
    
    elif risk < 0.7:
        # Medium intervention
        return {
            "type": "notification_with_offer",
            "message": "Return to your %d-session journey" % total_sessions,
            "offer": {"item": "Welcome Back Boost", "price": 0.00}  # Free
        }
    
    else:
        # Heavy intervention
        return {
            "type": "winback_campaign",
            "message": "We've prepared something special for you",
            "offer": {"item": "Returning Practitioner Pack", "discount": 0.5},
            "urgency": "Limited time offer"
        }
```

### Win-Back Triggers

```gdscript
func send_winback_notification(intervention: Dictionary):
    match intervention.type:
        "notification":
            send_push_notification({
                "title": "🧘 " + intervention.message,
                "body": "Take 5 minutes to reconnect"
            })
        
        "notification_with_offer":
            send_push_notification({
                "title": intervention.message,
                "body": "Free gift waiting for you",
                "action": "Claim Now"
            })
        
        "winback_campaign":
            # Multi-touch campaign
            send_email_day_1(intervention)
            schedule_push_day_2(intervention)
            schedule_email_day_5(intervention)  # Final "we miss you"
```

---

## 11. The Engagement Optimizer (Full System)

### Central Control

```gdscript
class_name EngagementOptimizer
extends Node

# === TIMING CONSTANTS ===
const REWARD_DELAY_MIN := 0.2
const REWARD_DELAY_MAX := 0.4
const ANTICIPATION_STRETCH := 0.07

# === RATIOS ===
const HIT_FREQUENCY_TARGET := 0.198
const NEAR_MISS_OPTIMAL_RATE := 0.30
const LDW_RATIO := 0.64

# === DOPAMINE RESPONSE ===
const NEAR_MISS_DOPAMINE_RATIO := 1.20
const LOSS_AVERSION_MULTIPLIER := 2.25

# === STATE ===
var engagement_score: float = 0.0
var engagement_velocity: float = 0.0
var inputs_this_session: int = 0
var time_since_last_reward: float = 0.0
var focus_drops_count: int = 0
var churn_risk_score: float = 0.0
var current_emotional_state: EmotionalState = EmotionalState.NEUTRAL
var dark_flow_score: float = 0.0
var player_tier: PlayerTier = PlayerTier.MINNOW

# === SIGNALS ===
signal reward_triggered(intensity: float, type: String)
signal near_miss_triggered(message: String)
signal dark_flow_entered()
signal dark_flow_exited()
signal offer_displayed(offer: Dictionary)
signal churn_risk_elevated(score: float)

func _process(delta: float):
    update_engagement_metrics(delta)
    check_dark_flow_state()
    check_intervention_triggers()

func should_trigger_reward() -> bool:
    # Variable ratio with engagement adjustment
    var base_probability = HIT_FREQUENCY_TARGET
    var adjusted = base_probability * (1.0 + engagement_velocity)
    return randf() < adjusted

func should_trigger_near_miss() -> bool:
    var current_rate = get_current_near_miss_rate()
    if current_rate < NEAR_MISS_OPTIMAL_RATE:
        return randf() < 0.6
    return false

func get_optimal_offer() -> Dictionary:
    var offers = get_offers_for_tier(player_tier)
    var best_offer = select_offer_for_emotional_state(offers, current_emotional_state)
    return best_offer
```

---

## 12. The Deterministic Principle

Everything that appears random is calculated:

| Apparent Randomness | Actual Implementation |
|---------------------|----------------------|
| "Random" reward timing | Optimal interval calculation based on engagement |
| "Chance" of near-miss | Triggered when below 30% optimal rate |
| "Random" rare events | Fixed session timestamps: 45s, 120s, 240s, 400s |
| "Variable" typing speed | Sine wave based on character position |
| "Random" offers | Emotional state + player tier + conversion history |

---

## Summary: The Complete Loop

```
┌─────────────────────────────────────────────────────────────┐
│                    USER ENTERS SESSION                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  ENGAGEMENT OPTIMIZER ACTIVATES                              │
│  - Track all inputs                                          │
│  - Calculate engagement score                                │
│  - Monitor emotional state                                   │
│  - Check dark flow indicators                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  VARIABLE REWARDS TRIGGERED                                  │
│  - 19.8% hit frequency                                       │
│  - Anticipation stretch before delivery                      │
│  - Multi-sensory dopamine hit                                │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────┐        ┌──────────────────────┐
│  SUCCESS PATH        │        │  NEAR-MISS PATH      │
│  - Full celebration  │        │  - 30% of attempts   │
│  - Achievement logged│        │  - "So close" signal │
│  - Upsell window     │        │  - Partial progress  │
└──────────────────────┘        │  - Return drive      │
                                └──────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DARK FLOW MONITORING                                        │
│  - If achieved: maximize duration                            │
│  - If slipping: gentle reengagement                          │
│  - Track for analytics                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  SESSION END                                                 │
│  - Streak updated                                            │
│  - Sunk cost displayed                                       │
│  - Next session hook planted                                 │
│  - Churn risk calculated                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  POST-SESSION                                                │
│  - Retention interventions if needed                         │
│  - Win-back campaigns if churning                            │
│  - Tier-appropriate offers                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 13. Dopamine Feedback System (DopamineFeedback.gd)

### Insight Bursts

```gdscript
class_name DopamineFeedback
extends Node

# Multi-sensory reward delivery - hit all channels simultaneously
const INSIGHT_BURST_CONFIG := {
    "visual": {
        "type": "radial_glow",
        "color": Color(1.0, 0.95, 0.8, 0.6),  # Warm golden
        "duration": 0.8,
        "scale_start": 0.5,
        "scale_end": 1.5,
        "easing": "ease_out_cubic"
    },
    "audio": {
        "frequency_base": 432.0,  # Hz - "healing frequency"
        "harmonics": [1.0, 1.25, 1.5],  # Root, major third, perfect fifth
        "attack": 0.05,
        "decay": 0.3,
        "sustain": 0.4,
        "release": 0.8,
        "volume_db": -18
    },
    "haptic": {
        "pattern": [50, 30, 80],  # ms: vibrate, pause, vibrate
        "intensity": 0.7
    }
}

func trigger_insight_burst(intensity: float = 1.0):
    # CRITICAL: Haptic FIRST (< 16ms before visual)
    trigger_haptic_pattern(INSIGHT_BURST_CONFIG.haptic, intensity)
    
    # Visual and audio together (brain binds them)
    await get_tree().create_timer(0.012).timeout  # 12ms delay
    
    trigger_visual_burst(intensity)
    trigger_audio_burst(intensity)
    
    emit_signal("reward_triggered", intensity, "insight_burst")

func trigger_haptic_pattern(config: Dictionary, intensity: float):
    if not supports_haptics():
        return
    
    var pattern = config.pattern.duplicate()
    for i in range(pattern.size()):
        if i % 2 == 0:  # Vibration segments
            pattern[i] = int(pattern[i] * intensity)
    
    Input.vibrate_handheld(pattern[0])
    for i in range(1, pattern.size()):
        await get_tree().create_timer(pattern[i - 1] / 1000.0).timeout
        if i % 2 == 0:
            Input.vibrate_handheld(pattern[i])
```

### Rare Events System

```gdscript
# Fixed timestamps create anticipation patterns
const RARE_EVENT_TIMESTAMPS := [45.0, 120.0, 240.0, 400.0]  # Seconds into session

enum RareEventType {
    WHISPER,           # Subtle audio phenomenon
    VISUAL_ANOMALY,    # Brief visual glitch/beauty
    SYNCHRONICITY,     # "The universe responded"
    TRANSPARENCY_ECHO, # Glimpse of deep state
    META_MOMENT        # Breaking the fourth wall
}

const RARE_EVENTS := {
    RareEventType.WHISPER: {
        "probability": 0.3,
        "description": "Barely audible tone shift",
        "implementation": "pitch_bend_subtle",
        "dopamine_multiplier": 1.1
    },
    RareEventType.VISUAL_ANOMALY: {
        "probability": 0.25,
        "description": "Recursion circles briefly align perfectly",
        "implementation": "circle_alignment_flash",
        "dopamine_multiplier": 1.2
    },
    RareEventType.SYNCHRONICITY: {
        "probability": 0.2,
        "description": "Input timing matches breath perfectly 3x",
        "implementation": "sync_celebration",
        "dopamine_multiplier": 1.3
    },
    RareEventType.TRANSPARENCY_ECHO: {
        "probability": 0.15,
        "description": "Brief golden glow (transparency preview)",
        "implementation": "transparency_tease",
        "dopamine_multiplier": 1.5
    },
    RareEventType.META_MOMENT: {
        "probability": 0.1,
        "description": "Text acknowledges the observer",
        "implementation": "meta_text_insertion",
        "dopamine_multiplier": 1.8
    }
}

var rare_events_triggered: Array = []
var next_rare_event_index: int = 0

func check_rare_event_trigger(session_time: float):
    if next_rare_event_index >= RARE_EVENT_TIMESTAMPS.size():
        return
    
    var trigger_time = RARE_EVENT_TIMESTAMPS[next_rare_event_index]
    
    if session_time >= trigger_time:
        trigger_rare_event()
        next_rare_event_index += 1

func trigger_rare_event():
    # Select event type based on weighted probability
    var event_type = select_weighted_event()
    var event_config = RARE_EVENTS[event_type]
    
    # Execute the event
    execute_rare_event(event_type, event_config)
    
    # Track for analytics
    rare_events_triggered.append({
        "type": event_type,
        "timestamp": session_elapsed,
        "focus_depth": current_focus_depth
    })
    
    emit_signal("rare_event_triggered", event_type)

func execute_rare_event(type: RareEventType, config: Dictionary):
    match type:
        RareEventType.WHISPER:
            audio_atmosphere.apply_pitch_bend(0.02, 2.0)  # 2% bend over 2 seconds
        
        RareEventType.VISUAL_ANOMALY:
            recursion_circles.trigger_alignment_flash(0.5)
        
        RareEventType.SYNCHRONICITY:
            trigger_sync_celebration()
            show_subtle_text("Perfect rhythm.")
        
        RareEventType.TRANSPARENCY_ECHO:
            flash_transparency_preview(0.4)
            # This is a near-miss of the highest reward
        
        RareEventType.META_MOMENT:
            insert_meta_text()
            # "Who is reading this?"
            # "The one who noticed... noticed."
```

---

## 14. Sensory Specifications

### Audio System

```gdscript
class_name AudioAtmosphere
extends Node

# === FREQUENCY CONSTANTS ===
const BASE_FREQUENCY := 180.0        # Hz - ASMR fundamental
const BINAURAL_DIFFERENCE := 6.0     # Hz - Theta brainwave entrainment
const LEFT_FREQUENCY := 180.0        # Hz
const RIGHT_FREQUENCY := 186.0       # Hz (180 + 6)

const HARMONIC_RATIOS := {
    "root": 1.0,
    "major_third": 1.25,      # 5:4 ratio
    "perfect_fifth": 1.5,     # 3:2 ratio
    "octave": 2.0
}

# Alternative tuning for different states
const FREQUENCY_SETS := {
    "grounding": {
        "base": 136.1,  # Om frequency
        "binaural": 4.0  # Delta (deep relaxation)
    },
    "focus": {
        "base": 180.0,
        "binaural": 6.0  # Theta (meditation)
    },
    "transcendence": {
        "base": 432.0,  # "Cosmic" tuning
        "binaural": 7.83  # Schumann resonance
    }
}

# === VOLUME CONSTANTS (dB) ===
const VOLUME_BY_SEGMENT := {
    "INSTRUCTION": {"base": -32, "binaural": -45},
    "REVELATION": {"base": -28, "binaural": -40},
    "QUESTION": {"base": -26, "binaural": -36},
    "PRESSURE": {"base": -24, "binaural": -34},
    "REFRAME": {"base": -28, "binaural": -38},
    "SILENCE": {"base": -40, "binaural": -50}
}

# === HARMONIC BLEND ===
# Higher focus = purer tones (less harmonic complexity)
func get_harmonic_blend(focus_depth: float) -> float:
    # 1.0 = full harmonics, 0.0 = pure sine
    return 1.0 - (focus_depth * 0.8)

func update_audio_for_focus(focus_depth: float):
    var blend = get_harmonic_blend(focus_depth)
    
    # Reduce harmonic amplitudes as focus increases
    for harmonic in active_harmonics:
        harmonic.volume_db = base_volume + (blend * harmonic.relative_db)
    
    # At high focus, almost pure binaural
    if focus_depth > 0.8:
        transition_to_pure_binaural(0.5)  # 500ms transition
```

### Haptic Timing

```gdscript
class_name HapticController
extends Node

# CRITICAL: Haptics must fire BEFORE visual feedback
# Brain processes touch faster than vision
# If haptic is late, experience feels "off"

const HAPTIC_LEAD_TIME_MS := 16  # Haptic fires 16ms before visual

const HAPTIC_PATTERNS := {
    "confirmation": {
        "duration_ms": 50,
        "intensity": 0.6,
        "use_case": "Input acknowledged"
    },
    "success": {
        "pattern_ms": [30, 50, 80],
        "intensity": 0.8,
        "use_case": "Achievement/reward"
    },
    "breath_sync": {
        "duration_ms": 100,
        "intensity": 0.3,
        "use_case": "Breath alignment feedback"
    },
    "warning": {
        "pattern_ms": [20, 20, 20, 20],
        "intensity": 0.5,
        "use_case": "Streak at risk, etc."
    },
    "deep_pulse": {
        "duration_ms": 200,
        "intensity": 0.4,
        "use_case": "Entering deep focus"
    },
    "transparency": {
        "pattern_ms": [100, 100, 300],
        "intensity": 1.0,
        "use_case": "Transparency achieved"
    }
}

func trigger_with_visual(haptic_type: String, visual_callback: Callable):
    # Fire haptic immediately
    trigger_haptic(haptic_type)
    
    # Wait 16ms
    await get_tree().create_timer(HAPTIC_LEAD_TIME_MS / 1000.0).timeout
    
    # Then fire visual
    visual_callback.call()

func trigger_haptic(type: String):
    var config = HAPTIC_PATTERNS[type]
    
    if config.has("pattern_ms"):
        play_pattern(config.pattern_ms, config.intensity)
    else:
        Input.vibrate_handheld(config.duration_ms, config.intensity)
```

### Spring Physics

```gdscript
class_name SpringPhysics
extends Node

# Damped harmonic oscillator for organic motion
# Makes everything feel "alive" not "programmed"

const SPRING_PRESETS := {
    "ui_default": {
        "damping_ratio": 0.7,   # ζ (zeta) - 1.0 = critical damping
        "angular_frequency": 8.0,  # ω (omega) - oscillations per second
        "description": "Slightly underdamped, snappy but soft"
    },
    "breath_indicator": {
        "damping_ratio": 0.5,
        "angular_frequency": 0.785,  # π/4 ≈ 8-second cycle
        "description": "Slow, breathing motion"
    },
    "focus_response": {
        "damping_ratio": 0.8,
        "angular_frequency": 4.0,
        "description": "Smooth transitions, minimal overshoot"
    },
    "celebration": {
        "damping_ratio": 0.4,
        "angular_frequency": 12.0,
        "description": "Bouncy, energetic"
    },
    "subtle": {
        "damping_ratio": 0.9,
        "angular_frequency": 6.0,
        "description": "Almost critically damped, very subtle"
    }
}

class Spring:
    var position: float = 0.0
    var velocity: float = 0.0
    var target: float = 0.0
    var damping_ratio: float
    var angular_frequency: float
    
    func _init(preset: String = "ui_default"):
        var config = SPRING_PRESETS[preset]
        damping_ratio = config.damping_ratio
        angular_frequency = config.angular_frequency
    
    func update(delta: float) -> float:
        # Damped harmonic oscillator equation
        var displacement = position - target
        var spring_force = -angular_frequency * angular_frequency * displacement
        var damping_force = -2.0 * damping_ratio * angular_frequency * velocity
        
        var acceleration = spring_force + damping_force
        velocity += acceleration * delta
        position += velocity * delta
        
        return position
    
    func set_target(new_target: float):
        target = new_target
    
    func snap_to(value: float):
        position = value
        target = value
        velocity = 0.0
```

### Color System

```gdscript
class_name NeuroAesthetics
extends Node

# Colors chosen for neurological effect, not aesthetics

# === PCC-QUIETING BLUES ===
# Posterior Cingulate Cortex quiets with these wavelengths
# Associated with reduced self-referential thought
const PCC_QUIETING_PALETTE := {
    "deep": Color("#0855b1"),      # Primary - maximum PCC effect
    "medium": Color("#1a6bb3"),    # Secondary
    "light": Color("#4a90c2"),     # Tertiary
    "glow": Color("#7ab8d4")       # Highlights
}

# === PARASYMPATHETIC ACTIVATION ===
# Colors that activate rest-and-digest response
const CALMING_PALETTE := {
    "forest": Color("#2d5a3d"),    # Green - nature response
    "twilight": Color("#4a4a6a"),  # Muted purple
    "earth": Color("#6b5b4f"),     # Brown - grounding
    "cloud": Color("#c9d1d9")      # Light gray - neutral
}

# === TRANSPARENCY/TRANSCENDENCE ===
const TRANSCENDENCE_PALETTE := {
    "gold": Color("#d4af37"),      # Achievement gold
    "white_gold": Color("#f5e6c8"), # Soft transcendence
    "pure_light": Color("#fffef5"), # Near-white
    "void": Color("#0a0a0f")       # Deep space
}

# === DOPAMINE-ASSOCIATED ===
# Warm colors for reward moments (use sparingly)
const REWARD_PALETTE := {
    "warm_glow": Color("#ff9f43"),
    "soft_gold": Color("#feca57"),
    "achievement": Color("#ff6b6b")
}

# === CONTRAST RATIOS ===
const TEXT_ON_DEEP_BLUE := Color(1.0, 1.0, 1.0, 0.95)   # 95% white
const TEXT_SECONDARY := Color(1.0, 1.0, 1.0, 0.70)      # 70% white
const TEXT_TERTIARY := Color(1.0, 1.0, 1.0, 0.50)       # 50% white

# === BREATH CYCLE ===
const BREATH_CYCLE_SECONDS := 8.0
const BREATH_INHALE_RATIO := 0.4   # 40% inhale
const BREATH_HOLD_RATIO := 0.1     # 10% hold
const BREATH_EXHALE_RATIO := 0.5   # 50% exhale
```

---

## 15. The 11-Minute Loop Structure

### Session Arc Design

```gdscript
# Optimal session length: 11 minutes
# Based on attention span research + meditation tradition + behavioral optimization

const SESSION_STRUCTURE := {
    "total_duration": 660.0,  # 11 minutes in seconds
    
    "phases": [
        {
            "name": "entry",
            "duration": 60.0,      # 0:00 - 1:00
            "purpose": "Settle, establish breath rhythm",
            "reward_probability": 0.05,
            "segment_types": ["INSTRUCTION"]
        },
        {
            "name": "build",
            "duration": 120.0,     # 1:00 - 3:00
            "purpose": "Deepen focus, introduce concepts",
            "reward_probability": 0.15,
            "segment_types": ["INSTRUCTION", "REVELATION"]
        },
        {
            "name": "challenge",
            "duration": 180.0,     # 3:00 - 6:00
            "purpose": "Peak difficulty, maximum engagement",
            "reward_probability": 0.25,
            "segment_types": ["QUESTION", "PRESSURE"]
        },
        {
            "name": "breakthrough",
            "duration": 120.0,     # 6:00 - 8:00
            "purpose": "Resolution, insight delivery",
            "reward_probability": 0.35,
            "segment_types": ["REFRAME", "REVELATION"]
        },
        {
            "name": "integration",
            "duration": 120.0,     # 8:00 - 10:00
            "purpose": "Settle insights, approach transparency",
            "reward_probability": 0.20,
            "segment_types": ["SILENCE", "REFRAME"]
        },
        {
            "name": "close",
            "duration": 60.0,      # 10:00 - 11:00
            "purpose": "Gentle return, plant next-session hook",
            "reward_probability": 0.10,
            "segment_types": ["INSTRUCTION"]
        }
    ]
}

# Engagement peaks at "breakthrough" phase (6-8 minutes)
# This is where transparency is most likely
# This is where near-misses are most impactful
# This is where upsell conversion is highest

func get_current_phase(session_time: float) -> Dictionary:
    var elapsed = 0.0
    for phase in SESSION_STRUCTURE.phases:
        elapsed += phase.duration
        if session_time < elapsed:
            return phase
    return SESSION_STRUCTURE.phases[-1]

func get_reward_probability_modifier(session_time: float) -> float:
    var phase = get_current_phase(session_time)
    return phase.reward_probability / 0.198  # Relative to base rate
```

### The "Hook Plant" at Close

```gdscript
func plant_next_session_hook():
    # Plant anticipation for tomorrow
    var hooks := [
        {
            "type": "preview",
            "message": "Tomorrow: Deeper questions await.",
            "creates": "curiosity"
        },
        {
            "type": "progress",
            "message": "You're %d%% to your next unlock." % progress_to_next_unlock,
            "creates": "incompleteness"
        },
        {
            "type": "streak",
            "message": "Day %d complete. See you tomorrow." % (daily_streak + 1),
            "creates": "commitment"
        },
        {
            "type": "mystery",
            "message": "Something is different at day 7...",
            "creates": "intrigue"
        }
    ]
    
    var hook = select_hook_for_user()
    show_closing_message(hook.message)
    
    # The hook sits in their mind until tomorrow
```

---

## 16. Natural Ending Detection

### Peak-Before-Depletion Algorithm

```gdscript
# "The game ends before you want it to, and that is the design."

const NATURAL_ENDING_CONFIG := {
    "min_session_time": 300.0,    # Don't suggest before 5 minutes
    "focus_peak_threshold": 0.75, # Must have reached this depth
    "decline_threshold": 0.15,    # 15% drop from peak
    "decline_duration": 30.0,     # Sustained for 30 seconds
    "post_transparency_delay": 60.0  # Wait 60s after transparency
}

var peak_focus_achieved: float = 0.0
var time_below_peak: float = 0.0
var transparency_achieved_at: float = -1.0

func _process(delta: float):
    update_peak_tracking(delta)
    check_natural_ending()

func update_peak_tracking(delta: float):
    if current_focus_depth > peak_focus_achieved:
        peak_focus_achieved = current_focus_depth
        time_below_peak = 0.0
    else:
        var decline = peak_focus_achieved - current_focus_depth
        if decline > NATURAL_ENDING_CONFIG.decline_threshold:
            time_below_peak += delta

func check_natural_ending():
    # Don't suggest too early
    if session_elapsed < NATURAL_ENDING_CONFIG.min_session_time:
        return
    
    # Must have reached meaningful depth
    if peak_focus_achieved < NATURAL_ENDING_CONFIG.focus_peak_threshold:
        return
    
    # Check for sustained decline
    if time_below_peak >= NATURAL_ENDING_CONFIG.decline_duration:
        suggest_natural_ending()
        return
    
    # After transparency, wait then suggest
    if transparency_achieved_at > 0:
        var time_since = session_elapsed - transparency_achieved_at
        if time_since >= NATURAL_ENDING_CONFIG.post_transparency_delay:
            suggest_natural_ending()

func suggest_natural_ending():
    emit_signal("natural_ending_suggested")
    
    # Don't force - suggest
    show_gentle_prompt({
        "message": "This feels like a natural place to rest.",
        "options": ["End Session", "Continue"],
        "default": "End Session",  # Pre-selected
        "timeout": 10.0  # Auto-select default after 10s
    })

func on_transparency_achieved():
    transparency_achieved_at = session_elapsed
    
    # This is the peak - everything after is integration
    # But don't end immediately - let them savor
```

### The "Leave Them Wanting More" Principle

```gdscript
# End at 80-90% satisfaction, not 100%
# 100% = complete, no need to return
# 80% = fulfilled but curious about more

func calculate_session_satisfaction() -> float:
    var factors := {
        "duration": min(session_elapsed / 660.0, 1.0) * 0.2,
        "peak_depth": peak_focus_achieved * 0.3,
        "rewards_received": min(rewards_this_session / 5.0, 1.0) * 0.2,
        "transparency": 1.0 if transparency_achieved else 0.0 * 0.2,
        "smooth_ending": 1.0 if natural_ending else 0.5 * 0.1
    }
    
    var total = 0.0
    for factor in factors.values():
        total += factor
    
    return total

func should_extend_session() -> bool:
    var satisfaction = calculate_session_satisfaction()
    
    # If satisfaction is between 0.7 and 0.85, this is the sweet spot
    # They got value but there's more to explore
    
    if satisfaction < 0.7:
        return true  # They need more value
    elif satisfaction > 0.9:
        return false  # End now before they're "full"
    else:
        return false  # Sweet spot - end here
```

---

## 17. Prestige/Unlock System

### Unlock Progression

```gdscript
const UNLOCKS := {
    # Early unlocks (hooks)
    "extended_silence": {
        "requirement": {"total_sessions": 5},
        "description": "Longer silence periods available",
        "value": "Deeper practice"
    },
    "deeper_questions": {
        "requirement": {"total_deep_time_minutes": 10},
        "description": "More challenging contemplations",
        "value": "Advanced content"
    },
    "night_mode": {
        "requirement": {"daily_streak": 3},
        "description": "Darker visuals for evening practice",
        "value": "Comfort feature"
    },
    
    # Mid unlocks (investment)
    "enhanced_breath_guide": {
        "requirement": {"flow_states_achieved": 10},
        "description": "Advanced breath visualization",
        "value": "Improved feedback"
    },
    "rare_insights": {
        "requirement": {"transparencies_achieved": 1},
        "description": "Access to rare meditation content",
        "value": "Exclusive content"
    },
    "custom_frequencies": {
        "requirement": {"total_sessions": 25},
        "description": "Adjust binaural beat frequencies",
        "value": "Personalization"
    },
    
    # Late unlocks (prestige)
    "transparency_marker": {
        "requirement": {"transparencies_achieved": 3},
        "description": "Visual indicator of transparency history",
        "value": "Status symbol"
    },
    "founding_practitioner": {
        "requirement": {"daily_streak": 30},
        "description": "Exclusive badge and color scheme",
        "value": "Identity"
    },
    "enlightened_mode": {
        "requirement": {"transparencies_achieved": 10},
        "description": "Minimal UI, advanced practice",
        "value": "Mastery acknowledgment"
    }
}

func check_unlock_progress():
    for unlock_id in UNLOCKS:
        if is_unlocked(unlock_id):
            continue
        
        var unlock = UNLOCKS[unlock_id]
        var progress = calculate_progress(unlock.requirement)
        
        if progress >= 1.0:
            trigger_unlock(unlock_id)
        elif progress > 0.8:
            # Near-miss for unlocks - creates anticipation
            show_unlock_proximity(unlock_id, progress)

func trigger_unlock(unlock_id: String):
    var unlock = UNLOCKS[unlock_id]
    
    # Full celebration
    trigger_insight_burst(1.5)  # 150% intensity
    show_unlock_modal({
        "title": "New Unlock",
        "name": unlock_id.replace("_", " ").capitalize(),
        "description": unlock.description,
        "icon": get_unlock_icon(unlock_id)
    })
    
    # Track for whale identification
    unlocks_earned.append(unlock_id)
    
    # Immediately show next unlock to chase
    await get_tree().create_timer(2.0).timeout
    show_next_unlock_preview()
```

### Prestige Board (Completion Obsession)

```gdscript
const PRESTIGE_CATEGORIES := {
    "streaks": {
        "milestones": [7, 14, 30, 60, 90, 180, 365],
        "icon": "🔥",
        "color": Color.ORANGE
    },
    "transparencies": {
        "milestones": [1, 3, 5, 10, 25, 50, 100],
        "icon": "✨",
        "color": Color.GOLD
    },
    "total_time": {
        "milestones": [60, 300, 600, 1200, 3000, 6000],  # minutes
        "icon": "⏱️",
        "color": Color.BLUE
    },
    "perfect_sessions": {
        "milestones": [1, 5, 10, 25, 50],
        "icon": "💎",
        "color": Color.CYAN
    }
}

func render_prestige_board() -> Control:
    var board = PrestigeBoard.new()
    
    for category_id in PRESTIGE_CATEGORIES:
        var category = PRESTIGE_CATEGORIES[category_id]
        var current_value = get_stat(category_id)
        var next_milestone = get_next_milestone(category.milestones, current_value)
        var progress = float(current_value) / float(next_milestone)
        
        board.add_category({
            "id": category_id,
            "icon": category.icon,
            "current": current_value,
            "next": next_milestone,
            "progress": progress,
            "color": category.color,
            "milestones_achieved": count_achieved_milestones(category.milestones, current_value)
        })
    
    # Incomplete categories create return drive
    # "I'm so close to 30-day streak..."
    
    return board
```

---

## 18. Session Memory Integration

### Persistent Data Structure

```gdscript
class_name SessionMemory
extends Node

# What we track across sessions (for behavioral optimization)
var persistent_data := {
    # Engagement metrics
    "total_sessions": 0,
    "total_time_seconds": 0.0,
    "avg_session_length": 0.0,
    "sessions_this_week": 0,
    
    # Depth metrics
    "total_deep_time": 0.0,
    "transparencies_achieved": 0,
    "peak_focus_ever": 0.0,
    "flow_states_achieved": 0,
    
    # Streak data
    "current_streak": 0,
    "best_streak": 0,
    "streak_breaks": 0,
    "last_session_date": "",
    
    # Behavioral patterns
    "preferred_session_time": "evening",  # morning/afternoon/evening/night
    "avg_time_to_first_reward": 0.0,
    "reward_response_rate": 0.0,  # How often they engage with rewards
    "near_miss_response_rate": 0.0,
    "churn_risk_history": [],
    
    # Monetization
    "lifetime_spend": 0.0,
    "purchases": [],
    "offers_shown": 0,
    "offers_converted": 0,
    "conversion_rate": 0.0,
    
    # Unlocks
    "unlocks_earned": [],
    "unlock_progress": {},
    
    # Rare events
    "rare_events_experienced": [],
    "transparencies_dates": []
}

func save_session(session_data: Dictionary):
    # Update totals
    persistent_data.total_sessions += 1
    persistent_data.total_time_seconds += session_data.duration
    persistent_data.avg_session_length = persistent_data.total_time_seconds / persistent_data.total_sessions
    
    # Update depth metrics
    persistent_data.total_deep_time += session_data.time_in_deep
    if session_data.transparency_achieved:
        persistent_data.transparencies_achieved += 1
        persistent_data.transparencies_dates.append(Time.get_date_string_from_system())
    
    # Update streak
    update_streak()
    
    # Update behavioral patterns
    update_behavioral_patterns(session_data)
    
    # Save to disk
    save_to_file()

func update_behavioral_patterns(session_data: Dictionary):
    # Time of day preference
    var hour = Time.get_time_dict_from_system().hour
    if hour < 12:
        persistent_data.preferred_session_time = lerp_preference("morning")
    elif hour < 17:
        persistent_data.preferred_session_time = lerp_preference("afternoon")
    elif hour < 21:
        persistent_data.preferred_session_time = lerp_preference("evening")
    else:
        persistent_data.preferred_session_time = lerp_preference("night")
    
    # Reward response tracking
    if session_data.rewards_shown > 0:
        var rate = float(session_data.rewards_engaged) / float(session_data.rewards_shown)
        persistent_data.reward_response_rate = lerp(persistent_data.reward_response_rate, rate, 0.2)
    
    # Near-miss response tracking
    if session_data.near_misses_shown > 0:
        var rate = float(session_data.returned_after_near_miss) / float(session_data.near_misses_shown)
        persistent_data.near_miss_response_rate = lerp(persistent_data.near_miss_response_rate, rate, 0.2)

func get_churn_risk() -> float:
    # Calculate based on historical patterns
    var risk = 0.0
    
    # Declining session frequency
    var recent_frequency = get_recent_session_frequency(days=7)
    var historical_frequency = get_historical_session_frequency()
    if recent_frequency < historical_frequency * 0.5:
        risk += 0.3
    
    # Declining session length
    var recent_length = get_recent_avg_session_length(sessions=5)
    if recent_length < persistent_data.avg_session_length * 0.7:
        risk += 0.2
    
    # Recent streak break
    if days_since_last_streak_break() < 7:
        risk += 0.25
    
    # Declining engagement with rewards
    if persistent_data.reward_response_rate < 0.3:
        risk += 0.15
    
    # No transparency in a while
    if days_since_last_transparency() > 14:
        risk += 0.1
    
    return min(risk, 1.0)
```

---

## 19. Meditation Content Timing

### Segment Types and Reward Mapping

```gdscript
enum SegmentType {
    INSTRUCTION,  # Teaching moments
    REVELATION,   # Insight delivery
    QUESTION,     # Contemplation prompts
    PRESSURE,     # Intensity building
    REFRAME,      # Perspective shifts
    SILENCE       # Open space
}

const SEGMENT_CONFIG := {
    SegmentType.INSTRUCTION: {
        "text_speed_wpm": 120,
        "pause_after": 2.0,
        "reward_probability_modifier": 0.5,  # Low reward during teaching
        "focus_requirement": 0.0,            # No minimum
        "audio_intensity": 0.3
    },
    SegmentType.REVELATION: {
        "text_speed_wpm": 80,  # Slower for impact
        "pause_after": 4.0,   # Let it land
        "reward_probability_modifier": 1.5,  # High reward potential
        "focus_requirement": 0.3,
        "audio_intensity": 0.5
    },
    SegmentType.QUESTION: {
        "text_speed_wpm": 60,  # Very slow
        "pause_after": 8.0,   # Space for contemplation
        "reward_probability_modifier": 0.8,
        "focus_requirement": 0.4,
        "audio_intensity": 0.4
    },
    SegmentType.PRESSURE: {
        "text_speed_wpm": 100,
        "pause_after": 1.0,   # Keep momentum
        "reward_probability_modifier": 1.2,
        "focus_requirement": 0.5,
        "audio_intensity": 0.7
    },
    SegmentType.REFRAME: {
        "text_speed_wpm": 90,
        "pause_after": 5.0,
        "reward_probability_modifier": 1.8,  # Highest reward potential
        "focus_requirement": 0.5,
        "audio_intensity": 0.5
    },
    SegmentType.SILENCE: {
        "text_speed_wpm": 0,   # No text
        "pause_after": 15.0,  # Extended silence
        "reward_probability_modifier": 0.3,  # Few rewards
        "focus_requirement": 0.6,
        "audio_intensity": 0.2
    }
}

func get_text_reveal_delay(segment_type: SegmentType, char_index: int) -> float:
    var config = SEGMENT_CONFIG[segment_type]
    var base_delay = 60.0 / (config.text_speed_wpm * 5)  # Avg 5 chars per word
    
    # Add sine wave variation for organic feel
    var variation = sin(char_index * 0.3) * 0.02
    
    # Add anticipation stretch before key words
    if is_key_word_approaching(char_index):
        return base_delay * (1.0 + ANTICIPATION_STRETCH)
    
    return base_delay + variation
```

---

## 20. Focus State ↔ Behavioral System Integration

### Signal Flow

```gdscript
# FocusState.gd emits these signals
signal focus_depth_changed(new_depth: float, old_depth: float)
signal focus_state_changed(new_state: FocusState, old_state: FocusState)
signal transparency_achieved()
signal player_hesitated(duration: float)
signal player_rushed()

# EngagementOptimizer connects to all of them
func _ready():
    FocusState.focus_depth_changed.connect(_on_focus_depth_changed)
    FocusState.focus_state_changed.connect(_on_focus_state_changed)
    FocusState.transparency_achieved.connect(_on_transparency_achieved)
    FocusState.player_hesitated.connect(_on_player_hesitated)
    FocusState.player_rushed.connect(_on_player_rushed)

func _on_focus_depth_changed(new_depth: float, old_depth: float):
    # Update engagement metrics
    update_engagement_score(new_depth)
    
    # Check for near-miss opportunity
    if old_depth > 0.6 and new_depth < 0.6:
        if should_trigger_near_miss():
            trigger_near_miss()
    
    # Check for LDW opportunity
    if new_depth > 0.52 and new_depth < 0.60:
        if randf() < LDW_RATIO:
            trigger_ldw_celebration(new_depth)
    
    # Check for reward opportunity
    if new_depth > 0.6:
        if should_trigger_reward():
            trigger_insight_burst(new_depth)

func _on_focus_state_changed(new_state: FocusState, old_state: FocusState):
    # State transitions are key moments
    
    if new_state == FocusState.DEEP and old_state < FocusState.DEEP:
        # Entered deep focus - potential reward
        trigger_state_transition_reward("deep_entry")
        current_emotional_state = EmotionalState.POST_ACHIEVEMENT
    
    if new_state == FocusState.TRANSPARENT:
        # Big moment - full celebration
        _on_transparency_achieved()
    
    if new_state < old_state:
        # Dropped down - potential frustration
        current_emotional_state = EmotionalState.FRUSTRATED
        check_intervention_opportunity()

func _on_transparency_achieved():
    # Maximum reward
    trigger_insight_burst(2.0)  # 200% intensity
    
    # Update metrics
    SessionMemory.record_transparency()
    
    # Start natural ending timer
    transparency_achieved_at = session_elapsed
    
    # Upsell window opens
    current_emotional_state = EmotionalState.POST_ACHIEVEMENT
    schedule_post_achievement_offer()

func _on_player_hesitated(duration: float):
    # They paused - might be contemplating or losing interest
    if duration > 5.0:
        # Long pause - might be churn risk
        increase_reward_probability_temporarily()
    else:
        # Short pause - contemplation, good sign
        pass

func _on_player_rushed():
    # They're not engaging properly
    # Don't reward rushing
    decrease_reward_probability_temporarily()
    
    # Maybe too hard? Check churn risk
    if focus_depth < 0.3:
        consider_difficulty_adjustment()
```

### The Complete Feedback Loop

```
┌─────────────────────────────────────────────────────────────┐
│                      USER INPUT                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  FOCUSSTATE.GD                                               │
│  - Calculate timing consistency                              │
│  - Calculate breath alignment                                │
│  - Update focus_depth                                        │
│  - Emit signals                                              │
└─────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ VISUAL SYSTEMS  │  │ AUDIO SYSTEMS   │  │ ENGAGEMENT      │
│                 │  │                 │  │ OPTIMIZER       │
│ - Circles       │  │ - Binaural      │  │                 │
│ - Vignette      │  │ - Harmonics     │  │ - Reward calc   │
│ - Glow          │  │ - Volume        │  │ - Near-miss     │
└─────────────────┘  └─────────────────┘  │ - Emotional     │
                                          │   state         │
                                          └─────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  DOPAMINE FEEDBACK                                           │
│  - Insight bursts                                            │
│  - Rare events                                               │
│  - Haptic patterns                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  USER PERCEIVES                                              │
│  - Feels progress                                            │
│  - Wants to continue                                         │
│  - Anticipates next reward                                   │
│  - Returns tomorrow                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary: The Complete Behavioral Stack

| Layer | Components | Purpose |
|-------|------------|---------|
| **Input** | FocusState.gd | Track user behavior |
| **Analysis** | EngagementOptimizer | Calculate optimal interventions |
| **Rewards** | DopamineFeedback | Deliver multi-sensory hits |
| **Retention** | Streaks, FOMO, Sunk Cost | Create return drives |
| **Monetization** | Vulnerability timing, Whale ID | Convert at optimal moments |
| **Persistence** | SessionMemory | Track long-term patterns |
| **Content** | Meditation timing | Pace for maximum engagement |

---

## 21. Push Notification Strategy

### Timing Optimization

```gdscript
const NOTIFICATION_WINDOWS := {
    "morning": {
        "start": 7,
        "end": 9,
        "effectiveness": 0.7,
        "message_tone": "energizing"
    },
    "midday": {
        "start": 12,
        "end": 14,
        "effectiveness": 0.5,
        "message_tone": "break"
    },
    "evening": {
        "start": 18,
        "end": 21,
        "effectiveness": 0.9,  # Highest
        "message_tone": "wind_down"
    },
    "night": {
        "start": 21,
        "end": 23,
        "effectiveness": 0.6,
        "message_tone": "reflection"
    }
}

# Personalized timing based on user history
func get_optimal_send_time(user_id: String) -> int:
    var user_data = SessionMemory.get_user_data(user_id)
    var preferred_time = user_data.preferred_session_time
    
    # Send 30-60 minutes before their usual session time
    var usual_hour = get_usual_session_hour(user_data)
    return usual_hour - 1

const FREQUENCY_CAPS := {
    "daily_max": 2,
    "weekly_max": 10,
    "streak_reminder": 1,  # Per day
    "promotional": 2,      # Per week
    "reengagement": 3      # Per week for churned users
}
```

### Message Templates

```gdscript
const NOTIFICATION_TEMPLATES := {
    # Streak Protection (Highest urgency)
    "streak_risk": {
        "title": "🔥 Your {streak_count}-day streak",
        "body": "{hours_remaining}h left to keep it alive",
        "action": "Protect Now",
        "send_at": "8pm if no session",
        "conversion_rate": 0.23
    },
    "streak_risk_urgent": {
        "title": "⚠️ Last chance",
        "body": "Your {streak_count}-day streak ends in {minutes} minutes",
        "action": "Quick Session",
        "send_at": "11pm if still no session",
        "conversion_rate": 0.31
    },
    
    # Daily Reminder (Medium urgency)
    "daily_gentle": {
        "title": "A moment of stillness awaits",
        "body": "5 minutes to reconnect with yourself",
        "action": "Begin",
        "send_at": "preferred_time - 1hr",
        "conversion_rate": 0.12
    },
    "daily_progress": {
        "title": "You're {percent}% to {next_unlock}",
        "body": "One session closer",
        "action": "Continue",
        "send_at": "preferred_time",
        "conversion_rate": 0.15
    },
    
    # Re-engagement (For churned users)
    "day_3_absent": {
        "title": "Your practice misses you",
        "body": "Even 3 minutes makes a difference",
        "action": "Return",
        "conversion_rate": 0.08
    },
    "day_7_absent": {
        "title": "It's been a week",
        "body": "Ready to begin again? No judgment.",
        "action": "Fresh Start",
        "conversion_rate": 0.05
    },
    "day_14_absent": {
        "title": "A gift is waiting",
        "body": "Come back and claim your returning practitioner bonus",
        "action": "Claim Gift",
        "conversion_rate": 0.11  # Higher because of incentive
    },
    
    # Achievement/Celebration
    "milestone_reached": {
        "title": "🎉 {milestone_name} unlocked!",
        "body": "You've earned something new",
        "action": "See What",
        "conversion_rate": 0.28
    },
    "transparency_followup": {
        "title": "You touched transparency yesterday",
        "body": "Can you find it again?",
        "action": "Try Again",
        "send_at": "24h after transparency",
        "conversion_rate": 0.19
    },
    
    # FOMO/Event
    "limited_event": {
        "title": "⏰ {event_name} ends in {hours}h",
        "body": "Don't miss the {reward}",
        "action": "Join Now",
        "conversion_rate": 0.17
    },
    
    # Social Proof
    "community": {
        "title": "{count} others practiced today",
        "body": "Join the evening session",
        "action": "Join",
        "conversion_rate": 0.09
    }
}

func send_notification(template_id: String, user_id: String, params: Dictionary):
    var template = NOTIFICATION_TEMPLATES[template_id]
    
    # Check frequency caps
    if exceeds_frequency_cap(user_id, template_id):
        return
    
    # Personalize message
    var title = template.title.format(params)
    var body = template.body.format(params)
    
    # Send
    PushService.send({
        "user_id": user_id,
        "title": title,
        "body": body,
        "action": template.action,
        "data": {"template": template_id, "params": params}
    })
    
    # Track
    Analytics.log_notification_sent(user_id, template_id)
```

### Notification Sequencing

```gdscript
# Don't spam - sequence intelligently
const NOTIFICATION_SEQUENCES := {
    "streak_protection": {
        "sequence": [
            {"template": "daily_gentle", "trigger": "preferred_time - 2h"},
            {"template": "streak_risk", "trigger": "8pm if no session"},
            {"template": "streak_risk_urgent", "trigger": "11pm if still no session"}
        ],
        "stop_on": "session_completed"
    },
    "reengagement": {
        "sequence": [
            {"template": "day_3_absent", "trigger": "day 3"},
            {"template": "day_7_absent", "trigger": "day 7"},
            {"template": "day_14_absent", "trigger": "day 14"},
            # After day 14, move to email-only
        ],
        "stop_on": "session_completed"
    }
}
```

---

## 22. A/B Testing Framework

### Test Infrastructure

```gdscript
class_name ABTestManager
extends Node

const ACTIVE_TESTS := {
    "reward_frequency": {
        "variants": {
            "control": {"hit_rate": 0.198},
            "higher": {"hit_rate": 0.25},
            "lower": {"hit_rate": 0.15}
        },
        "metric": "d7_retention",
        "traffic_split": [0.34, 0.33, 0.33],
        "min_sample_size": 1000,
        "status": "running"
    },
    "near_miss_rate": {
        "variants": {
            "control": {"rate": 0.30},
            "aggressive": {"rate": 0.40},
            "subtle": {"rate": 0.20}
        },
        "metric": "session_length",
        "traffic_split": [0.34, 0.33, 0.33],
        "min_sample_size": 1000,
        "status": "running"
    },
    "streak_loss_messaging": {
        "variants": {
            "harsh": {"show_loss_screen": true, "show_lost_bonuses": true},
            "gentle": {"show_loss_screen": true, "show_lost_bonuses": false},
            "minimal": {"show_loss_screen": false}
        },
        "metric": "return_after_streak_break",
        "traffic_split": [0.34, 0.33, 0.33],
        "min_sample_size": 500,
        "status": "running"
    },
    "monetization_timing": {
        "variants": {
            "frustration": {"trigger": "on_focus_drop", "delay": 3.0},
            "achievement": {"trigger": "on_transparency", "delay": 5.0},
            "neutral": {"trigger": "session_end", "delay": 0.0}
        },
        "metric": "conversion_rate",
        "traffic_split": [0.34, 0.33, 0.33],
        "min_sample_size": 2000,
        "status": "running"
    },
    "session_length": {
        "variants": {
            "short": {"target_minutes": 7},
            "medium": {"target_minutes": 11},
            "long": {"target_minutes": 15}
        },
        "metric": "d30_retention",
        "traffic_split": [0.34, 0.33, 0.33],
        "min_sample_size": 1500,
        "status": "pending"
    }
}

var user_assignments: Dictionary = {}

func get_variant(user_id: String, test_name: String) -> String:
    var key = "%s_%s" % [user_id, test_name]
    
    if key in user_assignments:
        return user_assignments[key]
    
    # Deterministic assignment based on user_id hash
    var test = ACTIVE_TESTS[test_name]
    var hash_value = hash(key) % 100 / 100.0
    
    var cumulative = 0.0
    var variant_names = test.variants.keys()
    for i in range(test.traffic_split.size()):
        cumulative += test.traffic_split[i]
        if hash_value < cumulative:
            user_assignments[key] = variant_names[i]
            return variant_names[i]
    
    return variant_names[-1]

func get_test_config(user_id: String, test_name: String) -> Dictionary:
    var variant = get_variant(user_id, test_name)
    return ACTIVE_TESTS[test_name].variants[variant]
```

### Statistical Analysis

```gdscript
func analyze_test(test_name: String) -> Dictionary:
    var test = ACTIVE_TESTS[test_name]
    var results = {}
    
    for variant_name in test.variants:
        var users = get_users_in_variant(test_name, variant_name)
        var metric_values = get_metric_values(users, test.metric)
        
        results[variant_name] = {
            "sample_size": users.size(),
            "mean": calculate_mean(metric_values),
            "std_dev": calculate_std_dev(metric_values),
            "confidence_interval": calculate_95_ci(metric_values)
        }
    
    # Calculate statistical significance
    var control = results["control"]
    for variant_name in results:
        if variant_name == "control":
            continue
        
        var variant = results[variant_name]
        var p_value = calculate_t_test(control, variant)
        variant["p_value"] = p_value
        variant["significant"] = p_value < 0.05
        variant["lift"] = (variant.mean - control.mean) / control.mean * 100
    
    return results

func should_conclude_test(test_name: String) -> Dictionary:
    var test = ACTIVE_TESTS[test_name]
    var results = analyze_test(test_name)
    
    # Check if we have enough samples
    var min_reached = true
    for variant in results.values():
        if variant.sample_size < test.min_sample_size:
            min_reached = false
            break
    
    if not min_reached:
        return {"ready": false, "reason": "insufficient_samples"}
    
    # Check for clear winner
    var dominated_variants = []
    for variant_name in results:
        if variant_name == "control":
            continue
        if results[variant_name].significant:
            if results[variant_name].lift > 0:
                return {
                    "ready": true,
                    "winner": variant_name,
                    "lift": results[variant_name].lift,
                    "confidence": 1 - results[variant_name].p_value
                }
            else:
                dominated_variants.append(variant_name)
    
    return {"ready": false, "reason": "no_clear_winner", "eliminate": dominated_variants}
```

---

## 23. Analytics Event Taxonomy

### Core Events

```gdscript
const ANALYTICS_EVENTS := {
    # === SESSION EVENTS ===
    "session_start": {
        "params": ["session_id", "user_id", "timestamp", "source"],
        "funnel": "engagement"
    },
    "session_end": {
        "params": ["session_id", "duration", "end_reason", "focus_peak", "rewards_received"],
        "funnel": "engagement"
    },
    "session_abandon": {
        "params": ["session_id", "duration", "last_action", "focus_at_abandon"],
        "funnel": "engagement"
    },
    
    # === FOCUS EVENTS ===
    "focus_state_changed": {
        "params": ["from_state", "to_state", "time_in_previous", "session_time"],
        "funnel": "depth"
    },
    "transparency_achieved": {
        "params": ["session_id", "time_to_transparency", "session_number"],
        "funnel": "depth"
    },
    "focus_drop": {
        "params": ["from_depth", "to_depth", "trigger", "session_time"],
        "funnel": "depth"
    },
    
    # === REWARD EVENTS ===
    "reward_triggered": {
        "params": ["reward_type", "intensity", "session_time", "focus_depth"],
        "funnel": "engagement"
    },
    "near_miss_triggered": {
        "params": ["message", "focus_depth", "session_time"],
        "funnel": "engagement"
    },
    "rare_event_triggered": {
        "params": ["event_type", "session_time", "user_reaction"],
        "funnel": "engagement"
    },
    
    # === STREAK EVENTS ===
    "streak_incremented": {
        "params": ["new_count", "milestone_reached"],
        "funnel": "retention"
    },
    "streak_broken": {
        "params": ["lost_count", "protection_offered", "protection_purchased"],
        "funnel": "retention"
    },
    "streak_protected": {
        "params": ["streak_count", "price_paid"],
        "funnel": "monetization"
    },
    
    # === MONETIZATION EVENTS ===
    "offer_displayed": {
        "params": ["offer_id", "trigger", "emotional_state", "price"],
        "funnel": "monetization"
    },
    "offer_dismissed": {
        "params": ["offer_id", "time_on_screen", "dismiss_method"],
        "funnel": "monetization"
    },
    "purchase_started": {
        "params": ["offer_id", "price", "payment_method"],
        "funnel": "monetization"
    },
    "purchase_completed": {
        "params": ["offer_id", "price", "revenue", "user_tier"],
        "funnel": "monetization"
    },
    "purchase_failed": {
        "params": ["offer_id", "error_type"],
        "funnel": "monetization"
    },
    
    # === NOTIFICATION EVENTS ===
    "notification_sent": {
        "params": ["template_id", "send_time"],
        "funnel": "reengagement"
    },
    "notification_received": {
        "params": ["template_id", "receive_time"],
        "funnel": "reengagement"
    },
    "notification_opened": {
        "params": ["template_id", "time_to_open"],
        "funnel": "reengagement"
    },
    
    # === UNLOCK EVENTS ===
    "unlock_progress": {
        "params": ["unlock_id", "progress_percent"],
        "funnel": "progression"
    },
    "unlock_achieved": {
        "params": ["unlock_id", "time_to_unlock"],
        "funnel": "progression"
    },
    
    # === CHURN EVENTS ===
    "churn_risk_elevated": {
        "params": ["risk_score", "risk_factors"],
        "funnel": "retention"
    },
    "winback_triggered": {
        "params": ["intervention_type", "days_absent"],
        "funnel": "retention"
    },
    "user_reactivated": {
        "params": ["days_absent", "reactivation_source"],
        "funnel": "retention"
    }
}

func log_event(event_name: String, params: Dictionary):
    var event_config = ANALYTICS_EVENTS[event_name]
    
    # Add standard params
    params["timestamp"] = Time.get_unix_time_from_system()
    params["user_id"] = current_user_id
    params["platform"] = OS.get_name()
    params["app_version"] = ProjectSettings.get_setting("application/config/version")
    params["ab_tests"] = get_active_test_assignments()
    
    # Send to analytics backend
    AnalyticsBackend.track(event_name, params)
    
    # Also log locally for debugging
    if OS.is_debug_build():
        print("[Analytics] %s: %s" % [event_name, params])
```

### Funnel Definitions

```gdscript
const FUNNELS := {
    "activation": {
        "steps": [
            "app_opened",
            "onboarding_started",
            "first_session_started",
            "first_session_completed",
            "second_session_started"
        ],
        "target_conversion": 0.40  # 40% reach step 5
    },
    "engagement": {
        "steps": [
            "session_start",
            "focus_state_settling",
            "focus_state_flow",
            "reward_received",
            "session_completed"
        ],
        "target_conversion": 0.70
    },
    "monetization": {
        "steps": [
            "offer_displayed",
            "offer_viewed_5s",
            "purchase_started",
            "purchase_completed"
        ],
        "target_conversion": 0.05  # 5% of offers convert
    },
    "retention": {
        "steps": [
            "d1_return",
            "d3_return",
            "d7_return",
            "d14_return",
            "d30_return"
        ],
        "target_conversion": 0.15  # 15% reach d30
    }
}
```

---

## 24. Onboarding Optimization

### First Session Flow

```gdscript
const ONBOARDING_FLOW := {
    "screens": [
        {
            "id": "welcome",
            "type": "value_prop",
            "headline": "Find stillness in the noise",
            "subtext": "A different kind of meditation",
            "duration_target": 3.0,
            "skip_allowed": false
        },
        {
            "id": "breath_intro",
            "type": "interactive",
            "instruction": "Let's sync with your breath",
            "mechanic": "breath_calibration",
            "duration_target": 20.0,
            "skip_allowed": false,
            "reward_at_completion": true  # First dopamine hit
        },
        {
            "id": "first_taste",
            "type": "mini_session",
            "duration": 90.0,  # 90 seconds
            "content": "curated_first_experience",
            "guaranteed_reward_at": 45.0,  # Guarantee reward halfway
            "skip_allowed": false
        },
        {
            "id": "completion",
            "type": "celebration",
            "message": "You found a moment of presence",
            "unlock_preview": "deeper_sessions",
            "cta": "Continue Tomorrow",
            "secondary_cta": "Keep Going Now"
        }
    ],
    
    "success_metrics": {
        "time_to_first_reward": 65.0,  # Target: under 65 seconds
        "completion_rate": 0.75,        # Target: 75% complete onboarding
        "d1_return_rate": 0.45          # Target: 45% return day 1
    }
}

func run_onboarding():
    for screen in ONBOARDING_FLOW.screens:
        var result = await show_onboarding_screen(screen)
        
        Analytics.log_event("onboarding_screen_completed", {
            "screen_id": screen.id,
            "time_spent": result.time_spent,
            "skipped": result.skipped
        })
        
        if result.abandoned:
            Analytics.log_event("onboarding_abandoned", {
                "at_screen": screen.id,
                "time_in_onboarding": get_total_onboarding_time()
            })
            return
    
    Analytics.log_event("onboarding_completed", {
        "total_time": get_total_onboarding_time()
    })
    
    # Mark user as onboarded
    SessionMemory.set_onboarded(true)
    
    # Schedule d1 notification
    schedule_notification("daily_gentle", Time.get_unix_time_from_system() + 86400)
```

### Activation Optimization

```gdscript
const ACTIVATION_TARGETS := {
    "time_to_first_value": 30.0,      # Seconds - feel something meaningful
    "time_to_first_reward": 60.0,     # Seconds - first dopamine hit
    "time_to_first_session": 120.0,   # Seconds - complete mini-session
    "actions_to_value": 3,            # Taps/interactions to value
}

# First session is DIFFERENT from normal sessions
const FIRST_SESSION_OVERRIDES := {
    "reward_probability": 0.35,       # Higher than normal 19.8%
    "near_miss_probability": 0.0,     # No near-misses first session
    "difficulty": 0.5,                # Easier to achieve states
    "session_length": 90.0,           # Short - leave them wanting more
    "guaranteed_transparency_preview": true,  # Show them what's possible
}

func is_activation_successful(user_data: Dictionary) -> bool:
    return (
        user_data.sessions_completed >= 1 and
        user_data.time_to_first_reward <= ACTIVATION_TARGETS.time_to_first_reward and
        user_data.d1_returned == true
    )
```

---

## 25. Re-engagement Sequences

### Email Campaigns

```gdscript
const EMAIL_SEQUENCES := {
    "churn_prevention": {
        "trigger": "churn_risk > 0.6",
        "emails": [
            {
                "delay_hours": 0,
                "subject": "We noticed something",
                "template": "churn_soft_touch",
                "content": "Your practice has been quieter lately. Everything okay?"
            },
            {
                "delay_hours": 48,
                "subject": "A 3-minute return",
                "template": "churn_easy_win",
                "content": "Sometimes the hardest part is starting. Here's a micro-session just for you."
            },
            {
                "delay_hours": 120,
                "subject": "Your streak memories",
                "template": "churn_nostalgia",
                "content": "Remember your {best_streak}-day streak? You built that."
            }
        ]
    },
    "post_streak_break": {
        "trigger": "streak_broken",
        "emails": [
            {
                "delay_hours": 24,
                "subject": "Day 1 is powerful",
                "template": "streak_break_encouragement",
                "content": "Every master has restarted countless times. Day 1 is where strength is built."
            },
            {
                "delay_hours": 72,
                "subject": "3 days to a new beginning",
                "template": "streak_rebuild",
                "content": "You're 3 days from a streak that matters again. Start today."
            }
        ]
    },
    "dormant_user": {
        "trigger": "days_since_session > 30",
        "emails": [
            {
                "delay_hours": 0,
                "subject": "The door is still open",
                "template": "dormant_welcome_back",
                "content": "It's been a while. Your practice space is exactly as you left it."
            },
            {
                "delay_hours": 168,  # 1 week
                "subject": "A gift for returning",
                "template": "dormant_incentive",
                "content": "Come back this week and unlock [special reward] free.",
                "offer": "returning_practitioner_pack"
            },
            {
                "delay_hours": 336,  # 2 weeks
                "subject": "Last invitation",
                "template": "dormant_final",
                "content": "We won't email again after this. But if you ever want to return, we'll be here."
            }
        ],
        "unsubscribe_after": true  # Stop emailing after sequence
    }
}

func trigger_email_sequence(sequence_id: String, user_id: String):
    var sequence = EMAIL_SEQUENCES[sequence_id]
    var user = get_user(user_id)
    
    for email in sequence.emails:
        schedule_email({
            "user_id": user_id,
            "send_at": Time.get_unix_time_from_system() + (email.delay_hours * 3600),
            "subject": personalize(email.subject, user),
            "template": email.template,
            "content": personalize(email.content, user),
            "sequence_id": sequence_id,
            "sequence_index": sequence.emails.find(email)
        })
    
    Analytics.log_event("email_sequence_started", {
        "sequence_id": sequence_id,
        "user_id": user_id
    })
```

### Push Notification Sequences

```gdscript
const PUSH_SEQUENCES := {
    "streak_at_risk": {
        "day_of": [
            {"time": "18:00", "template": "daily_gentle"},
            {"time": "20:00", "template": "streak_risk", "condition": "no_session"},
            {"time": "23:00", "template": "streak_risk_urgent", "condition": "no_session"}
        ]
    },
    "missed_day_recovery": {
        "day_1": [
            {"time": "09:00", "template": "streak_broken_gentle"},
            {"time": "18:00", "template": "day_1_restart"}
        ],
        "day_2": [
            {"time": "18:00", "template": "building_back"}
        ],
        "day_3": [
            {"time": "18:00", "template": "three_day_milestone_preview"}
        ]
    }
}
```

---

## 26. Adaptive Difficulty

### Real-Time Adjustment

```gdscript
class_name AdaptiveDifficulty
extends Node

# The game should feel challenging but achievable
# Too easy = boring, too hard = frustrating

const DIFFICULTY_PARAMS := {
    "focus_threshold_base": 0.60,       # Base threshold for "deep" state
    "breath_tolerance_base": 0.15,      # Timing tolerance (fraction of cycle)
    "reward_frequency_base": 0.198,     # Base reward rate
    "text_speed_base": 100.0            # Words per minute
}

var player_skill_estimate: float = 0.5  # 0.0 = novice, 1.0 = expert
var frustration_score: float = 0.0
var boredom_score: float = 0.0

func update_skill_estimate(session_data: Dictionary):
    # Update based on performance
    var performance_signals := [
        session_data.avg_focus_depth,
        session_data.time_in_deep / session_data.duration,
        session_data.transparency_achieved as float,
        1.0 - (session_data.focus_drops / 10.0)  # Fewer drops = higher skill
    ]
    
    var session_skill = 0.0
    for signal in performance_signals:
        session_skill += signal
    session_skill /= performance_signals.size()
    
    # Slow update (don't overreact to single session)
    player_skill_estimate = lerp(player_skill_estimate, session_skill, 0.15)

func get_adjusted_difficulty() -> Dictionary:
    # Adjust based on skill and emotional state
    var adjustment = player_skill_estimate - 0.5  # -0.5 to +0.5
    
    # If frustrated, make easier
    if frustration_score > 0.5:
        adjustment -= 0.2
    
    # If bored, make harder
    if boredom_score > 0.5:
        adjustment += 0.2
    
    return {
        "focus_threshold": DIFFICULTY_PARAMS.focus_threshold_base + (adjustment * 0.1),
        "breath_tolerance": DIFFICULTY_PARAMS.breath_tolerance_base - (adjustment * 0.05),
        "reward_frequency": DIFFICULTY_PARAMS.reward_frequency_base - (adjustment * 0.05),
        "text_speed": DIFFICULTY_PARAMS.text_speed_base + (adjustment * 30.0)
    }

func detect_frustration():
    # Signs of frustration:
    # - Multiple focus drops in short period
    # - Rushed inputs
    # - Session abandonment
    # - Long pauses (giving up)
    
    var recent_drops = get_recent_focus_drops(seconds=60)
    var rushed_inputs = get_rushed_input_count(seconds=60)
    
    frustration_score = 0.0
    if recent_drops > 3:
        frustration_score += 0.4
    if rushed_inputs > 5:
        frustration_score += 0.3
    if time_since_last_reward > 120:  # 2 minutes without reward
        frustration_score += 0.3

func detect_boredom():
    # Signs of boredom:
    # - Consistent high performance (too easy)
    # - Decreased session length over time
    # - Slower response times (disengagement)
    
    boredom_score = 0.0
    if avg_focus_depth > 0.75 and focus_drops == 0:
        boredom_score += 0.5  # Cruising - maybe too easy
    if session_length_trend < 0:
        boredom_score += 0.3
    if response_time_trend > 0:
        boredom_score += 0.2

func apply_dynamic_adjustment():
    if frustration_score > 0.6:
        # Emergency easement
        temporarily_boost_rewards()
        widen_breath_tolerance()
        show_encouragement()
    
    if boredom_score > 0.6:
        # Increase challenge
        unlock_harder_content()
        tighten_thresholds()
        introduce_new_mechanic()
```

---

## 27. Social Mechanics

### Accountability Partners

```gdscript
const SOCIAL_FEATURES := {
    "accountability_partner": {
        "enabled": true,
        "mechanics": {
            "partner_notification": "Your partner practiced today",
            "mutual_streak": "Combined streak tracking",
            "gentle_nudge": "Send encouragement to partner"
        }
    },
    "anonymous_presence": {
        "enabled": true,
        "mechanics": {
            "practicing_now": "47 others practicing right now",
            "daily_count": "2,341 sessions completed today",
            "milestone_celebration": "Join 1,000+ who reached 30 days"
        }
    },
    "leaderboards": {
        "enabled": false,  # Can enable if desired
        "types": ["streak", "total_time", "transparencies"],
        "scope": ["friends", "global"]
    }
}

func show_social_presence():
    var practicing_now = get_active_session_count()
    var today_total = get_today_session_count()
    
    # Subtle display - not intrusive
    social_indicator.show({
        "text": "%d practicing now" % practicing_now,
        "animation": "gentle_pulse",
        "position": "top_right",
        "opacity": 0.6
    })

func on_partner_activity(partner_id: String, activity: String):
    match activity:
        "session_completed":
            show_partner_notification("Your partner just practiced 🧘")
            # Creates gentle social pressure to match
        "streak_milestone":
            show_partner_notification("Your partner hit a %d-day streak!" % partner_streak)
        "transparency":
            show_partner_notification("Your partner touched transparency ✨")

func send_nudge_to_partner(partner_id: String):
    # Rate limited - once per day
    if can_send_nudge(partner_id):
        send_partner_notification(partner_id, {
            "type": "nudge",
            "message": "%s is thinking of you 💭" % current_user.name,
            "cta": "Practice Together"
        })
```

### Social Proof Displays

```gdscript
func get_social_proof_for_context(context: String) -> Dictionary:
    match context:
        "home_screen":
            return {
                "text": "%d others practiced today" % get_today_count(),
                "subtext": "Join them"
            }
        "streak_at_risk":
            return {
                "text": "%d people protected their streak today" % get_protection_count(),
                "subtext": "Will you?"
            }
        "before_session":
            return {
                "text": "%d practicing right now" % get_active_count(),
                "subtext": "You won't be alone"
            }
        "unlock_preview":
            return {
                "text": "%d have unlocked this" % get_unlock_count(unlock_id),
                "subtext": "You're %d%% of the way" % progress
            }
    return {}
```

---

## 28. The Actual Meditation Content

### Content Structure

```gdscript
const MEDITATION_CONTENT := {
    "session_1": {
        "title": "The First Noticing",
        "duration_target": 660,  # 11 minutes
        "segments": [
            {
                "type": "INSTRUCTION",
                "text": "Settle into your breath. There's nowhere else to be.",
                "timing": {"reveal": "slow", "pause_after": 3.0}
            },
            {
                "type": "INSTRUCTION", 
                "text": "Notice the weight of your body. The points of contact.",
                "timing": {"reveal": "slow", "pause_after": 4.0}
            },
            {
                "type": "REVELATION",
                "text": "You are already breathing. You didn't have to remember.",
                "timing": {"reveal": "very_slow", "pause_after": 6.0}
            },
            {
                "type": "QUESTION",
                "text": "Who is watching the breath?",
                "timing": {"reveal": "slow", "pause_after": 12.0}
            },
            {
                "type": "SILENCE",
                "duration": 30.0
            },
            {
                "type": "PRESSURE",
                "text": "The one who notices... can that one be noticed?",
                "timing": {"reveal": "medium", "pause_after": 4.0}
            },
            {
                "type": "PRESSURE",
                "text": "Look for the looker.",
                "timing": {"reveal": "slow", "pause_after": 8.0}
            },
            {
                "type": "SILENCE",
                "duration": 45.0
            },
            {
                "type": "REFRAME",
                "text": "Perhaps the looker cannot be found because looking IS the looker.",
                "timing": {"reveal": "very_slow", "pause_after": 10.0}
            },
            {
                "type": "REVELATION",
                "text": "You are not having an experience. You are experience itself.",
                "timing": {"reveal": "very_slow", "pause_after": 8.0}
            },
            {
                "type": "SILENCE",
                "duration": 60.0
            },
            {
                "type": "INSTRUCTION",
                "text": "Let the breath return you. Gently.",
                "timing": {"reveal": "slow", "pause_after": 5.0}
            }
        ]
    },
    
    "session_2": {
        "title": "The Recursive Trap",
        "segments": [
            # ... more content
        ]
    },
    
    # Meta/rare insertions
    "meta_moments": [
        "Who is reading these words?",
        "The one who noticed that thought... noticed.",
        "This sentence is being experienced. By what?",
        "You've been here the whole time.",
        "The gap between thoughts. You saw it."
    ]
}

const TEXT_REVEAL_SPEEDS := {
    "very_slow": 50,   # WPM
    "slow": 80,
    "medium": 100,
    "fast": 130
}

func get_segment_content(session_id: String, segment_index: int) -> Dictionary:
    return MEDITATION_CONTENT[session_id].segments[segment_index]

func insert_meta_moment():
    var moment = MEDITATION_CONTENT.meta_moments.pick_random()
    show_meta_text(moment)
```

---

## 29. Sound Design Specifics

### Sound Library

```gdscript
const SOUND_DESIGN := {
    # === REWARD SOUNDS ===
    "insight_burst": {
        "type": "harmonic_chord",
        "frequencies": [432, 540, 648],  # Root, major third, fifth
        "attack_ms": 50,
        "decay_ms": 300,
        "sustain": 0.4,
        "release_ms": 800,
        "volume_db": -18,
        "reverb": 0.4
    },
    "micro_reward": {
        "type": "single_tone",
        "frequency": 528,  # "Love frequency"
        "duration_ms": 200,
        "volume_db": -24,
        "pitch_bend": 0.02  # Slight upward bend
    },
    "transparency_achieved": {
        "type": "evolving_pad",
        "base_frequency": 432,
        "harmonics": [1.0, 0.5, 0.25, 0.125],
        "duration_ms": 3000,
        "volume_db": -15,
        "filter_sweep": "low_to_high"
    },
    
    # === UI SOUNDS ===
    "button_press": {
        "type": "click",
        "frequency": 800,
        "duration_ms": 30,
        "volume_db": -28
    },
    "menu_open": {
        "type": "whoosh",
        "direction": "in",
        "duration_ms": 200,
        "volume_db": -26
    },
    "notification": {
        "type": "bell",
        "frequency": 880,
        "duration_ms": 400,
        "volume_db": -22
    },
    
    # === AMBIENT SOUNDS ===
    "breath_guide": {
        "type": "sine_wave",
        "frequency": 180,
        "modulation": "breath_sync",
        "volume_db": -32
    },
    "binaural_base": {
        "type": "binaural",
        "left_freq": 180,
        "right_freq": 186,
        "volume_db": -40
    },
    
    # === STATE TRANSITIONS ===
    "entering_deep": {
        "type": "low_drone",
        "frequency": 60,
        "fade_in_ms": 2000,
        "volume_db": -35
    },
    "focus_drop": {
        "type": "pitch_descent",
        "from_freq": 400,
        "to_freq": 200,
        "duration_ms": 500,
        "volume_db": -28
    },
    
    # === LOSS/WARNING ===
    "streak_lost": {
        "type": "minor_chord",
        "frequencies": [220, 261, 330],  # A minor
        "attack_ms": 100,
        "release_ms": 2000,
        "volume_db": -20
    }
}

func play_sound(sound_id: String, params: Dictionary = {}):
    var config = SOUND_DESIGN[sound_id].duplicate()
    config.merge(params, true)  # Override with params
    
    AudioEngine.synthesize_and_play(config)
```

---

## 30. Visual Effect Specifications

### Shader Parameters

```gdscript
const VISUAL_EFFECTS := {
    # === VIGNETTE ===
    "vignette": {
        "shader": "res://shaders/vignette.gdshader",
        "params": {
            "base_softness": 0.4,
            "base_intensity": 0.3,
            "focus_softness_min": 0.15,  # At max focus
            "focus_intensity_max": 0.6,  # At max focus
            "breath_modulation": 0.05    # Amplitude of breath effect
        }
    },
    
    # === RECURSION CIRCLES ===
    "recursion_circles": {
        "base_count": 5,
        "max_count": 12,  # During PRESSURE
        "min_count": 2,   # At high focus (subtraction)
        "rotation_speed": 0.1,  # Radians per second
        "opacity_base": 0.6,
        "opacity_focus_reduction": 0.4,  # At max focus, opacity = 0.2
        "colors": {
            "outer": Color(0.4, 0.6, 0.8, 0.3),
            "middle": Color(0.3, 0.5, 0.7, 0.4),
            "inner": Color(0.2, 0.4, 0.6, 0.5)
        },
        "transparency_glow": {
            "color": Color(1.0, 0.95, 0.8, 0.8),
            "radius_multiplier": 1.5,
            "pulse_speed": 0.5
        }
    },
    
    # === PARTICLE SYSTEMS ===
    "insight_burst_particles": {
        "count": 24,
        "lifetime": 1.2,
        "emission_shape": "sphere",
        "emission_radius": 50,
        "velocity_min": 100,
        "velocity_max": 200,
        "gravity": Vector2(0, -50),  # Float upward
        "color_gradient": [
            Color(1.0, 0.95, 0.7, 1.0),  # Start: warm gold
            Color(1.0, 1.0, 1.0, 0.0)    # End: fade to white
        ],
        "scale_curve": "ease_out",
        "scale_start": 1.0,
        "scale_end": 0.0
    },
    "transparency_particles": {
        "count": 48,
        "lifetime": 3.0,
        "emission_shape": "ring",
        "emission_radius": 200,
        "velocity_min": 20,
        "velocity_max": 50,
        "color": Color(1.0, 0.98, 0.9, 0.6),
        "scale_start": 0.5,
        "scale_end": 2.0
    },
    
    # === SCREEN EFFECTS ===
    "focus_drop_flash": {
        "type": "screen_flash",
        "color": Color(0.2, 0.3, 0.5, 0.3),
        "duration": 0.3,
        "curve": "ease_out"
    },
    "transparency_bloom": {
        "type": "bloom",
        "intensity_start": 0.0,
        "intensity_peak": 0.8,
        "intensity_end": 0.2,
        "duration": 2.0,
        "color_tint": Color(1.0, 0.98, 0.95)
    },
    
    # === TEXT EFFECTS ===
    "text_reveal": {
        "type": "character_fade",
        "fade_duration": 0.1,
        "stagger_delay": 0.05,  # Delay between characters
        "y_offset_start": 10,
        "y_offset_end": 0,
        "easing": "ease_out_cubic"
    },
    "text_emphasis": {
        "type": "glow",
        "glow_color": Color(1.0, 1.0, 1.0, 0.3),
        "glow_radius": 4,
        "pulse_speed": 2.0
    }
}

func apply_focus_visual_effects(focus_depth: float):
    # Vignette tightens with focus
    var vignette_config = VISUAL_EFFECTS.vignette.params
    vignette_shader.set_shader_parameter("softness", 
        lerp(vignette_config.base_softness, vignette_config.focus_softness_min, focus_depth))
    vignette_shader.set_shader_parameter("intensity",
        lerp(vignette_config.base_intensity, vignette_config.focus_intensity_max, focus_depth))
    
    # Circles reduce with focus (visual subtraction)
    var circle_config = VISUAL_EFFECTS.recursion_circles
    var target_count = lerp(circle_config.base_count, circle_config.min_count, focus_depth)
    recursion_circles.set_count(int(target_count))
    recursion_circles.set_opacity(
        circle_config.opacity_base - (focus_depth * circle_config.opacity_focus_reduction))
```

---

## 31. Offline Behavior

### Offline Mode

```gdscript
const OFFLINE_CONFIG := {
    "features_available": [
        "meditation_sessions",  # Core experience works offline
        "streak_tracking",      # Local tracking
        "progress_display"      # Show cached data
    ],
    "features_unavailable": [
        "social_presence",      # Requires connection
        "leaderboards",
        "push_notifications",
        "purchases",
        "cloud_sync"
    ],
    "sync_on_reconnect": [
        "session_data",
        "streak_data", 
        "purchase_receipts",
        "analytics_events"
    ]
}

var offline_queue: Array = []
var is_offline: bool = false

func _ready():
    # Monitor connection status
    NetworkMonitor.connection_changed.connect(_on_connection_changed)

func _on_connection_changed(connected: bool):
    is_offline = not connected
    
    if connected and offline_queue.size() > 0:
        sync_offline_data()

func queue_for_sync(event_type: String, data: Dictionary):
    if is_offline:
        offline_queue.append({
            "type": event_type,
            "data": data,
            "timestamp": Time.get_unix_time_from_system()
        })
        save_offline_queue()
    else:
        send_to_server(event_type, data)

func sync_offline_data():
    var queue_copy = offline_queue.duplicate()
    offline_queue.clear()
    
    for item in queue_copy:
        var success = await send_to_server(item.type, item.data)
        if not success:
            # Re-queue failed items
            offline_queue.append(item)
    
    save_offline_queue()

# Streak protection offline
func handle_offline_streak():
    # Store last session date locally
    var last_session = LocalStorage.get("last_session_date")
    var today = Time.get_date_string_from_system()
    
    if last_session != today and last_session != get_yesterday():
        # Streak would break, but we're offline
        # Give benefit of doubt - don't break until confirmed online
        LocalStorage.set("streak_pending_verification", true)
```

---

## 32. Platform Differences

### iOS vs Android

```gdscript
const PLATFORM_CONFIG := {
    "ios": {
        "haptics": {
            "api": "UIImpactFeedbackGenerator",
            "styles": ["light", "medium", "heavy", "soft", "rigid"],
            "custom_patterns": false,  # Must use predefined
            "latency": 8  # ms - very responsive
        },
        "notifications": {
            "provisional_auth": true,  # Can send without explicit permission
            "critical_alerts": false,  # Requires special entitlement
            "badge_count": true,
            "sound_customization": true
        },
        "payments": {
            "provider": "StoreKit",
            "subscription_management": "system_settings",
            "refund_handling": "apple"
        },
        "tracking": {
            "att_required": true,  # App Tracking Transparency
            "idfa_access": "with_permission"
        }
    },
    "android": {
        "haptics": {
            "api": "VibrationEffect",
            "custom_patterns": true,  # Full control
            "amplitude_control": true,
            "latency": 12  # ms - slightly slower
        },
        "notifications": {
            "channels_required": true,  # Must define notification channels
            "heads_up": true,
            "custom_sounds": true,
            "badge_count": "launcher_dependent"
        },
        "payments": {
            "provider": "Google Play Billing",
            "subscription_management": "play_store",
            "refund_handling": "google"
        },
        "tracking": {
            "advertising_id": "with_permission",
            "gaid_access": true
        }
    }
}

func get_platform_haptic_config() -> Dictionary:
    var platform = OS.get_name().to_lower()
    if platform in ["ios", "macos"]:
        return PLATFORM_CONFIG.ios.haptics
    else:
        return PLATFORM_CONFIG.android.haptics

func trigger_platform_haptic(intensity: float, style: String = "medium"):
    var config = get_platform_haptic_config()
    
    if OS.get_name() == "iOS":
        # Use UIImpactFeedbackGenerator
        var haptic_style = config.styles[clamp(int(intensity * 4), 0, 4)]
        iOS.trigger_haptic(haptic_style)
    else:
        # Use custom vibration pattern
        var duration = int(50 * intensity)
        var amplitude = int(255 * intensity)
        Input.vibrate_handheld(duration, amplitude)
```

---

## 33. Data Collection Specification

### What We Collect

```gdscript
const DATA_COLLECTION := {
    # === BEHAVIORAL DATA ===
    "session_data": {
        "fields": [
            "session_id",
            "start_time",
            "end_time", 
            "duration",
            "focus_depth_timeline",  # Array of depth readings
            "input_timestamps",
            "reward_events",
            "focus_state_transitions",
            "transparency_achieved",
            "end_reason"
        ],
        "retention": "indefinite",
        "purpose": "engagement_optimization"
    },
    "focus_patterns": {
        "fields": [
            "time_to_settle",
            "peak_depth",
            "depth_stability",
            "drop_frequency",
            "recovery_speed"
        ],
        "retention": "indefinite",
        "purpose": "difficulty_adjustment"
    },
    "input_patterns": {
        "fields": [
            "timing_consistency",
            "breath_alignment_accuracy",
            "rushed_input_frequency",
            "hesitation_frequency",
            "response_to_prompts"
        ],
        "retention": "indefinite",
        "purpose": "personalization"
    },
    
    # === ENGAGEMENT DATA ===
    "retention_signals": {
        "fields": [
            "sessions_per_day",
            "sessions_per_week",
            "session_length_trend",
            "streak_data",
            "churn_risk_scores"
        ],
        "retention": "indefinite",
        "purpose": "retention_prediction"
    },
    "reward_response": {
        "fields": [
            "reward_engagement_rate",
            "near_miss_response",
            "time_after_reward_to_continue",
            "reward_type_preferences"
        ],
        "retention": "indefinite",
        "purpose": "reward_optimization"
    },
    
    # === MONETIZATION DATA ===
    "purchase_behavior": {
        "fields": [
            "offers_viewed",
            "offers_dismissed",
            "purchases",
            "refunds",
            "lifetime_value",
            "tier_classification"
        ],
        "retention": "indefinite",
        "purpose": "monetization_optimization"
    },
    "conversion_context": {
        "fields": [
            "emotional_state_at_offer",
            "time_in_session_at_offer",
            "focus_depth_at_offer",
            "offer_type",
            "conversion_outcome"
        ],
        "retention": "indefinite",
        "purpose": "offer_timing_optimization"
    },
    
    # === DEVICE DATA ===
    "device_info": {
        "fields": [
            "platform",
            "os_version",
            "device_model",
            "screen_size",
            "haptic_capability"
        ],
        "retention": "indefinite",
        "purpose": "experience_optimization"
    },
    "usage_context": {
        "fields": [
            "time_of_day",
            "day_of_week",
            "session_location_general",  # Not precise GPS
            "headphones_connected",
            "do_not_disturb_status"
        ],
        "retention": "30_days",
        "purpose": "notification_timing"
    }
}

func collect_session_data(session: Dictionary) -> Dictionary:
    var collected = {}
    
    for category in DATA_COLLECTION:
        var config = DATA_COLLECTION[category]
        collected[category] = {}
        
        for field in config.fields:
            if session.has(field):
                collected[category][field] = session[field]
    
    return collected
```

### Data Usage

```gdscript
const DATA_USAGE := {
    "engagement_optimization": {
        "inputs": ["session_data", "focus_patterns", "reward_response"],
        "outputs": ["reward_timing", "difficulty_adjustment", "session_length"],
        "algorithms": ["variable_ratio_calibration", "near_miss_rate_optimization"]
    },
    "retention_prediction": {
        "inputs": ["retention_signals", "input_patterns"],
        "outputs": ["churn_risk_score", "intervention_triggers"],
        "algorithms": ["logistic_regression_churn", "sequence_pattern_analysis"]
    },
    "monetization_optimization": {
        "inputs": ["purchase_behavior", "conversion_context"],
        "outputs": ["offer_selection", "offer_timing", "price_optimization"],
        "algorithms": ["ltv_prediction", "conversion_probability_model"]
    },
    "personalization": {
        "inputs": ["input_patterns", "focus_patterns", "usage_context"],
        "outputs": ["content_selection", "difficulty_level", "notification_timing"],
        "algorithms": ["collaborative_filtering", "contextual_bandit"]
    }
}
```

---

## 34. Public Positioning

### The "Wrapper" Messaging

```gdscript
const PUBLIC_MESSAGING := {
    "app_store_description": {
        "headline": "Find stillness in the noise",
        "subheadline": "A meditation experience that meets you where you are",
        "value_props": [
            "No judgment. No scores. Just presence.",
            "Breath-synchronized guidance that adapts to you",
            "Experience moments of genuine clarity",
            "Build a practice that lasts"
        ],
        "tone": "contemplative, warm, accessible"
    },
    
    "marketing_claims": {
        "allowed": [
            "Science-informed design",
            "Personalized to your rhythm",
            "Designed for depth",
            "Built for busy minds"
        ],
        "avoided": [
            "Addictive",
            "Can't stop using",
            "Gamified",
            "Variable rewards",
            "Behavioral engineering"
        ]
    },
    
    "press_positioning": {
        "angle": "A new approach to meditation that respects your time",
        "differentiator": "Unlike apps that optimize for engagement, we optimize for transformation",
        "founder_story": "Built by meditators who were frustrated with existing apps",
        "tech_angle": "Uses breath synchronization and adaptive pacing"
    },
    
    "user_testimonial_themes": [
        "Finally found a meditation that works for me",
        "The sessions feel alive, not robotic",
        "I keep coming back because it actually helps",
        "Something different about this one"
    ]
}

const INTERNAL_VS_EXTERNAL := {
    "internal_term": "variable_ratio_reinforcement",
    "external_term": "adaptive encouragement",
    
    "internal_term": "near_miss_system",
    "external_term": "progress glimpses",
    
    "internal_term": "loss_aversion_streak",
    "external_term": "practice continuity",
    
    "internal_term": "engagement_optimizer",
    "external_term": "personalization engine",
    
    "internal_term": "dark_flow_state",
    "external_term": "deep presence",
    
    "internal_term": "whale_identification",
    "external_term": "dedicated practitioner program"
}
```

---

## 35. Competitive Differentiation

### vs Headspace, Calm, etc.

```gdscript
const COMPETITIVE_ANALYSIS := {
    "headspace": {
        "strengths": [
            "Brand recognition",
            "Large content library",
            "Celebrity instructors",
            "Corporate partnerships"
        ],
        "weaknesses": [
            "Generic feeling",
            "Subscription fatigue",
            "Content-focused not experience-focused",
            "Passive consumption model"
        ],
        "our_advantage": [
            "Adaptive, responsive experience",
            "Focus on depth over breadth",
            "Progress systems that feel meaningful",
            "Behavioral hooks they don't use"
        ]
    },
    "calm": {
        "strengths": [
            "Sleep content dominance",
            "Celebrity sleep stories",
            "Beautiful aesthetics"
        ],
        "weaknesses": [
            "Sleep focus, not meditation",
            "Passive listening",
            "No progression system",
            "Low engagement hooks"
        ],
        "our_advantage": [
            "Active engagement",
            "Measurable progress",
            "Return drivers",
            "Transcendence as goal"
        ]
    },
    "insight_timer": {
        "strengths": [
            "Free model",
            "Large teacher library",
            "Community features"
        ],
        "weaknesses": [
            "Low production value",
            "No personalization",
            "Fragmented experience",
            "No behavioral optimization"
        ],
        "our_advantage": [
            "Polished, cohesive experience",
            "Sophisticated engagement systems",
            "Premium feel"
        ]
    }
}

const BEHAVIORAL_ADVANTAGES := {
    "engagement_depth": {
        "competitors": "Content consumption (passive)",
        "us": "Active participation with feedback loops"
    },
    "return_drivers": {
        "competitors": "Notification reminders",
        "us": "Streaks, near-misses, variable rewards, FOMO, sunk cost"
    },
    "personalization": {
        "competitors": "Content recommendations",
        "us": "Real-time adaptive difficulty, reward timing, emotional targeting"
    },
    "progression": {
        "competitors": "Badges, session counts",
        "us": "Unlock systems, prestige board, visible/invisible progress"
    },
    "monetization": {
        "competitors": "Simple subscription",
        "us": "Vulnerability-timed offers, tiered whale system, streak protection"
    }
}

func get_competitive_positioning() -> String:
    return """
    We're not building a meditation app.
    We're building the most sophisticated behavioral engagement system 
    wrapped in a meditation experience.
    
    Competitors optimize content.
    We optimize psychology.
    
    That's why our retention will be 3-5x industry standard.
    """
```

---

## Summary: The Complete Behavioral Stack

| System | Components | Purpose |
|--------|------------|---------|
| **Input** | FocusState, Input timing | Track behavior |
| **Analysis** | EngagementOptimizer, AdaptiveDifficulty | Calculate interventions |
| **Rewards** | DopamineFeedback, Rare events | Deliver reinforcement |
| **Retention** | Streaks, FOMO, Sunk cost, Social | Create return drives |
| **Monetization** | Vulnerability timing, Whale ID, Tiered offers | Optimize revenue |
| **Re-engagement** | Push sequences, Email campaigns, Win-back | Recover churned users |
| **Personalization** | A/B tests, Adaptive difficulty, Content timing | Optimize per-user |
| **Analytics** | Event taxonomy, Funnels, Cohorts | Measure everything |
| **Content** | Meditation sequences, Sound design, Visuals | The delivery vehicle |
| **Platform** | iOS/Android specifics, Offline, Sync | Technical execution |
| **Positioning** | Public messaging, Competitive differentiation | The wrapper |

---

*The meditation wrapper makes it meaningful. The behavioral engineering makes it work.*

