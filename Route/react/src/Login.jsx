import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import './Login.css'

function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem(username))
    if (user && user.password === password) {
      navigate('/home')
    } else {
      navigate('/error')
    }
  }

  return (
    <div>
      <div className="nav-buttons">
        <Link to="/about">
          <button>About</button>
        </Link>
        <Link to="/">
          <button>Sign In</button>
        </Link>
        <Link to="/signup">
          <button>Sign Up</button>
        </Link>
      </div>
      <div className="login-container">
        <h2>Login</h2>
        <input type="text" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  )
}

export default Login