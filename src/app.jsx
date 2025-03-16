import Footer from './components/footer/footer';
import Nav from './components/nav/nav';
import AppRoutes from './routes/app-routes';

const App = () => {
  return (
    <div className='chorder'>
      <Nav />
      <main className='chorder__body'>
        <AppRoutes />
      </main>
      <Footer />
    </div>
  )
};

export default App;
