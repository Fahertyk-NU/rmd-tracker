import { useState, useEffect } from "react";
import { Container, Table, Badge, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
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

  return (
    <Container className="mt-4">
      <h2>RMD Dashboard</h2>
      <Form.Select
        className="mb-3 w-auto"
        value={year}
        onChange={(e) => setYear(parseInt(e.target.value))}
      >
        <option value={2024}>2024</option>
        <option value={2025}>2025</option>
        <option value={2026}>2026</option>
        <option value={2027}>2027</option>
      </Form.Select>

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
            {summary.map((row) => (
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
                  <Badge bg={row.fulfilled ? "success" : "danger"}>
                    {row.fulfilled ? "Fulfilled" : "Pending"}
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
