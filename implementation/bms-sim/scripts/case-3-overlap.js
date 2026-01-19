
// Native fetch

async function runCase3() {
    console.log('🚀 Starting Case 3: Overlapping Seats...');

    const API_URL = 'http://localhost:3000/api/book-secure';
    const SHOW_ID = 1;
    const U1_SEATS = [21, 22];
    const U2_SEATS = [22, 23]; // Overlap on 22

    console.log(`User 1 Requesting: ${U1_SEATS}`);
    console.log(`User 2 Requesting: ${U2_SEATS}`);

    // Fire both almost simultaneously
    const p1 = fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User1', showId: SHOW_ID, seatIds: U1_SEATS })
    }).then(r => r.json());

    const p2 = fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'User2', showId: SHOW_ID, seatIds: U2_SEATS })
    }).then(r => r.json());

    const [res1, res2] = await Promise.all([p1, p2]);

    console.log('User 1 Result:', res1.success ? 'Success' : res1.error);
    console.log('User 2 Result:', res2.success ? 'Success' : res2.error);

    if ((res1.success && !res2.success) || (!res1.success && res2.success)) {
        console.log('✅ Case 3 Passed: One user succeeded, other failed due to overlap.');
    } else if (!res1.success && !res2.success) {
        console.log('⚠️  Both failed (Maybe race on DB?) - Still acceptable as no double booking.');
    } else {
        console.log('❌ Case 3 Failed: BOTH SUCCEEDED (Double Booking!)');
    }
}
runCase3();
