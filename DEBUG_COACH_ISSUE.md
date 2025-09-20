# 🐛 **Debug: Mock Data Issue - SOLUTION**

## 🎯 **Problem Identified:**
The MyCoaches screen is showing **mock data** (Dr. Rajesh Kumar, Priya Sharma) instead of **real Supabase coaches**.

## 🔧 **What I've Fixed:**

### ✅ **1. Updated Context Logic:**
- **Removed Mock Data Fallback**: No longer falls back to mock data when Supabase is available
- **Real Data Priority**: Always tries Supabase first, shows empty state if no real coaches
- **Mock Data Detection**: Identifies and clears cached mock data automatically

### ✅ **2. Added Debug Tools:**
- **Debug Section**: Shows user ID, role, and coach IDs in MyCoaches screen
- **Clear Mock Data Button**: Red button to force clear cached mock data
- **Console Logging**: Detailed logs to track data loading

### ✅ **3. Improved Data Flow:**
- **Supabase First**: Always queries real coaches from database
- **Empty State**: Shows "No coaches registered" instead of fake coaches
- **Real Coach Display**: Only shows coaches who have `role = 'coach'` AND `last_sign_in_at`

## 🛠 **How to Fix Your Issue:**

### **Step 1: Clear Mock Data**
1. **Open MyCoaches screen** in athlete app
2. **Look for Debug Info section** (shows User ID, Role, Coach IDs)
3. **Click "Clear Mock Data & Refresh"** red button
4. **Check console logs** for "Cleared cached mock data"

### **Step 2: Verify Supabase Setup**
1. **Check Supabase profiles table**:
```sql
SELECT id, full_name, email, role, last_sign_in_at 
FROM profiles 
WHERE role = 'coach' 
AND last_sign_in_at IS NOT NULL;
```

2. **Ensure coach has logged in** (must have `last_sign_in_at` timestamp)

### **Step 3: Test Real Coach Flow**
1. **Register as coach** → Set `role = 'coach'` in profile
2. **Login as coach** → This sets `last_sign_in_at`
3. **Switch to athlete** → Should see real coach, not mock data

## 📊 **Debug Information:**

### **What Debug Section Shows:**
- **User ID**: Your actual Supabase user UUID
- **Role**: Should be 'athlete' for athlete view
- **Coach IDs**: Should show real UUIDs, not 'coach_shubham', 'coach_abhin'

### **Expected vs Actual:**
```javascript
// ❌ Mock Data (what you're seeing):
Coach IDs: coach_shubham, coach_abhin, coach_pranay, coach_yash

// ✅ Real Data (what you should see):
Coach IDs: 550e8400-e29b-41d4-a716-446655440000 (or empty if no coaches)
```

## 🔍 **Console Logs to Check:**

### **When Loading Coaches:**
```
Loaded real coaches from Supabase: 1
Coach Shubham (550e8400-...): available=true, status=available, load=0/15
Available coaches: [{id: "550e8400-...", name: "Shubham"}]
```

### **When Clearing Mock Data:**
```
Cached data is mock data, clearing it
Cleared cached mock data
```

## 🎯 **Root Cause:**
The app was loading **cached mock data** from AsyncStorage instead of **real Supabase data**. The updated context now:

1. **Prioritizes Supabase** over cached data
2. **Detects mock data** by checking for IDs starting with 'coach_'
3. **Clears mock data** automatically when detected
4. **Shows empty state** instead of fake coaches

## 🚀 **Quick Fix:**

**Just click the "Clear Mock Data & Refresh" button in the MyCoaches screen!**

This will:
- ✅ Clear all cached mock data
- ✅ Force reload from Supabase
- ✅ Show only real registered coaches
- ✅ Display correct coach count

## 🎉 **Expected Result:**

After clearing mock data, you should see:
- **"0 registered coaches available"** (if no real coaches)
- **"1 registered coaches available"** (if one real coach)
- **Real coach names** in request modal, not Dr. Rajesh Kumar
- **Real contact info** from Supabase profiles

**The debug button will solve your issue immediately!** 🔧
