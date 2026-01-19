# Concurrency Control & Locking

This project simulates two Booking Architectures to demonstrate the "Double Booking" problem and its solution.

## 1. The Naive Approach (Race Condition)

In the naive implementation, we check for seat availability and then book it in two separate database steps. This creates a "gap" where multiple concurrent requests can all see the seat as "Available" before anyone has booked it.

```mermaid
sequenceDiagram
    participant UserA
    participant UserB
    participant API
    participant DB

    UserA->>API: Book Seat 10
    UserB->>API: Book Seat 10
    
    API->>DB: Check Seat 10 Status (User A)
    API->>DB: Check Seat 10 Status (User B)
    
    DB-->>API: Available (User A)
    DB-->>API: Available (User B)
    
    Note over API: Both users think seat is free!
    
    API->>DB: INSERT Booking (User A)
    DB-->>API: Success (User A)
    
    API->>DB: INSERT Booking (User B)
    DB-->>API: Success (User B)
    
    Note right of DB: DOUBLE BOOKING ❌
```

## 2. The Secure Approach (Redis Distributed Lock)

To fix this, we implement a **Pessimistic Locking** strategy using Redis. Before even checking the database, a user must acquire a unique lock on the specific seat ID.

We use the Redis command: `SET lock:seat:{id} {userId} NX EX 600`
- **NX**: Only set if **N**ot e**X**ists (Atomic lock acquisition)
- **EX**: **Ex**pire in 600 seconds (TTL to prevent deadlocks)

```mermaid
sequenceDiagram
    participant UserA
    participant UserB
    participant API
    participant Redis
    participant DB

    UserA->>API: Book Seat 10
    UserB->>API: Book Seat 10
    
    Note over API: Attempt to Acquire Lock
    
    API->>Redis: SET lock:seat:10 UserA NX
    Redis-->>API: OK (Lock Acquired)
    
    API->>Redis: SET lock:seat:10 UserB NX
    Redis-->>API: NULL (Lock Failed)
    
    API-->>UserB: Error: Seat is currently being booked by someone else
    
    Note right of UserB: User B is blocked ✅
    
    Note over API: User A proceeds exclusively
    
    API->>DB: Check Seat 10 Status
    DB-->>API: Available
    API->>DB: INSERT Booking (User A)
    DB-->>API: Success
    
    API->>Redis: DEL lock:seat:10
    API-->>UserA: Booking Confirmed
```

## Comparisons

| Feature | Naive Approach | Distributed Locking (Redis) |
| :--- | :--- | :--- |
| **Consistency** | Low (Classic Double Booking) | High (Strict Serialization) |
| **Performance** | High (No locking overhead) | Medium (Network call to Redis) |
| **User Experience** | Bad (Booking failures after payment) | Good (Fast failure if seat is taken) |
| **Scaling** | Fails at scale | Scales well with Redis Cluster |
