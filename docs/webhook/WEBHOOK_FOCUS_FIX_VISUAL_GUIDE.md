# Visual Guide: Input Focus Loss Fix

## The Problem Visualized

```
┌─────────────────────────────────────────────────────────────┐
│ WebhookRegistrationComponent                                │
│                                                              │
│  State: editName = ""                                       │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modal (Edit Webhook)                                  │  │
│  │                                                        │  │
│  │  <TextInput                                           │  │
│  │    value={editName}                                   │  │
│  │    onChange={(e) => setEditName(e.target.value)} ─────┼──┼─ NEW function ref!
│  │  />                                                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

User types "A"
    ↓
┌─────────────────────────────────────────────────────────────┐
│ WebhookRegistrationComponent RE-RENDERS                     │
│                                                              │
│  State: editName = "A"  ← State changed!                   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modal (Edit Webhook)                                  │  │
│  │                                                        │  │
│  │  <TextInput                                           │  │
│  │    value={editName}                                   │  │
│  │    onChange={(e) => setEditName(e.target.value)} ─────┼──┼─ DIFFERENT function ref!
│  │  />                                                    │  │
│  │                                                        │  │
│  │  ⚠️  React sees different onChange prop               │  │
│  │  ⚠️  TextInput UNMOUNTS and REMOUNTS                  │  │
│  │  ❌ Focus lost!                                        │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## The Solution Visualized

```
┌─────────────────────────────────────────────────────────────┐
│ WebhookRegistrationComponent                                │
│                                                              │
│  State: editName = ""                                       │
│                                                              │
│  Callbacks (created once with useCallback):                 │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ handleEditNameChange ─────────────────────────────────┼─┼─ Ref: 0x1234
│  │ handleEditDescriptionChange ──────────────────────────┼─┼─ Ref: 0x5678
│  │ handleEditUrlChange ──────────────────────────────────┼─┼─ Ref: 0x9ABC
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modal (Edit Webhook)                                  │  │
│  │                                                        │  │
│  │  <EditForm                                            │  │
│  │    editName={editName}                                │  │
│  │    onNameChange={handleEditNameChange} ───────────────┼──┼─ Stable ref: 0x1234
│  │  />                                                    │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ EditForm (memoized)                            │  │  │
│  │  │                                                 │  │  │
│  │  │  <TextInput                                    │  │  │
│  │  │    value={editName}                            │  │  │
│  │  │    onChange={(e) => onNameChange(e.target.val) │  │  │
│  │  │  />                                             │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

User types "A"
    ↓
┌─────────────────────────────────────────────────────────────┐
│ WebhookRegistrationComponent RE-RENDERS                     │
│                                                              │
│  State: editName = "A"  ← State changed!                   │
│                                                              │
│  Callbacks (same references because of useCallback):        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ handleEditNameChange ─────────────────────────────────┼─┼─ Ref: 0x1234 (SAME!)
│  │ handleEditDescriptionChange ──────────────────────────┼─┼─ Ref: 0x5678 (SAME!)
│  │ handleEditUrlChange ──────────────────────────────────┼─┼─ Ref: 0x9ABC (SAME!)
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Modal (Edit Webhook)                                  │  │
│  │                                                        │  │
│  │  <EditForm                                            │  │
│  │    editName={editName}  ← Changed                     │  │
│  │    onNameChange={handleEditNameChange} ───────────────┼──┼─ SAME ref: 0x1234 ✓
│  │  />                                                    │  │
│  │                                                        │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │ EditForm checks memo:                          │  │  │
│  │  │  - editName changed: "A" !== ""                │  │  │
│  │  │  - onNameChange same: 0x1234 === 0x1234 ✓      │  │  │
│  │  │  → RE-RENDER with new value                    │  │  │
│  │  │                                                 │  │  │
│  │  │  <TextInput                                    │  │  │
│  │  │    value={editName}  ← "A"                     │  │  │
│  │  │    onChange={...} ← SAME prop                  │  │  │
│  │  │  />                                             │  │  │
│  │  │                                                 │  │  │
│  │  │  ✅ TextInput stays MOUNTED                     │  │  │
│  │  │  ✅ Focus MAINTAINED!                           │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

### Before Fix
```
WebhookRegistration
    └── Modal
        └── form
            ├── TextInput (name)        ← Loses focus
            ├── TextInput (description) ← Loses focus
            ├── TextInput (url)         ← Loses focus
            └── TextInput (secret)      ← Loses focus

Problem: Inline onChange handlers recreated on every render
```

### After Fix
```
WebhookRegistration
    └── Modal
        └── form
            └── EditForm (memoized)
                ├── TextInput (name)        ← Focus maintained ✓
                ├── TextInput (description) ← Focus maintained ✓
                ├── TextInput (url)         ← Focus maintained ✓
                └── TextInput (secret)      ← Focus maintained ✓

Solution: Stable callback references via useCallback
```

## State Flow Comparison

### Before (Broken)
```
┌─────────┐
│ User    │
│ Types   │
│  "A"    │
└────┬────┘
     │
     ▼
┌──────────────────┐
│ onChange inline  │ ← New function instance
│ function created │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ setEditName("A") │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Component        │
│ Re-renders       │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ NEW onChange     │ ← Different function instance
│ function created │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ React compares:  │
│ old !== new      │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ TextInput        │
│ UNMOUNTS         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ TextInput        │
│ REMOUNTS         │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ ❌ Focus Lost   │
└──────────────────┘
```

### After (Fixed)
```
┌─────────┐
│ User    │
│ Types   │
│  "A"    │
└────┬────┘
     │
     ▼
┌──────────────────────┐
│ handleEditNameChange │ ← SAME function instance (useCallback)
│ (memoized)           │
└────┬─────────────────┘
     │
     ▼
┌──────────────────┐
│ setEditName("A") │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ Component        │
│ Re-renders       │
└────┬─────────────┘
     │
     ▼
┌──────────────────────┐
│ handleEditNameChange │ ← SAME function instance
│ (still memoized)     │
└────┬─────────────────┘
     │
     ▼
┌──────────────────┐
│ EditForm.memo:   │
│ Props changed?   │
│ - editName: YES  │
│ - callback: NO   │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ EditForm         │
│ Re-renders       │
│ (value updated)  │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ TextInput        │
│ Updates value    │
│ Stays MOUNTED    │
└────┬─────────────┘
     │
     ▼
┌──────────────────┐
│ ✅ Focus Kept   │
└──────────────────┘
```

## Function Reference Identity

### Problem: Inline Functions
```javascript
// Render 1
const onChange1 = (e) => setValue(e.target.value);  // Ref: 0x1000
<TextInput onChange={onChange1} />

// Render 2 (after typing)
const onChange2 = (e) => setValue(e.target.value);  // Ref: 0x2000 (NEW!)
<TextInput onChange={onChange2} />

// React comparison:
onChange1 === onChange2  // FALSE! ❌
// Result: TextInput remounts, loses focus
```

### Solution: useCallback
```javascript
// Render 1
const handleChange = useCallback(                   // Ref: 0x1000
    (value) => setValue(value),
    []
);
<TextInput onChange={(e) => handleChange(e.target.value)} />

// Render 2 (after typing)
const handleChange = useCallback(                   // Ref: 0x1000 (SAME!)
    (value) => setValue(value),
    []
);
<TextInput onChange={(e) => handleChange(e.target.value)} />

// React.memo comparison in EditForm:
handleChange === handleChange  // TRUE! ✅
// Result: TextInput stays mounted, keeps focus
```

## Key Takeaways

1. **Inline functions = new instances on every render**
   - React sees them as "different" props
   - Causes unnecessary re-renders and remounts

2. **useCallback = stable function reference**
   - Same function instance across renders
   - React.memo can skip re-renders

3. **React.memo = prop comparison**
   - Prevents re-render if props haven't changed
   - Uses shallow comparison (=== for functions)

4. **Together = optimized updates**
   - Component re-renders only when needed
   - DOM elements stay mounted
   - Focus preserved
