import { useState, useEffect } from "react";
import { Container, Table, Badge } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";

function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [rmdRecords, setRmdRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleDeleteAccount = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this account? This cannot be undone.",
      )
    ) {
      fetch(`/api/accounts/${id}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => navigate(`/clients/${account.clientId}`))
        .catch((err) => console.error(err));
    }
  };

  const handleDeleteRmdRecord = (recordId) => {
    if (window.confirm("Are you sure you want to delete this RMD record?")) {
      fetch(`/api/rmdRecords/${recordId}`, { method: "DELETE" })
        .then((res) => res.json())
        .then(() => {
          setRmdRecords((prev) => prev.filter((r) => r._id !== recordId));
        })
        .catch((err) => console.error(err));
    }
  };

  useEffect(() => {
    Promise.all([
      fetch(`/api/accounts/${id}`).then((res) => res.json()),
      fetch(`/api/rmdRecords/account/${id}`).then((res) => res.json()),
    ])
      .then(([accountData, recordsData]) => {
        setAccount(accountData);
        setRmdRecords(recordsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading)
    return (
      <Container className="mt-4">
        <p>Loading...</p>
      </Container>
    );
  if (!account)
    return (
      <Container className="mt-4">
        <p>Account not found.</p>
      </Container>
    );

  return (
    <Container className="mt-4">
      <Link
        to={`/clients/${account.clientId}`}
        className="btn btn-secondary mb-3"
      >
        ← Back to Client
      </Link>
      <button
        className="btn btn-danger mb-3 ms-2"
        onClick={handleDeleteAccount}
      >
        Delete Account
      </button>
      <h2>
        {account.company} — {account.accountType}
      </h2>
      <p>
        <strong>Primary Account #:</strong> {account.primaryAccountNumber}
      </p>
      {account.secondaryAccountNumber && (
        <p>
          <strong>Secondary Account #:</strong> {account.secondaryAccountNumber}
        </p>
      )}
      <p>
        <strong>Status:</strong> {account.status}
      </p>
      <p>
        <strong>Auto Distribution:</strong> {account.autoDistribution}
      </p>
      {account.autoDistribution === "fixed" && (
        <p>
          <strong>Fixed Amount:</strong> $
          {account.fixedAmount?.toLocaleString()} / {account.fixedSchedule}
        </p>
      )}
      {account.autoDistribution !== "none" && (
        <>
          <p>
            <strong>Federal Withholding:</strong> {account.federalWithholding}%
          </p>
          <p>
            <strong>State Withholding:</strong> {account.stateWithholding}%
          </p>
        </>
      )}
      {account.notes && (
        <p>
          <strong>Notes:</strong> {account.notes}
        </p>
      )}

      <h4 className="mt-4">RMD Records</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Year</th>
            <th>RMD Amount</th>
            <th>Amount Taken/Projected</th>
            <th>Status</th>
            <th>Verified</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rmdRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.year}</td>
              <td>${record.rmdAmount.toLocaleString()}</td>
              <td>${record.amountTakenOrProjected.toLocaleString()}</td>
              <td>
                <Badge
                  bg={
                    record.distributionStatus === "fulfilled"
                      ? "success"
                      : record.distributionStatus === "on-track"
                        ? "primary"
                        : record.distributionStatus === "action-required"
                          ? "danger"
                          : "warning"
                  }
                >
                  {record.distributionStatus}
                </Badge>
              </td>
              <td>
                <Badge bg={record.verified ? "success" : "secondary"}>
                  {record.verified ? "Yes" : "No"}
                </Badge>
              </td>
              <td>
                <Link
                  to={`/rmdRecords/${record._id}/edit`}
                  className="btn btn-sm btn-outline-secondary me-2"
                >
                  Edit
                </Link>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteRmdRecord(record._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Link
        to={`/rmdRecords/new?accountId=${id}&clientId=${account.clientId}`}
        className="btn btn-success"
      >
        + Add RMD Record
      </Link>
    </Container>
  );
}

export default AccountDetail;
