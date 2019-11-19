import React, { useEffect, useState } from 'react';
import Icon from './Icon';
import { NavbarStyle } from './Navbar.styled';
import { useMediaQuery } from 'react-responsive';
// import { NavContext } from '../../contexts/NavContext';
import { Link } from 'react-router-dom';


const Navbar = ({ fetching }) => {
  const isLessThan700px = useMediaQuery({ maxWidth: 700 });
  // const { nav, setNav } = useContext(NavContext);
  const [ nav, setNav ] = useState('');

	const icons = [
	  {
	  	name: 'home',
	  	d: "M12 20 L12 30 4 30 4 12 16 2 28 12 28 30 20 30 20 20 Z",
	  	additional: "",
	  	link: '/',
	  	strokeWidth: '2.5',
	  	fill: nav === '/' ? 'currentcolor' : 'none'
	  },
	  {
	  	name: 'search',
	  	d: "M23 23 L30 30",
	  	additional: <circle cx="14" cy="14" r="12" />,
	  	link: '/search',
	  	strokeWidth: nav === '/search' ? '4' : '2.5',
	  	fill: 'none'
	  },
	  {
	  	name: 'profile',
	  	d: "M22 11 C22 16 19 20 16 20 13 20 10 16 10 11 10 6 12 3 16 3 20 3 22 6 22 11 Z M4 30 L28 30 C28 21 22 20 16 20 10 20 4 21 4 30 Z",
	  	additional: "",
	  	link: '/profile',
	  	strokeWidth: '2.5',
	  	fill: nav === '/profile' ? 'currentcolor' : 'none'
	  },
	  {
	  	name: 'add',
	  	d: "M16 2 L16 30 M2 16 L30 16",
	  	additional: "",
	  	link: '/add',
	  	strokeWidth: nav === '/add' ? '4' : '2.5',
	  	fill: 'none'
	  }
	];

	useEffect((/*did update*/) => {
		 setNav(window.location.pathname)
		},[setNav]
	);

  const handleClick = (link, e) => {
  	if (!fetching) {
	    setNav(link);
  	} else {
  		e.preventDefault();
  	}
  };

	return (
		<NavbarStyle isLessThan700px={isLessThan700px}>
			{
				icons.map(icon =>
					<Link to={icon.link} key={icon.link} onClick={e => handleClick(icon.link, e)} >
						<Icon isLessThan700px={isLessThan700px} iconProps={icon} />
					</Link>
				)
			}
		</NavbarStyle>
	);
}

export default Navbar; 