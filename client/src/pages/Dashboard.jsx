import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Form,
  Row,
  Col,
  ProgressBar,
  Card,
  Alert,
  Collapse,
  Button,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import StatusBadge from "../components/StatusBadge";
import "./Dashboard.css";
import usePageTitle from "../hooks/usePageTitle";

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAdvisor, setFilterAdvisor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showHelp, setShowHelp] = useState(false);

  usePageTitle("Dashboard");

  useEffect(() => {
    fetch(`/api/dashboard?year=${year}`)
      .then((res) => res.json())
      .then((data) => {
        setSummary(data);
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

  // get unique advisor names for the filter dropdown
  const advisors = [...new Set(summary.map((row) => row.client.advisorName))];

  // apply filters
  const filtered = summary.filter((row) => {
    const fullName =
      `${row.client.firstName} ${row.client.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesAdvisor =
      filterAdvisor === "all" || row.client.advisorName === filterAdvisor;
    const matchesStatus =
      filterStatus === "all" || row.clientStatus === filterStatus;
    return matchesSearch && matchesAdvisor && matchesStatus;
  });

  return (
    <Container className="mt-4 mb-5">
      <div className="mb-2">
        <h1 className="page-title">Required Minimum Distribution Dashboard</h1>
        <p className="page-subtitle text-muted">
          Tracking {year} distributions across {summary.length} clients
        </p>
      </div>

      <div className="mb-4">
        <Button
          variant="outline-secondary"
          size="sm"
          onClick={() => setShowHelp(!showHelp)}
          aria-controls="help-section"
          aria-expanded={showHelp}
        >
          {showHelp ? "Hide Help" : "How to Use"}
        </Button>
        <Link to="/clients/new" className="btn btn-success btn-sm ms-2">
          + Add Client
        </Link>
        <Collapse in={showHelp}>
          <div id="help-section">
            <Alert variant="info" className="mt-2">
              <Alert.Heading>How to Use RMD Tracker</Alert.Heading>
              <p>
                RMD Tracker helps financial advisors manage Required Minimum
                Distributions for clients age 73 and older.
              </p>
              <hr />
              <p className="mb-1">
                <strong>Dashboard:</strong> View all clients with RMD
                obligations. Filter by advisor, status, or search by name. The
                progress bar shows overall completion across all clients.
              </p>
              <p className="mb-1">
                <strong>Client Accounts:</strong> Click a client name to view
                their accounts and current year RMD status. Total obligation and
                amount taken are shown at the bottom.
              </p>
              <p className="mb-1">
                <strong>Account Detail:</strong> View account info, distribution
                settings, and RMD records. Mark auto distribution as verified
                and log RMD amounts as they are received.
              </p>
              <p className="mb-0">
                <strong>Accounts by Company:</strong> View all accounts sorted
                by custodian -- useful for batching calls to companies during
                RMD season.
              </p>
            </Alert>
          </div>
        </Collapse>
      </div>
      <div className="mb-5">
        {!loading &&
          summary.length > 0 &&
          (() => {
            const counts = {
              pending: summary.filter((r) => r.clientStatus === "pending")
                .length,
              "action-required": summary.filter(
                (r) => r.clientStatus === "action-required",
              ).length,
              "on-track": summary.filter((r) => r.clientStatus === "on-track")
                .length,
              fulfilled: summary.filter((r) => r.clientStatus === "fulfilled")
                .length,
            };
            const total = summary.length;

            return (
              <>
                <Row className="mb-3 g-2">
                  <Col xs={6} md={3}>
                    <Card className="text-center border-warning">
                      <Card.Body>
                        <div className="fw-bold text-warning fs-4">
                          {counts.pending}
                        </div>
                        <div className="text-muted small">Pending</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="text-center border-danger">
                      <Card.Body>
                        <div className="fw-bold text-danger fs-4">
                          {counts["action-required"]}
                        </div>
                        <div className="text-muted small">Action Required</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="text-center border-info">
                      <Card.Body>
                        <div className="fw-bold text-info fs-4">
                          {counts["on-track"]}
                        </div>
                        <div className="text-muted small">On Track</div>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col xs={6} md={3}>
                    <Card className="text-center border-success">
                      <Card.Body>
                        <div className="fw-bold text-success fs-4">
                          {counts.fulfilled}
                        </div>
                        <div className="text-muted small">Fulfilled</div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
                <ProgressBar
                  className="mb-3"
                  role="img"
                  style={{ height: "24px" }}
                  aria-label={`RMD completion: ${counts.fulfilled} fulfilled, ${counts["on-track"]} on track, ${counts["action-required"]} action required, ${counts.pending} pending, out of ${total} total`}
                >
                  <ProgressBar
                    variant="warning"
                    now={(counts.pending / total) * 100}
                    key={1}
                    aria-label={`${counts.pending} pending`}
                  />
                  <ProgressBar
                    variant="danger"
                    now={(counts["action-required"] / total) * 100}
                    key={2}
                    aria-label={`${counts["action-required"]} action required`}
                  />
                  <ProgressBar
                    variant="info"
                    now={(counts["on-track"] / total) * 100}
                    key={3}
                    aria-label={`${counts["on-track"]} on track`}
                  />
                  <ProgressBar
                    variant="success"
                    now={(counts.fulfilled / total) * 100}
                    key={4}
                    aria-label={`${counts.fulfilled} fulfilled`}
                  />
                </ProgressBar>
              </>
            );
          })()}
      </div>
      <Row className="mb-4 g-2">
        <Col md={3}>
          <Form.Label htmlFor="year-select" className="visually-hidden">
            Filter by year
          </Form.Label>
          <Form.Select
            id="year-select"
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
        <Col md={3}>
          <Form.Label htmlFor="client-search" className="visually-hidden">
            Search by client name
          </Form.Label>
          <Form.Control
            id="client-search"
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="advisor-select" className="visually-hidden">
            Filter by advisor
          </Form.Label>
          <Form.Select
            id="advisor-select"
            value={filterAdvisor}
            onChange={(e) => setFilterAdvisor(e.target.value)}
          >
            <option value="all">All Advisors</option>
            {advisors.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Form.Label htmlFor="status-filter" className="visually-hidden">
            Filter by status
          </Form.Label>
          <Form.Select
            id="status-filter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="action-required">Action Required</option>
            <option value="pending">Pending</option>
            <option value="on-track">On Track</option>
            <option value="fulfilled">Fulfilled</option>
          </Form.Select>
        </Col>
      </Row>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>Client</th>
              <th>Advisor</th>
              <th>Total Obligation</th>
              <th>Total Taken</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr key={row._id}>
                <td>
                  <Link to={`/clients/${row._id}`}>
                    {row.client.firstName} {row.client.lastName}
                  </Link>
                </td>
                <td>{row.client.advisorName}</td>
                <td>${row.totalObligation.toLocaleString()}</td>
                <td>${row.totalTaken.toLocaleString()}</td>
                <td>
                  <StatusBadge status={row.clientStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

Dashboard.propTypes = {};

export default Dashboard;
