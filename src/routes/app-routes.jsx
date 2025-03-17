import { Routes, Route } from 'react-router-dom';
import Home from '../pages/home';
import CreateChord from '../pages/create-chord';
import CreateScale from '../pages/create-scale';
import Radio from '../pages/radio';

const AppRoutes = () => {
    return (
        <Routes basename={process.env.PUBLIC_URL}>
            <Route path='/' element={<Home />} />
            <Route path='/create-chord' element={<CreateChord />} />
            <Route path='/create-scale' element={<CreateScale />} />
            <Route path='/radio' element={<Radio />} />
        </Routes>
    );
};

export default AppRoutes;