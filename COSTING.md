# SvaraLab - Cost Analysis & Pricing Strategy

## 1. Setup Costs (One-Time)

| Item | Cost | Notes |
|------|------|-------|
| **Development** | | |
| App Development (5 sprints) | $0 | Self-developed |
| Emergent Pro Plan | $20/month | First month for backend |
| Apple Developer Account | $99/year | Required for iOS |
| Google Play Developer | $25 (one-time) | Required for Android |
| **Content Creation** | | |
| ElevenLabs Audio Generation | $22 | ~120K characters for all content |
| Content Writing (320 items) | $0 | Self-created or AI-generated |
| **Infrastructure** | | |
| Domain Name | $12/year | svaralab.com |
| Initial OpenAI Credits | $20 | Testing budget |
| | | |
| **TOTAL SETUP** | **~$200** | First-time costs |

---

## 2. API Costs (Per Use)

### OpenAI Whisper (Speech-to-Text)
| Metric | Value |
|--------|-------|
| Cost | $0.006 per minute |
| Avg recording | 10 seconds = $0.001 |
| Per exercise | ~$0.001 |

### GPT-4o-mini (AI Evaluation)
| Metric | Value |
|--------|-------|
| Input | $0.00015 per 1K tokens |
| Output | $0.0006 per 1K tokens |
| Avg evaluation | ~500 tokens = **$0.0004** |

### ElevenLabs (Text-to-Speech) - Pre-generated
| Metric | Value |
|--------|-------|
| Cost | $0.18 per 1K characters |
| All content (~120K chars) | **$22 one-time** |
| Real-time (if needed) | $0.003 per sentence |

---

## 3. Cost Per Exercise

### Mode 1: Repeat (Cheapest)
| Component | Cost |
|-----------|------|
| Whisper transcription | $0.001 |
| Fuzzy matching (local) | $0.000 |
| **Total per exercise** | **$0.001** |

### Mode 2: Respond (AI Evaluation)
| Component | Cost |
|-----------|------|
| Whisper transcription | $0.001 |
| GPT-4o-mini evaluation | $0.0004 |
| **Total per exercise** | **$0.0014** |

### Mode 3: Listen
| Component | Cost |
|-----------|------|
| Audio playback (pre-generated) | $0.000 |
| Whisper transcription | $0.001 |
| **Total per exercise** | **$0.001** |

### Mode 4: Situation (Most Expensive)
| Component | Cost |
|-----------|------|
| Whisper transcription (30 sec) | $0.003 |
| GPT-4o-mini evaluation | $0.0006 |
| **Total per exercise** | **$0.0036** |

---

## 4. Heavy User Cost (All Day Usage)

### Assumptions for "All Day" User
- Active usage: **4 hours/day**
- Exercises per hour: **30** (2 min per exercise including review)
- Total exercises: **120 per day**

### Daily Cost Breakdown
| Mode | Exercises | Cost Each | Daily Cost |
|------|-----------|-----------|------------|
| Repeat (40%) | 48 | $0.001 | $0.048 |
| Respond (25%) | 30 | $0.0014 | $0.042 |
| Listen (20%) | 24 | $0.001 | $0.024 |
| Situation (15%) | 18 | $0.0036 | $0.065 |
| | | | |
| **TOTAL DAILY** | 120 | | **$0.18** |

### Monthly Heavy User Cost
| Usage Level | Exercises/Day | Cost/Day | Cost/Month |
|-------------|---------------|----------|------------|
| Light (30 min) | 15 | $0.02 | **$0.60** |
| Medium (1 hour) | 30 | $0.05 | **$1.50** |
| Heavy (2 hours) | 60 | $0.09 | **$2.70** |
| Power (4 hours) | 120 | $0.18 | **$5.40** |

---

## 5. Pricing Strategy

### Single Plan with 7-Day Free Trial

| Channel | Price | Your Revenue | Agent Commission |
|---------|-------|--------------|------------------|
| **Direct Sales** | Rp 349,000/mo | Rp 349,000 | - |
| **Agent Sales** | Rp 349,000/mo | Rp 300,000 | Rp 49,000 |

**USD Equivalent** (1 USD = Rp 16,000):
- Price: $21.81/month
- Direct: You get $21.81
- Agent: You get $18.75, agent gets $3.06

### Plan Features (All Access)
- **7-day free trial** (no credit card required)
- Unlimited exercises
- All 4 game modes (Repeat, Respond, Listen, Situation)
- All 4 difficulty levels
- AI-powered evaluation
- Progress tracking
- Offline content (pre-downloaded)

### Free Trial Limits
During 7-day trial:
- Full access to all features
- Usage tracking for conversion analysis
- Push notification reminders before trial ends

---

## 6. Revenue per User

### Direct Sales
| Metric | Value (IDR) | Value (USD) |
|--------|-------------|-------------|
| Monthly Revenue | Rp 349,000 | $21.81 |
| Avg User Cost | Rp 48,000 | $3.00 |
| **Net Profit** | **Rp 301,000** | **$18.81** |
| **Margin** | **86%** | |

### Agent Sales
| Metric | Value (IDR) | Value (USD) |
|--------|-------------|-------------|
| Monthly Revenue | Rp 349,000 | $21.81 |
| Agent Commission | Rp 49,000 | $3.06 |
| Your Revenue | Rp 300,000 | $18.75 |
| Avg User Cost | Rp 48,000 | $3.00 |
| **Net Profit** | **Rp 252,000** | **$15.75** |
| **Margin** | **84%** | |

---

## 7. Profit Projections

### Scenario: 500 Paid Users (Month 3)
*Assuming 60% direct, 40% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 300 | Rp 104,700,000 | Rp 104,700,000 | Rp 14,400,000 | Rp 90,300,000 |
| Agent | 200 | Rp 69,800,000 | Rp 60,000,000 | Rp 9,600,000 | Rp 50,400,000 |
| | | | | | |
| **TOTAL** | 500 | **Rp 174,500,000** | **Rp 164,700,000** | Rp 24,000,000 | **Rp 140,700,000** |

**Monthly Profit: Rp 140.7 million (~$8,794 USD)**

---

### Scenario: 1,000 Paid Users (Month 6)
*Assuming 50% direct, 50% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 500 | Rp 174,500,000 | Rp 174,500,000 | Rp 24,000,000 | Rp 150,500,000 |
| Agent | 500 | Rp 174,500,000 | Rp 150,000,000 | Rp 24,000,000 | Rp 126,000,000 |
| | | | | | |
| **TOTAL** | 1,000 | **Rp 349,000,000** | **Rp 324,500,000** | Rp 48,000,000 | **Rp 276,500,000** |

**Monthly Profit: Rp 276.5 million (~$17,281 USD)**

---

### Scenario: 5,000 Paid Users (Year 1)
*Assuming 40% direct, 60% via agents (mature agent network)*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 2,000 | Rp 698,000,000 | Rp 698,000,000 | Rp 96,000,000 | Rp 602,000,000 |
| Agent | 3,000 | Rp 1,047,000,000 | Rp 900,000,000 | Rp 144,000,000 | Rp 756,000,000 |
| | | | | | |
| **TOTAL** | 5,000 | **Rp 1,745,000,000** | **Rp 1,598,000,000** | Rp 240,000,000 | **Rp 1,358,000,000** |

**Monthly Profit: Rp 1.36 billion (~$84,875 USD)**

---

### Scenario: 10,000 Paid Users (Year 2)
*Assuming 30% direct, 70% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 3,000 | Rp 1,047,000,000 | Rp 1,047,000,000 | Rp 144,000,000 | Rp 903,000,000 |
| Agent | 7,000 | Rp 2,443,000,000 | Rp 2,100,000,000 | Rp 336,000,000 | Rp 1,764,000,000 |
| | | | | | |
| **TOTAL** | 10,000 | **Rp 3,490,000,000** | **Rp 3,147,000,000** | Rp 480,000,000 | **Rp 2,667,000,000** |

**Monthly Profit: Rp 2.67 billion (~$166,688 USD)**

---

## 8. Agent Commission Structure

### For Agents
| Metric | Value |
|--------|-------|
| Commission per sale | Rp 49,000/month |
| Recurring (monthly) | Yes, as long as user stays subscribed |
| 10 active users | Rp 490,000/month passive income |
| 50 active users | Rp 2,450,000/month passive income |
| 100 active users | Rp 4,900,000/month passive income |

### Agent Incentive Tiers
| Active Users | Bonus | Total per User |
|--------------|-------|----------------|
| 1-10 users | - | Rp 49,000 |
| 11-25 users | +Rp 5,000 | Rp 54,000 |
| 26-50 users | +Rp 10,000 | Rp 59,000 |
| 50+ users | +Rp 15,000 | Rp 64,000 |

---

## 9. Fixed Monthly Costs

| Item | Cost/Month | Notes |
|------|------------|-------|
| Emergent Hosting | $20 | Backend + database |
| Domain | $1 | Annual prorated |
| Apple Developer | $8.25 | Annual prorated |
| Error Monitoring | $0 | Free tier (Sentry) |
| Analytics | $0 | Free tier (Mixpanel) |
| | | |
| **TOTAL FIXED** | **~$30/month** | ~Rp 480,000 |

---

## 10. Break-Even Analysis

### Direct Sales Only
| Metric | Value |
|--------|-------|
| Fixed costs | Rp 480,000/month |
| Profit per user | Rp 301,000/month |
| **Break-even** | **2 paid users** |

### Including Free Trial Costs
| Metric | Value |
|--------|-------|
| Assume 30% trial conversion | |
| 100 trial users → 30 paid | |
| Trial user cost | Rp 5,000 (7 days light usage) |
| 100 trials cost | Rp 500,000 |
| 30 paid × Rp 301,000 | Rp 9,030,000 profit |
| **Net after trials** | **Rp 8,530,000** |

---

## 11. Summary

### Key Numbers
| Metric | IDR | USD |
|--------|-----|-----|
| Setup cost | Rp 3,200,000 | ~$200 |
| Cost per user/month | Rp 48,000 | ~$3.00 |
| Price (all channels) | Rp 349,000/mo | $21.81 |
| Agent commission | Rp 49,000/mo | $3.06 |
| Direct profit margin | 86% | |
| Agent profit margin | 84% | |
| Break-even | 2 users | |

### Growth Milestones

| Users | Monthly Revenue | Monthly Profit |
|-------|-----------------|----------------|
| 100 | Rp 35M | Rp 28M (~$1,750) |
| 500 | Rp 175M | Rp 141M (~$8,800) |
| 1,000 | Rp 349M | Rp 277M (~$17,300) |
| 5,000 | Rp 1.75B | Rp 1.36B (~$85,000) |
| 10,000 | Rp 3.49B | Rp 2.67B (~$167,000) |

### Recommendation
Launch with **Rp 349,000/month** for everyone with 7-day free trial. Agents get **Rp 49,000 commission** per subscriber.

**Why this pricing works:**
- Rp 349,000 ≈ Rp 11,600/day - affordable for serious learners
- 86% profit margin (direct) covers growth and unexpected costs
- Agent commission (Rp 49,000) is attractive for referrals
- 7-day trial removes barrier to entry
- Single price simplifies messaging and reduces confusion
