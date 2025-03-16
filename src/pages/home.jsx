import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <h1>Chorder</h1>
            <p>You can <Link to='/create-chord'>create a chord</Link> or <Link to='/create-scale'>create a scale</Link>.</p>
        </>
    );
};

export default Home;