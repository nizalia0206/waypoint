const RESEARCH = [
  "Willingness to help rarely turns into action — near-universal openness among alumni almost never becomes a real conversation, because there's no easy way for a student to start one.",
  "Career guidance today depends on informal luck: who's in your class, your family, or your friend group — not your actual major or goals — leaving students without those connections quietly behind.",
  `The gap compounds for first-generation students, who also lack the unwritten "hidden curriculum" — how office hours work, what to wear to a career fair — that continuing-generation students absorb without ever being taught it directly.`,
];

export default function ProblemSolution() {
  return (
    <section id="problem-solution">
      <div className="wrap">
        <div className="section-head">
          <h2>Why Waypoint needs to exist.</h2>
        </div>

        <div className="ps-block">
          <h4>The Problem</h4>
          <p className="ps-drop">
            University students constantly hit a "who do I even ask" wall. Choosing a career path, prepping
            for an interview, understanding how someone got from a major into a real job — the guidance that
            would help almost never reaches the student who needs it, because it lives inside whoever happens
            to already be in their circle.
          </p>
        </div>

        <div className="ps-stat-row">
          <div className="ps-stat"><b>92%</b><span>of alumni say they'd help a student they've never met</span></div>
          <div className="ps-stat"><b>15%</b><span>of students report ever actually reaching out</span></div>
          <div className="ps-stat"><b>9%</b><span>of graduates found their alumni network genuinely helpful</span></div>
        </div>

        <div className="ps-block">
          <h4>Mini Research</h4>
          <ol className="research-list">
            {RESEARCH.map((r, i) => (
              <li key={i}>
                <span className="mile">{String(i + 1).padStart(2, '0')}</span>
                <div>{r}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="ps-block">
          <h4>The Solution</h4>
          <p style={{ fontSize: '15.5px', lineHeight: 1.7, maxWidth: '70ch' }}>
            Waypoint asks a student for one thing: their goal. It finds a peer or alum from their own
            university whose path led exactly there, lays out their real journey as a timeline instead of a
            profile, and turns that into a structured, scheduled mentorship — a 15-minute chat, a mock
            interview — with the mentor's own milestones becoming a checklist the student can follow. Mentors
            earn Trail Points and badges for helpful notes and completed calls, redeemable for real perks like
            campus discounts, a free resume review, or a verified mentor badge for their own resume.
          </p>
        </div>

        <div className="ps-block">
          <h4>Why It Matters</h4>
          <p style={{ fontSize: '15.5px', lineHeight: 1.7, maxWidth: '70ch' }}>
            Waypoint can't guarantee every message gets a reply — no platform can promise that. What it
            removes are the two real barriers to ever reaching out at all: not knowing who to ask, and not
            knowing how to ask well. By staying inside one university, and by starting from a goal instead of
            a profile, Waypoint turns mentorship from something left to chance into a trail anyone can
            actually follow.
          </p>
          <div className="ps-callout">Built for RIT Dubai · DesignAthon 2026 — a solo UI/UX prototype.</div>
        </div>
      </div>
    </section>
  );
}
