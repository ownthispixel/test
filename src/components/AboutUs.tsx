import React from 'react';
import BaseLogo from './BaseLogo';

const AboutUs: React.FC = () => {
  return (
    <div className="about-us">
      <div className="about-header">
        <BaseLogo size={48} className="about-logo" />
        <h2>About Own This Pixel</h2>
      </div>
      
      <div className="about-content">
        <section className="about-section card">
          <h3>Our Story</h3>
          <p>
            Own This Pixel was founded in 2025 with a simple vision: to create a decentralized canvas where anyone can own, customize, and trade digital real estate in the form of pixels.
          </p>
          <p>
            Inspired by the early internet experiments like the Million Dollar Homepage, we've taken the concept to the next level by leveraging blockchain technology to provide true ownership and permanence to digital pixels.
          </p>
          <p>
            Our platform runs on Base Chain, providing low transaction fees and a seamless experience for both crypto natives and newcomers alike.
          </p>
        </section>
        
        <section className="about-section card">
          <h3>Our Mission</h3>
          <p>
            We believe in the power of community-owned digital spaces. Our mission is to create a collaborative canvas where art, advertising, and self-expression can coexist in a decentralized environment.
          </p>
          <p>
            By tokenizing pixels as NFTs, we're ensuring that your digital property remains yours forever, with the freedom to customize, trade, or hold as you see fit.
          </p>
          <p>
            We're committed to building a platform that's accessible to everyone, regardless of their technical background or experience with blockchain technology.
          </p>
        </section>
        
        <section className="about-section card">
          <h3>The Technology</h3>
          <p>
            Own This Pixel is built on Base Chain, an Ethereum Layer 2 solution that provides fast, low-cost transactions while maintaining the security and decentralization of Ethereum.
          </p>
          <p>
            Our smart contracts are written in Solidity and follow the ERC-1155 standard, allowing for efficient batch operations and reduced gas costs when trading multiple pixels.
          </p>
          <p>
            The frontend is built with React and TypeScript, providing a responsive and intuitive user experience across devices.
          </p>
        </section>
      </div>
      
      <div className="contact-us card">
        <h3>Contact Us</h3>
        <p>
          Have questions, suggestions, or just want to say hello? We'd love to hear from you!
        </p>
        
        <div className="contact-methods">
          <div className="contact-method">
            <h4>Email</h4>
            <p><a href="mailto:hello@ownthispixel.com">hello@ownthispixel.com</a></p>
          </div>
          
          <div className="contact-method">
            <h4>Discord</h4>
            <p><a href="https://discord.gg/ownthispixel" target="_blank" rel="noopener noreferrer">Join our Discord community</a></p>
          </div>
          
          <div className="contact-method">
            <h4>Twitter</h4>
            <p><a href="https://twitter.com/ownthispixel" target="_blank" rel="noopener noreferrer">@ownthispixel</a></p>
          </div>
        </div>
        
        <div className="contact-form">
          <h4>Send us a message</h4>
          <form onSubmit={(e) => { e.preventDefault(); alert('Message sent! We\'ll get back to you soon.'); }}>
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" name="name" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" name="email" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="subject">Subject</label>
              <input type="text" id="subject" name="subject" required />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required></textarea>
            </div>
            
            <button type="submit" className="submit-button">Send Message</button>
          </form>
        </div>
      </div>
      
      <div className="team-section">
        <h3>Our Team</h3>
        <div className="team-grid">
          <div className="team-member card">
            <div className="member-avatar"></div>
            <h4>Alex Johnson</h4>
            <p className="member-role">Founder & CEO</p>
            <p className="member-bio">Blockchain enthusiast with a background in digital art and web development.</p>
          </div>
          
          <div className="team-member card">
            <div className="member-avatar"></div>
            <h4>Samira Patel</h4>
            <p className="member-role">Lead Developer</p>
            <p className="member-bio">Smart contract expert with 5+ years of experience in Ethereum development.</p>
          </div>
          
          <div className="team-member card">
            <div className="member-avatar"></div>
            <h4>Marcus Chen</h4>
            <p className="member-role">UI/UX Designer</p>
            <p className="member-bio">Creating intuitive interfaces for Web3 applications since 2020.</p>
          </div>
          
          <div className="team-member card">
            <div className="member-avatar"></div>
            <h4>Olivia Rodriguez</h4>
            <p className="member-role">Community Manager</p>
            <p className="member-bio">Building bridges between developers and users in the NFT space.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
