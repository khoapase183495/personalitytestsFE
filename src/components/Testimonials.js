import React from 'react';
import './Testimonials.css';

function Testimonials() {
  const testimonials = [
    {
      id: 1,
      text: "The MBTI test helped me understand myself better and improve my relationships. The website is very user-friendly and the results are detailed.",
      name: "John Smith",
      role: "Student"
    },
    {
      id: 2,
      text: "I've used the Enneagram test results to develop myself and improve my leadership skills. The information shared on this website is very helpful.",
      name: "Sarah Johnson",
      role: "HR Manager"
    },
    {
      id: 3,
      text: "The career test helped me identify the right career path. I'm grateful I found this website.",
      name: "Michael Brown",
      role: "Senior Student"
    }
  ];

  return (
    <section className="testimonials">
      <h2>User Testimonials</h2>
      <div className="testimonials-container">
        {testimonials.map(testimonial => (
          <div className="testimonial-card" key={testimonial.id}>
            <div className="testimonial-content">
              <p>"{testimonial.text}"</p>
              <div className="testimonial-author">
                <strong>{testimonial.name}</strong>
                <span>{testimonial.role}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Testimonials;