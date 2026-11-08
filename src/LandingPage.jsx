const Arrow = () => <span aria-hidden="true">↗</span>;

function MiniSubscription({ mark, name, detail, amount, tone }) {
  return <div className="lp-mini-sub">
    <span className="lp-brand-mark" style={{ '--tone': tone }}>{mark}</span>
    <span className="lp-mini-copy"><b>{name}</b><small>{detail}</small></span>
    <strong>{amount}</strong>
  </div>;
}

function ProductPreview() {
  return <div className="lp-preview-wrap" aria-label="Illustrative preview of the Montra dashboard">
    <div className="lp-preview-glow" />
    <div className="lp-preview-window">
      <div className="lp-preview-topbar">
        <div className="lp-preview-brand"><i>M</i><b>Montra</b></div>
        <div className="lp-preview-dots"><span /><span /><span /></div>
      </div>
      <div className="lp-preview-content">
        <div className="lp-preview-welcome"><div><small>YOUR SUBSCRIPTIONS</small><h3>Good afternoon.</h3><p>Here’s what’s coming up.</p></div><span className="lp-preview-date">This month</span></div>
        <div className="lp-preview-summary">
          <div><small>MONTHLY COMMITMENT</small><strong>₱1,905</strong><span>Across 6 active subscriptions</span></div>
          <div className="lp-preview-ring"><span>76%<small>of budget</small></span></div>
        </div>
        <div className="lp-preview-list-head"><b>Your subscriptions</b><small>View all&nbsp; →</small></div>
        <div className="lp-preview-list">
          <MiniSubscription mark="N" name="Netflix" detail="Renews in 2 days" amount="₱549" tone="#E74B59" />
          <MiniSubscription mark="♫" name="Spotify" detail="Renews in 5 days" amount="₱149" tone="#1DAD72" />
          <MiniSubscription mark="▶" name="YouTube Premium" detail="Renews in 9 days" amount="₱159" tone="#E84B4B" />
        </div>
      </div>
    </div>
    <div className="lp-float-note"><span>✓</span><div><b>All in one place</b><small>Your subscriptions, organized.</small></div></div>
  </div>;
}

const features = [
  { icon: '▦', title: 'One clear overview', copy: 'See all your subscriptions in one place, with the details that matter at a glance.', tone: 'violet' },
  { icon: '◷', title: 'Keep renewals in view', copy: 'Keep upcoming billing dates visible with a calendar built around your subscriptions.', tone: 'blue' },
  { icon: '↗', title: 'Understand your spending', copy: 'See monthly and yearly estimates so recurring costs are easier to plan for.', tone: 'green' },
  { icon: '⌁', title: 'Stay in control', copy: 'Update, pause, or mark subscriptions as cancelled as your needs change.', tone: 'amber' },
];

export default function LandingPage() {
  return <div className="landing-page">
    <header className="lp-header">
      <a className="lp-logo" href="#top" aria-label="Montra home"><i>M</i><span>Montra</span></a>
      <nav className="lp-nav" aria-label="Landing page"><a href="#features">Features</a><a href="#how-it-works">How it works</a></nav>
      <a className="lp-header-cta" href="#/overview">Open app <Arrow /></a>
    </header>

    <main id="top">
      <section className="lp-hero">
        <div className="lp-hero-copy">
          <div className="lp-eyebrow"><span /> A clearer view of your recurring expenses</div>
          <h1>Subscriptions,<br /><em>under control.</em></h1>
          <p className="lp-hero-lede">All your subscriptions in one simple place. Keep track of renewals, understand your spending, and make every recurring expense count.</p>
          <div className="lp-hero-actions"><a className="lp-primary" href="#/overview">Start tracking <Arrow /></a><a className="lp-secondary" href="#features">Explore features <span>↓</span></a></div>
          <div className="lp-proof"><span className="lp-proof-check">✓</span><span>Simple to use</span><i /> <span>No bank connection required</span></div>
        </div>
        <ProductPreview />
      </section>

      <section className="lp-trust-strip" aria-label="Montra benefits"><span>MADE TO KEEP THINGS SIMPLE</span><b>Every subscription.</b><b>One clear picture.</b><b>Your money, your call.</b></section>

      <section className="lp-features" id="features">
        <div className="lp-section-intro"><span className="lp-kicker">A BETTER WAY TO KEEP TRACK</span><h2>Clarity for the things<br />you pay for regularly.</h2><p>Small recurring payments can add up. Montra helps you see them clearly, without adding complexity.</p></div>
        <div className="lp-feature-grid">{features.map((f) => <article className="lp-feature" key={f.title}><div className={'lp-feature-icon ' + f.tone}>{f.icon}</div><h3>{f.title}</h3><p>{f.copy}</p></article>)}</div>
      </section>

      <section className="lp-how" id="how-it-works">
        <div className="lp-how-copy"><span className="lp-kicker">GET STARTED IN MINUTES</span><h2>Less keeping track.<br />More peace of mind.</h2><p>Getting organized doesn't need to be another project. Add what you already pay for and let Montra bring the details together.</p><a className="lp-text-link" href="#/overview">Go to your dashboard <Arrow /></a></div>
        <div className="lp-steps">
          <article><span>01</span><div><h3>Add your subscriptions</h3><p>Enter the services you use, how much they cost, and when they renew.</p></div></article>
          <article><span>02</span><div><h3>See the full picture</h3><p>Review your recurring costs, upcoming renewals, and spending breakdown.</p></div></article>
          <article><span>03</span><div><h3>Make informed decisions</h3><p>Keep the subscriptions you value and make changes when you need to.</p></div></article>
        </div>
      </section>

      <section className="lp-cta-band"><div><span className="lp-kicker">READY WHEN YOU ARE</span><h2>Make room for a clearer picture.</h2><p>Bring your recurring expenses together with Montra.</p></div><a className="lp-primary lp-cta-button" href="#/overview">Open Montra <Arrow /></a></section>
    </main>

    <footer className="lp-footer"><a className="lp-logo" href="#top"><i>M</i><span>Montra</span></a><span>Make every subscription count.</span><small>© {new Date().getFullYear()} Montra</small></footer>
  </div>;
}
