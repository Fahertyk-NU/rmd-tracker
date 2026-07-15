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
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import "./Dashboard.css";

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAdvisor, setFilterAdvisor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showHelp, setShowHelp] = useState(false);

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
    <Container className="mt-4">
      <h2>RMD Dashboard</h2>
      <div className="mb-3">
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
      {!loading &&
        summary.length > 0 &&
        (() => {
          const counts = {
            pending: summary.filter((r) => r.clientStatus === "pending").length,
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
                  <Card className="text-center border-primary">
                    <Card.Body>
                      <div className="fw-bold text-primary fs-4">
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
              <ProgressBar className="mb-3" style={{ height: "24px" }}>
                <ProgressBar
                  variant="warning"
                  now={(counts.pending / total) * 100}
                  key={1}
                />
                <ProgressBar
                  variant="danger"
                  now={(counts["action-required"] / total) * 100}
                  key={2}
                />
                <ProgressBar
                  variant="primary"
                  now={(counts["on-track"] / total) * 100}
                  key={3}
                />
                <ProgressBar
                  variant="success"
                  now={(counts.fulfilled / total) * 100}
                  key={4}
                />
              </ProgressBar>
            </>
          );
        })()}
      <Row className="mb-3 g-2">
        <Col md={3}>
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
        <Col md={3}>
          <Form.Control
            placeholder="Search by client name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Form.Select
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
          <Form.Select
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
