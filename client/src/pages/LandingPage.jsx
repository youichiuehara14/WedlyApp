import Navbar from '../components/Navbar';
import { Context } from '../Context';
import { useContext } from 'react';
import { useEffect } from 'react';

function LandingPage() {
  const { user } = useContext(Context);

  useEffect(() => {
    if (user) {
      window.location.href = '/home';
    }
  }, [user]);

  return (
    <>
      <Navbar />
      <h1>This is the Landing Page</h1>
    </>
  );
}

export default LandingPage;
