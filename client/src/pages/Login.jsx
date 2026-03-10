import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { Mail, Lock, User, Eye, EyeOff, Loader, Activity } from 'lucide-react'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isLogin) {
        await signIn(email, password)
        navigate('/dashboard')
      } else {
        await signUp(email, password, fullName)
        setError('Check your email to confirm your account!')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      {/* Decorative background blurs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-healthcare-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-healthcare-secondary/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 relative">
            <div className="absolute inset-0 bg-healthcare-primary/30 blur-2xl rounded-full w-24 h-24 mx-auto"></div>
            <img
              src="/images/logo.png"
              alt="NeuroPath AI Logo"
              className="w-20 h-20 object-contain drop-shadow-[0_0_15px_rgba(0,240,255,0.8)] relative z-10"
            />
          </div>
          <h1 className="text-4xl font-display font-bold text-white mb-2 tracking-widest text-glow uppercase">
            NEUROPATH
          </h1>
          <p className="text-healthcare-primary uppercase tracking-[0.2em] text-xs font-semibold">Authentication Protocol</p>
        </div>

        {/* Auth Card */}
        <div className="card !bg-black/60 !backdrop-blur-3xl p-8 border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          {/* Toggle Buttons */}
          <div className="flex gap-2 mb-8 bg-white/5 p-1.5 rounded-xl border border-white/5">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${isLogin
                  ? 'bg-healthcare-primary/20 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-healthcare-primary/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              System Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 rounded-lg font-medium transition-all text-sm ${!isLogin
                  ? 'bg-healthcare-primary/20 text-white shadow-[0_0_15px_rgba(0,240,255,0.3)] border border-healthcare-primary/50'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              New Subject
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name (Sign Up only) */}
            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Subject Name
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-12"
                    placeholder="Enter full designation"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Neural ID (Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-12"
                  placeholder="subject@network.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Security Key
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-12 pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-healthcare-primary transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className={`p-4 rounded-xl text-sm border font-medium flex items-center gap-3 ${error.includes('Check your email')
                  ? 'bg-healthcare-accent/10 border-healthcare-accent/30 text-healthcare-accent'
                  : 'bg-healthcare-error/10 border-healthcare-error/30 text-healthcare-error'
                }`}>
                <Activity className="w-5 h-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary text-sm tracking-wide mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                isLogin ? 'Initiate Link' : 'Register Subject'
              )}
            </button>
          </form>

          {/* Forgot Password */}
          {isLogin && (
            <div className="mt-6 text-center">
              <button className="text-xs text-gray-400 hover:text-healthcare-primary transition-colors uppercase tracking-widest font-semibold border-b border-transparent hover:border-healthcare-primary pb-0.5">
                Reset Security Key
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-500 text-sm mt-8 font-light">
          {isLogin ? "Unregistered Subject? " : "Authorized Subject? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-healthcare-primary hover:text-white transition-colors font-medium border-b border-healthcare-primary/30 ml-1"
          >
            {isLogin ? 'Register Here' : 'Login Here'}
          </button>
        </p>
      </div>
    </div>
  )
}

export default Login
