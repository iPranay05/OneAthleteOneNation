# 🔍 **Debug Coach Requests Not Showing**

## 🎯 **Current Status:**
✅ **Request Created Successfully** - The request is in the database:
```json
{
  "athlete_id": "0180e5fb-8dbd-4076-9ee4-0072133a7857",
  "coach_id": "[coach-id]", 
  "message": "Hi Abhin, I would like to request you as my coach...",
  "status": "pending",
  "created_at": "2025-09-20T06:02:08.524843+00:00"
}
```

## 🔍 **Debug Steps Added:**

### **1. Enhanced Logging**
- Added detailed console logs to track request loading
- Shows coach ID, athlete ID, and request data
- Logs profile fetching attempts

### **2. Debug UI Section**
- Added debug info panel in CoachRequests screen
- Shows current coach ID, email, role, and request count
- Helps verify if the right coach is logged in

## 🚀 **How to Debug:**

### **Step 1: Check Coach Identity**
1. **Login as Abhin** (the coach)
2. **Open Coach Dashboard** → Click "Athlete Requests"
3. **Check Debug Info** section - should show:
   - Coach ID: `[abhin's-uuid]`
   - Coach Email: `abhin@email.com`
   - Profile Role: `coach`
   - Requests Found: `1` (or more)

### **Step 2: Check Console Logs**
Look for these logs when coach opens requests:
```
🔍 Loading requests for coach: [coach-uuid]
🔍 Getting requests for coach: [coach-uuid]
📋 Found requests for coach: 1
📋 Raw coach requests: [{...}]
🔍 Enriching request for athlete: [athlete-uuid]
✅ Found athlete profile: {...}
```

### **Step 3: Verify Coach ID Match**
The key is ensuring the `coach_id` in the request matches the logged-in coach's ID:
- **Request coach_id**: `[from database]`
- **Logged-in coach ID**: `[from debug panel]`
- **These MUST match exactly**

## 🔧 **Possible Issues & Solutions:**

### **❌ Issue 1: Wrong Coach Logged In**
**Problem**: Different coach is logged in than the one the request was sent to
**Solution**: Ensure Abhin is logged in, not another coach

### **❌ Issue 2: Coach ID Mismatch**
**Problem**: Request sent to different coach ID than expected
**Solution**: Check the coach selection in athlete app

### **❌ Issue 3: Role Not Set**
**Problem**: Coach profile doesn't have `role = 'coach'`
**Solution**: Update profile in Supabase

### **❌ Issue 4: RLS Policies**
**Problem**: Row Level Security blocking access
**Solution**: Ensure coach_requests table RLS policies are correct

## 📊 **Expected Console Output:**

### **When Working Correctly:**
```
🔍 Loading requests for coach: abc123-def456-ghi789
🔍 Getting requests for coach: abc123-def456-ghi789
📋 Found requests for coach: 1
📋 Raw coach requests: [
  {
    "id": "64be058b-0f71-4658-a417-c8f33fbc98d3",
    "athlete_id": "0180e5fb-8dbd-4076-9ee4-0072133a7857",
    "coach_id": "abc123-def456-ghi789",
    "message": "Hi Abhin, I would like to request you as my coach...",
    "status": "pending"
  }
]
🔍 Enriching request for athlete: 0180e5fb-8dbd-4076-9ee4-0072133a7857
✅ Found athlete profile: {name: "Athlete Name", email: "athlete@email.com"}
```

## 🎯 **Quick Test:**

1. **Open Coach App** as Abhin
2. **Go to Athlete Requests** 
3. **Check Debug Panel** - should show Coach ID and "Requests Found: 1"
4. **If Requests Found: 0** → Coach ID mismatch or RLS issue
5. **If Requests Found: 1+** → Should see the request card

## 🔄 **Next Steps:**

**If still not showing:**
1. **Verify Supabase Table** exists (`coach_requests`)
2. **Check RLS Policies** are properly set
3. **Confirm Coach Profile** has correct role
4. **Match Coach IDs** between request and logged-in user

**The debug info will show exactly what's happening!** 🔍
