import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Instagram, Twitter, Facebook, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = {
  shop: [
    { name: 'Custom T-Shirts', path: '/shop?category=tshirts' },
    { name: 'Photo Mugs', path: '/shop?category=mugs' },
    { name: 'Photo Frames', path: '/shop?category=frames' },
    { name: 'Phone Covers', path: '/shop?category=phone-covers' },
    { name: 'Gift Combos', path: '/shop?category=combos' },
  ],
  company: [
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/returns' },
  ],
};

const socialLinks = [
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Facebook, href: '#', label: 'Facebook' },
];

export const Footer = () => {
  return (
    <footer className="relative bg-card border-t border-border">

      {/* Gradient Top Border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent via-primary to-accent" />

      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand Column */}
            <div className="lg:col-span-1">
              <Link to="/" className="text-2xl font-bold tracking-tight">
                Giftoria
              </Link>
              <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
                Transform your precious memories into beautiful, personalized gifts.
                Crafted with love, delivered with care.
              </p>

              {/* Newsletter */}
              <div className="mt-6">
                <h4 className="text-sm font-semibold mb-3">Subscribe to our newsletter</h4>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <button className="px-4 py-2 bg-accent text-accent-foreground rounded-lg text-sm font-medium hover:bg-accent/90 transition-colors">
                    Join
                  </button>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex gap-3 mt-6">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="p-2 rounded-full border border-border hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Shop Links */}
            <div>
              <h4 className="font-semibold mb-4">Shop</h4>
              <ul className="space-y-3">
                {footerLinks.shop.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link to={link.path} className="text-sm text-muted-foreground hover:text-accent transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info with Map */}
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <a href="mailto:daljeet0113@gmail.com" className="hover:text-accent transition-colors">daljeet0113@gmail.com</a>
                </div>
                <div className="flex items-start gap-2">
                  <Phone className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  +91 78275 25257
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  near vinod general store sanjay gandhi transport
                </div>
              </div>

              {/* Embedded Map */}
              <div className="mt-4 rounded-xl overflow-hidden border border-border h-36 grayscale hover:grayscale-0 transition-all duration-500">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3430.0!2d76.78!3d30.74!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzDCsDQ0JzI0LjAiTiA3NsKwNDYnNDguMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Store Location"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Giftoria. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
