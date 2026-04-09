import {Button,Container, Form, Nav, Navbar, NavDropdown  } from 'react-bootstrap';
import {Link} from 'react-router-dom';

const Header = () => {


  return (
    <Navbar expand="lg" className="bg-success">
      <Container fluid>
        <Navbar.Brand href="#">Header</Navbar.Brand>
        <Navbar.Toggle aria-controls="navbarScroll" />
        <Navbar.Collapse id="navbarScroll">
          <Nav
            className="me-auto my-2 my-lg-0"
            style={{ maxHeight: '100px' }}
            navbarScroll
          >

            <Nav.Link href="#action1">Inicio</Nav.Link>
          
            
          </Nav>
          <Form className="d-flex">
            <Form.Control
              type="search"
              placeholder="Search"
              className="me-2"
              aria-label="Search"
            />
            <Button variant="outline-success">Search</Button>
          </Form>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header;
