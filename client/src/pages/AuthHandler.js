import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function AuthHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [navigate]);
  return null;
}

export default AuthHandler;
