import { useState, useEffect } from "react";
import { Container, Table, Row, Col, Card } from "react-bootstrap";
import { useParams, useNavigate, Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import "./AccountDetail.css";

function AccountDetail() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [rmdRecords, setRmdRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [verifyName, setVerifyName] = useState("");
  const [showVerifyInput, setShowVerifyInput] = useState(false);

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

  const handleVerify = () => {
    if (!verifyName.trim()) return;
    fetch(`/api/accounts/${id}/verify`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ verifiedBy: verifyName }),
    })
      .then((res) => res.json())
      .then(() => {
        setAccount((prev) => ({
          ...prev,
          autoDistVerifiedBy: verifyName,
          autoDistVerifiedAt: new Date().toISOString(),
        }));
        setShowVerifyInput(false);
        setVerifyName("");
      })
      .catch((err) => console.error(err));
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
      <Link to={`/accounts/${id}/edit`} className="btn btn-primary mb-3 ms-2">
        Edit Account
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
      <Row className="mt-3 mb-4 g-3">
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <strong>Account Information</strong>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Primary Account #:</strong>{" "}
                {account.primaryAccountNumber}
              </p>
              {account.secondaryAccountNumber && (
                <p className="mb-2">
                  <strong>Secondary Account #:</strong>{" "}
                  {account.secondaryAccountNumber}
                </p>
              )}
              <p className="mb-2">
                <strong>Status:</strong> {account.status}
              </p>
              {account.notes && (
                <p className="mb-2">
                  <strong>Notes:</strong> {account.notes}
                </p>
              )}
              {account.lastUpdatedBy && (
                <p className="mb-0 text-muted small">
                  Last updated{" "}
                  {new Date(account.lastUpdatedAt).toLocaleDateString()} by{" "}
                  {account.lastUpdatedBy}
                </p>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card className="h-100">
            <Card.Header>
              <strong>Distribution Settings</strong>
            </Card.Header>
            <Card.Body>
              <p className="mb-2">
                <strong>Auto Distribution:</strong> {account.autoDistribution}
              </p>
              {account.autoDistribution === "fixed" && (
                <>
                  <p className="mb-2">
                    <strong>Fixed Amount:</strong> $
                    {account.fixedAmount?.toLocaleString()} /{" "}
                    {account.fixedSchedule}
                  </p>
                  {account.fixedSchedule === "monthly" &&
                    account.distributionDay && (
                      <p className="mb-2">
                        <strong>Distribution Day:</strong>{" "}
                        {account.distributionDay} of each month
                      </p>
                    )}
                  {account.fixedSchedule === "annual" &&
                    account.distributionDay && (
                      <p className="mb-2">
                        <strong>Distribution Date:</strong>{" "}
                        {new Date(
                          2000,
                          account.distributionMonth - 1,
                          1,
                        ).toLocaleString("default", { month: "long" })}{" "}
                        {account.distributionDay}
                      </p>
                    )}
                </>
              )}
              {account.autoDistribution !== "none" && (
                <>
                  <p className="mb-2">
                    <strong>Federal Withholding:</strong>{" "}
                    {account.federalWithholding}%
                  </p>
                  <p className="mb-2">
                    <strong>State Withholding:</strong>{" "}
                    {account.stateWithholding}%
                  </p>
                </>
              )}
              <p className="mb-2">
                <strong>Auto Distribution Last Verified:</strong>{" "}
                {account.autoDistVerifiedAt
                  ? `${new Date(account.autoDistVerifiedAt).toLocaleDateString()} by ${account.autoDistVerifiedBy}`
                  : "Not yet verified"}{" "}
                {!showVerifyInput && (
                  <button
                    className="btn btn-sm btn-outline-primary ms-2"
                    onClick={() => setShowVerifyInput(true)}
                  >
                    Mark as Verified
                  </button>
                )}
              </p>
              {showVerifyInput && (
                <div className="d-flex gap-2 mb-2">
                  <input
                    className="form-control form-control-sm w-auto"
                    placeholder="Your name"
                    value={verifyName}
                    onChange={(e) => setVerifyName(e.target.value)}
                  />
                  <button
                    className="btn btn-sm btn-primary"
                    onClick={handleVerify}
                  >
                    Confirm
                  </button>
                  <button
                    className="btn btn-sm btn-secondary"
                    onClick={() => setShowVerifyInput(false)}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
        {account.accountType === "Inherited IRA" && (
          <Col md={12}>
            <Card>
              <Card.Header>
                <strong>Inherited IRA Details</strong>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Original Owner:</strong>{" "}
                      {account.originalOwnerName}
                    </p>
                    <p className="mb-2">
                      <strong>Original Owner DOB:</strong>{" "}
                      {account.originalOwnerDOB
                        ? new Date(
                            account.originalOwnerDOB,
                          ).toLocaleDateString()
                        : "—"}
                    </p>
                    <p className="mb-2">
                      <strong>Date of Death:</strong>{" "}
                      {account.dateOfDeath
                        ? new Date(account.dateOfDeath).toLocaleDateString()
                        : "—"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p className="mb-2">
                      <strong>Beneficiary Relationship:</strong>{" "}
                      {account.beneficiaryRelationship}
                    </p>
                    <p className="mb-2">
                      <strong>Pre-SECURE Act:</strong>{" "}
                      {account.preSecureAct ? "Yes" : "No"}
                    </p>
                    <p className="mb-2">
                      <strong>Original Owner Had Started RMDs:</strong>{" "}
                      {account.originalOwnerRMDStarted ? "Yes" : "No"}
                    </p>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>
      <h4 className="mt-4">RMD Records</h4>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Year</th>
            <th>RMD Amount</th>
            <th>Amount Taken/Projected</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rmdRecords.map((record) => (
            <tr key={record._id}>
              <td>{record.year}</td>
              <td>
                <span
                  className="rmd-amount-cell"
                  title={
                    record.rmdAmountEnteredBy
                      ? `Entered by ${record.rmdAmountEnteredBy} on ${new Date(record.rmdAmountEnteredAt).toLocaleDateString()}`
                      : "Not yet entered"
                  }
                >
                  ${record.rmdAmount.toLocaleString()}
                </span>
              </td>
              <td>${record.amountTakenOrProjected.toLocaleString()}</td>
              <td>
                <StatusBadge status={record.distributionStatus} />
              </td>
              <td>
                <div className="d-flex flex-wrap gap-2">
                  <Link
                    to={`/rmdRecords/${record._id}/edit`}
                    className="btn btn-sm btn-outline-secondary"
                  >
                    Edit
                  </Link>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteRmdRecord(record._id)}
                  >
                    Delete
                  </button>
                </div>
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

AccountDetail.propTypes = {};

export default AccountDetail;
