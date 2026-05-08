# 1. Track Management

Tests track selector, create, edit, switch, and delete.

## Setup

Navigate to http://localhost:5174/courses

## Steps

### 1.1 Track Selector Opens

- [ ] Click the track name in the header (e.g., "New User Onboarding")
- [ ] **Expect:** Select Track modal opens with "All Courses" + existing tracks listed

### 1.2 Create Track

- [ ] Click "Add Track" in the modal header
- [ ] Enter title: `Operations`, description: `Recurring QC procedures and operational workflows`
- [ ] Click Add
- [ ] **Expect:** Modal now shows the new "Operations" track in the list

### 1.3 Create Second Track

- [ ] Click "Add Track" again
- [ ] Enter title: `Troubleshooting`, description: `Investigating and resolving QC issues`
- [ ] Click Add
- [ ] **Expect:** 3 tracks visible: New User Onboarding, Operations, Troubleshooting

### 1.4 Switch Tracks

- [ ] Click "Operations" in the selector
- [ ] **Expect:** Background updates to show "No courses in this track" (empty track)
- [ ] Reopen selector, click "New User Onboarding"
- [ ] **Expect:** Original courses visible again
- [ ] Reopen selector, click "All Courses"
- [ ] **Expect:** All tracks and courses visible

### 1.5 Edit Track Settings

- [ ] Open selector, click the gear icon on "Operations"
- [ ] **Expect:** Track Settings dialog opens with title, description, sort order
- [ ] Change description to `Weekly and monthly operational procedures`
- [ ] Click Save
- [ ] **Expect:** Dialog closes, description updated in the selector

### 1.6 Track Persists on Refresh

- [ ] Select "New User Onboarding" as active track
- [ ] Refresh the page (F5)
- [ ] **Expect:** "New User Onboarding" still selected (persisted to localStorage)

## Teardown

Leave tracks in place for subsequent tests. Track deletion is tested in [6-cleanup.md](6-cleanup.md).
