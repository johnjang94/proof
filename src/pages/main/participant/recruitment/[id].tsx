"use client";

import { useRouter } from "next/router";
import { useState, useRef } from "react";
import { apiFetch } from "@/lib/apiFetch";

type FormField = {
  role: string;
  portfolio: string;
  reason: string;
};

const ROLE_OPTIONS = [
  "Product Designer",
  "UI/UX Designer",
  "Developer",
  "Product Manager",
  "Marketer",
  "Business / Strategy",
  "Other",
];

export default function RecruitmentEarlyAccess() {
  const router = useRouter();
  const { id } = router.query;
  const formRef = useRef<HTMLDivElement>(null);

  const [fields, setFields] = useState<FormField>({
    role: "",
    portfolio: "",
    reason: "",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = () => {
    if (!fields.role) return;

    void router.push(`/project/participant/application/success/${id}`);

    apiFetch(`/early-access/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    }).catch(console.error);
  };

  const isValid = !!fields.role;

  return (
    <div className="proof-page">
      <style>{styles}</style>

      {/* ── Urgency ── */}
      <section className="urgency">
        <div className="section-inner urgency-inner">
          <div className="urgency-text">
            <div className="urgency-badge">Limited First Cohort</div>
            <h2 className="urgency-title">
              Early members get first access
              <br />
              to project opportunities.
            </h2>
            <p className="urgency-sub">
              We are opening PROOF to a carefully selected first group. Early
              members receive priority matching to incoming projects and help
              shape how the platform works.
            </p>
            <ul className="urgency-list">
              <li>✦ Priority access to all incoming projects</li>
              <li>✦ Direct feedback channel to the PROOF team</li>
              <li>✦ First cohort badge on your profile</li>
            </ul>
            <button
              type="button"
              onClick={() =>
                formRef.current?.scrollIntoView({ behavior: "smooth" })
              }
              className="btn-primary urgency-cta"
            >
              Apply for Early Access →
            </button>
          </div>
          <div className="urgency-visual">
            <div className="cohort-card">
              <p className="cohort-label">First Cohort</p>
              <div className="cohort-bar-wrap">
                <div className="cohort-bar">
                  <div className="cohort-fill" />
                </div>
                <span className="cohort-note">Spots filling</span>
              </div>
              <p className="cohort-cta-note">Apply now to secure your place.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Form ── */}
      <section className="form-section" ref={formRef}>
        <div className="section-inner form-inner">
          <div className="form-header">
            <p className="section-eyebrow">Apply for Early Access</p>
            <h2 className="section-title">
              Join the waitlist.
              <br />
              Be first.
            </h2>
            <p className="form-sub">
              Tell us a little about yourself. We review every application
              personally.
            </p>
          </div>

          <div className="form-card">
            <div className="form-fields">
              <div className="field">
                <label className="field-label">
                  Role of Interest <span className="required">*</span>
                </label>
                <select
                  name="role"
                  value={fields.role}
                  onChange={handleChange}
                  className="field-input field-select"
                >
                  <option value="">Select your role</option>
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label className="field-label">
                  LinkedIn or Portfolio
                  <span className="optional"> (optional)</span>
                </label>
                <input
                  name="portfolio"
                  value={fields.portfolio}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                  className="field-input"
                />
              </div>

              <div className="field">
                <label className="field-label">
                  Why do you want early access?
                  <span className="optional"> (optional)</span>
                </label>
                <textarea
                  name="reason"
                  value={fields.reason}
                  onChange={handleChange}
                  rows={4}
                  placeholder="What are you hoping to prove? What kind of projects excite you?"
                  className="field-input field-textarea"
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!isValid}
                className="btn-primary btn-full"
              >
                Apply for Early Access →
              </button>
              <p className="form-disclaimer">
                No spam. No credit card. Just PROOF.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:wght@300;400;500;600&display=swap');

  :root {
    --emerald: #34a67a;
    --emerald-light: #e8f5ee;
    --amber: #e6a640;
    --ink: #111111;
    --ink-2: #333333;
    --muted: #6b7280;
    --border: #e5e7eb;
    --surface: #ffffff;
    --bg: #f7f9f7;
    --radius-card: 20px;
    --radius-sm: 12px;
  }

  .proof-page {
    font-family: 'DM Sans', sans-serif;
    background: var(--bg);
    color: var(--ink);
    min-height: 100vh;
    overflow-x: hidden;
  }

  .section-inner {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 40px;
  }
  .section-eyebrow {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: var(--emerald);
    margin-bottom: 12px;
  }
  .section-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(28px, 4vw, 42px);
    line-height: 1.15;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin-bottom: 16px;
  }
  .urgency { padding: 80px 0; }
  .urgency-inner {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: center;
  }
  .urgency-badge {
    display: inline-block;
    background: #fff8ec;
    border: 1px solid rgba(230,166,64,0.3);
    color: var(--amber);
    border-radius: 100px;
    padding: 6px 14px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .urgency-title {
    font-family: 'DM Serif Display', serif;
    font-size: clamp(26px, 3.5vw, 38px);
    line-height: 1.2;
    letter-spacing: -0.025em;
    color: var(--ink);
    margin-bottom: 18px;
  }
  .urgency-sub {
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    margin-bottom: 28px;
    font-weight: 300;
  }
  .urgency-list {
    list-style: none;
    padding: 0; margin: 0 0 32px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .urgency-list li {
    font-size: 14px;
    font-weight: 500;
    color: var(--ink-2);
  }
  .urgency-cta { margin-top: 4px; }
  .cohort-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-card);
    padding: 32px 28px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.06);
  }
  .cohort-label {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 20px;
  }
  .cohort-bar-wrap { margin-bottom: 24px; }
  .cohort-bar {
    height: 8px;
    background: var(--border);
    border-radius: 100px;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .cohort-fill {
    height: 100%;
    width: 68%;
    background: linear-gradient(90deg, var(--emerald), #5bc49a);
    border-radius: 100px;
    animation: fillBar 1.8s ease-out both;
  }
  @keyframes fillBar {
    from { width: 0; }
    to { width: 68%; }
  }
  .cohort-note {
    font-size: 12px;
    color: var(--muted);
    font-weight: 500;
  }
  .cohort-cta-note {
    font-size: 14px;
    font-weight: 600;
    color: var(--ink);
    padding: 16px 0 0;
    border-top: 1px solid var(--border);
  }
  .form-section {
    padding: 80px 0;
    background: var(--surface);
    border-top: 1px solid var(--border);
  }
  .form-inner {
    display: grid;
    grid-template-columns: 1fr 1.4fr;
    gap: 60px;
    align-items: start;
  }
  .form-sub {
    font-size: 15px;
    line-height: 1.7;
    color: var(--muted);
    font-weight: 300;
  }
  .form-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 24px;
    padding: 32px;
  }
  .form-fields { display: flex; flex-direction: column; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--ink-2);
    letter-spacing: 0.01em;
  }
  .required { color: #e05252; }
  .optional { color: var(--muted); font-weight: 400; }
  .field-input {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 11px 14px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    color: var(--ink);
    outline: none;
    transition: border-color 0.15s;
    width: 100%;
    box-sizing: border-box;
  }
  .field-input::placeholder { color: #c4c9d4; }
  .field-input:focus { border-color: #9ab8d8; background: #fff; }
  .field-select { appearance: none; cursor: pointer; }
  .field-textarea { resize: none; }
  .form-actions { margin-top: 20px; }
  .form-disclaimer {
    text-align: center;
    font-size: 12px;
    color: var(--muted);
    margin-top: 12px;
  }
  .btn-primary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--ink);
    color: #fff;
    border: none;
    border-radius: 100px;
    padding: 14px 28px;
    font-family: 'DM Sans', sans-serif;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.15s;
    letter-spacing: -0.01em;
  }
  .btn-primary:hover { opacity: 0.88; transform: translateY(-1px); }
  .btn-primary:active { transform: scale(0.99); }
  .btn-primary:disabled { opacity: 0.3; cursor: not-allowed; transform: none; }
  .btn-full { width: 100%; border-radius: 14px; }

  @media (max-width: 768px) {
    .section-inner { padding: 0 20px; }
    .urgency { padding: 60px 0; }
    .urgency-inner { grid-template-columns: 1fr; gap: 40px; }
    .form-section { padding: 60px 0; }
    .form-inner { grid-template-columns: 1fr; gap: 36px; }
  }
`;
