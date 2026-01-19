
# BookMyShow Simulation (BMS-Sim)

This project is a **learning simulation** of the BookMyShow architecture, specifically focusing on handling high concurrency and distributed locking.

## 🎯 Goal
To replicate and solve the "Double Booking" problem that occurs when thousands of users try to book the same seat simultaneously.

## 🛠 Tech Stack
- **Framework**: Next.js 14+ (App Router)
- **Database**: PostgreSQL (via Prisma)
- **Caching/Locking**: Redis
- **Styling**: Tailwind CSS + Shadcn UI

## 📂 Project Structure
- `app/api/book-naive`: The "Buggy" implementation (No locking).
- `app/api/book-secure`: The "Fixed" implementation (Redis Locking).
- `scripts/`: Node.js scripts to simulate thousands of users.

## 🧪 Simulation Scenarios

### Case 1: The Race Condition (Double Booking)
Running `npm run sim:race` will fire 50 concurrent requests.
- **Naive API**: Will result in multiple bookings for the same seat.
- **Secure API**: Should result in exactly 1 success and 49 failures.

### Case 2: Lock Release / Expiry
Running `npm run sim:release` verifies that if a user locks a seat but fails payment, the lock is released for others.

### Case 3: Overlapping Seats
Running `npm run sim:overlap` verifies that you cannot book a subset of already locked seats.

## 🚀 Getting Started

1.  **Setup Environment**
    ```bash
    cp .env.example .env
    # Fill in POSTGRES_URL and REDIS_URL
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Run Database Migrations**
    ```bash
    npx prisma migrate dev
    npx prisma db seed
    ```

4.  **Run the App**
    ```bash
    npm run dev
    ```

5.  **Run Simulations**
    ```bash
    node scripts/race-condition.js
    ```
