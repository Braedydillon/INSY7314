import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { api, routes } from "../services/api.js";
import { Alert, Field } from "../components/UI.jsx";

function tokenFromHash(hash) {
  return new URLSearchParams(hash.replace(/^#/, "")).get("token") || "";
}

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const [token] = useState(() => tokenFromHash(location.hash));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (location.hash) {
      window.history.replaceState(null, "", location.pathname);
    }
  }, [location.hash, location.pathname]);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setErrors({});

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match." });
      return;
    }

    setLoading(true);

    try {
      await api.post(routes.resetPassword, { token, password });

      navigate("/login", {
        replace: true,
        state: {
          message:
            "Your password has been reset. Please log in with your new password.",
        },
      });
    } catch (err) {
      setError(err);
      setErrors(err.fieldErrors || {});
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-layout">
      <section className="auth-intro">
        <p className="eyebrow">HUSTLEHUB PLUS</p>
        <h1>
          Choose a new <em>password.</em>
        </h1>
        <p>
          Once youre password is changed you will be logged out. Use the new
          password to login.
        </p>
      </section>

      <section className="form-panel">
        <h2>New Password</h2>

        {!token ? (
          <Alert>This reset link is invalid or incomplete.</Alert>
        ) : (
          <>
            <Alert error={errors.token ? new Error(errors.token) : error} />

            <form onSubmit={submit}>
              <Field
                label="New password"
                name="password"
                error={errors.password}
                hint="At least 12 characters, with an uppercase letter, a lowercase letter, a number and a symbol."
              >
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </Field>

              <Field
                label="Confirm new password"
                name="confirmPassword"
                error={errors.confirmPassword}
              >
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </Field>

              <button
                className="btn btn-primary btn-block"
                type="submit"
                disabled={loading}
              >
                {loading ? "Saving..." : "Reset Password"}
              </button>
            </form>
          </>
        )}

        <p className="text-muted">
          <Link to="/forgot-password" className="text-link">
            Request a new reset link
          </Link>
        </p>
      </section>
    </div>
  );
}
