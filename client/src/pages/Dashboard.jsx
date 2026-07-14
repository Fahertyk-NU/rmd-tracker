import { useState, useEffect } from "react";
import { Container, Table, Badge, Form, Row, Col } from "react-bootstrap";
import { Link } from "react-router-dom";

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterAdvisor, setFilterAdvisor] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

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
                  <Badge
                    bg={
                      row.clientStatus === "fulfilled"
                        ? "success"
                        : row.clientStatus === "on-track"
                          ? "primary"
                          : row.clientStatus === "action-required"
                            ? "danger"
                            : "warning"
                    }
                  >
                    {row.clientStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </Container>
  );
}

export default Dashboard;
