import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

const MAJORS = ['Computer Science', 'Marketing', 'Mechanical Engineering', 'Finance', 'Graphic Design'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

export default function AuthPage({ toast }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useSite();
  const { signUp, signIn } = useAuth();

  const [mode, setMode] = useState(location.pathname === '/signup' ? 'signup' : 'signin');
  const [role, setRole] = useState('student');
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    major: MAJORS[0], year: YEARS[0], gradYear: '', industry: '', outcome: '',
  });
  const [error, setError] = useState('');

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
    navigate(m === 'signup' ? '/signup' : '/signin', { replace: true });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      if (!form.name.trim() || !form.email.trim() || !form.password) {
        setError(t.auth.errorRequired);
        return;
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        role,
        ...(role === 'student'
          ? { major: form.major, year: form.year }
          : { major: form.major, gradYear: form.gradYear, industry: form.industry, outcome: form.outcome }),
      };
      const res = signUp(payload);
      if (!res.ok) {
        setError(t.auth.errorExists);
        return;
      }
      toast(t.auth.welcomeToast(res.user.name));
      navigate(role === 'mentor' ? '/mentor' : '/features');
    } else {
      const res = signIn({ email: form.email.trim(), password: form.password });
      if (!res.ok) {
        setError(t.auth.errorInvalid);
        return;
      }
      toast(t.auth.welcomeToast(res.user.name));
      navigate(res.user.role === 'mentor' ? '/mentor' : '/features');
    }
  };

  return (
    <section style={{ paddingTop: 64, paddingBottom: 70 }}>
      <div className="wrap" style={{ maxWidth: 460 }}>
        <div className="auth-tabs">
          <button type="button" className={mode === 'signin' ? 'active' : ''} onClick={() => switchMode('signin')}>{t.auth.signIn}</button>
          <button type="button" className={mode === 'signup' ? 'active' : ''} onClick={() => switchMode('signup')}>{t.auth.signUp}</button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div className="role-row" style={{ marginBottom: 20 }}>
              <button type="button" className={`role-card${role === 'student' ? ' active' : ''}`} onClick={() => setRole('student')}>{t.auth.imStudent}</button>
              <button type="button" className={`role-card${role === 'mentor' ? ' active' : ''}`} onClick={() => setRole('mentor')}>{t.auth.imMentor}</button>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <label>{t.auth.nameLabel}</label>
              <input value={form.name} onChange={update('name')} type="text" />
            </>
          )}

          <label>{t.auth.emailLabel}</label>
          <input value={form.email} onChange={update('email')} type="email" autoComplete="email" />

          <label>{t.auth.passwordLabel}</label>
          <input value={form.password} onChange={update('password')} type="password" autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} />

          {mode === 'signup' && role === 'student' && (
            <>
              <label>{t.auth.majorLabel}</label>
              <select value={form.major} onChange={update('major')}>
                {MAJORS.map((m) => <option key={m} value={m}>{t.match.majors[m] || m}</option>)}
              </select>
              <label>{t.auth.yearLabel}</label>
              <select value={form.year} onChange={update('year')}>
                {YEARS.map((y) => <option key={y} value={y}>{t.match.years[y] || y}</option>)}
              </select>
            </>
          )}

          {mode === 'signup' && role === 'mentor' && (
            <>
              <label>{t.auth.majorLabel}</label>
              <input value={form.major} onChange={update('major')} type="text" />
              <label>{t.auth.gradYearLabel}</label>
              <input value={form.gradYear} onChange={update('gradYear')} type="text" placeholder="2019" />
              <label>{t.auth.industryLabel}</label>
              <input value={form.industry} onChange={update('industry')} type="text" placeholder={t.auth.industryPlaceholder} />
              <label>{t.auth.outcomeLabel}</label>
              <input value={form.outcome} onChange={update('outcome')} type="text" placeholder={t.auth.outcomePlaceholder} />
            </>
          )}

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="match-submit" style={{ marginTop: 22 }}>
            {mode === 'signup' ? t.auth.createAccount : t.auth.signIn}
          </button>
        </form>

        <p className="auth-switch">
          {mode === 'signup' ? t.auth.haveAccount : t.auth.noAccount}{' '}
          <button type="button" onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')}>
            {mode === 'signup' ? t.auth.signIn : t.auth.signUp}
          </button>
        </p>
      </div>
    </section>
  );
}
