import PropTypes from "prop-types";
import { Badge } from "react-bootstrap";
import "./StatusBadge.css";

function StatusBadge({ status }) {
  const variantMap = {
    fulfilled: "success",
    "on-track": "info",
    "action-required": "danger",
    pending: "warning",
  };

  const displayText = status.replace(/-/g, " ");

  return (
    <Badge bg={variantMap[status] || "secondary"} className="status-badge">
      {displayText}
    </Badge>
  );
}

StatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusBadge;
