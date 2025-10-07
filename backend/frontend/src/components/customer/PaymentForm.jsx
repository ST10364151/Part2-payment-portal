// Payment Form (Customer)
const PaymentForm = () => {
    const [formData, setFormData] = useState({
      amount: '',
      currency: 'USD',
      provider: 'SWIFT',
      payeeAccountNumber: '',
      swiftCode: '',
      payeeName: '',
    });
    const [errors, setErrors] = useState({});
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);
  
    const validate = () => {
      const newErrors = {};
      
      if (!validators.amount(formData.amount)) {
        newErrors.amount = 'Enter a valid amount (e.g., 100.50)';
      }
      if (!validators.currency(formData.currency)) {
        newErrors.currency = 'Currency must be 3 uppercase letters (e.g., USD)';
      }
      if (!validators.accountNumber(formData.payeeAccountNumber)) {
        newErrors.payeeAccountNumber = 'Account number must be 8-16 digits';
      }
      if (!validators.swiftCode(formData.swiftCode)) {
        newErrors.swiftCode = 'Invalid SWIFT code format (e.g., ABCDZAJJ)';
      }
      if (!validators.fullName(formData.payeeName)) {
        newErrors.payeeName = 'Invalid payee name';
      }
  
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      setAlert(null);
  
      if (!validate()) return;
  
      setLoading(true);
      try {
        const response = await api.createPayment(formData);
        setAlert({ type: 'success', message: 'Payment created successfully and sent for verification!' });
        setFormData({
          amount: '',
          currency: 'USD',
          provider: 'SWIFT',
          payeeAccountNumber: '',
          swiftCode: '',
          payeeName: '',
        });
      } catch (error) {
        setAlert({ type: 'error', message: error.message });
      } finally {
        setLoading(false);
      }
    };
  
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-6">
          <DollarSign className="w-12 h-12 mx-auto mb-2 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">International Payment</h2>
        </div>
  
        {alert && <Alert type={alert.type} message={alert.message} />}
  
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
              <input
                type="text"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="100.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                required
              />
              {errors.amount && <p className="text-red-600 text-xs mt-1">{errors.amount}</p>}
            </div>
  
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="ZAR">ZAR - South African Rand</option>
                <option value="JPY">JPY - Japanese Yen</option>
              </select>
            </div>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="SWIFT">SWIFT</option>
            </select>
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payee Name</label>
            <input
              type="text"
              value={formData.payeeName}
              onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.payeeName && <p className="text-red-600 text-xs mt-1">{errors.payeeName}</p>}
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payee Account Number</label>
            <input
              type="text"
              value={formData.payeeAccountNumber}
              onChange={(e) => setFormData({ ...formData, payeeAccountNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.payeeAccountNumber && <p className="text-red-600 text-xs mt-1">{errors.payeeAccountNumber}</p>}
          </div>
  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">SWIFT Code</label>
            <input
              type="text"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value.toUpperCase() })}
              placeholder="ABCDZAJJ"
              maxLength={11}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              required
            />
            {errors.swiftCode && <p className="text-red-600 text-xs mt-1">{errors.swiftCode}</p>}
          </div>
  
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Processing...' : 'Pay Now'}
          </button>
        </form>
      </div>
    );
  };
  