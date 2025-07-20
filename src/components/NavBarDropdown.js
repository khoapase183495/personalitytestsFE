import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import TestService from '../services/TestService';

function NavBarDropdown() {
  const [tests, setTests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTests = async () => {
      try {
        setIsLoading(true);
        const testsData = await TestService.getAllTests();
        
        // Map to dropdown format
        const dropdownTests = testsData.map(test => ({
          id: test.id,
          title: test.title,
          slug: test.title.toLowerCase().replace(/\s+/g, '-')
        }));
        
        setTests(dropdownTests);
      } catch (error) {
        console.warn('NavBar: Could not load tests for dropdown:', error.message);
        // Fallback to default items if backend fails
        setTests([
          { id: 1, title: 'MBTI', slug: 'mbti' },
          { id: 2, title: 'Enneagram', slug: 'enneagram' },
          { id: 3, title: 'Big Five', slug: 'big-five' },
          { id: 4, title: 'Career Guidance', slug: 'career' }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadTests();
  }, []);

  if (isLoading) {
    return (
      <div className="dropdown-menu">
        <div className="dropdown-item">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dropdown-menu">
      {tests.map(test => (
        <Link 
          key={test.id} 
          to={`/tests/${test.slug}`} 
          className="dropdown-item"
        >
          {test.title}
        </Link>
      ))}
    </div>
  );
}

export default NavBarDropdown;
