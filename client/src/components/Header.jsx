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
      className="bg-white shadow-lg sticky top-0 z-50 border-b-4 border-healthcare-primary"
    >
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <img 
              src="/images/logo.png" 
              alt="NeuroPath AI Logo" 
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-healthcare-primary">
                NeuroPath AI
              </h1>
              <p className="text-xs text-gray-600">Stroke Rehabilitation</p>
            </div>
          </motion.div>

          <div className="flex items-center space-x-2">
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
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                      isActive(item.path)
                        ? 'bg-healthcare-primary text-white shadow-lg'
                        : 'text-gray-600 hover:bg-healthcare-light hover:text-healthcare-primary'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
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
