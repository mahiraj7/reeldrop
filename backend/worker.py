import time
import requests
from datetime import datetime

SUPABASE_URL = "https://hshcbrvkxndwsjrgrsbq.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzaGNicnZreG5kd3Nqcmdyc2JxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5NjU3NzQsImV4cCI6MjEwNzU0MTc3NH0.PxVAB3EpZaGtS9DmTYjJ2voyfkSrf_ISNfW_dXxu0_4"
BASE_GRAPH_URL = "https://graph.facebook.com/v19.0"

HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json"
}

def audit_7day_escrow():
    now_str = datetime.utcnow().isoformat()
    # Unlocked jobs past 7 days
    query = f"scheduled_deliveries?status=eq.LIVE&payout_status=eq.LOCKED_7_DAYS&retention_deadline=lte.{now_str}&select=*,theme_pages(*)"
    items = requests.get(f"{SUPABASE_URL}/rest/v1/{query}", headers=HEADERS).json()

    print(f"[{datetime.now().strftime('%H:%M:%S')}] Auditing {len(items)} posts for 7-day completion...")

    for item in items:
        # Check Meta API if real
        page = item.get("theme_pages", {})
        media_id = item.get("meta_media_id")

        if page.get("is_real") and page.get("access_token"):
            check_url = f"{BASE_GRAPH_URL}/{media_id}?fields=id&access_token={page['access_token']}"
            res = requests.get(check_url)
            is_alive = (res.status_code == 200)
        else:
            is_alive = True  # Demo node auto-pass

        if is_alive:
            # Unlock Cash
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/scheduled_deliveries?id=eq.{item['id']}",
                headers=HEADERS,
                json={"payout_status": "AVAILABLE", "status": "COMPLETED"}
            )
            print(f"✅ Unlocked payout of ₹{item['payout_amount']} for {page.get('instagram_handle')}")
        else:
            # Deleted early -> Penalty
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/scheduled_deliveries?id=eq.{item['id']}",
                headers=HEADERS,
                json={"payout_status": "FORFEITED", "status": "DELETED_EARLY"}
            )
            # Add strike
            current_strikes = page.get("strikes_count", 0) + 1
            requests.patch(
                f"{SUPABASE_URL}/rest/v1/theme_pages?id=eq.{page['id']}",
                headers=HEADERS,
                json={"strikes_count": current_strikes}
            )
            print(f"❌ Post deleted early by {page.get('instagram_handle')}! Payout forfeited.")

if __name__ == "__main__":
    print("🔁 ReelDrop Automated 7-Day Audit Cron Worker is Active...")
    while True:
        try:
            audit_7day_escrow()
        except Exception as e:
            print("Audit Loop Error:", e)
        time.sleep(60) # Runs every minute