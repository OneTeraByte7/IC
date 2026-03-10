import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Heart, Activity, Brain, TrendingUp, ArrowRight, LogIn, UserPlus } from 'lucide-react'

const Home = () => {
  const navigate = useNavigate()

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Analysis',
      description: 'Advanced pose detection and real-time feedback for optimal rehabilitation',
      color: 'from-healthcare-primary to-healthcare-secondary',
      shadow: 'shadow-[0_0_20px_rgba(0,240,255,0.3)]'
    },
    {
      icon: Activity,
      title: 'Exercise Tracking',
      description: 'Monitor progress with comprehensive exercise session analytics',
      color: 'from-healthcare-secondary to-purple-600',
      shadow: 'shadow-[0_0_20px_rgba(112,0,255,0.3)]'
    },
    {
      icon: TrendingUp,
      title: 'Progress Monitoring',
      description: 'Visualize recovery journey with detailed progress reports',
      color: 'from-healthcare-accent to-green-600',
      shadow: 'shadow-[0_0_20px_rgba(0,255,102,0.3)]'
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
    <div className="min-h-screen relative overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-healthcare-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-healthcare-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navigation Header */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="container mx-auto px-6 py-6 relative z-10"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img
              src="/images/logo.png"
              alt="NeuroPath AI Logo"
              className="w-12 h-12 object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.5)]"
            />
            <span className="text-3xl font-display font-bold text-white tracking-widest text-glow">NEUROPATH</span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="flex items-center gap-2 px-6 py-2.5 text-gray-300 hover:text-healthcare-primary hover:bg-white/5 rounded-xl transition-all font-medium border border-transparent hover:border-white/10"
            >
              <LogIn className="w-5 h-5" />
              <span>Login</span>
            </button>
            <button
              onClick={() => navigate('/login')}
              className="btn-primary flex items-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              <span>Sign Up</span>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto px-6 py-12 relative z-10"
      >
        <div className="grid md:grid-cols-2 gap-12 items-center min-h-[70vh]">
          <motion.div
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full border border-healthcare-primary/30 bg-healthcare-primary/10 text-healthcare-primary text-sm font-medium mb-8 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <span className="w-2 h-2 rounded-full bg-healthcare-primary animate-pulse"></span>
              <span>Next-Gen Healthcare AI</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold text-white mb-6 leading-tight">
              Revolutionizing <br />
              <span className="text-gradient text-glow tracking-wide">Stroke</span>
              <br /> Rehabilitation
            </h1>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed font-light max-w-lg">
              AI-powered platform for personalized stroke recovery exercises with
              real-time pose analysis and advanced progress tracking.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate('/login')}
                className="btn-primary flex items-center space-x-2 group"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/exercise')}
                className="btn-secondary"
              >
                Try Demo
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative h-full flex items-center justify-center p-8"
          >
            <div className="relative w-full aspect-square max-w-md">
              <div className="absolute inset-0 bg-gradient-to-tr from-healthcare-primary/20 to-healthcare-secondary/20 rounded-full blur-3xl animate-pulse-slow"></div>

              <motion.div
                animate={{ y: [-15, 15, -15], rotate: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-10 z-10 card flex items-center justify-center border-healthcare-primary/30 shadow-[0_0_50px_rgba(0,240,255,0.2)] bg-black/40 backdrop-blur-2xl"
              >
                <div className="absolute inset-0 bg-glow-primary opacity-50 mix-blend-screen pointer-events-none"></div>
                <Brain className="w-1/2 h-1/2 text-healthcare-primary drop-shadow-[0_0_30px_rgba(0,240,255,0.8)]" />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.1, 1], rotate: [-10, 0, -10] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 z-20 card p-6 border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <Activity className="w-10 h-10 text-healthcare-accent drop-shadow-[0_0_15px_rgba(0,255,102,0.8)]" />
              </motion.div>

              <motion.div
                animate={{ scale: [1, 1.15, 1], y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute -bottom-10 -left-6 z-20 card p-6 border-white/10 bg-white/5 backdrop-blur-xl"
              >
                <Heart className="w-12 h-12 text-healthcare-error drop-shadow-[0_0_20px_rgba(255,0,60,0.8)]" />
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
        viewport={{ once: true, margin: "-100px" }}
        className="container mx-auto px-6 py-32 relative z-10"
      >
        <motion.div variants={itemVariants} className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 tracking-tight">
            Comprehensive <span className="text-gradient">Healthcare Matrix</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Harnessing the power of advanced machine learning pipelines to reconstruct and accelerate patient rehabilitation protocols.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="card-healthcare group block"
              >
                <div
                  className={`bg-gradient-to-br ${feature.color} w-16 h-16 rounded-2xl flex items-center justify-center mb-8 ${feature.shadow} transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}
                >
                  <Icon className="w-8 h-8 text-white drop-shadow-md" />
                </div>
                <h3 className="text-2xl font-display font-bold text-white mb-4 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed font-light">
                  {feature.description}
                </p>
                <div className="mt-6 flex items-center text-sm font-medium text-gray-500 group-hover:text-white transition-colors">
                  <span>Explore Module</span>
                  <ArrowRight className="w-4 h-4 ml-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </div>
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
        transition={{ duration: 0.8 }}
        className="container mx-auto px-6 py-20 pb-32 relative z-10"
      >
        <div className="relative overflow-hidden rounded-[2.5rem] p-12 md:p-20 text-center border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-healthcare-primary/10 via-transparent to-healthcare-secondary/10"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-healthcare-primary/20 via-black/0 to-black/0 blur-2xl"></div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6 text-glow">
              Ready to Initiate <br /> Recovery Protocol?
            </h2>
            <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto font-light">
              Join the futuristic era of patient rehabilitation. Seamless integration, real-time telemetry, and predictive health tracking.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary text-lg px-10 py-4"
            >
              Access Neural Dashboard
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  )
}

export default Home
