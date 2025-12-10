# How to Find Advanced DNS in Namecheap

## You're on the Wrong Tab!

You're currently on the **"Details"** tab. You need to go to the **"Advanced DNS"** tab.

---

## Step-by-Step: Finding Advanced DNS

### Method 1: From Domain List

1. Go to your **Namecheap dashboard**
2. Click **"Domain List"** in the left sidebar
3. Find **poseprompter.com** in the list
4. Click the **"Manage"** button (blue button on the right)
5. You'll see tabs at the top:
   - **Details** ← You're here
   - **Advanced DNS** ← Click this one!
   - **Nameservers**
   - **WhoisGuard**
   - etc.

6. **Click "Advanced DNS"** tab

### Method 2: Direct Link (If Already on Domain Page)

If you're already on the domain page:
1. Look at the **top of the page** - you'll see tabs
2. Click the **"Advanced DNS"** tab (it's usually the second tab)

---

## What You'll See in Advanced DNS

Once you click "Advanced DNS", you'll see:

### At the Top:
- **Nameservers** section (leave this alone - use Namecheap's default)
- **Host Records** section ← **This is where you add DNS!**

### Host Records Section Will Show:
```
Type    Host    Value                    TTL
A       @       192.0.2.1               Automatic
CNAME   www     example.com             Automatic
```

(You'll see existing records - that's normal)

---

## Adding DNS Records

In the **Host Records** section:

1. **Scroll down** to see existing records
2. Click **"Add New Record"** button
3. A form will appear:
   - **Type**: Dropdown (select A Record)
   - **Host**: Text field (enter `@`)
   - **Value**: Text field (enter IP from Firebase)
   - **TTL**: Dropdown (select Automatic)
4. Click the **green checkmark** (✓) to save
5. Repeat for second A record

---

## Visual Guide

```
Namecheap Dashboard
└── Domain List
    └── poseprompter.com
        └── [Manage Button]
            └── Tabs at top:
                ├── Details ← You're here (wrong tab!)
                ├── Advanced DNS ← Click this!
                ├── Nameservers
                └── ...
                    └── Host Records section
                        └── [Add New Record] ← Add DNS here
```

---

## If You Don't See "Advanced DNS" Tab

If you don't see the Advanced DNS tab, it might be because:

1. **Domain is locked** - Check if domain is locked (shouldn't be for DNS)
2. **Wrong account** - Make sure you're logged into the right Namecheap account
3. **Domain not fully activated** - Wait a few minutes after purchase

---

## Alternative: Use Nameservers Method

If you absolutely can't access Advanced DNS, you can:

1. Change nameservers to Firebase's nameservers
2. But this is more complex and not recommended
3. **Better to use Advanced DNS** (easier and recommended)

---

## Quick Checklist

- [ ] Clicked "Manage" on poseprompter.com
- [ ] See tabs at top of page
- [ ] Clicked "Advanced DNS" tab
- [ ] See "Host Records" section
- [ ] Ready to add DNS records

---

## Still Can't Find It?

1. **Take a screenshot** of what you see
2. **Look for these words**:
   - "Advanced DNS"
   - "Host Records"
   - "DNS Records"
   - "A Record"
   - "CNAME"

3. **Check the URL** - Should be something like:
   `https://www.namecheap.com/domains/domaincontrolpanel/poseprompter.com/advanceddns`

---

**The key is: Look for tabs at the TOP of the page after clicking "Manage"!**

