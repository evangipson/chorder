import Nav from './components/nav/nav';
import AppRoutes from './routes/app-routes';

const App = () => {
  return (
    <div className='chorder'>
      <Nav />
      <main className='chorder__body'>
        <AppRoutes />
      </main>
    </div>
  )
};

export default App;
