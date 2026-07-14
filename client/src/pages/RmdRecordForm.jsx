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
    distributionStatus: "pending",
    autoDistribution: "none",
    fixedAmount: "",
    fixedSchedule: "",
    federalWithholding: 0,
    stateWithholding: 0,
    verified: false,
    verifiedBy: "",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/rmdRecords/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            fixedAmount: data.fixedAmount ?? "",
            fixedSchedule: data.fixedSchedule ?? "",
            verifiedBy: data.verifiedBy ?? "",
            notes: data.notes ?? "",
          });
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
          isEdit ? `/accounts/${formData.accountId}` : `/accounts/${accountId}`,
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
          <Form.Label>Distribution Status</Form.Label>
          <Form.Select
            name="distributionStatus"
            value={formData.distributionStatus}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="on-track">On Track</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="at-risk">At Risk</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Auto Distribution</Form.Label>
          <Form.Select
            name="autoDistribution"
            value={formData.autoDistribution}
            onChange={handleChange}
          >
            <option value="none">None</option>
            <option value="full-recalculated">
              Full RMD Recalculated Annually
            </option>
            <option value="fixed">Fixed Amount</option>
          </Form.Select>
        </Form.Group>

        {formData.autoDistribution === "fixed" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Fixed Amount ($)</Form.Label>
              <Form.Control
                type="number"
                name="fixedAmount"
                value={formData.fixedAmount}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Schedule</Form.Label>
              <Form.Select
                name="fixedSchedule"
                value={formData.fixedSchedule}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="monthly">Monthly</option>
                <option value="annual">Annual</option>
              </Form.Select>
            </Form.Group>
          </>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Federal Withholding (%)</Form.Label>
          <Form.Control
            type="number"
            name="federalWithholding"
            value={formData.federalWithholding}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>State Withholding (%)</Form.Label>
          <Form.Control
            type="number"
            name="stateWithholding"
            value={formData.stateWithholding}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Check
            type="checkbox"
            label="Verified"
            name="verified"
            checked={formData.verified}
            onChange={handleChange}
          />
        </Form.Group>

        {formData.verified && (
          <Form.Group className="mb-3">
            <Form.Label>Verified By</Form.Label>
            <Form.Control
              name="verifiedBy"
              value={formData.verifiedBy}
              onChange={handleChange}
            />
          </Form.Group>
        )}

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
