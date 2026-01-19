
// Native fetch

async function runSimulation() {
    console.log('🚀 Starting Race Condition Simulation (SECURE API)...');

    const API_URL = 'http://localhost:3000/api/book-secure'; // TARGETING SECURE API
    const SHOW_ID = 1;
    const SEAT_IDS = [6]; // Target Seat A6 (Different from previous test)
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
    const lockFailures = failures.filter(r => r.data?.error?.includes('already held') || r.data?.error?.includes('booked'));

    console.log('\n--- 📊 Simulation Results ---');
    console.log(`Total Requests: ${CONCURRENT_USERS}`);
    console.log(`✅ Successful Bookings: ${successes.length}`);
    console.log(`❌ Failed Bookings:     ${failures.length}`);
    console.log(`🔒 Lock Collisions:     ${lockFailures.length}`);

    if (successes.length === 1) {
        console.log('\n✅ SUCCESS: SYSTEM SECURED!');
        console.log('Only 1 user managed to book. Everyone else got locked out.');
    } else if (successes.length === 0) {
        console.log('\n⚠️  WARNING: ALL FAILED (Maybe DB error?)');
    } else {
        console.log('\n❌ FAILURE: DOUBLE BOOKING STILL EXISTS!');
        console.log(`${successes.length} users succeeded.`);
    }
}

runSimulation();
