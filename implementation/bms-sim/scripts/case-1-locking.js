
// Native fetch

async function runCase1() {
    console.log('🚀 Starting Case 1: Happy Path (Locking)...');

    const API_URL = 'http://localhost:3000/api/book-secure';
    const SHOW_ID = 1;
    const SEAT_IDS = [10]; // Seat A10

    // 1. User 1 tries to book
    // We'll treat a successful booking as proof of locking (atomic)
    console.log('User 1 requesting...');
    const res1 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User1', showId: SHOW_ID, seatIds: SEAT_IDS })
    });
    const data1 = await res1.json();
    console.log('User 1 Result:', data1);

    // 2. User 2 tries to book Same Seat IMMEDIATELY (if U1 succeeded)
    console.log('User 2 requesting same seat...');
    const res2 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User2', showId: SHOW_ID, seatIds: SEAT_IDS })
    });
    const data2 = await res2.json();
    console.log('User 2 Result:', data2);

    if (data1.success && !data2.success) {
        console.log('✅ Case 1 Passed: User 1 booked, User 2 was blocked.');
    } else {
        console.log('❌ Case 1 Failed.');
    }
}
runCase1();
