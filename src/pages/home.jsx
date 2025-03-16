import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <>
            <h1>Chorder</h1>
            <p>Hitting a creative roadblock making music? You can <Link to='/create-chord'>create some chords</Link> or <Link to='/create-scale'>use a new scale</Link>.</p>
            <p>If you want to sit back and listen, check out <Link to='/radio'>the radio</Link> instead.</p>
        </>
    );
};

export default Home;