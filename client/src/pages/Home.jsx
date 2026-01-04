import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Activity, Brain, TrendingUp, ArrowRight } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced pose detection and real-time feedback for optimal rehabilitation',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Activity,
      title: 'Exercise Tracking',
      description: 'Monitor progress with comprehensive exercise session analytics',
      color: 'from-teal-500 to-teal-600',
    },
    {
      icon: TrendingUp,
      title: 'Progress Monitoring',
      description: 'Visualize recovery journey with detailed progress reports',
      color: 'from-green-500 to-green-600',
    },
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-20"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6">
              Revolutionizing
              <span className="text-healthcare-primary"> Stroke </span>
              Rehabilitation
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              AI-powered platform for personalized stroke recovery exercises with
              real-time pose analysis and progress tracking.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-primary flex items-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/exercise')}
                className="btn-secondary"
              >
                Start Exercise
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="bg-gradient-to-br from-healthcare-primary to-healthcare-secondary rounded-3xl p-12 shadow-2xl"
              >
                <Heart className="w-64 h-64 text-white opacity-20 mx-auto" />
              </motion.div>
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-6 -right-6 bg-white p-6 rounded-2xl shadow-xl"
              >
                <Activity className="w-12 h-12 text-healthcare-accent" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="container mx-auto px-6 py-20"
      >
        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold text-center text-gray-800 mb-16"
        >
          Comprehensive Healthcare Platform
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -10 }}
                className="card-healthcare cursor-pointer"
              >
                <div
                  className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-xl flex items-center justify-center mb-6 shadow-lg`}
                >
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="container mx-auto px-6 py-20"
      >
        <div className="bg-gradient-to-r from-healthcare-primary to-healthcare-secondary rounded-3xl p-12 text-center shadow-2xl">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Your Recovery Journey?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Join thousands of patients improving their recovery outcomes
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-healthcare-primary px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
          >
            Access Dashboard
          </button>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
