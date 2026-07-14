import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";
import "./StatusBadge.css";

function StatusBadge({ status }) {
  const variantMap = {
    fulfilled: "success",
    "on-track": "primary",
    "action-required": "danger",
    pending: "warning",
  };

  return (
    <Badge bg={variantMap[status] || "secondary"}>{status || "unknown"}</Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
