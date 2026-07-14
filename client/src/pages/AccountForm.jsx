import { useState, useEffect } from "react";
import { Container, Form, Button, Alert } from "react-bootstrap";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";

function AccountForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clientId = searchParams.get("clientId");
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    company: "",
    primaryAccountNumber: "",
    secondaryAccountNumber: "",
    accountType: "Traditional IRA",
    status: "active",
    autoDistribution: "none",
    fixedAmount: "",
    fixedSchedule: "",
    distributionDay: "",
    distributionMonth: "",
    federalWithholding: 0,
    stateWithholding: 0,
    notes: "",
    // inherited IRA fields
    originalOwnerName: "",
    originalOwnerDOB: "",
    dateOfDeath: "",
    beneficiaryRelationship: "",
    preSecureAct: false,
    originalOwnerRMDStarted: false,
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/accounts/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setFormData({
            ...data,
            fixedAmount: data.fixedAmount ?? "",
            fixedSchedule: data.fixedSchedule ?? "",
            distributionDay: data.distributionDay ?? "",
            distributionMonth: data.distributionMonth ?? "",
            secondaryAccountNumber: data.secondaryAccountNumber ?? "",
            originalOwnerName: data.originalOwnerName ?? "",
            originalOwnerDOB: data.originalOwnerDOB
              ? data.originalOwnerDOB.slice(0, 10)
              : "",
            dateOfDeath: data.dateOfDeath ? data.dateOfDeath.slice(0, 10) : "",
            beneficiaryRelationship: data.beneficiaryRelationship ?? "",
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
    const url = isEdit ? `/api/accounts/${id}` : "/api/accounts";
    const method = isEdit ? "PUT" : "POST";
    const body = isEdit ? formData : { ...formData, clientId };

    fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
      .then((res) => res.json())
      .then(() => {
        navigate(isEdit ? `/accounts/${id}` : `/clients/${clientId}`);
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
      <h2>{isEdit ? "Edit Account" : "Add Account"}</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Company</Form.Label>
          <Form.Control
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Account Type</Form.Label>
          <Form.Select
            name="accountType"
            value={formData.accountType}
            onChange={handleChange}
          >
            <option>Traditional IRA</option>
            <option>Roth IRA</option>
            <option>Inherited IRA</option>
            <option>403b</option>
            <option>401k</option>
            <option>SEP IRA</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Primary Account Number</Form.Label>
          <Form.Control
            name="primaryAccountNumber"
            value={formData.primaryAccountNumber}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Secondary Account Number (if applicable)</Form.Label>
          <Form.Control
            name="secondaryAccountNumber"
            value={formData.secondaryAccountNumber}
            onChange={handleChange}
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
            <option value="inherited">Inherited</option>
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
            {formData.fixedSchedule === "monthly" && (
              <Form.Group className="mb-3">
                <Form.Label>Day of Month</Form.Label>
                <Form.Control
                  type="number"
                  name="distributionDay"
                  value={formData.distributionDay}
                  onChange={handleChange}
                  min={1}
                  max={31}
                  placeholder="e.g. 15"
                />
              </Form.Group>
            )}
            {formData.fixedSchedule === "annual" && (
              <>
                <Form.Group className="mb-3">
                  <Form.Label>Month</Form.Label>
                  <Form.Select
                    name="distributionMonth"
                    value={formData.distributionMonth}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    <option value={1}>January</option>
                    <option value={2}>February</option>
                    <option value={3}>March</option>
                    <option value={4}>April</option>
                    <option value={5}>May</option>
                    <option value={6}>June</option>
                    <option value={7}>July</option>
                    <option value={8}>August</option>
                    <option value={9}>September</option>
                    <option value={10}>October</option>
                    <option value={11}>November</option>
                    <option value={12}>December</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Day of Month</Form.Label>
                  <Form.Control
                    type="number"
                    name="distributionDay"
                    value={formData.distributionDay}
                    onChange={handleChange}
                    min={1}
                    max={31}
                    placeholder="e.g. 15"
                  />
                </Form.Group>
              </>
            )}
          </>
        )}

        {formData.autoDistribution !== "none" && (
          <>
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
          </>
        )}

        {formData.accountType === "Inherited IRA" && (
          <>
            <h5 className="mt-3">Inherited IRA Details</h5>
            <Form.Group className="mb-3">
              <Form.Label>Original Owner Name</Form.Label>
              <Form.Control
                name="originalOwnerName"
                value={formData.originalOwnerName}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Original Owner Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="originalOwnerDOB"
                value={formData.originalOwnerDOB}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Death</Form.Label>
              <Form.Control
                type="date"
                name="dateOfDeath"
                value={formData.dateOfDeath}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Beneficiary Relationship</Form.Label>
              <Form.Select
                name="beneficiaryRelationship"
                value={formData.beneficiaryRelationship}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="spouse">Spouse</option>
                <option value="non-spouse">Non-Spouse</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Death occurred before Jan 1, 2020 (Pre-SECURE Act)"
                name="preSecureAct"
                checked={formData.preSecureAct}
                onChange={handleChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Original owner had already started taking RMDs"
                name="originalOwnerRMDStarted"
                checked={formData.originalOwnerRMDStarted}
                onChange={handleChange}
              />
            </Form.Group>
          </>
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
          {isEdit ? "Save Changes" : "Add Account"}
        </Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Cancel
        </Button>
      </Form>
    </Container>
  );
}

export default AccountForm;
