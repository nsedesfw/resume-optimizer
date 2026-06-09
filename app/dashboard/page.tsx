'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';

export default function Dashboard() {
  const { user } = useUser();
  const [resume, setResume] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function analyze() {
    if (!resume || !jobDesc) {
      setError('Please fill in both fields.');
      return;
    }
    setLoading(true);
    setError('');
    const res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume, jobDescription: jobDesc }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Something went wrong.');
    } else {
      setResult(data);
    }
    setLoading(false);
  }

  async function handleUpgrade() {
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user?.emailAddresses[0].emailAddress,
        userId: user?.id,
      }),
    });
    const { url } = await res.json();
    window.location.href = url;
  }

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
        Resume Optimizer
      </h1>
      <p style={{ color: '#666', marginBottom: 24 }}>
        Paste your resume and job description to get an ATS score, rewritten bullets, and a cover letter.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Your resume
          </label>
          <textarea
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            placeholder="Paste your resume here..."
            style={{ width: '100%', height: 200, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>
            Job description
          </label>
          <textarea
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            placeholder="Paste the job description here..."
            style={{ width: '100%', height: 200, padding: 10, borderRadius: 8, border: '1px solid #ddd', fontSize: 13 }}
          />
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>
          {error}
          {error.includes('Upgrade') && (
            <button
              onClick={handleUpgrade}
              style={{ marginLeft: 12, background: '#2563eb', color: 'white', border: 'none', padding: '4px 12px', borderRadius: 6, cursor: 'pointer' }}
            >
              Upgrade to Pro
            </button>
          )}
        </div>
      )}

      <button
        onClick={analyze}
        disabled={loading}
        style={{ width: '100%', padding: '12px', background: '#111', color: 'white', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1 }}
      >
        {loading ? 'Analyzing...' : 'Analyze my resume'}
      </button>

      {result && (
        <div style={{ marginTop: 32 }}>
          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>
              ATS Score: {result.ats_score}/100
            </h2>
            <p style={{ color: '#2563eb', fontWeight: 500 }}>{result.score_label}</p>
            <p style={{ color: '#555', marginTop: 4 }}>{result.score_summary}</p>
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Keywords</h2>
            <div style={{ marginBottom: 10 }}>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Found</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.keywords_found?.map((k: string) => (
                  <span key={k} style={{ background: '#dcfce7', color: '#166534', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 6 }}>Missing</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {result.keywords_missing?.map((k: string) => (
                  <span key={k} style={{ background: '#fee2e2', color: '#991b1b', fontSize: 12, padding: '3px 10px', borderRadius: 20 }}>
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Rewritten Bullets</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.rewritten_bullets}</p>
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Cover Letter</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.cover_letter}</p>
          </div>

          <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 12, padding: '1.5rem' }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Things to Watch Out For</h2>
            <p style={{ fontSize: 13, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.red_flags}</p>
          </div>
        </div>
      )}
    </main>
  );
}