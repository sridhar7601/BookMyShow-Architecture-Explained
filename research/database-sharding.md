# Database Sharding Strategies for Booking Systems

As a booking platform like BookMyShow grows, a single database instance cannot handle the write load of millions of concurrent bookings. Sharding (Horizontal Partitioning) is the standard solution.

## What is Sharding?

Sharding involves splitting a large dataset across multiple database instances (shards) based on a specific key (Shard Key). Each shard is an independent database.

## Sharding Strategies for BookMyShow

### 1. Geo-Sharding (Location Based)
**Shard Key:** `City` or `Region`

*   **Logic:** All data for "Mumbai" goes to Shard A, "Delhi" goes to Shard B.
*   **Pros:**
    *   Natural isolation: Users in Mumbai rarely book tickets in Delhi.
    *   Latency: You can place Shard A physically closer to Mumbai users.
*   **Cons:**
    *   **Hotspots:** If a major event happens in Mumbai (e.g., Coldplay Concert), Shard A might get overloaded while Shard B sits idle.

### 2. Entity-Sharding (Movie/Event Based)
**Shard Key:** `MovieID` or `EventID`

*   **Logic:** "Avengers" data is on Shard A, "Barbie" is on Shard B.
*   **Pros:**
    *   Distributes load for different blockbusters.
*   **Cons:**
    *   **Mega-Hotspot:** If one movie (e.g., Avatar 3) accounts for 80% of traffic, one shard effectively takes the entire system load.

### 3. User-Sharding
**Shard Key:** `UserID`

*   **Logic:** User 1-1M on Shard A, 1M-2M on Shard B.
*   **Pros:**
    *   Even distribution of user profile data.
*   **Cons:**
    *   **Cross-Shard Joins:** A user wants to see "Movies in Mumbai". This requires querying potentially ALL shards if movie data isn't replicated. Unfeasible for booking flows.

## Recommendation

For a simulation or initial scale-up, **Geo-Sharding** is often the most practical approach for a ticketing platform, combined with **Active-Passive replication** for high availability.

> **Note:** Our current simulation uses a single Postgres instance, which mimics a "Single Shard" architecture.
