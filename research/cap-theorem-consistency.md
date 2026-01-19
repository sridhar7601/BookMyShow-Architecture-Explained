# CAP Theorem in Ticket Booking

The **CAP Theorem** states that a distributed system can only provide two of three guarantees:
1.  **C**onsistency (Every read receives the most recent write or an error)
2.  **A**vailability (Every request receives a (non-error) response, without the guarantee that it contains the most recent write)
3.  **P**artition Tolerance (The system continues to operate despite an arbitrary number of messages being dropped or delayed by the network between nodes)

Since Partition Tolerance (P) is mandatory for any distributed system over a network, we must choose between **CP** and **AP**.

## Booking System: CP or AP?

### 1. Seat Selection & Payment (Must be CP)
When a user selects "Seat A1":
*   **Scenario:** Two users click "Book" at the same time.
*   **Requirement:** The system **MUST** ensure only one succeeds. It is better to show an error to User B ("System Busy" or "Seat Taken") than to allow a double booking.
*   **Decision:** **Consistency (CP)**. We sacrifice Availability (some users might get errors during network partitions) to ensure no two people own the same seat.

### 2. Movie Listings & Reviews (Can be AP)
When a server is down or sync is delayed:
*   **Scenario:** A new review is posted in Mumbai.
*   **Requirement:** Accessing the review from Delhi 5 seconds later.
*   **Decision:** **Availability (AP)**. It is okay if the review shows up 1 minute later (Eventual Consistency). It is NOT okay to show a "Database Error" page just because the reviews aren't perfectly synced.

## Hybrid Approach

BookMyShow is a hybrid system:
*   **Browsing Flow:** Highly Available (AP). Uses CDNs, Replicas, Caching.
*   **Booking Flow:** Strictly Consistent (CP). Uses Master DBs, Redis Locks, Transaction Isolation.

## Our Simulation

Our `api/book-secure` implementation enforces **CP**.
If Redis (our lock manager) is unreachable, the booking **fails**. We do not allow a "tentative" booking to proceed without a lock, prioritizing data correctness over uptime.
