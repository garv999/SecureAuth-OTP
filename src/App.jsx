import { motion } from 'framer-motion';

function App() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-dark text-white p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-4xl font-bold text-primary mb-4">SecureAuth-OTP</h1>
        <p className="text-gray-400 text-lg">Modern Phone Authentication</p>
        <div className="mt-8 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-300 italic">Initializing project structure...</p>
        </div>
      </motion.div>
    </div>
  )
}

export default App
