import React from 'react';
import './App.css';
import NavBar from './components/NavBar';
import Hero from './components/Hero';
import TestSection from './components/TestSection';
import ArticleSection from './components/ArticleSection';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

function App() {
  return (
    <div className="App">
      <NavBar />
      <Hero />
      <TestSection />
      <ArticleSection />
      <Testimonials />
      <Footer />
    </div>
  );
}

export default App;
