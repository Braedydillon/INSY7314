import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, routes } from "../services/api.js";
import {
  PageHeading,
  Loading,
  Empty,
  Alert,
  Status,
} from "../components/UI.jsx";
import { listOf, money, dateText, idOf } from "../utils/format.js";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState("");

  async function refresh() {
    const data = await api.get(routes.myBookings);
    setBookings(listOf(data, "bookings"));
  }

  useEffect(() => {
    let active = true;

    api
      .get(routes.myBookings)
      .then((data) => {
        if (active) {
          setBookings(listOf(data, "bookings"));
        }
      })
      .catch((err) => {
        if (active) setError(err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function cancelBooking(booking) {
    if (!window.confirm("Cancel this booking?")) return;

    const id = idOf(booking);
    setBusyId(id);
    setError(null);

    try {
      await api.patch(`${routes.bookings}/${id}/cancel`, {});
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusyId("");
    }
  }

  return (
    <section>
      <PageHeading
        eyebrow="CLIENT DASHBOARD"
        title="My Bookings"
        subtitle="View and manage your service bookings."
      />

      <Alert error={error} />

      {loading ? (
        <Loading />
      ) : bookings.length === 0 ? (
        <Empty title="No bookings yet">
          Browse gigs and book your first service.
        </Empty>
      ) : (
        <div className="stack-list">
          {bookings.map((booking) => (
            <div key={idOf(booking)} className="booking-row">
              <div className="booking-icon">↗</div>

              <div className="booking-main">
                <strong>
                  {booking.gigId?.title ||
                    booking.tierTitle ||
                    "Service Booking"}
                </strong>

                <p>{dateText(booking.createdAt)}</p>

                <Link to={`/bookings/${idOf(booking)}`} className="small-link">
                  View Details
                </Link>
              </div>

              <strong className="booking-money">
                {money(booking.totalCents)}
              </strong>

              <Status value={booking.status} />

              {["pending", "confirmed"].includes(booking.status) && (
                <button
                  className="btn btn-outline btn-sm"
                  disabled={Boolean(busyId)}
                  onClick={() => cancelBooking(booking)}
                >
                  {busyId === idOf(booking) ? "Cancelling..." : "Cancel"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
