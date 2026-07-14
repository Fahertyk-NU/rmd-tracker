import { Link } from "react-router-dom";
import { Navbar, Container, Nav } from "react-bootstrap";
// eslint-disable-next-line no-unused-vars
import PropTypes from "prop-types";
import "./Navbar.css";

function AppNavbar() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">
          RMD Tracker
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/">
              Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/accounts/byCompany">
              Accounts by Company
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

Navbar.propTypes = {};

export default AppNavbar;
