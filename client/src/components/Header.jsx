import { motion } from 'framer-motion'
import { Link, useLocation } from 'react-router-dom'
import { Activity, Home, User, Heart } from 'lucide-react'

const Header = () => {
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/dashboard', label: 'Dashboard', icon: Activity },
    { path: '/exercise', label: 'Exercise', icon: Heart },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="bg-black/40 backdrop-blur-xl sticky top-0 z-50 border-b border-white/10 shadow-[0_4px_30px_rgba(0,0,0,0.5)]"
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3 group cursor-pointer"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-healthcare-primary/30 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <img
                src="/images/logo.png"
                alt="NeuroPath AI Logo"
                className="w-10 h-10 object-contain drop-shadow-[0_0_10px_rgba(0,240,255,0.6)] relative z-10"
              />
            </div>
            <div>
              <h1 className="text-xl font-display font-bold text-white tracking-wide group-hover:text-glow transition-all">
                NEUROPATH
              </h1>
              <p className="text-[10px] text-healthcare-primary tracking-widest uppercase font-medium">Stroke Rehab AI</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2 bg-white/5 rounded-2xl p-1.5 border border-white/10">
            {navItems.map((item, index) => {
              const Icon = item.icon
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 relative overflow-hidden group ${isActive(item.path)
                        ? 'text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                  >
                    {isActive(item.path) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-white/10 border border-white/20 rounded-xl"
                        transition={{ duration: 0.3 }}
                      ></motion.div>
                    )}
                    <Icon className={`w-4 h-4 relative z-10 ${isActive(item.path) ? 'text-healthcare-primary drop-shadow-[0_0_8px_rgba(0,240,255,0.8)]' : 'group-hover:text-healthcare-primary group-hover:drop-shadow-[0_0_8px_rgba(0,240,255,0.5)] transition-all'}`} />
                    <span className="font-medium text-sm relative z-10">{item.label}</span>
                  </Link>
                </motion.div>
              )
            })}
          </div>
        </div>
      </nav>
    </motion.header>
  )
}

export default Header
