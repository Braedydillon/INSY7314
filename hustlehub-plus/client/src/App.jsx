
import { Link, Route, Routes } from 'react-router-dom'

function Home() {
  return (
    <section className="hero">
      <h1>Welcome to HustleHub Plus</h1>
      <p>
        Find local services, connect with skilled people,
        and grow your hustle.
      </p>

      <Link className="button" to="/gigs">
        Browse Gigs
      </Link>
    </section>
  )
}

function Gigs() {
  return (
    <section>
      <h1>Available Gigs</h1>
      <p>Your gigs will appear here when connected to the API.</p>
    </section>
  )
}

export default function App() {
  return (
    <>
      <header className="navbar">
        <Link to="/" className="logo">HustleHub Plus</Link>

        <nav>
          <Link to="/">Home</Link>
          <Link to="/gigs">Browse Gigs</Link>
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gigs" element={<Gigs />} />
        </Routes>
      </main>
    </>
  )
}
