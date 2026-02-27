# AWS Billing Alerts Setup Guide

## 🎯 Purpose

Set up billing alerts to get notified before AWS charges exceed your budget. This prevents unexpected costs!

---

## 📊 Recommended Budget: $10/month

For this project (MVP phase), $10/month is a safe budget that covers:
- Free tier services (most usage will be free)
- Small overages if you exceed free tier limits
- Safety buffer for testing

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Enable Billing Alerts

1. **Go to:** https://console.aws.amazon.com/billing/home#/preferences

2. **Scroll down** to "Alert preferences"

3. **Check these boxes:**
   - ✅ "Receive AWS Free Tier alerts"
   - ✅ "Receive Billing Alerts"

4. **Enter your email** (if not already there)

5. **Click:** "Save preferences"

---

### Step 2: Create a Budget

1. **Go to:** https://console.aws.amazon.com/billing/home#/budgets/create

2. **Select:** "Use a template (simplified)"

3. **Choose:** "Zero spend budget" (for free tier monitoring)
   - This alerts you if you spend ANY money

4. **OR Choose:** "Monthly cost budget" (for $10 limit)
   - Budget name: `CodeLearn-Monthly-Budget`
   - Budgeted amount: `$10`
   - Email recipients: Your email

5. **Click:** "Create budget"

---

## 💰 Budget Options Explained

### Option 1: Zero Spend Budget (Strictest)
- **Alert:** Any spending at all
- **Best for:** Staying 100% in free tier
- **Downside:** You'll get alerts even for $0.01

### Option 2: Monthly Cost Budget - $10 (Recommended)
- **Alert:** When costs reach $8 (80% of $10)
- **Best for:** Development with small buffer
- **Allows:** Minor overages without panic

### Option 3: Monthly Cost Budget - $5
- **Alert:** When costs reach $4 (80% of $5)
- **Best for:** Very tight budget
- **Risk:** May alert frequently during testing

---

## 📧 Alert Thresholds (For $10 Budget)

Set up multiple alerts at different thresholds:

1. **Go to:** https://console.aws.amazon.com/billing/home#/budgets/create

2. **Select:** "Customize (advanced)"

3. **Budget setup:**
   - Budget name: `CodeLearn-Monthly-Budget`
   - Period: Monthly
   - Budget amount: `$10`

4. **Alert thresholds:**
   - Alert 1: 50% ($5) - Warning
   - Alert 2: 80% ($8) - Urgent
   - Alert 3: 100% ($10) - Critical

5. **Email recipients:** Your email

6. **Click:** "Create budget"

---

## 🔔 What Happens When Alert Triggers

You'll receive an email like:

```
Subject: AWS Budgets: CodeLearn-Monthly-Budget has exceeded your alert threshold

Your budget CodeLearn-Monthly-Budget has exceeded 80% of your $10.00 budget.

Current spend: $8.50
Forecasted spend: $11.20
```

**What to do:**
1. Check AWS Cost Explorer to see what's costing money
2. Stop/delete expensive resources
3. Review the cost optimization tips below

---

## 💡 Cost Monitoring Tips

### Check Current Costs

1. **Go to:** https://console.aws.amazon.com/cost-management/home#/dashboard

2. **View:**
   - Current month-to-date costs
   - Service breakdown
   - Daily cost trends

### Enable Cost Explorer

1. **Go to:** https://console.aws.amazon.com/cost-management/home#/cost-explorer

2. **Click:** "Enable Cost Explorer" (if not enabled)

3. **Use it to:**
   - See which services cost the most
   - Track daily spending
   - Identify cost spikes

---

## 🆓 Free Tier Monitoring

### Check Free Tier Usage

1. **Go to:** https://console.aws.amazon.com/billing/home#/freetier

2. **View:**
   - Services you're using
   - How much of free tier is used
   - When you'll exceed limits

### Free Tier Limits (Relevant to CodeLearn)

| Service | Free Tier Limit | After Free Tier |
|---------|----------------|-----------------|
| DynamoDB | 25 GB storage | $0.25/GB/month |
| S3 | 5 GB storage | $0.023/GB/month |
| Lambda | 1M requests/month | $0.20/1M requests |
| Cognito | 50K MAUs | $0.0055/MAU |
| SQS | 1M requests/month | $0.40/1M requests |
| CloudWatch Logs | 5 GB ingestion | $0.50/GB |

---

## 🚨 Cost Optimization Rules

### To Stay Within Free Tier:

1. **Delete unused resources:**
   - Stop EC2 instances when not in use
   - Delete old S3 files
   - Remove unused DynamoDB tables

2. **Use on-demand billing:**
   - DynamoDB: On-demand mode (pay per request)
   - Lambda: Automatic (pay per invocation)

3. **Set up auto-cleanup:**
   - S3 lifecycle policies (delete after 30 days)
   - DynamoDB TTL (auto-delete old items)

4. **Monitor daily:**
   - Check Cost Explorer weekly
   - Review Free Tier usage monthly

---

## 📋 Quick Setup Checklist

- [ ] Billing alerts enabled in preferences
- [ ] Email verified for billing alerts
- [ ] Budget created ($10/month recommended)
- [ ] Alert thresholds set (50%, 80%, 100%)
- [ ] Cost Explorer enabled
- [ ] Free Tier dashboard bookmarked

---

## 🎯 Recommended Setup for CodeLearn

**Budget:** $10/month

**Alerts:**
- 50% ($5) - "Check what's running"
- 80% ($8) - "Review and optimize"
- 100% ($10) - "Stop non-essential services"

**Monitoring:**
- Check Cost Explorer: Weekly
- Check Free Tier usage: Monthly
- Review billing dashboard: After major deployments

---

## 🔗 Quick Links

- **Billing Dashboard:** https://console.aws.amazon.com/billing/home
- **Budgets:** https://console.aws.amazon.com/billing/home#/budgets
- **Cost Explorer:** https://console.aws.amazon.com/cost-management/home#/cost-explorer
- **Free Tier:** https://console.aws.amazon.com/billing/home#/freetier
- **Billing Preferences:** https://console.aws.amazon.com/billing/home#/preferences

---

## ✅ After Setup

Once billing alerts are configured:

1. ✅ You'll get email alerts before overspending
2. ✅ You can monitor costs in real-time
3. ✅ You'll know when approaching free tier limits
4. ✅ Ready to proceed with Task 2!

---

## 💰 Expected Costs for CodeLearn MVP

**Month 1-2 (Development):**
- **Expected:** $0-2 (within free tier)
- **Max:** $5 (if testing heavily)

**Month 3+ (After Free Tier):**
- **Expected:** $5-10/month
- **Breakdown:**
  - DynamoDB: $1-2
  - S3: $0.50-1
  - Lambda: $0.50-1
  - Cognito: $0-1
  - Other: $1-2

---

## 🆘 If You Get an Alert

1. **Don't panic** - Check what's causing the cost
2. **Go to Cost Explorer** - See service breakdown
3. **Stop expensive resources** - Delete/stop what's not needed
4. **Review free tier usage** - See what exceeded limits
5. **Optimize** - Follow cost optimization tips above

---

**Time to set up:** 5 minutes
**Peace of mind:** Priceless 😊

Let me know once you've set up the billing alerts! 🚀
