from typing import Optional
from app.services.geo import haversine_distance

def calculate_transport_cost(
    distance_km: float, 
    quantity_kg: float, 
    rate_per_km: Optional[float] = None, 
    flat_route_rate: Optional[float] = None
) -> float:
    """
    Computes transport cost (FR-LG-05). Single source of truth.
    If flat_route_rate is provided, uses it directly.
    Otherwise uses rate_per_km * distance.
    If rate is per kg per km, we might adjust this logic, but
    based on schema rate_per_km is total for the vehicle or per km.
    Let's assume rate_per_km is per km for the whole capacity.
    """
    if flat_route_rate is not None:
        return flat_route_rate
        
    if rate_per_km is not None:
        return rate_per_km * distance_km
        
    # Default fallback if both are None, assume some base rate like ₹20/km
    return 20.0 * distance_km
