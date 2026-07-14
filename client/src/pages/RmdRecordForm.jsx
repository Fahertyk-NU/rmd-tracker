import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

function RmdRecordForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const accountId = searchParams.get("accountId");
  const clientId = searchParams.get("clientId");
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear(),
    rmdAmount: "",
    amountTakenOrProjected: "",
    rmdAmountEnteredBy: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  const [recordAccountId, setRecordAccountId] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/rmdRecords/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setRecordAccountId(data.accountId);
          setFormData({
            year: data.year,
            rmdAmount: data.rmdAmount ?? "",
            amountTakenOrProjected: data.amountTakenOrProjected ?? "",
            rmdAmountEnteredBy: data.rmdAmountEnteredBy ?? "",
            notes: data.notes ?? "",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const url = isEdit ? `/api/rmdRecords/${id}` : "/api/rmdRecords";
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? formData : { ...formData, accountId, clientId };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(() => {
        navigate(
          isEdit ? `/accounts/${recordAccountId}` : `/accounts/${accountId}`,
        );
      })
      .catch(() => setError("Something went wrong. Please try again."));
  };

  if (loading)
    return (
      <Container className="mt-4">
        <p>Loading...</p>
      </Container>
    );

  return (
    <Container className="mt-4" style={{ maxWidth: "600px" }}>
      <h2>{isEdit ? "Edit RMD Record" : "Add RMD Record"}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Year</Form.Label>
          <Form.Control
            type="number"
            name="year"
            value={formData.year}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>RMD Amount ($)</Form.Label>
          <Form.Control
            type="number"
            name="rmdAmount"
            value={formData.rmdAmount}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Amount Taken / Projected ($)</Form.Label>
          <Form.Control
            type="number"
            name="amountTakenOrProjected"
            value={formData.amountTakenOrProjected}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>RMD Amount Entered By</Form.Label>
          <Form.Control
            name="rmdAmountEnteredBy"
            value={formData.rmdAmountEnteredBy}
            onChange={handleChange}
            placeholder="Your name"
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="notes"
            value={formData.notes}
            onChange={handleChange}
          />
        </Form.Group>

        <Button type="submit" variant="primary" className="me-2">
          {isEdit ? "Save Changes" : "Add RMD Record"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
}

export default RmdRecordForm;
