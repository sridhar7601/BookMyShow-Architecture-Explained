# References & Further Reading

These resources were used to understand the architecture of BookMyShow and similar high-concurrency booking systems.

## BookMyShow Engineering
*   **[BookMyShow Tech Blog](https://medium.com/bookmyshow-tech)** - Official engineering blog on Medium.
*   **[Handling High Traffic at BookMyShow](https://medium.com/bookmyshow-tech/how-bookmyshow-handled-high-traffic-for-avengers-endgame-72e50z7f2b1d)** - (Example/Conceptual) Insights into handling blockbuster releases like Avengers.
*   **[Varnish at BookMyShow](https://info.varnish-software.com/blog/bookmyshow-uses-varnish-plus-handle-high-traffic-spikes)** - How they use Varnish for caching.

## System Design Concepts
*   **[Redis Distributed Locks (Redlock)](https://redis.io/docs/manual/patterns/distributed-locks/)** - Official guide on how to implement locking with Redis.
*   **[Thundering Herd Problem](https://en.wikipedia.org/wiki/Thundering_herd_problem)** - Wikipedia article on the cache stampede problem.
*   **[PostgreSQL Concurrency Control](https://www.postgresql.org/docs/current/mvcc.html)** - Understanding MVCC in Postgres.

## Similar Case Studies
*   **[Hotstar Tech Blog](https://blog.hotstar.com/)** - Handling millions of concurrent users during IPL cricket matches.
*   **[Uber Architecture](https://www.uber.com/en-IN/blog/engineering/)** - Real-time dispatch and locking.
