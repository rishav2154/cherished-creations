import { motion } from 'framer-motion';
import { Heart, Award, Truck, Users, Star, Gift, Sparkles } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CartDrawer } from '@/components/cart/CartDrawer';

const stats = [
  { value: '50K+', label: 'Happy Customers', icon: Users },
  { value: '100K+', label: 'Gifts Delivered', icon: Gift },
  { value: '4.9', label: 'Average Rating', icon: Star },
  { value: '24/7', label: 'Support Available', icon: Heart },
];

const values = [
  {
    icon: Heart,
    title: 'Made with Love',
    description: 'Every product is crafted with care and attention to detail, ensuring your gift carries the emotion you intend.',
  },
  {
    icon: Award,
    title: 'Premium Quality',
    description: 'We use only the finest materials and printing techniques to create lasting memories.',
  },
  {
    icon: Truck,
    title: 'Fast Delivery',
    description: 'Your personalized gifts reach you quickly with our efficient delivery network across India.',
  },
  {
    icon: Sparkles,
    title: 'Unique Designs',
    description: 'Stand out with completely customizable products that reflect your personal style.',
  },
];

const team = [
  { name: 'Priya Sharma', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400' },
  { name: 'Rahul Verma', role: 'Head of Design', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400' },
  { name: 'Anita Patel', role: 'Customer Success', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400' },
];

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="pt-24 pb-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-primary/5" />
          <div className="container mx-auto px-4 lg:px-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="text-accent font-medium text-sm tracking-wider uppercase">
                Our Story
              </span>
              <h1 className="text-4xl md:text-6xl font-bold mt-4 leading-tight">
                Creating Memories,
                <br />
                <span className="text-gradient-accent">One Gift at a Time</span>
              </h1>
              <p className="text-muted-foreground mt-6 text-lg max-w-2xl mx-auto">
                At Giftoria, we believe that the best gifts are the ones that carry a piece of your heart. 
                Our mission is to help you express love, gratitude, and celebration through beautifully 
                personalized products.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent/10 mb-4">
                    <stat.icon className="w-7 h-7 text-accent" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-gradient-accent">{stat.value}</div>
                  <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <span className="text-accent font-medium text-sm tracking-wider uppercase">
                  How It Started
                </span>
                <h2 className="text-3xl md:text-4xl font-bold mt-4">
                  From a Simple Idea to Your Favorite Gift Shop
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground">
                  <p>
                    Giftoria was born in 2020 from a simple observation: people wanted to give 
                    meaningful, personalized gifts but didn't have an easy way to create them.
                  </p>
                  <p>
                    What started as a small operation printing custom t-shirts from a garage has 
                    grown into a full-fledged personalization platform serving thousands of happy 
                    customers across India.
                  </p>
                  <p>
                    Today, we offer everything from custom apparel to home décor, all designed 
                    to help you create lasting memories with the people you love.
                  </p>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="aspect-square rounded-3xl overflow-hidden glass-card">
                  <img
                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=800"
                    alt="Gift wrapping"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-2xl overflow-hidden glass-card border-4 border-background">
                  <img
                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400"
                    alt="Custom products"
                    className="w-full h-full object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-accent font-medium text-sm tracking-wider uppercase">
                What We Believe
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4">Our Core Values</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card p-6 text-center hover:border-accent/50 transition-colors"
                >
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-accent-gradient mb-4">
                    <value.icon className="w-7 h-7 text-accent-foreground" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-accent font-medium text-sm tracking-wider uppercase">
                Meet The Team
              </span>
              <h2 className="text-3xl md:text-4xl font-bold mt-4">The People Behind Giftoria</h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {team.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="glass-card overflow-hidden group"
                >
                  <div className="aspect-[4/5] overflow-hidden">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-5 text-center">
                    <h3 className="font-semibold text-lg">{member.name}</h3>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="container mx-auto px-4 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 md:p-16 text-center bg-gradient-to-br from-accent/5 via-transparent to-primary/5"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Create Something Special?
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto mb-8">
                Start designing your personalized gift today and make someone's day unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="/shop" className="btn-luxury">
                  Shop Now
                </a>
                <a href="/customize" className="btn-luxury-outline">
                  Start Customizing
                </a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
