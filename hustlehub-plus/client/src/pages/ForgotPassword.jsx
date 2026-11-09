import { useState } from "react";
import { Link } from "react-router-dom";
import { api, routes } from "../services/api.js";
import { Alert, Field } from "../components/UI.jsx";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sentMessage, setSentMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await api.post(routes.forgotPassword, {
        email: email.trim().toLowerCase(),
      });
      setSentMessage(data.message);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">HUSTLEHUB PLUS</p>
        <h1>
          Forgot your <em>password?</em>
        </h1>
        <p>
          Enter your email and follow the link you recieve to change your
          password.
        </p>
      </section>

      <section className="form-panel">
        <h2>Reset Password</h2>

        {sentMessage ? (
          <>
            <Alert kind="success">{sentMessage}</Alert>
            <p className="text-muted">Check your inbox.</p>
          </>
        ) : (
          <>
            <Alert error={error} />

            <form onSubmit={submit}>
              <Field label="Email" name="email">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </Field>

              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </>
        )}

        <p className="text-muted">
          <Link to="/login" className="text-link">
            Back to log in
          </Link>
        </p>
      </section>
    </div>
  );
}
