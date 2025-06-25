import React from 'react';
import TestCard from './TestCard';
import './TestSection.css';

function TestSection() {
  const tests = [
    {
      id: 1,
      title: 'MBTI Test',
      description: 'Discover your MBTI personality type and better understand your communication and work style.',
      image: '/images/mbti.png',
      link: '/tests/mbti'
    },
    {
      id: 2,
      title: 'Enneagram Test',
      description: 'Explore your deep motivations and emotional needs through the 9 Enneagram personality types.',
      image: '/images/enneagram.png',
      link: '/tests/enneagram'
    },
    {
      id: 3,
      title: 'Holland Career Test',
      description: 'Discover careers that match your interests and values.',
      image: '/images/career.png',
      link: '/tests/career'
    },
    {
      id: 4,
      title: 'Big Five Test',
      description: 'Assess five major personality dimensions based on scientific research models.',
      image: '/images/big-five.png',
      link: '/tests/big-five'
    }
  ];
  return (
    <section className="test-section">
      <h2>Discover Your Personality</h2>
      <p>Take our scientifically-backed personality tests to gain deep insights into your character, motivations, and potential.</p>
      <div className="test-grid">
        {tests.map(test => (
          <TestCard 
            key={test.id}
            title={test.title}
            description={test.description}
            image={test.image}
            link={test.link}
          />
        ))}
      </div>
    </section>
  );
}

export default TestSection;