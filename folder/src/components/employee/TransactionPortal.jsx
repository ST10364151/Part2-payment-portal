// Employee Transaction Portal
const EmployeePortal = () => {
  const [transactions, setTransactions] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const response = await api.getPendingTransactions();
      setTransactions(response.transactions);
    } catch (error) {
      setAlert({ type: 'error', message: 'Failed to load transactions' });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await api.verifyTransaction(id);
      setAlert({ type: 'success', message: 'Transaction verified successfully' });
      loadTransactions();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const handleSubmitToSwift = async () => {
    if (selectedIds.length === 0) {
      setAlert({ type: 'error', message: 'Please select transactions to submit' });
      return;
    }

    try {
      await api.submitToSwift(selectedIds);
      setAlert({ type: 'success', message: `${selectedIds.length} transaction(s) submitted to SWIFT` });
      setSelectedIds([]);
      loadTransactions();
    } catch (error) {
      setAlert({ type: 'error', message: error.message });
    }
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  if (loading) return <div className="text-center py-8">Loading transactions...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Pending Transactions</h2>
        <button
          onClick={handleSubmitToSwift}
          disabled={selectedIds.length === 0}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400"
        >
          Submit to SWIFT ({selectedIds.length})
        </button>
      </div>

      {alert && <Alert type={alert.type} message={alert.message} />}

      {transactions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No pending transactions</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === transactions.filter(t => t.status === 'verified').length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(transactions.filter(t => t.status === 'verified').map(t => t.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ref</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SWIFT</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((txn) => (
                <tr key={txn.id} className={selectedIds.includes(txn.id) ? 'bg-blue-50' : ''}>
                  <td className="px-4 py-4">
                    {txn.status === 'verified' && (
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(txn.id)}
                        onChange={() => toggleSelection(txn.id)}
                        className="rounded border-gray-300"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {txn.transactionRef}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{txn.customer.name}</div>
                    <div className="text-xs text-gray-400">{txn.customer.accountNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <div>{txn.payeeName}</div>
                    <div className="text-xs text-gray-400">{txn.payeeAccountNumber}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {txn.currency} {txn.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {txn.swiftCode}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      txn.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {txn.status === 'pending' && (
                      <button
                        onClick={() => handleVerify(txn.id)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Verify
                      </button>
                    )}
                    {txn.status === 'verified' && (
                      <span className="text-green-600 font-medium">✓ Verified</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
