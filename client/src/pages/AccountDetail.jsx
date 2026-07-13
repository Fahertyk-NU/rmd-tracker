import { useState, useEffect } from "react";
import { Container, Table, Badge } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";

function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [rmdRecords, setRmdRecords] = useState([]);
  const [loading, setLoading] = useState(true);

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
      <p>
        <strong>Federal Withholding:</strong> {account.federalWithholding}%
      </p>
      <p>
        <strong>State Withholding:</strong> {account.stateWithholding}%
      </p>
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
                      : record.distributionStatus === "at-risk"
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
                  className="btn btn-sm btn-outline-secondary"
                >
                  Edit
                </Link>
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
