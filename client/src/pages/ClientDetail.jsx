import { useState, useEffect } from "react";
import { Container, Table, Badge, Row, Col, Card } from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";

function ClientDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const year = new Date().getFullYear();

  useEffect(() => {
    Promise.all([
      fetch(`/api/clients/${id}`).then((res) => res.json()),
      fetch(`/api/accounts/client/${id}/summary?year=${year}`).then((res) =>
        res.json(),
      ),
    ])
      .then(([clientData, accountsData]) => {
        setClient(clientData);
        setAccounts(accountsData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, year]);

  const handleDeleteClient = () => {
    if (
      !window.confirm(
        "Are you sure you want to delete this client? This cannot be undone.",
      )
    )
      return;

    fetch(`/api/clients/${id}`, { method: "DELETE" })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Delete failed");
        navigate("/");
      })
      .catch((err) => alert(err.message));
  };

  return (
    <Container className="mt-4">
      <Link to="/" className="btn btn-secondary mb-3">
        ← Back to Dashboard
      </Link>
      {client && (
        <>
          <Link
            to={`/clients/${id}/edit`}
            className="btn btn-primary mb-3 ms-2"
          >
            Edit Client
          </Link>
          <button
            className="btn btn-danger mb-3 ms-2"
            onClick={handleDeleteClient}
          >
            Delete Client
          </button>
          <Card className="mb-4">
            <Card.Header>
              <strong>
                {client.firstName} {client.lastName}
              </strong>{" "}
              <Badge
                bg={
                  client.status === "active"
                    ? "success"
                    : client.status === "inactive"
                      ? "secondary"
                      : "dark"
                }
              >
                {client.status}
              </Badge>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Date of Birth:</strong>{" "}
                    {client.dateOfBirth
                      ? new Date(client.dateOfBirth).toLocaleDateString()
                      : "—"}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> {client.email || "—"}
                  </p>
                  <p className="mb-2">
                    <strong>Phone:</strong> {client.phone || "—"}
                  </p>
                </Col>
                <Col md={6}>
                  <p className="mb-2">
                    <strong>Advisor:</strong> {client.advisorName || "—"}
                  </p>
                  {client.notes && (
                    <p className="mb-2">
                      <strong>Notes:</strong> {client.notes}
                    </p>
                  )}
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </>
      )}
      <h2>Client Accounts</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          {accounts.length === 0 ? (
            <p>No accounts found for this client.</p>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Account Type</th>
                  <th>Primary Account #</th>
                  <th>Secondary Account #</th>
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
                    <td>{account.secondaryAccountNumber || "—"}</td>
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
                        <StatusBadge
                          status={account.rmdRecord.distributionStatus}
                        />
                      ) : (
                        <Badge bg="secondary">No Record</Badge>
                      )}
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-2">
                        <Link
                          to={`/accounts/${account._id}`}
                          className="btn btn-sm btn-primary"
                        >
                          View
                        </Link>
                        <Link
                          to={`/accounts/${account._id}/edit`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="table-dark fw-bold">
                  <td colSpan={5}>Total</td>
                  <td>
                    $
                    {accounts
                      .reduce(
                        (sum, a) => sum + (a.rmdRecord?.rmdAmount || 0),
                        0,
                      )
                      .toLocaleString()}
                  </td>
                  <td>
                    $
                    {accounts
                      .reduce(
                        (sum, a) =>
                          sum + (a.rmdRecord?.amountTakenOrProjected || 0),
                        0,
                      )
                      .toLocaleString()}
                  </td>
                  <td></td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
          )}
          <Link to={`/accounts/new?clientId=${id}`} className="btn btn-success">
            + Add Account
          </Link>
        </>
      )}
    </Container>
  );
}

ClientDetail.propTypes = {};

export default ClientDetail;
