export default function Home() {
  return (
    <main className="shell">
      <section className="panel">
        <p className="eyebrow">Next.js API</p>
        <h1>http status lookup</h1>
        <form className="lookup" action="/api/status" method="get">
          <label htmlFor="url">Gallery URL or gallery ID</label>
          <div className="row">
            <input
              id="url"
              name="url"
              placeholder="https://soujpa.in/start/3918588/3918588_9.avif"
              required
            />
            <button type="submit">Get Status</button>
          </div>
        </form>
        <div className="examples">
          <code>/api/status?url=https%3A%2F%2Fsoujpa.in%2Fstart%2F3918588%2F3918588_9.avif</code>
        </div>
      </section>
    </main>
  );
}
