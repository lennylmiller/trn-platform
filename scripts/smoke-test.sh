#!/bin/bash
# =============================================================================
# Courses Smoke Test
# =============================================================================
# Hits the running Express server with real requests. Tests the full stack:
# server + database. Cleans up after itself.
#
# Prerequisites: server running on localhost:3001 with database connected
# Usage: ./scripts/smoke-test.sh
# =============================================================================

set -euo pipefail

BASE="http://localhost:3001/api/v2"
PASS=0
FAIL=0
TOTAL=0
CREATED_COURSE_ID=""
CREATED_TRACK_ID=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m'

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

check() {
  local label="$1"
  local expected_status="$2"
  local method="$3"
  local path="$4"
  shift 4
  local body_args=("$@")

  TOTAL=$((TOTAL + 1))

  local response
  local http_code

  if [ "$method" = "GET" ]; then
    response=$(curl -s -w "\n%{http_code}" "$BASE$path")
  elif [ "$method" = "DELETE" ]; then
    response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE$path")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" -H "Content-Type: application/json" "$BASE$path" "${body_args[@]}")
  fi

  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" = "$expected_status" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${GREEN}✓${NC} $label (${http_code})"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${RED}✗${NC} $label — expected $expected_status, got $http_code"
    echo "    $body" | head -1
  fi

  # Export body for subsequent steps
  LAST_BODY="$body"
}

extract_json() {
  echo "$LAST_BODY" | python3 -c "import json,sys; print(json.load(sys.stdin).get('$1', ''))" 2>/dev/null || echo ""
}

# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Health Check${NC}"
# Health check is at /api/health, not under /api/v2
TOTAL=$((TOTAL + 1))
HEALTH_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3001/api/health")
if [ "$HEALTH_CODE" = "200" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${GREEN}✓${NC} API health (200)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${RED}✗${NC} API health — expected 200, got $HEALTH_CODE"
fi

# ---------------------------------------------------------------------------
# Track CRUD
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Track CRUD${NC}"

check "List tracks" "200" GET "/courses/tracks"

check "Create track" "201" POST "/courses/tracks" -d '{"title":"__SMOKE_TEST_TRACK__","description":"Temporary smoke test track"}'
CREATED_TRACK_ID=$(extract_json "track_id")
echo "    → track_id=$CREATED_TRACK_ID"

if [ -n "$CREATED_TRACK_ID" ] && [ "$CREATED_TRACK_ID" != "" ]; then
  check "Update track" "200" PUT "/courses/tracks/$CREATED_TRACK_ID" -d '{"description":"Updated description"}'
fi

# ---------------------------------------------------------------------------
# Course CRUD
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Course CRUD${NC}"

check "List courses" "200" GET "/courses"

check "Create course" "201" POST "/courses" -d '{"title":"__SMOKE_TEST_COURSE__","description":"Temporary","category":"test"}'
CREATED_COURSE_ID=$(extract_json "course_id")
echo "    → course_id=$CREATED_COURSE_ID"

if [ -n "$CREATED_COURSE_ID" ] && [ "$CREATED_COURSE_ID" != "" ]; then
  check "Get course" "200" GET "/courses/$CREATED_COURSE_ID"
  check "Update course" "200" PUT "/courses/$CREATED_COURSE_ID" -d '{"description":"Updated smoke test"}'
fi

check "Get nonexistent course" "404" GET "/courses/99999"

# ---------------------------------------------------------------------------
# Lesson CRUD
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Lesson CRUD${NC}"

if [ -n "$CREATED_COURSE_ID" ] && [ "$CREATED_COURSE_ID" != "" ]; then
  check "Add lesson" "201" POST "/courses/$CREATED_COURSE_ID/lessons" -d '{"seq":0,"title":"Smoke Lesson"}'
  LESSON_ID=$(extract_json "lesson_id")
  echo "    → lesson_id=$LESSON_ID"

  if [ -n "$LESSON_ID" ] && [ "$LESSON_ID" != "" ]; then
    check "Update lesson" "200" PUT "/courses/$CREATED_COURSE_ID/lessons/$LESSON_ID" -d '{"title":"Updated Lesson"}'

    # Slide CRUD
    echo ""
    echo -e "${YELLOW}Slide CRUD${NC}"

    check "Add slide" "201" POST "/courses/$CREATED_COURSE_ID/lessons/$LESSON_ID/slides" -d '{"seq":0,"slide_type":"narrative","title":"Smoke Slide","content":"Test content"}'
    SLIDE_ID=$(extract_json "slide_id")
    echo "    → slide_id=$SLIDE_ID"

    if [ -n "$SLIDE_ID" ] && [ "$SLIDE_ID" != "" ]; then
      check "Update slide" "200" PUT "/courses/$CREATED_COURSE_ID/lessons/$LESSON_ID/slides/$SLIDE_ID" -d '{"title":"Updated Slide"}'
      check "Delete slide" "204" DELETE "/courses/$CREATED_COURSE_ID/lessons/$LESSON_ID/slides/$SLIDE_ID"
    fi

    check "Delete lesson" "204" DELETE "/courses/$CREATED_COURSE_ID/lessons/$LESSON_ID"
  fi
fi

# ---------------------------------------------------------------------------
# Bulk Build
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Bulk Build${NC}"

if [ -n "$CREATED_COURSE_ID" ] && [ "$CREATED_COURSE_ID" != "" ]; then
  check "Build course content" "200" POST "/courses/$CREATED_COURSE_ID/build" -d '{
    "lessons": [
      {
        "title": "Smoke Lesson 1",
        "description": "First lesson",
        "slides": [
          {"slide_type": "narrative", "title": "Intro", "content": "# Hello\nSmoke test content"},
          {"slide_type": "quiz", "quiz_question": "Is this a test?", "quiz_options": ["Yes", "No"], "quiz_answer": 0, "quiz_explanation": "It is a smoke test."}
        ]
      },
      {
        "title": "Smoke Lesson 2",
        "slides": [
          {"slide_type": "live_demo", "title": "Demo", "content": "Run this SQL", "sql_text": "SELECT 1 AS smoke_test", "sql_label": "Smoke"}
        ]
      }
    ]
  }'

  # Verify build result
  check "Get built course" "200" GET "/courses/$CREATED_COURSE_ID"
fi

# ---------------------------------------------------------------------------
# Export / Import
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Export / Import${NC}"

if [ -n "$CREATED_COURSE_ID" ] && [ "$CREATED_COURSE_ID" != "" ]; then
  check "Export course" "200" GET "/courses/$CREATED_COURSE_ID/export"
  EXPORTED="$LAST_BODY"

  check "Import course" "201" POST "/courses/import" -d "$EXPORTED"
  IMPORTED_ID=$(extract_json "course_id")
  echo "    → imported course_id=$IMPORTED_ID"
fi

# ---------------------------------------------------------------------------
# Clear
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Clear / Delete${NC}"

if [ -n "$CREATED_COURSE_ID" ] && [ "$CREATED_COURSE_ID" != "" ]; then
  check "Clear course" "200" POST "/courses/$CREATED_COURSE_ID/clear"
  check "Delete course" "204" DELETE "/courses/$CREATED_COURSE_ID"
fi

# Clean up imported course
if [ -n "$IMPORTED_ID" ] && [ "$IMPORTED_ID" != "" ]; then
  check "Delete imported course" "204" DELETE "/courses/$IMPORTED_ID"
fi

# Clean up track
if [ -n "$CREATED_TRACK_ID" ] && [ "$CREATED_TRACK_ID" != "" ]; then
  check "Delete track" "204" DELETE "/courses/tracks/$CREATED_TRACK_ID"
fi

# ---------------------------------------------------------------------------
# Series (read-only)
# ---------------------------------------------------------------------------

echo ""
echo -e "${YELLOW}Series${NC}"

check "List series" "200" GET "/courses/series"

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$FAIL" -eq 0 ]; then
  echo -e "${GREEN}All $TOTAL tests passed${NC}"
else
  echo -e "${RED}$FAIL of $TOTAL tests failed${NC} ($PASS passed)"
fi
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

exit $FAIL
