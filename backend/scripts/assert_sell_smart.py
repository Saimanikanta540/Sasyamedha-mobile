"""§5.1 assertion: tomato, 500kg @ farm coords must rank FPO > Guntur mandi > Khammam mandi."""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlmodel import Session

from db import engine
from services.sell_smart import compute_sell_smart

with Session(engine) as session:
    resp = compute_sell_smart(
        session, crop="tomato", quantity_kg=500, lat=16.3067, lng=80.4365, storage_days=0, lang="en"
    )

top3 = resp["results"][:3]
for r in top3:
    print(
        f"#{r['rank']} {r['name']:30s} type={r['destination_type']:6s} "
        f"₹/kg={r['price_per_kg']:>6.2f} dist={r['distance_km']:>6.1f}km "
        f"gross={r['gross']:>9.0f} transport={r['transport_cost']:>8.0f} "
        f"net={r['net_return']:>9.0f} Δ={r['delta_vs_best']:>8.0f}"
    )

assert top3[0]["destination_type"] == "fpo", "rank 1 must be the FPO"
assert top3[0]["name"] == "Krishna Valley Farmer Producer Organization"
assert top3[0]["delta_vs_best"] == 0

assert top3[1]["destination_type"] == "mandi", "rank 2 must be a mandi"
assert top3[1]["name"] == "Guntur Market Yard"
assert top3[1]["net_return"] < top3[0]["net_return"]

assert top3[2]["destination_type"] == "mandi", "rank 3 must be a mandi"
assert top3[2]["name"] == "Khammam Market Yard"
assert top3[2]["net_return"] < top3[1]["net_return"]

# The inversion: Khammam has the HIGHEST price/kg but the WORST net return of the top 3.
assert top3[2]["price_per_kg"] > top3[1]["price_per_kg"] > top3[0]["price_per_kg"]
assert top3[2]["net_return"] < top3[1]["net_return"] < top3[0]["net_return"]

print("\nALL ASSERTIONS PASSED ✓")
