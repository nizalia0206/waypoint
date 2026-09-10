import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Hero from '../components/Hero';
import TrailBegins from '../components/TrailBegins';
import AboutWaypoint from '../components/AboutWaypoint';

export default function HomePage() {
  const [heroGoal, setHeroGoal] = useState('');
  const navigate = useNavigate();

  const handleFindTrail = () => {
    const v = heroGoal.trim();
    navigate('/features', { state: { scrollTo: 'match', ...(v ? { goal: v } : {}) } });
  };

  return (
    <>
      <Hero heroGoal={heroGoal} setHeroGoal={setHeroGoal} onFindTrail={handleFindTrail} />
      <TrailBegins />
      <AboutWaypoint />
    </>
  );
}
