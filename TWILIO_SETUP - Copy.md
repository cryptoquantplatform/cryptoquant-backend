# Setting Up Twilio for SMS Verification

## Step 1: Create Twilio Account

1. Go to: https://www.twilio.com/try-twilio
2. Click **"Sign up for free"**
3. Fill in your details:
   - Email
   - Password
   - First & Last Name
4. Verify your email

---

## Step 2: Verify Your Phone Number

1. After signup, Twilio will ask you to verify YOUR phone number
2. Enter your phone number (this is for your account, not for sending SMS)
3. Enter the verification code you receive

---

## Step 3: Get Your Trial Credits

- Twilio gives you **FREE $15 trial credit**
- Enough for **~500 SMS messages**
- No credit card required for trial!

---

## Step 4: Get Your Twilio Credentials

After signing up, you'll see your dashboard with:

### **Account SID**
- Looks like: `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Copy this

### **Auth Token**
- Click the "eye" icon to reveal it
- Looks like: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Copy this

---

## Step 5: Get a Twilio Phone Number

1. In your Twilio dashboard, go to **"Phone Numbers"** → **"Manage"** → **"Buy a number"**
2. OR go directly to: https://console.twilio.com/us1/develop/phone-numbers/manage/search
3. Select your country
4. Check **"SMS"** capability
5. Click **"Search"**
6. Pick a number (it's FREE with trial credits!)
7. Click **"Buy"**

You'll get a number like: `+1234567890`

---

## Step 6: Add to .env File

Open your `.env` file and add:

```env
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

Replace with YOUR actual values from Twilio dashboard.

---

## Step 7: Install Twilio Package

In PowerShell:

```powershell
cd c:\Users\j\Downloads\imgui-master\imgui-master\backend
npm install
```

This installs the Twilio package.

---

## Step 8: Restart Backend

```powershell
Ctrl+C
npm start
```

You should see:
```
✅ Twilio SMS service initialized
```

---

## Testing SMS Verification

### **Trial Account Limitations:**

With a **trial** Twilio account:
- You can only send SMS to **verified phone numbers**
- To verify a number for testing:
  1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
  2. Click **"Add a new number"**
  3. Enter the phone number you want to test with
  4. Verify it via SMS

### **To Remove Limitations:**

Upgrade to paid account (no monthly fee, just pay-per-SMS):
- Cost: ~$0.0075 per SMS (less than 1 cent!)
- Can send to ANY number worldwide

---

## Troubleshooting

### SMS not sending?

Check:
1. `.env` has correct credentials
2. Phone number format includes country code: `+1234567890`
3. For trial accounts, recipient number must be verified in Twilio

### Check Twilio Logs:

https://console.twilio.com/us1/monitor/logs/sms

---

## Cost Estimate

- **Trial**: FREE ($15 credit = ~500 SMS)
- **Production**: ~$0.0075 per SMS
- **Monthly**: No monthly fees!

**Example:** 1000 registrations/month = ~$7.50/month

---

## Alternative: Skip SMS for Now

If you want to skip SMS verification for now:

- Phone number field will still be there (optional)
- Users can enter it, but won't need to verify
- You can add Twilio later when you're ready to go live

Just leave the Twilio settings empty in `.env` and it will work without SMS!

---

**Start by creating your Twilio account:** https://www.twilio.com/try-twilio 📱


