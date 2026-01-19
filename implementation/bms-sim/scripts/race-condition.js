
// Node 18+ has native fetch


async function runSimulation() {
    console.log('🚀 Starting Race Condition Simulation (Naive API)...');

    const API_URL = 'http://localhost:3000/api/book-naive';
    const SHOW_ID = 1;
    const SEAT_IDS = [5]; // Target Seat A5 (ID 5 usually)
    const CONCURRENT_USERS = 30;

    console.log(`Target: Booking Seat ${SEAT_IDS} for Show ${SHOW_ID} with ${CONCURRENT_USERS} concurrent users.`);

    const requests = [];

    for (let i = 0; i < CONCURRENT_USERS; i++) {
        const userId = `user-sim-${i}`;
        const p = fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId,
                showId: SHOW_ID,
                seatIds: SEAT_IDS
            })
        })
            .then(res => res.json().then(data => ({ status: res.status, data, userId })))
            .catch(err => ({ status: 500, error: err, userId }));

        requests.push(p);
    }

    const results = await Promise.all(requests);

    const successes = results.filter(r => r.data?.success);
    const failures = results.filter(r => !r.data?.success);

    console.log('\n--- 📊 Simulation Results ---');
    console.log(`Total Requests: ${CONCURRENT_USERS}`);
    console.log(`✅ Successful Bookings: ${successes.length}`);
    console.log(`❌ Failed Bookings:     ${failures.length}`);

    if (successes.length > 1) {
        console.log('\n⚠️  CRITICAL FAILURE: DOUBLE BOOKING DETECTED!');
        console.log(`${successes.length} people successfully booked the exact same seat.`);
        console.log('This proves the Race Condition exists in the Naive implementation.');
    } else {
        console.log('\n✅ System handled it correctly (Only 1 booking).');
    }
}

runSimulation();
