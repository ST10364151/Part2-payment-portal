// Employee Login
const EmployeeLogin = () => {
    const { login } = useAuth();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setAlert(null);
      setLoading(false);
  
      try {
        const response = await api.employeeLogin(formData);
        login(response.token, response.user);
      } catch (error) {
        setAlert({ type: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <Building className="w-12 h-12 mx-auto mb-2 text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Employee Portal</h2>
        </div>
  
        {alert && <Alert type={alert.type} message={alert.message} />}
  
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee Username</label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Employee Login'}
          </button>
        </form>
      </div>
    );
  };