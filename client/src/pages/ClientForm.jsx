import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";

function ClientForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    email: "",
    phone: "",
    advisorName: "",
    status: "active",
    notes: "",
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/clients/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            dateOfBirth: data.dateOfBirth ? data.dateOfBirth.slice(0, 10) : "",
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
    const url = isEdit ? `/api/clients/${id}` : "/api/clients";
    const method = isEdit ? "PUT" : "POST";

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    })
      .then((res) => res.json())
      .then((data) => {
        if (isEdit) {
          navigate(`/clients/${id}`);
        } else {
          navigate(`/clients/${data.insertedId}`);
        }
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
      <h2>{isEdit ? "Edit Client" : "Add Client"}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>First Name</Form.Label>
          <Form.Control
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            //can be just be a whitespace string: "   "
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Last Name</Form.Label>
          <Form.Control
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            //can be just be a whitespace string: "   "
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Date of Birth</Form.Label>
          <Form.Control
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            //DOB can be in the future
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Phone</Form.Label>
          <Form.Control
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            //No validation for proper phone number
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Advisor</Form.Label>
          <Form.Control
            name="advisorName"
            value={formData.advisorName}
            onChange={handleChange}
            //Should this not be a dropdown with advisor names populated from the DB?
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Status</Form.Label>
          <Form.Select
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="deceased">Deceased</option>
          </Form.Select>
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
          {isEdit ? "Save Changes" : "Add Client"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
}

ClientForm.propTypes = {};

export default ClientForm;
