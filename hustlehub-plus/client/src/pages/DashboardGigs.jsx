import { useEffect, useState } from "react";
import { api, routes } from "../services/api.js";
import {
  PageHeading,
  Loading,
  Empty,
  Alert,
  Field,
  Status,
} from "../components/UI.jsx";
import { listOf, idOf, money, minTierPrice } from "../utils/format.js";

const categories = [
  "music",
  "coding",
  "writing",
  "marketing",
  "tutoring",
  "photography",
  "art",
  "design",
  "videography",
  "other",
];

function blankTier() {
  return {
    title: "",
    description: "",
    price: "",
  };
}

function blankGig() {
  return {
    title: "",
    description: "",
    category: "design",
    tiers: [blankTier()],
  };
}

export default function DashboardGigs() {
  const [gigs, setGigs] = useState([]);
  const [form, setForm] = useState(blankGig);
  const [editingId, setEditingId] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  async function refresh() {
    const data = await api.get(routes.myGigs);
    setGigs(listOf(data, "gigs"));
  }

  useEffect(() => {
    let active = true;

    api
      .get(routes.myGigs)
      .then((data) => {
        if (active) setGigs(listOf(data, "gigs"));
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

  function newGig() {
    setForm(blankGig());
    setEditingId("");
    setError(null);
    setShowForm(true);
  }

  function editGig(gig) {
    setEditingId(idOf(gig));
    setForm({
      title: gig.title || "",
      description: gig.description || "",
      category: gig.category || "design",
      tiers: (gig.tiers || []).map((tier) => ({
        title: tier.title,
        description: tier.description || "",
        price: (tier.priceCents / 100).toFixed(2),
      })),
    });
    setError(null);
    setShowForm(true);
  }

  function updateField(event) {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateTier(index, name, value) {
    setForm((previous) => ({
      ...previous,
      tiers: previous.tiers.map((tier, i) =>
        i === index ? { ...tier, [name]: value } : tier,
      ),
    }));
  }

  function addTier() {
    if (form.tiers.length >= 3) return;

    setForm((previous) => ({
      ...previous,
      tiers: [...previous.tiers, blankTier()],
    }));
  }

  function removeTier(index) {
    if (form.tiers.length <= 1) return;

    setForm((previous) => ({
      ...previous,
      tiers: previous.tiers.filter((_, i) => i !== index),
    }));
  }

  async function submit(event) {
    event.preventDefault();
    if (busy) return;

    setError(null);

    if (form.title.trim().length < 3 || form.description.trim().length < 10) {
      setError(
        new Error(
          "Title must have at least 3 characters and description at least 10.",
        ),
      );
      return;
    }

    const invalidTier = form.tiers.some(
      (tier) =>
        tier.title.trim().length < 2 ||
        !/^\d+(\.\d{1,2})?$/.test(String(tier.price)) ||
        Number(tier.price) < 30 ||
        Number(tier.price) > 50000,
    );

    if (invalidTier) {
      setError(
        new Error(
          "Each package needs a title and a price between R30 and R50,000.",
        ),
      );
      return;
    }

    const body = {
      title: form.title.trim(),
      description: form.description.trim(),
      category: form.category,
      tiers: form.tiers.map((tier) => ({
        title: tier.title.trim(),
        description: tier.description.trim(),
        priceCents: Math.round(Number(tier.price) * 100),
      })),
    };

    setBusy(true);

    try {
      if (editingId) {
        await api.put(`${routes.gigs}/${editingId}`, body);
      } else {
        await api.post(routes.gigs, body);
      }

      await refresh();
      setShowForm(false);
      setEditingId("");
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function deleteGig(gig) {
    if (!window.confirm(`Remove "${gig.title}"?`)) return;

    setBusy(true);
    setError(null);

    try {
      await api.delete(`${routes.gigs}/${idOf(gig)}`);
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  async function restoreGig(gig) {
    setBusy(true);
    setError(null);

    try {
      await api.patch(`${routes.gigs}/${idOf(gig)}/restore`, {});
      await refresh();
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <PageHeading
        eyebrow="FREELANCER DASHBOARD"
        title="My Gigs"
        subtitle="Create and manage your services."
        actions={
          <button className="btn btn-primary" onClick={newGig}>
            + Create Gig
          </button>
        }
      />

      <Alert error={error} />

      {showForm && (
        <div className="content-card gig-editor">
          <div className="form-header">
            <h2>{editingId ? "Edit Gig" : "Create Gig"}</h2>

            <button
              className="btn btn-outline btn-sm"
              onClick={() => setShowForm(false)}
            >
              Close
            </button>
          </div>

          <form onSubmit={submit}>
            <Field label="Gig Title" name="title">
              <input
                id="title"
                name="title"
                value={form.title}
                maxLength={80}
                onChange={updateField}
                required
              />
            </Field>

            <Field label="Category" name="category">
              <select
                id="category"
                name="category"
                value={form.category}
                onChange={updateField}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Description" name="description">
              <textarea
                id="description"
                name="description"
                rows={5}
                maxLength={1000}
                value={form.description}
                onChange={updateField}
                required
              />
            </Field>

            <div className="tiers-editor">
              <div className="form-header">
                <h3>Service Packages</h3>

                <button
                  className="btn btn-outline btn-sm"
                  type="button"
                  disabled={form.tiers.length >= 3}
                  onClick={addTier}
                >
                  + Add Package
                </button>
              </div>

              {form.tiers.map((tier, index) => (
                <div className="tier-editor-card" key={index}>
                  <div className="form-header">
                    <strong>Package {index + 1}</strong>

                    {form.tiers.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-quiet btn-sm"
                        onClick={() => removeTier(index)}
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <Field label="Package Name" name={`tier-name-${index}`}>
                    <input
                      id={`tier-name-${index}`}
                      maxLength={40}
                      value={tier.title}
                      onChange={(e) =>
                        updateTier(index, "title", e.target.value)
                      }
                      required
                    />
                  </Field>

                  <Field
                    label="Package Description"
                    name={`tier-description-${index}`}
                  >
                    <input
                      id={`tier-description-${index}`}
                      maxLength={200}
                      value={tier.description}
                      onChange={(e) =>
                        updateTier(index, "description", e.target.value)
                      }
                    />
                  </Field>

                  <Field label="Price (Rand)" name={`tier-price-${index}`}>
                    <input
                      id={`tier-price-${index}`}
                      type="number"
                      min="30"
                      max="50000"
                      step="0.01"
                      value={tier.price}
                      onChange={(e) =>
                        updateTier(index, "price", e.target.value)
                      }
                      required
                    />
                  </Field>
                </div>
              ))}
            </div>

            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Save Changes" : "Create Gig"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <Loading />
      ) : gigs.length === 0 ? (
        <Empty title="No gigs yet">
          Create your first service to get started.
        </Empty>
      ) : (
        <div className="stack-list">
          {gigs.map((gig) => (
            <div className="booking-row" key={idOf(gig)}>
              <div className="booking-main">
                <strong>{gig.title}</strong>

                <p>
                  {gig.category} · From {money(minTierPrice(gig) ?? 0)}
                </p>
              </div>

              <Status value={gig.status || "active"} />

              <div className="row-actions">
                {gig.status === "removed" ? (
                  <button
                    className="btn btn-outline btn-sm"
                    disabled={busy}
                    onClick={() => restoreGig(gig)}
                  >
                    Reactivate
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => editGig(gig)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-outline btn-sm"
                      disabled={busy}
                      onClick={() => deleteGig(gig)}
                    >
                      Remove
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
