import { useState, useEffect } from "react";
import { Container, Table, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";

function AccountsByCompany() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("company");

  useEffect(() => {
    fetch(`/api/accounts/byCompany?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [year]);

  const companies = [...new Set(accounts.map((a) => a.company))].sort();

  const filtered = accounts.filter((a) => {
    const matchesCompany =
      filterCompany === "all" || a.company === filterCompany;
    const matchesStatus =
      filterStatus === "all" ||
      (a.rmdRecord?.distributionStatus || "pending") === filterStatus;
    return matchesCompany && matchesStatus;
  });

  const sorted = [...filtered].sort((a, b) => {
    switch (sortBy) {
      case "company":
        return a.company.localeCompare(b.company);
      case "client":
        return a.client.lastName.localeCompare(b.client.lastName);
      case "status":
        return (a.rmdRecord?.distributionStatus || "pending").localeCompare(
          b.rmdRecord?.distributionStatus || "pending",
        );
      case "autoDistribution":
        return a.autoDistribution.localeCompare(b.autoDistribution);
      case "accountType":
        return a.accountType.localeCompare(b.accountType);
      default:
        return 0;
    }
  });

  return (
    <Container className="mt-4">
      <h2>Accounts by Company</h2>
      <Row className="mb-3 g-2">
        <Col xs={6} md={3}>
          <Form.Select
            value={year}
            onChange={(e) => {
              setLoading(true);
              setYear(parseInt(e.target.value));
            }}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            value={filterCompany}
            onChange={(e) => setFilterCompany(e.target.value)}
          >
            <option value="all">All Companies</option>
            {companies.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="on-track">On Track</option>
            <option value="action-required">Action Required</option>
            <option value="fulfilled">Fulfilled</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="company">Sort by Company</option>
            <option value="client">Sort by Client</option>
            <option value="status">Sort by Status</option>
            <option value="autoDistribution">Sort by Auto Distribution</option>
            <option value="accountType">Sort by Account Type</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Company</th>
              <th>Client</th>
              <th>Account Type</th>
              <th>Primary Account #</th>
              <th>Secondary Account #</th>
              <th>Auto Distribution</th>
              <th>RMD Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((account) => (
              <tr key={account._id}>
                <td>{account.company}</td>
                <td>
                  <Link to={`/clients/${account.clientId}`}>
                    {account.client.lastName}, {account.client.firstName}
                  </Link>
                </td>
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
                  {account.rmdRecord ? (
                    <StatusBadge
                      status={account.rmdRecord.distributionStatus}
                    />
                  ) : (
                    <span className="text-muted">No Record</span>
                  )}
                </td>
                <td>
                  <Link
                    to={`/accounts/${account._id}`}
                    className="btn btn-sm btn-primary"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

AccountsByCompany.propTypes = {};

export default AccountsByCompany;
