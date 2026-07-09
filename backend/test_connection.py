"""
test_connection.py — End-to-end pipeline verification script.

Tests in sequence:
  1. CORS preflight (OPTIONS) to /api/chat
  2. Live POST to /api/chat → Flask → IBM IAM → watsonx Orchestrate
  3. Direct IBM IAM token exchange (bypass Flask entirely)
  4. Direct Orchestrate call (bypass Flask entirely)

Run with:  python test_connection.py
"""

import sys
import json
import time
import requests

# ── Config ────────────────────────────────────────────────────────────────────
FLASK_BASE        = "http://localhost:5000"
CHAT_ENDPOINT     = f"{FLASK_BASE}/api/chat"
HEALTH_ENDPOINT   = f"{FLASK_BASE}/api/health"
IAM_URL           = "https://iam.cloud.ibm.com/identity/token"
IBM_API_KEY       = "KmGxO69ogU5xEXTByRu9UVVH5VdanRtSNoc2rkgH85qW"
ORCHESTRATE_URL   = (
    "https://api.au-syd.watson-orchestrate.cloud.ibm.com"
    "/instances/bc312176-b1d0-4c96-a976-e36df50dfbf7"
    "/v1/orchestrate/a63fe8d0-479a-475a-b94b-edba919ed9b0/chat/completions"
)
TEST_MESSAGE = (
    "I am a fruit vendor in Pune's Camp area. Give me a quick tip to boost sales."
)

# ── Helpers ───────────────────────────────────────────────────────────────────
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"
BOLD   = "\033[1m"

def ok(msg):    print(f"  [OK] {msg}{RESET}")
def fail(msg):  print(f"  [FAIL] {msg}{RESET}")
def info(msg):  print(f"  --> {msg}{RESET}")
def section(n, title):
    print(f"\n{BOLD}{CYAN}" + "-"*60 + RESET)
    print(f"{BOLD}{CYAN}  TEST {n}: {title}{RESET}")
    print(f"{BOLD}{CYAN}" + "-"*60 + RESET)

# -- Test 1: Flask Health Check ------------------------------------------------
section(1, "Flask Health Check")
try:
    r = requests.get(HEALTH_ENDPOINT, timeout=5)
    info(f"Status: {r.status_code}")
    payload = r.json()
    print(f"  Response: {json.dumps(payload, indent=4)}")
    if r.status_code == 200 and payload.get("status") == "ok":
        ok("Flask is running and credentials are loaded.")
    elif r.status_code == 500 and "missing_credentials" in payload:
        fail(f"Flask running but credentials missing: {payload.get('missing_credentials')}")
        sys.exit(1)
    elif r.status_code == 200:
        ok("Flask health check returned 200 (non-standard shape, but server is up).")
except requests.ConnectionError:
    fail("Cannot reach http://localhost:5000 — is Flask running? (python app.py)")
    sys.exit(1)

# -- Test 2: CORS Preflight (OPTIONS) -----------------------------------------
section(2, "CORS Preflight — OPTIONS /api/chat")
try:
    r = requests.options(
        CHAT_ENDPOINT,
        headers={
            "Origin":                         "http://localhost:5173",
            "Access-Control-Request-Method":  "POST",
            "Access-Control-Request-Headers": "Content-Type",
        },
        timeout=5,
    )
    info(f"Status: {r.status_code}")
    acao = r.headers.get("Access-Control-Allow-Origin", "MISSING")
    acam = r.headers.get("Access-Control-Allow-Methods", "MISSING")
    info(f"Access-Control-Allow-Origin:  {acao}")
    info(f"Access-Control-Allow-Methods: {acam}")
    if r.status_code == 200 and acao in ("*", "http://localhost:5173"):
        ok("Preflight passed — browser CORS check will succeed.")
    else:
        fail(f"Preflight returned {r.status_code} or wrong ACAO header: {acao}")
        fail("Make sure CORS(app, resources={{r'/*': {{'origins': '*'}}}}) is in app.py")
except Exception as e:
    fail(f"OPTIONS request failed: {e}")

# -- Test 3: Live POST through Flask proxy -------------------------------------
section(3, "Live POST -- Flask to IBM watsonx Orchestrate")
info(f"Message: \"{TEST_MESSAGE}\"")
info("(This call hits IBM IAM + Orchestrate; allow up to 60 seconds...)\n")
start = time.time()
try:
    r = requests.post(
        CHAT_ENDPOINT,
        json={"message": TEST_MESSAGE},
        headers={
            "Content-Type": "application/json",
            "Origin":       "http://localhost:5173",
        },
        timeout=90,
    )
    elapsed = time.time() - start
    info(f"Status: {r.status_code}  ({elapsed:.1f}s)")

    try:
        payload = r.json()
    except ValueError:
        payload = {"raw": r.text}

    if r.status_code == 200 and "message" in payload:
        ok("Full pipeline is working! Agent reply received.")
        print(f"\n{BOLD}  -- Agent Reply -----------------------------------------{RESET}")
        # Strip non-ASCII chars (Orchestrate may return Unicode dashes etc.)
        reply = payload["message"]
        safe_reply = reply[:600].encode('ascii', 'replace').decode('ascii')
        print(f"  {safe_reply}{'...' if len(reply) > 600 else ''}")
        print(f"{BOLD}  -------------------------------------------------------{RESET}")
    elif r.status_code == 200 and "error" in payload:
        fail(f"Flask returned 200 but with an error key: {payload['error']}")
    else:
        fail(f"Unexpected status {r.status_code}")
        print(f"  Response body: {json.dumps(payload, indent=4)}")
except requests.Timeout:
    fail("Request timed out after 90 seconds — Orchestrate may be slow or the API key is invalid.")
except Exception as e:
    fail(f"POST request failed: {e}")

# -- Test 4: Direct IAM Token Exchange (bypass Flask) -------------------------
section(4, "Direct IBM IAM Token Exchange (bypasses Flask)")
try:
    r = requests.post(
        IAM_URL,
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey":     IBM_API_KEY,
        },
        headers={
            "Accept":       "application/json",
            "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout=30,
    )
    info(f"Status: {r.status_code}")
    if r.status_code == 200:
        token = r.json().get("access_token", "")
        ok(f"IAM token received — first 40 chars: {token[:40]}...")
    else:
        fail(f"IAM exchange failed: {r.status_code} — {r.text[:200]}")
        sys.exit(1)
except Exception as e:
    fail(f"IAM request failed: {e}")
    sys.exit(1)

# -- Test 5: Direct Orchestrate Call (bypass Flask) ----------------------------
section(5, "Direct Orchestrate Call (bypasses Flask)")
info("Sending message directly to Orchestrate API...")
start = time.time()
try:
    r2 = requests.post(
        ORCHESTRATE_URL,
        json={
            "messages": [{"role": "user", "content": TEST_MESSAGE}],
            "stream": False,
        },
        headers={
            "Authorization": f"Bearer {token}",
            "Accept":        "application/json",
            "Content-Type":  "application/json",
        },
        timeout=90,
    )
    elapsed = time.time() - start
    info(f"Status: {r2.status_code}  ({elapsed:.1f}s)")
    if r2.status_code == 200:
        choices = r2.json().get("choices", [])
        content = choices[0].get("message", {}).get("content", "") if choices else ""
        ok("Direct Orchestrate call succeeded.")
        print(f"\n{BOLD}  -- Direct Reply (first 400 chars) -------------------{RESET}")
        # Strip non-ASCII chars safe for Windows cp1252 terminal
        safe_content = content[:400].encode('ascii', 'replace').decode('ascii')
        print(f"  {safe_content}{'...' if len(content) > 400 else ''}")
        print(f"{BOLD}  -------------------------------------------------------{RESET}")
    else:
        fail(f"Orchestrate returned {r2.status_code}: {r2.text[:300]}")
except Exception as e:
    fail(f"Direct Orchestrate call failed: {e}")

# -- Summary -------------------------------------------------------------------
print(f"\n{BOLD}{CYAN}" + "="*60 + RESET)
print(f"{BOLD}{CYAN}  All tests complete. Review results above.{RESET}")
print(f"{BOLD}{CYAN}" + "="*60 + RESET + "\n")
