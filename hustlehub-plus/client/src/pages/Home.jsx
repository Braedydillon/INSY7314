
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">WELCOME TO HUSTLEHUB PLUS</p>

          <h1>
            Find talent. <em>Build your hustle.</em>
          </h1>

          <p>
            Hire skilled freelancers or earn money
            offering your own services.
          </p>

          <div className="hero-cta">
            <Link className="btn btn-primary" to="/gigs">
              Browse Gigs
            </Link>

            <Link className="btn btn-outline" to="/register">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      <div className="benefits">
        <div>
          <strong>Find Services</strong>
          <span>Discover talented freelancers</span>
        </div>

        <div>
          <strong>Book Gigs</strong>
          <span>Choose a package that suits you</span>
        </div>

        <div>
          <strong>Earn Money</strong>
          <span>Offer your skills to clients</span>
        </div>
      </div>
    </div>
  )
}
