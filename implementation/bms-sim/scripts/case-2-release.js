
// Native fetch

async function runCase2() {
    console.log('🚀 Starting Case 2: Lock Release (Simulated Payment Failure)...');

    const API_URL = 'http://localhost:3000/api/book-secure';
    const SHOW_ID = 1;
    const SEAT_IDS = [20]; // Seat A20

    // 1. User 1 tries to book but FAILS payment
    console.log('User 1 requesting (with simulateFailure=true)...');
    const res1 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User1', showId: SHOW_ID, seatIds: SEAT_IDS, simulateFailure: true })
    });
    const data1 = await res1.json();
    console.log('User 1 Result:', data1); // Expected: Payment Failed

    if (data1.error !== 'Payment Failed (Simulated)') {
        console.log('❌ Setup Failed: User 1 did not fail as expected.');
        return;
    }

    // 2. User 2 tries to book Same Seat IMMEDIATELY
    console.log('User 2 requesting same seat (should succeed because User 1 failed)...');
    const res2 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User2', showId: SHOW_ID, seatIds: SEAT_IDS })
    });
    const data2 = await res2.json();
    console.log('User 2 Result:', data2);

    if (data2.success) {
        console.log('✅ Case 2 Passed: User 1 lock was released, User 2 booked successfully.');
    } else {
        console.log('❌ Case 2 Failed: User 2 was blocked even though User 1 failed.');
    }
}
runCase2();
