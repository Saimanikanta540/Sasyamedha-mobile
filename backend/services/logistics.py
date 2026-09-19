from models import TransportProvider


def cheapest_eligible_provider(
    providers: list[TransportProvider], quantity_kg: float
) -> TransportProvider | None:
    """Smallest-capacity provider that can carry the whole batch."""
    eligible = [p for p in providers if p.capacity_kg >= quantity_kg]
    if not eligible:
        return None
    return min(eligible, key=lambda p: p.capacity_kg)


def transport_cost(
    providers: list[TransportProvider], quantity_kg: float, distance_km: float
) -> tuple[float, TransportProvider | None]:
    provider = cheapest_eligible_provider(providers, quantity_kg)
    if provider is None:
        return 0.0, None
    cost = max(provider.min_fare, provider.rate_per_km * distance_km)
    return cost, provider
