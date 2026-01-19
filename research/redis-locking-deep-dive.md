# Redis Locking Strategies: Deep Dive

In our simulation, we solved the Double Booking problem using Redis. This document explores the nuances of that solution.

## 1. Simple Locking (Our Implementation)

We used the command:
`SET lock:seat:{id} {userId} NX EX 600`

*   **Correctness:** Valid for a **single Redis instance**.
*   **How it works:**
    *   `NX` ensures mutual exclusion.
    *   `EX` prevents deadlocks if the node crashes before releasing the lock.
*   **Risk:** If the Redis Master crashes *after* acquiring a lock but *before* replicating it to the Slave, and the Slave is promoted to Master, the lock is lost. A second user could lock the same seat.

## 2. Redlock Algorithm (Production Grade)

For a distributed Redis setup (multiple masters), the simple approach isn't 100% safe. The **Redlock** algorithm is the industry standard.

*   **Algorithm:**
    1.  Client gets current timestamp.
    2.  Attempts to acquire lock in N Redis instances (e.g., 5 independent masters) sequentially.
    3.  Lock is considered acquired only if it was acquired in the **majority** (e.g., 3/5) instances.
    4.  Validity time is calculated by subtracting the time taken to acquire locks from the TTL.

## 3. Why we chose Simple Locking

For a booking system, extreme consistency (CP) is preferred. However, the probability of a Redis Master crashing at the exact millisecond of a booking is low.

**Trade-off:**
*   **Simple Locking:** Fast, simple code, adequate for 99.99% of cases.
*   **Redlock:** Complex, higher latency, required for mission-critical guarantees (e.g., financial transactions).

## The "Thundering Herd" Anti-Pattern

While locking solves consistency, we must also cache reads. If 10,000 users refresh the "Show Layout" page simultaneously:
1.  DB query should happen **once**.
2.  Result stored in Redis.
3.  All 10,000 users read from Redis.

If the cache expires, all 10k requests might hit the DB at once. This is the **Thundering Herd**.
**Solution:** Use "Locking" even for cache regeneration (Mutex on cache miss).
