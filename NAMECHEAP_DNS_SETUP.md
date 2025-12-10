# Namecheap DNS Setup for poseprompter.com

## Current Status Check

From what you showed me:
- ✅ Domain is **Active** (good!)
- ✅ Valid until Dec 4, 2026 (plenty of time)
- ⚠️ **Redirect is set**: `www.poseprompter.com` → `poseprompter.com`

**Important**: The redirect might interfere with Firebase. We'll handle this.

---

## Step 1: Get DNS Records from Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **pose-prompter**
3. Navigate to **Hosting** → **Add custom domain**
4. Enter: `poseprompter.com`
5. Click **Continue**
6. Firebase will show you DNS records (save these!)

You'll see something like:
```
Type: A
Name: @
Value: 151.101.1.195 (example IP)
```

Or:
```
Type: A
Name: @
Value: 151.101.65.195 (example IP)
```

**You'll get 2 A records with different IP addresses - you need BOTH!**

---

## Step 2: Remove the Redirect (Temporary)

The redirect might interfere. Let's remove it first:

1. In Namecheap, go to **Redirect Domain**
2. Click **Remove** next to the `www.poseprompter.com` redirect
3. We'll set up proper DNS for www later

---

## Step 3: Set Up DNS Records in Namecheap

### Option A: Using Namecheap BasicDNS (Recommended for Firebase)

1. In Namecheap, go to your domain: **poseprompter.com**
2. Click **"Advanced DNS"** tab (at the top)
3. Scroll down to **"Host Records"** section
4. You'll see existing records - **don't delete them yet**

5. **Add A Records for Root Domain:**
   - Click **"Add New Record"**
   - Select **Type**: `A Record`
   - **Host**: `@` (this means root domain)
   - **Value**: [First IP from Firebase]
   - **TTL**: `Automatic` (or `30 min`)
   - Click **Save** (green checkmark)
   
   - **Add second A record:**
   - Click **"Add New Record"** again
   - **Type**: `A Record`
   - **Host**: `@`
   - **Value**: [Second IP from Firebase]
   - **TTL**: `Automatic`
   - Click **Save**

6. **Add CNAME for www (Optional but Recommended):**
   - Click **"Add New Record"**
   - **Type**: `CNAME Record`
   - **Host**: `www`
   - **Value**: `pose-prompter.web.app` (your Firebase domain)
   - **TTL**: `Automatic`
   - Click **Save**

7. **Remove old/conflicting records:**
   - If you see any A records pointing to other IPs, you can remove them
   - Keep CNAME records that point to Firebase domains

### Option B: Using PremiumDNS (If You Have It)

If you have PremiumDNS enabled:
1. Follow same steps as Option A
2. PremiumDNS gives better performance and DDoS protection
3. But BasicDNS works fine for Firebase

---

## Step 4: Verify DNS Records

After adding records, your Host Records should look like:

```
Type    Host    Value                    TTL
A       @       151.101.1.195            Automatic
A       @       151.101.65.195          Automatic
CNAME   www     pose-prompter.web.app   Automatic
```

(IP addresses will be different - use the ones Firebase gives you)

---

## Step 5: Wait for DNS Propagation

- **Time**: 15 minutes to 48 hours
- **Usually**: 1-2 hours
- **Check status**: Firebase Console → Hosting → Custom domains

**You can check propagation at**: https://www.whatsmydns.net/#A/poseprompter.com

---

## Step 6: Add www Domain in Firebase (After Root Works)

Once `poseprompter.com` is verified:

1. Go to Firebase Console → Hosting
2. Click **"Add custom domain"** again
3. Enter: `www.poseprompter.com`
4. Firebase will verify it (should be quick since CNAME is already set)

---

## Step 7: Update Firebase Authorized Domains

1. Firebase Console → Project Settings → Authorized domains
2. Add:
   - `poseprompter.com`
   - `www.poseprompter.com`

---

## Step 8: Update API Key Restrictions

1. Google Cloud Console → APIs & Services → Credentials
2. Edit your Browser API key
3. Add to HTTP referrers:
   ```
   https://poseprompter.com/*
   https://www.poseprompter.com/*
   ```

---

## Troubleshooting Namecheap-Specific Issues

### "Can't add A record"
- Make sure you're in **"Advanced DNS"** tab, not "Nameservers"
- If using PremiumDNS, make sure it's enabled

### "Redirect still active"
- Go to **"Redirect Domain"** section
- Click **Remove** on any redirects
- Wait a few minutes for changes to propagate

### "DNS not updating"
- Namecheap DNS can take 1-2 hours to propagate
- Check at https://www.whatsmydns.net/#A/poseprompter.com
- Make sure you saved the records (green checkmark)

### "www not working"
- Make sure CNAME record for `www` points to `pose-prompter.web.app`
- Add `www.poseprompter.com` as separate custom domain in Firebase
- Wait for DNS propagation

---

## Namecheap DNS Settings Location

In Namecheap dashboard:
1. **Domain List** → Click **"Manage"** next to poseprompter.com
2. Click **"Advanced DNS"** tab (at the top)
3. Scroll to **"Host Records"** section
4. This is where you add A and CNAME records

---

## Quick Checklist

- [ ] Removed redirect from Namecheap
- [ ] Got DNS records from Firebase Hosting
- [ ] Added 2 A records (@ → Firebase IPs) in Namecheap Advanced DNS
- [ ] Added CNAME record (www → pose-prompter.web.app)
- [ ] Waited for DNS propagation (1-2 hours)
- [ ] Verified domain in Firebase Console
- [ ] Added poseprompter.com to Firebase authorized domains
- [ ] Updated API key restrictions
- [ ] Added www.poseprompter.com as custom domain in Firebase
- [ ] Tested site at https://poseprompter.com

---

## Important Notes

1. **Don't change nameservers** - Use Namecheap's DNS (BasicDNS or PremiumDNS)
2. **Keep existing records** - Don't delete records unless you know what they do
3. **TTL**: Use "Automatic" - Namecheap will set appropriate values
4. **Both A records needed** - Firebase requires 2 A records for redundancy
5. **www is optional** - Root domain (poseprompter.com) is most important

---

## Need Help?

- **Namecheap Support**: https://www.namecheap.com/support/
- **Firebase Hosting Docs**: https://firebase.google.com/docs/hosting/custom-domain
- **DNS Check Tool**: https://www.whatsmydns.net/#A/poseprompter.com

---

**Next Step**: Go to Firebase Console → Hosting → Add custom domain, then follow Step 3 above to add the DNS records in Namecheap!

