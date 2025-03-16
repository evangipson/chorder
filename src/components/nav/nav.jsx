import { NavLink } from 'react-router-dom';
import './nav.css';

const Nav = () => {
    return (
        <nav className='chorder__nav'>
            <div className='chorder__nav-links'>
                <NavLink to='/'>Home</NavLink>
                <NavLink to='/create-chord'>Create a Chord</NavLink>
                <NavLink to='/create-scale'>Create a Scale</NavLink>
                <NavLink to='/radio'>Radio</NavLink>
            </div>
        </nav>
    )
};

export default Nav;