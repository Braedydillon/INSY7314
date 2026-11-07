import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { api, routes } from "../services/api.js";
import { PageHeading, Loading, Alert } from "../components/UI.jsx";
import { money } from "../utils/format.js";

const percent = (rate) => `${(rate * 100).toFixed(1)}%`;

function bandLabel(band) {
  const from = money(band.fromCents);
  return band.toCents == null
    ? `${from} and above`
    : `${from} – ${money(band.toCents)}`;
}

export default function DashboardIncome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;

    api
      .get(routes.tax)
      .then((result) => {
        if (active) setData(result);
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

  if (loading) return <Loading />;
  if (error) return <Alert error={error} />;

  const {
    taxYear,
    incomeCents,
    projectedCents,
    estimate,
    projectedEstimate,
    monthly,
  } = data;

  const chartData = monthly.map((row) => ({
    month: row.month,
    income: row.completedCents / 100,
  }));

  return (
    <section>
      <PageHeading
        eyebrow="FREELANCER DASHBOARD"
        title="Income and Tax"
        subtitle={`Your earnings and estimated tax for ${taxYear.label}.`}
      />

      <div className="stats-grid">
        <div className="stat-card">
          <span>Income this tax year</span>
          <strong>{money(incomeCents)}</strong>
          <small>From completed bookings</small>
        </div>

        <div className="stat-card">
          <span>Estimated tax</span>
          <strong>{money(estimate.taxCents)}</strong>
          <small>Effective rate {percent(estimate.effectiveRate)}</small>
        </div>

        <div className="stat-card">
          <span>Projected income</span>
          <strong>{money(incomeCents + projectedCents)}</strong>
          <small>
            Including {money(projectedCents)} in pending and confirmed bookings
          </small>
        </div>

        <div className="stat-card">
          <span>Tax rate</span>
          <strong>{percent(projectedEstimate.marginalRate)}</strong>
          <small>Projected tax {money(projectedEstimate.taxCents)}</small>
        </div>
      </div>

      <div className="content-card chart-card">
        <h2>Income by month</h2>

        <div
          className="chart-wrap"
          role="img"
          aria-label="Bar chart of completed income per month"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `R${value / 1000}k`} />
              <Tooltip formatter={(value) => money(value * 100)} />
              <Bar
                dataKey="income"
                name="Income"
                fill="#17694a"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="content-card">
        <h2>Tax calculation break down</h2>

        <table className="tax-table">
          <thead>
            <tr>
              <th>Tax band</th>
              <th>Rate</th>
              <th>Income in band</th>
              <th>Tax</th>
            </tr>
          </thead>
          <tbody>
            {estimate.bands.map((band) => (
              <tr
                key={band.fromCents}
                className={band.taxableCents > 0 ? "band-used" : ""}
              >
                <td>{bandLabel(band)}</td>
                <td>{percent(band.rate)}</td>
                <td>{money(band.taxableCents)}</td>
                <td>{money(band.taxCents)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan="3">Tax before rebate</td>
              <td>{money(estimate.grossTaxCents)}</td>
            </tr>
            <tr>
              <td colSpan="3">Primary rebate</td>
              <td>−{money(estimate.rebateCents)}</td>
            </tr>
            <tr>
              <td colSpan="3">
                <strong>Estimated tax</strong>
              </td>
              <td>
                <strong>{money(estimate.taxCents)}</strong>
              </td>
            </tr>
          </tfoot>
        </table>

        <ul className="tax-assumptions">
          <li>
            Uses the SARS individual income tax tables for {taxYear.label}{" "}
          </li>
          <li>Applies the primary rebate for taxpayers under 65.</li>
          <li>
            Does not include expenses, deductions, tax credits or income earned
            outside HustleHub.
          </li>
          <li>
            This is purely an estimate. DO NOT rely on this for tax planning.
          </li>
        </ul>
      </div>
    </section>
  );
}
