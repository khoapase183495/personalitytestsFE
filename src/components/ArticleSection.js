import React from 'react';
import './ArticleSection.css';

function ArticleSection() {
  const articles = [
    {
      id: 1,
      title: 'How MBTI Personality Types Influence Career Paths',
      excerpt: 'Explore the connection between 16 MBTI personality types and suitable career choices.',
      image: '/images/article1.jpg',
      link: '/articles/mbti-career'
    },
    {
      id: 2,
      title: 'How to Develop Yourself Based on Enneagram Results',
      excerpt: 'Guide to personal development based on strengths and weaknesses of each Enneagram type.',
      image: '/images/article2.jpg',
      link: '/articles/enneagram-growth'
    },
    {
      id: 3,
      title: 'Personality Compatibility in Relationships',
      excerpt: 'Understanding compatibility between personality types and improving your relationships.',
      image: '/images/article3.jpg',
      link: '/articles/compatibility'
    }
  ];

  return (
    <section className="article-section">
      <h2>Featured Articles</h2>
      <div className="article-grid">
        {articles.map(article => (
          <div className="article-card" key={article.id}>
            <div className="article-image">
              <img src={article.image} alt={article.title} />
            </div>
            <div className="article-content">
              <h3>{article.title}</h3>
              <p>{article.excerpt}</p>
              <a href={article.link} className="read-more">Read more</a>
            </div>
          </div>
        ))}
      </div>
      <div className="view-all">
        <a href="/articles" className="view-all-link">View all articles</a>
      </div>
    </section>
  );
}

export default ArticleSection;