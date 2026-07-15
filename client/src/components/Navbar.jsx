import { Link } from "react-router-dom";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import PropTypes from "prop-types";
import "./Navbar.css";

function AppNavbar({ onLogout }) {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          RMD Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto align-items-lg-center">
            <Nav.Link as={Link} to="/">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/accounts/byCompany">
              Accounts by Company
            </Nav.Link>
            <Button
              variant="outline-light"
              size="sm"
              className="ms-lg-2"
              onClick={onLogout}
            >
              Log Out
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

AppNavbar.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default AppNavbar;
