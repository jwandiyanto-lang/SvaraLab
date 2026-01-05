# SvaraLab - Cost Analysis & Pricing Strategy

## 1. Setup Costs (One-Time)

| Item | Cost | Notes |
|------|------|-------|
| **Development** | | |
| App Development (5 sprints) | $0 | Self-developed |
| Apple Developer Account | $99/year | Required for iOS |
| Google Play Developer | $25 (one-time) | Required for Android |
| **Content Creation** | | |
| ElevenLabs Audio Generation | $22 | ~120K characters for all content |
| Content Writing (580 items) | $0 | Self-created or AI-generated |
| **Infrastructure** | | |
| Domain Name | $12/year | svaralab.com |
| Initial API Credits | $20 | Testing budget |
| | | |
| **TOTAL SETUP** | **~$180** | First-time costs |

---

## 2. AI Services Used

### Primary: xAI Grok Voice API
Real-time voice agent that handles everything in one WebSocket connection:
- **Speech-to-Text (STT)** - Transcribes user speech
- **LLM Processing** - Evaluates pronunciation and generates feedback
- **Text-to-Speech (TTS)** - Speaks responses back to user

| Metric | Value |
|--------|-------|
| Cost | **$0.05 per minute** of connection |
| Latency | <1 second (fastest in market) |
| Features | VAD, barge-in, tool calling |

### Secondary: ElevenLabs TTS (Optional)
Pre-generated audio for content that doesn't need real-time interaction.

| Metric | Value |
|--------|-------|
| Cost | $0.18 per 1K characters |
| All content (~120K chars) | **$22 one-time** |

---

## 3. Cost Per Session

### xAI Grok Voice (All Modes)
| Metric | Value |
|--------|-------|
| Average session | 5 minutes |
| Cost per session | **$0.25** |

### Cost by Usage Level
| Usage Level | Sessions/Day | Cost/Day | Cost/Month |
|-------------|--------------|----------|------------|
| Light (1 session) | 1 | $0.25 | **$7.50** |
| Medium (2 sessions) | 2 | $0.50 | **$15.00** |
| Heavy (4 sessions) | 4 | $1.00 | **$30.00** |
| Power (6 sessions) | 6 | $1.50 | **$45.00** |

---

## 4. Pricing Strategy

### Single Plan: Rp 599,000/month

| Channel | Price | Your Revenue | Agent Commission |
|---------|-------|--------------|------------------|
| **Direct Sales** | Rp 599,000/mo | Rp 599,000 | - |
| **Agent Sales** | Rp 599,000/mo | Rp 520,000 | Rp 79,000 |

**USD Equivalent** (1 USD = Rp 16,000):
- Price: **$37.44/month**
- Direct: You get $37.44
- Agent: You get $32.50, agent gets $4.94

### Plan Features (All Access)
- **7-day free trial** (no credit card required)
- Unlimited practice sessions
- All 4 game modes (Speak Fast, Think & Answer, Listen Sharp, Real Talk)
- All 4 difficulty levels (Beginner → Advanced)
- 580+ content items
- AI-powered real-time evaluation
- Progress tracking & statistics
- Multiple accent options (US, UK, Australian)

---

## 5. Revenue per User

### Direct Sales
| Metric | Value (IDR) | Value (USD) |
|--------|-------------|-------------|
| Monthly Revenue | Rp 599,000 | $37.44 |
| Avg User Cost (heavy) | Rp 480,000 | $30.00 |
| **Net Profit** | **Rp 119,000** | **$7.44** |
| **Margin** | **20%** | |

### Light User (More Typical)
| Metric | Value (IDR) | Value (USD) |
|--------|-------------|-------------|
| Monthly Revenue | Rp 599,000 | $37.44 |
| Avg User Cost (light) | Rp 120,000 | $7.50 |
| **Net Profit** | **Rp 479,000** | **$29.94** |
| **Margin** | **80%** | |

### Agent Sales (Light User)
| Metric | Value (IDR) | Value (USD) |
|--------|-------------|-------------|
| Monthly Revenue | Rp 599,000 | $37.44 |
| Agent Commission | Rp 79,000 | $4.94 |
| Your Revenue | Rp 520,000 | $32.50 |
| Avg User Cost | Rp 120,000 | $7.50 |
| **Net Profit** | **Rp 400,000** | **$25.00** |
| **Margin** | **77%** | |

---

## 6. Profit Projections

### Scenario: 500 Paid Users (Month 3)
*Assuming 60% direct, 40% via agents, light usage*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 300 | Rp 179,700,000 | Rp 179,700,000 | Rp 36,000,000 | Rp 143,700,000 |
| Agent | 200 | Rp 119,800,000 | Rp 104,000,000 | Rp 24,000,000 | Rp 80,000,000 |
| | | | | | |
| **TOTAL** | 500 | **Rp 299,500,000** | **Rp 283,700,000** | Rp 60,000,000 | **Rp 223,700,000** |

**Monthly Profit: Rp 223.7 million (~$13,980 USD)**

---

### Scenario: 1,000 Paid Users (Month 6)
*Assuming 50% direct, 50% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 500 | Rp 299,500,000 | Rp 299,500,000 | Rp 60,000,000 | Rp 239,500,000 |
| Agent | 500 | Rp 299,500,000 | Rp 260,000,000 | Rp 60,000,000 | Rp 200,000,000 |
| | | | | | |
| **TOTAL** | 1,000 | **Rp 599,000,000** | **Rp 559,500,000** | Rp 120,000,000 | **Rp 439,500,000** |

**Monthly Profit: Rp 439.5 million (~$27,469 USD)**

---

### Scenario: 5,000 Paid Users (Year 1)
*Assuming 40% direct, 60% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 2,000 | Rp 1,198,000,000 | Rp 1,198,000,000 | Rp 240,000,000 | Rp 958,000,000 |
| Agent | 3,000 | Rp 1,797,000,000 | Rp 1,560,000,000 | Rp 360,000,000 | Rp 1,200,000,000 |
| | | | | | |
| **TOTAL** | 5,000 | **Rp 2,995,000,000** | **Rp 2,758,000,000** | Rp 600,000,000 | **Rp 2,158,000,000** |

**Monthly Profit: Rp 2.16 billion (~$134,875 USD)**

---

### Scenario: 10,000 Paid Users (Year 2)
*Assuming 30% direct, 70% via agents*

| Channel | Users | Revenue (IDR) | Your Take | Costs | Profit |
|---------|-------|---------------|-----------|-------|--------|
| Direct | 3,000 | Rp 1,797,000,000 | Rp 1,797,000,000 | Rp 360,000,000 | Rp 1,437,000,000 |
| Agent | 7,000 | Rp 4,193,000,000 | Rp 3,640,000,000 | Rp 840,000,000 | Rp 2,800,000,000 |
| | | | | | |
| **TOTAL** | 10,000 | **Rp 5,990,000,000** | **Rp 5,437,000,000** | Rp 1,200,000,000 | **Rp 4,237,000,000** |

**Monthly Profit: Rp 4.24 billion (~$264,813 USD)**

---

## 7. Agent Commission Structure

### For Agents
| Metric | Value |
|--------|-------|
| Commission per sale | Rp 79,000/month |
| Recurring (monthly) | Yes, as long as user stays subscribed |
| 10 active users | Rp 790,000/month passive income |
| 50 active users | Rp 3,950,000/month passive income |
| 100 active users | Rp 7,900,000/month passive income |

### Agent Incentive Tiers
| Active Users | Bonus | Total per User |
|--------------|-------|----------------|
| 1-10 users | - | Rp 79,000 |
| 11-25 users | +Rp 10,000 | Rp 89,000 |
| 26-50 users | +Rp 15,000 | Rp 94,000 |
| 50+ users | +Rp 20,000 | Rp 99,000 |

---

## 8. Fixed Monthly Costs

| Item | Cost/Month | Notes |
|------|------------|-------|
| Backend Hosting | $20 | Server + database |
| Domain | $1 | Annual prorated |
| Apple Developer | $8.25 | Annual prorated |
| Error Monitoring | $0 | Free tier (Sentry) |
| Analytics | $0 | Free tier |
| | | |
| **TOTAL FIXED** | **~$30/month** | ~Rp 480,000 |

---

## 9. Competitive Comparison

| App | Monthly Price | AI Features |
|-----|---------------|-------------|
| **SvaraLab** | **Rp 599,000** | Real-time AI speech evaluation, 4 modes |
| Duolingo Plus | Rp 169,000 | No speaking practice |
| ELSA Speak | Rp 299,000 | Speech only, no conversation |
| Cambly | Rp 1,500,000+ | Live human tutors |
| italki | Rp 200,000+ per lesson | Live human tutors |

### Value Proposition
- **vs Duolingo/ELSA**: More comprehensive speaking practice with real-time AI feedback
- **vs Cambly/italki**: Fraction of the cost, unlimited practice, available 24/7

---

## 10. Summary

### Key Numbers
| Metric | IDR | USD |
|--------|-----|-----|
| Setup cost | Rp 2,880,000 | ~$180 |
| Price (all channels) | **Rp 599,000/mo** | $37.44 |
| Agent commission | Rp 79,000/mo | $4.94 |
| Cost per user (light) | Rp 120,000/mo | $7.50 |
| Direct profit margin | 80% (light user) | |
| Agent profit margin | 77% (light user) | |
| Break-even | 1 user | |

### AI Services
| Service | Purpose | Cost |
|---------|---------|------|
| **xAI Grok Voice** | STT + LLM + TTS (all-in-one) | $0.05/min |
| ElevenLabs | Pre-generated audio (optional) | $0.18/1K chars |

### Growth Milestones

| Users | Monthly Revenue | Monthly Profit |
|-------|-----------------|----------------|
| 100 | Rp 60M | Rp 48M (~$3,000) |
| 500 | Rp 300M | Rp 224M (~$14,000) |
| 1,000 | Rp 599M | Rp 440M (~$27,500) |
| 5,000 | Rp 3.0B | Rp 2.2B (~$135,000) |
| 10,000 | Rp 6.0B | Rp 4.2B (~$265,000) |

### Recommendation
Launch with **Rp 599,000/month** with 7-day free trial. Agents get **Rp 79,000 commission** per subscriber.

**Why this pricing works:**
- Rp 599,000 ≈ Rp 20,000/day - premium positioning for serious learners
- 80% profit margin (light users) provides healthy business
- Higher price = higher perceived value = more committed users
- Still cheaper than ANY live tutor option
- Agent commission (Rp 79,000) is very attractive for referrals
