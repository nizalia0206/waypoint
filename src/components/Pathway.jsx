import { useSite } from '../context/SiteContext';

export default function Pathway() {
  const { t } = useSite();
  return (
    <section id="pathway">
      <div className="wrap">
        <div className="section-head">
          <h2>{t.pathway.head}</h2>
          <p>{t.pathway.sub}</p>
        </div>
        <div className="pathway">
          {t.pathway.steps.map((s, i) => (
            <div className="way-item" key={i}>
              <div className="way-pin">{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
