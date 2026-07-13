import { useState, useEffect } from "react";
import { Container, Table, Badge } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";

function ClientDetail() {
  const { id } = useParams();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    fetch(`/api/accounts/client/${id}/summary?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, year]);

  return (
    <Container className="mt-4">
      <Link to="/" className="btn btn-secondary mb-3">
        ← Back to Dashboard
      </Link>
      <h2>Client Accounts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : accounts.length === 0 ? (
        <p>No accounts found for this client.</p>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Company</th>
                <th>Account Type</th>
                <th>Primary Account #</th>
                <th>Auto Distribution</th>
                <th>RMD Amount</th>
                <th>Amount Taken</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account._id}>
                  <td>{account.company}</td>
                  <td>{account.accountType}</td>
                  <td>{account.primaryAccountNumber}</td>
                  <td>{account.autoDistribution}</td>
                  <td>
                    {account.rmdRecord
                      ? `$${account.rmdRecord.rmdAmount.toLocaleString()}`
                      : "—"}
                  </td>
                  <td>
                    {account.rmdRecord
                      ? `$${account.rmdRecord.amountTakenOrProjected.toLocaleString()}`
                      : "—"}
                  </td>
                  <td>
                    {account.rmdRecord ? (
                      <Badge
                        bg={
                          account.rmdRecord.distributionStatus === "fulfilled"
                            ? "success"
                            : account.rmdRecord.distributionStatus === "at-risk"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {account.rmdRecord.distributionStatus}
                      </Badge>
                    ) : (
                      <Badge bg="secondary">No Record</Badge>
                    )}
                  </td>
                  <td>
                    <Link
                      to={`/accounts/${account._id}`}
                      className="btn btn-sm btn-primary me-2"
                    >
                      View
                    </Link>
                    <Link
                      to={`/accounts/${account._id}/edit`}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Link to={`/accounts/new?clientId=${id}`} className="btn btn-success">
            + Add Account
          </Link>
        </>
      )}
    </Container>
  );
}

export default ClientDetail;
