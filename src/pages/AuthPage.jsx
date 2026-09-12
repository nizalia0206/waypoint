import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';

const MAJORS = ['Computer Science', 'Marketing', 'Mechanical Engineering', 'Finance', 'Graphic Design'];
const YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior'];

// Real "Continue with Google" requires a Google OAuth Client ID registered
// to the exact domain this site is deployed on — that's a credential only
// the site owner can create (Google Cloud Console → APIs & Services →
// Credentials → OAuth client ID → Web application → add your deployed URL
// under "Authorized JavaScript origins"). Paste it below. Until you do,
// the button explains this instead of silently doing nothing or faking a
// sign-in — see handleGoogleContinue.
const GOOGLE_CLIENT_ID = '245231516825-5losq96ts31uk3hrsr63t3aab4173r91.apps.googleusercontent.com';

// Local accounts here need *some* password value to sign back in later.
// A real Google user never types one, so derive a stable, private-enough
// placeholder from their own Google account id instead of a shared demo
// password — this keeps each Google sign-in tied to that one person's
// account rather than everyone sharing a single identity.
function passwordForGoogleSub(sub) {
  return `google-oauth:${sub}`;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" width="18" height="18" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.4-.3-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4.5 24 4.5c-7.7 0-14.4 4.4-17.7 10.2z" />
      <path fill="#4CAF50" d="M24 43.5c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6c-2 1.5-4.6 2.5-7.7 2.5-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.5 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.6 5.6c-.5.4 6.8-5 6.8-15.2 0-1.2-.1-2.4-.3-3.5z" />
    </svg>
  );
}

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
  const [showPassword, setShowPassword] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const tokenClientRef = useRef(null);
  const roleRef = useRef(role);
  roleRef.current = role;

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const switchMode = (m) => {
    setMode(m);
    setError('');
    navigate(m === 'signup' ? '/signup' : '/signin', { replace: true });
  };

  const completeAuth = (user) => {
    toast(t.auth.welcomeToast(user.name));
    navigate(user.role === 'mentor' ? '/mentor' : '/features');
  };

  // Runs once Google hands back an access token for the account the person
  // actually chose in the real Google popup. Looks that person up by their
  // real email — signs them into their own existing Waypoint account if
  // they already have one, or creates one under their real name/email if
  // this is their first time, using whichever role tab is selected.
  const handleGoogleToken = async (tokenResponse) => {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
      });
      if (!res.ok) throw new Error('userinfo request failed');
      const profile = await res.json();
      const password = passwordForGoogleSub(profile.sub);

      const signInRes = signIn({ email: profile.email, password });
      if (signInRes.ok) {
        completeAuth(signInRes.user);
        return;
      }
      const currentRole = roleRef.current;
      const payload = {
        name: profile.name || profile.email.split('@')[0],
        email: profile.email,
        password,
        role: currentRole,
        ...(currentRole === 'student'
          ? { major: MAJORS[0], year: YEARS[0] }
          : { major: MAJORS[0], gradYear: '', industry: '', outcome: '' }),
      };
      const signUpRes = signUp(payload);
      if (signUpRes.ok) {
        completeAuth(signUpRes.user);
      } else {
        // Existing account under this email but a different sign-in method
        // (e.g. they originally signed up with a password directly).
        setError(t.auth.errorExists);
      }
    } catch (err) {
      setError(t.auth.googleError);
    } finally {
      setGoogleBusy(false);
    }
  };

  const handleGoogleContinue = () => {
    setError('');
    if (GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      setError(t.auth.googleNotConfigured);
      return;
    }
    if (!window.google || !window.google.accounts || !window.google.accounts.oauth2) {
      setError(t.auth.googleLoadError);
      return;
    }
    setGoogleBusy(true);
    if (!tokenClientRef.current) {
      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: 'openid email profile',
        prompt: 'select_account',
        callback: handleGoogleToken,
        error_callback: () => { setGoogleBusy(false); setError(t.auth.googleError); },
      });
    }
    tokenClientRef.current.requestAccessToken();
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
      completeAuth(res.user);
    } else {
      const res = signIn({ email: form.email.trim(), password: form.password });
      if (!res.ok) {
        setError(t.auth.errorInvalid);
        return;
      }
      completeAuth(res.user);
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
          <button type="button" className="google-btn" onClick={handleGoogleContinue} disabled={googleBusy}>
            <GoogleIcon />
            {googleBusy ? t.auth.googleConnecting : t.auth.continueWithGoogle}
          </button>
          <div className="auth-divider"><span>{t.auth.orDivider}</span></div>

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
          <div className="auth-password-wrap">
            <input
              value={form.password}
              onChange={update('password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? t.auth.hidePassword : t.auth.showPassword}
            >
              {showPassword ? t.auth.hidePassword : t.auth.showPassword}
            </button>
          </div>

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
