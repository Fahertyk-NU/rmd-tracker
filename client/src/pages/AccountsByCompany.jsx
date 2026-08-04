import { useState, useEffect } from "react";
import { Container, Table, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import usePageTitle from "../hooks/usePageTitle";

function AccountsByCompany() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [filterCompany, setFilterCompany] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("company");

  usePageTitle("Accounts by Company");

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

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    currentYear - 2,
    currentYear - 1,
    currentYear,
    currentYear + 1,
  ];

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
      <h1 className="page-title mb-4">Accounts by Company</h1>
      <Row className="mb-4 g-2">
        <Col xs={6} md={3}>
          <Form.Label htmlFor="year-filter" className="visually-hidden">
            Filter by year
          </Form.Label>
          <Form.Select
            id="year-filter"
            value={year}
            onChange={(e) => {
              setLoading(true);
              setYear(parseInt(e.target.value));
            }}
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Label htmlFor="company-filter" className="visually-hidden">
            Filter by company
          </Form.Label>
          <Form.Select
            id="company-filter"
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
          <Form.Label htmlFor="status-filter-abc" className="visually-hidden">
            Filter by status
          </Form.Label>
          <Form.Select
            id="status-filter-abc"
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
          <Form.Label htmlFor="sort-by" className="visually-hidden">
            Sort by
          </Form.Label>
          <Form.Select
            id="sort-by"
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
                    {account.client.firstName?.trim() ||
                    account.client.lastName?.trim()
                      ? `${account.client.lastName}, ${account.client.firstName}`
                      : "Unnamed Client"}
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
                    aria-label={`View account ${account.primaryAccountNumber} for ${
                      account.client.firstName || account.client.lastName
                        ? `${account.client.firstName} ${account.client.lastName}`
                        : "Unnamed Client"
                    }`}
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
